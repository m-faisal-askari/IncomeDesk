from typing import List, Optional
from decimal import Decimal
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.core.database import get_db
from backend.app.core.security import get_current_user_id
from backend.app.models.models import Project, Client, Invoice, Transaction, TransactionType, InvoiceStatus
from backend.app.schemas.schemas import ProjectCreate, ProjectUpdate, ProjectResponse
from backend.app.engine.calculations import to_decimal, round_money
from backend.app.engine.money import to_cents, from_cents, convert

router = APIRouter(prefix="/projects", tags=["Projects"])

def enrich_project(project: Project, db: Session, include_details: bool = True) -> dict:
    invoices = db.query(Invoice).filter(
        Invoice.project_id == project.id,
        Invoice.status != InvoiceStatus.CANCELLED
    ).all()
    # inv.amount_paid is integer cents
    revenue = sum((from_cents(inv.amount_paid) for inv in invoices), Decimal("0.00"))
    invoiced_total = sum((from_cents(inv.total_amount) for inv in invoices), Decimal("0.00"))

    # Also check any direct income transactions tagged to project without invoice
    direct_income = db.query(Transaction).filter(
        Transaction.project_id == project.id,
        Transaction.type == TransactionType.INCOME,
        Transaction.status == "CONFIRMED"
    ).all()
    # Avoid double counting if already in invoice amount_paid
    # Add direct income
    for tx in direct_income:
        # If transaction notes say invoice payment, skip; else add
        if not tx.notes or "invoice" not in tx.notes.lower():
            # tx.amount and tx.fee_amount are integer cents
            revenue += (from_cents(tx.amount) - from_cents(tx.fee_amount))

    expenses = db.query(Transaction).filter(
        Transaction.project_id == project.id,
        Transaction.type == TransactionType.EXPENSE,
        Transaction.status == "CONFIRMED"
    ).order_by(Transaction.date.desc()).all()
    # tx.amount is integer cents
    total_expenses = sum((from_cents(tx.amount) for tx in expenses), Decimal("0.00"))

    profit = revenue - total_expenses
    profit_margin = ((profit / revenue) * Decimal("100.00")) if revenue > 0 else Decimal("0.00")

    budget_amount = from_cents(project.budget)
    budget_remaining = (budget_amount - total_expenses) if budget_amount > Decimal("0.00") else None
    budget_spent_percent = ((total_expenses / budget_amount) * Decimal("100.00")) if budget_amount > Decimal("0.00") else Decimal("0.00")

    result = {
        "id": project.id,
        "user_id": project.user_id,
        "client_id": project.client_id,
        "client_name": project.client.name if project.client else None,
        "name": project.name,
        "description": project.description,
        "agreed_amount": from_cents(project.agreed_amount),
        "currency": project.currency,
        "budget": budget_amount,
        "budget_remaining": round_money(budget_remaining) if budget_remaining is not None else None,
        "budget_spent_percent": round_money(budget_spent_percent),
        "status": project.status,
        "start_date": project.start_date,
        "end_date": project.end_date,
        "created_at": project.created_at,
        "updated_at": project.updated_at,
        "invoiced_total": round_money(invoiced_total),
        "revenue": round_money(revenue),
        "expenses": round_money(total_expenses),
        "profit": round_money(profit),
        "profit_margin_percent": round_money(profit_margin),
        "invoices_count": len(invoices),
        "expenses_count": len(expenses)
    }

    if include_details:
        result["invoices"] = [
            {
                "id": inv.id,
                "invoice_number": inv.invoice_number,
                "status": inv.status.value if hasattr(inv.status, "value") else str(inv.status),
                "total_amount": from_cents(inv.total_amount),
                "balance_due": from_cents(inv.balance_due),
                "amount_paid": from_cents(inv.amount_paid),
                "due_date": inv.due_date,
                "currency": inv.currency
            }
            for inv in invoices
        ]
        result["expenses_list"] = [
            {
                "id": tx.id,
                "description": tx.description,
                "amount": from_cents(tx.amount),
                "currency": tx.currency,
                "date": tx.date,
                "category_name": tx.category.name if tx.category else None,
                "receipt_url": tx.receipt_url
            }
            for tx in expenses
        ]

    return result

@router.get("", response_model=List[dict])
def get_projects(client_id: Optional[str] = None, user_id: str = Depends(get_current_user_id), db: Session = Depends(get_db)):
    query = db.query(Project).filter(Project.user_id == user_id)
    if client_id:
        query = query.filter(Project.client_id == client_id)
    projects = query.order_by(Project.created_at.desc()).all()
    return [enrich_project(p, db) for p in projects]

@router.get("/{project_id}", response_model=dict)
def get_project(project_id: str, user_id: str = Depends(get_current_user_id), db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id, Project.user_id == user_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found.")
    return enrich_project(project, db)

@router.post("", response_model=dict, status_code=status.HTTP_201_CREATED)
def create_project(data: ProjectCreate, user_id: str = Depends(get_current_user_id), db: Session = Depends(get_db)):
    project = Project(
        user_id=user_id,
        client_id=data.client_id,
        name=data.name,
        description=data.description,
        agreed_amount=to_cents(data.agreed_amount),
        currency=data.currency.upper(),
        budget=to_cents(data.budget),
        status=data.status,
        start_date=data.start_date,
        end_date=data.end_date
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    return enrich_project(project, db)

@router.put("/{project_id}", response_model=dict)
def update_project(project_id: str, data: ProjectUpdate, user_id: str = Depends(get_current_user_id), db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id, Project.user_id == user_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found.")
    
    for k, v in data.dict(exclude_unset=True).items():
        if k in ("agreed_amount", "budget") and v is not None:
            v = to_cents(v)
        setattr(project, k, v)
        
    db.commit()
    db.refresh(project)
    return enrich_project(project, db)

@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(project_id: str, user_id: str = Depends(get_current_user_id), db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id, Project.user_id == user_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found.")
    db.delete(project)
    db.commit()
    return None
