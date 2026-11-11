from typing import List, Optional, Set

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload, selectinload

from backend.app.core.database import get_db
from backend.app.core.security import get_current_user_id
from backend.app.engine.calculations import FinancialEngine
from backend.app.engine.money import convert_to_cents, from_cents, to_cents
from backend.app.models.models import Account, Loan, LoanPayment, Transaction, TransactionType
from backend.app.schemas.schemas import LoanCreate, LoanPaymentCreate, LoanResponse, LoanUpdate

router = APIRouter(prefix="/loans", tags=["Loans & Debt"])


def loan_options():
    return (
        joinedload(Loan.received_into_account),
        selectinload(Loan.payments).joinedload(LoanPayment.account),
    )


def get_loan(db: Session, loan_id: str, user_id: str) -> Optional[Loan]:
    return (
        db.query(Loan)
        .options(*loan_options())
        .filter(Loan.id == loan_id, Loan.user_id == user_id)
        .first()
    )


def require_active_account(db: Session, account_id: Optional[str], user_id: str) -> Optional[Account]:
    if not account_id:
        return None
    account = db.query(Account).filter(
        Account.id == account_id,
        Account.user_id == user_id,
        Account.is_archived == False,
    ).first()
    if not account:
        raise HTTPException(status_code=400, detail="Select an active account that belongs to your profile.")
    return account


def create_transfer_transaction(
    *, user_id: str, description: str, date, cents: int, currency: str,
    account: Account, incoming: bool, notes: Optional[str] = None
) -> Transaction:
    account_amount = convert_to_cents(from_cents(cents), currency, account.currency)
    return Transaction(
        user_id=user_id,
        type=TransactionType.TRANSFER,
        amount=account_amount,
        currency=account.currency,
        fee_amount=0,
        description=description,
        date=date,
        source_account_id=None if incoming else account.id,
        destination_account_id=account.id if incoming else None,
        is_business=False,
        is_tax_deductible=False,
        status="CONFIRMED",
        notes=notes,
    )


def sync_loan_receipt(
    loan: Loan,
    user_id: str,
    db: Session,
    affected_accounts: Set[str],
    create_if_missing: bool = False,
) -> None:
    account = None
    if loan.received_into_account_id:
        account = db.query(Account).filter(
            Account.id == loan.received_into_account_id,
            Account.user_id == user_id,
        ).first()
        if not account:
            raise HTTPException(status_code=400, detail="Selected deposit account could not be found.")
    transaction = None
    if loan.receipt_transaction_id:
        transaction = db.query(Transaction).filter(
            Transaction.id == loan.receipt_transaction_id,
            Transaction.user_id == user_id,
        ).first()

    if transaction and transaction.destination_account_id:
        affected_accounts.add(transaction.destination_account_id)

    if not account:
        if transaction:
            loan.receipt_transaction_id = None
            loan.receipt_transaction = None
            db.flush()
            db.delete(transaction)
        return

    affected_accounts.add(account.id)
    description = f"Loan received from {loan.lender_name}"
    if transaction:
        transaction.description = description
        transaction.date = loan.date_borrowed
        transaction.amount = convert_to_cents(from_cents(loan.principal_amount), loan.currency, account.currency)
        transaction.currency = account.currency
        transaction.source_account_id = None
        transaction.destination_account_id = account.id
        transaction.status = "CONFIRMED"
    elif create_if_missing:
        transaction = create_transfer_transaction(
            user_id=user_id,
            description=description,
            date=loan.date_borrowed,
            cents=loan.principal_amount,
            currency=loan.currency,
            account=account,
            incoming=True,
            notes=f"Loan funds: {loan.purpose or loan.loan_type}",
        )
        db.add(transaction)
        db.flush()
        loan.receipt_transaction_id = transaction.id


def enrich_loan(loan: Loan) -> dict:
    payments = loan.payments or []
    principal_repaid = sum((payment.principal_amount or 0) for payment in payments)
    interest_paid = sum((payment.interest_amount or 0) for payment in payments)
    principal = loan.principal_amount or 0
    balance_due = max(0, principal - principal_repaid)

    return {
        "id": loan.id,
        "user_id": loan.user_id,
        "lender_name": loan.lender_name,
        "loan_type": loan.loan_type,
        "principal_amount": from_cents(principal),
        "principal_repaid": from_cents(principal_repaid),
        "interest_paid": from_cents(interest_paid),
        "total_repaid": from_cents(principal_repaid + interest_paid),
        "balance_due": from_cents(balance_due),
        "currency": loan.currency,
        "date_borrowed": loan.date_borrowed,
        "due_date": loan.due_date,
        "annual_interest_rate": loan.annual_interest_rate,
        "purpose": loan.purpose,
        "received_into_account_id": loan.received_into_account_id,
        "received_into_account_name": loan.received_into_account.name if loan.received_into_account else None,
        "notes": loan.notes,
        "status": "PAID_OFF" if balance_due == 0 else "ACTIVE",
        "payments": [
            {
                "id": payment.id,
                "principal_amount": from_cents(payment.principal_amount),
                "interest_amount": from_cents(payment.interest_amount),
                "total_amount": from_cents((payment.principal_amount or 0) + (payment.interest_amount or 0)),
                "currency": loan.currency,
                "payment_date": payment.payment_date,
                "account_id": payment.account_id,
                "account_name": payment.account.name if payment.account else None,
                "notes": payment.notes,
                "created_at": payment.created_at,
            }
            for payment in payments
        ],
        "created_at": loan.created_at,
        "updated_at": loan.updated_at,
    }


def refresh_accounts(db: Session, account_ids: Set[str]) -> None:
    for account_id in account_ids:
        FinancialEngine.recalculate_account_balance(db, account_id)


@router.get("", response_model=List[LoanResponse])
def get_loans(user_id: str = Depends(get_current_user_id), db: Session = Depends(get_db)):
    loans = (
        db.query(Loan)
        .options(*loan_options())
        .filter(Loan.user_id == user_id)
        .order_by(Loan.date_borrowed.desc(), Loan.created_at.desc())
        .all()
    )
    return [enrich_loan(loan) for loan in loans]


@router.post("", response_model=LoanResponse, status_code=status.HTTP_201_CREATED)
def create_loan(data: LoanCreate, user_id: str = Depends(get_current_user_id), db: Session = Depends(get_db)):
    require_active_account(db, data.received_into_account_id, user_id)
    loan = Loan(
        user_id=user_id,
        lender_name=data.lender_name,
        loan_type=data.loan_type.value,
        principal_amount=to_cents(data.principal_amount),
        currency=data.currency,
        date_borrowed=data.date_borrowed,
        due_date=data.due_date,
        annual_interest_rate=data.annual_interest_rate,
        purpose=data.purpose,
        received_into_account_id=data.received_into_account_id,
        notes=data.notes,
    )
    db.add(loan)
    db.flush()

    affected_accounts: Set[str] = set()
    if loan.received_into_account_id:
        sync_loan_receipt(loan, user_id, db, affected_accounts, create_if_missing=True)

    db.commit()
    refresh_accounts(db, affected_accounts)
    return enrich_loan(get_loan(db, loan.id, user_id))


@router.put("/{loan_id}", response_model=LoanResponse)
def update_loan(
    loan_id: str,
    data: LoanUpdate,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    loan = get_loan(db, loan_id, user_id)
    if not loan:
        raise HTTPException(status_code=404, detail="Loan record not found.")

    updates = data.dict(exclude_unset=True)
    required_fields = {"lender_name", "loan_type", "principal_amount", "currency", "date_borrowed"}
    if any(key in updates and updates[key] is None for key in required_fields):
        raise HTTPException(status_code=400, detail="Lender, loan type, principal, currency, and borrowed date are required.")

    paid_principal = sum((payment.principal_amount or 0) for payment in loan.payments)
    new_principal = to_cents(updates["principal_amount"]) if updates.get("principal_amount") is not None else loan.principal_amount
    if new_principal < paid_principal:
        raise HTTPException(status_code=400, detail="Original principal cannot be lower than principal already repaid.")

    new_currency = updates.get("currency", loan.currency)
    if new_currency and new_currency.upper() != loan.currency.upper() and loan.payments:
        raise HTTPException(status_code=400, detail="Currency cannot be changed after repayments have been recorded.")

    new_borrowed_date = updates.get("date_borrowed", loan.date_borrowed)
    new_due_date = updates.get("due_date", loan.due_date)
    if new_due_date and new_due_date < new_borrowed_date:
        raise HTTPException(status_code=400, detail="Due date cannot be before the borrowed date.")

    previous_account_id = loan.received_into_account_id
    if "received_into_account_id" in updates and updates["received_into_account_id"] != previous_account_id:
        require_active_account(db, updates["received_into_account_id"], user_id)

    for key, value in updates.items():
        if key == "principal_amount" and value is not None:
            value = to_cents(value)
        elif key == "currency" and value is not None:
            value = value.upper()
        elif key == "loan_type" and value is not None:
            value = value.value
        setattr(loan, key, value)

    funding_fields = {"lender_name", "principal_amount", "currency", "date_borrowed", "received_into_account_id"}
    affected_accounts: Set[str] = set()
    if funding_fields.intersection(updates):
        sync_loan_receipt(
            loan,
            user_id,
            db,
            affected_accounts,
            create_if_missing=(
                "received_into_account_id" in updates
                and updates["received_into_account_id"] is not None
                and updates["received_into_account_id"] != previous_account_id
            ),
        )

    db.commit()
    refresh_accounts(db, affected_accounts)
    return enrich_loan(get_loan(db, loan.id, user_id))


@router.delete("/{loan_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_loan(loan_id: str, user_id: str = Depends(get_current_user_id), db: Session = Depends(get_db)):
    loan = get_loan(db, loan_id, user_id)
    if not loan:
        raise HTTPException(status_code=404, detail="Loan record not found.")

    affected_accounts: Set[str] = set()
    transactions = []
    transaction_ids = set()
    if loan.receipt_transaction_id:
        transaction_ids.add(loan.receipt_transaction_id)
    for payment in loan.payments:
        if payment.transaction_id:
            transaction_ids.add(payment.transaction_id)
            if payment.account_id:
                affected_accounts.add(payment.account_id)

    if transaction_ids:
        transactions = db.query(Transaction).filter(
            Transaction.id.in_(transaction_ids),
            Transaction.user_id == user_id,
        ).all()
        for transaction in transactions:
            if transaction.source_account_id:
                affected_accounts.add(transaction.source_account_id)
            if transaction.destination_account_id:
                affected_accounts.add(transaction.destination_account_id)

    loan.receipt_transaction_id = None
    loan.receipt_transaction = None
    for payment in loan.payments:
        payment.transaction_id = None
        payment.transaction = None
    db.flush()
    for transaction in transactions:
        db.delete(transaction)
    db.delete(loan)
    db.commit()
    refresh_accounts(db, affected_accounts)
    return None


@router.post("/{loan_id}/payments", response_model=LoanResponse, status_code=status.HTTP_201_CREATED)
def record_loan_payment(
    loan_id: str,
    data: LoanPaymentCreate,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    loan = db.query(Loan).filter(Loan.id == loan_id, Loan.user_id == user_id).with_for_update().first()
    if not loan:
        raise HTTPException(status_code=404, detail="Loan record not found.")

    principal_cents = to_cents(data.principal_amount)
    interest_cents = to_cents(data.interest_amount)
    total_cents = principal_cents + interest_cents
    principal_paid = db.query(func.coalesce(func.sum(LoanPayment.principal_amount), 0)).filter(
        LoanPayment.loan_id == loan.id,
        LoanPayment.user_id == user_id,
    ).scalar() or 0
    balance_due = max(0, loan.principal_amount - principal_paid)

    if total_cents <= 0:
        raise HTTPException(status_code=400, detail="Payment must be greater than zero.")
    if balance_due <= 0:
        raise HTTPException(status_code=400, detail="This loan is already paid off.")
    if principal_cents > balance_due:
        raise HTTPException(status_code=400, detail="Principal paid cannot exceed the remaining loan balance.")

    account = require_active_account(db, data.account_id, user_id)
    payment = LoanPayment(
        user_id=user_id,
        loan_id=loan.id,
        principal_amount=principal_cents,
        interest_amount=interest_cents,
        payment_date=data.payment_date,
        account_id=account.id if account else None,
        notes=data.notes,
    )
    db.add(payment)
    db.flush()

    affected_accounts: Set[str] = set()
    if account:
        transaction = create_transfer_transaction(
            user_id=user_id,
            description=f"Loan repayment to {loan.lender_name}",
            date=data.payment_date,
            cents=total_cents,
            currency=loan.currency,
            account=account,
            incoming=False,
            notes=f"Loan repayment: {loan.loan_type}",
        )
        db.add(transaction)
        db.flush()
        payment.transaction_id = transaction.id
        affected_accounts.add(account.id)

    db.commit()
    refresh_accounts(db, affected_accounts)
    return enrich_loan(get_loan(db, loan.id, user_id))


@router.delete("/{loan_id}/payments/{payment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_loan_payment(
    loan_id: str,
    payment_id: str,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    payment = db.query(LoanPayment).filter(
        LoanPayment.id == payment_id,
        LoanPayment.loan_id == loan_id,
        LoanPayment.user_id == user_id,
    ).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Loan payment not found.")

    affected_accounts: Set[str] = set()
    transaction = None
    if payment.transaction_id:
        transaction = db.query(Transaction).filter(
            Transaction.id == payment.transaction_id,
            Transaction.user_id == user_id,
        ).first()
    if payment.account_id:
        affected_accounts.add(payment.account_id)
    if transaction:
        if transaction.source_account_id:
            affected_accounts.add(transaction.source_account_id)
        if transaction.destination_account_id:
            affected_accounts.add(transaction.destination_account_id)
        payment.transaction_id = None
        payment.transaction = None
        db.flush()
        db.delete(transaction)

    db.delete(payment)
    db.commit()
    refresh_accounts(db, affected_accounts)
    return None
