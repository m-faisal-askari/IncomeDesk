from decimal import Decimal
from datetime import date
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.app.models.models import Base, Client, Project, Invoice, Transaction, TransactionType, InvoiceStatus
from backend.app.api.v1.projects import enrich_project
from backend.app.engine.money import to_cents

def test_enrich_project_production_budget_and_margin():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine)
    db = Session()

    client = Client(
        id="client-1",
        user_id="user-1",
        name="Nike Global",
        email="contact@nike.com"
    )
    db.add(client)

    proj = Project(
        id="proj-123",
        user_id="user-1",
        client_id="client-1",
        name="Brand Commercial Film",
        description="Shooting 60s TV commercial",
        agreed_amount=to_cents(Decimal("10000.00")), # $10,000 contract
        currency="USD",
        budget=to_cents(Decimal("3000.00")),        # $3,000 production budget
        status="IN_PROGRESS"
    )
    db.add(proj)

    # 1 invoice of $10,000 with $5,000 paid
    inv = Invoice(
        id="inv-1",
        user_id="user-1",
        client_id="client-1",
        project_id="proj-123",
        invoice_number="INV-001",
        status=InvoiceStatus.PARTIALLY_PAID,
        issue_date=date(2026, 11, 1),
        due_date=date(2026, 12, 1),
        currency="USD",
        subtotal=to_cents(Decimal("10000.00")),
        total_amount=to_cents(Decimal("10000.00")),
        amount_paid=to_cents(Decimal("5000.00")),
        balance_due=to_cents(Decimal("5000.00"))
    )
    db.add(inv)

    # 2 direct project expenses (camera kit rental + sound recordist) totaling $1,800
    tx1 = Transaction(
        id="tx-1",
        user_id="user-1",
        client_id="client-1",
        project_id="proj-123",
        type=TransactionType.EXPENSE,
        amount=to_cents(Decimal("1200.00")),
        currency="USD",
        fee_amount=0,
        description="Camera Kit Rental (Sony FX6)",
        date=date(2026, 11, 10),
        status="CONFIRMED"
    )
    tx2 = Transaction(
        id="tx-2",
        user_id="user-1",
        client_id="client-1",
        project_id="proj-123",
        type=TransactionType.EXPENSE,
        amount=to_cents(Decimal("600.00")),
        currency="USD",
        fee_amount=0,
        description="Sound Recordist Day Rate",
        date=date(2026, 11, 11),
        status="CONFIRMED"
    )
    db.add_all([tx1, tx2])
    db.commit()

    data = enrich_project(proj, db, include_details=True)

    assert data["agreed_amount"] == Decimal("10000.00")
    assert data["revenue"] == Decimal("5000.00")
    assert data["invoiced_total"] == Decimal("10000.00")
    assert data["expenses"] == Decimal("1800.00")
    # Profit: $5,000 revenue - $1,800 expenses = $3,200
    assert data["profit"] == Decimal("3200.00")
    # Profit margin: (3200 / 5000) * 100 = 64.00%
    assert data["profit_margin_percent"] == Decimal("64.00")
    # Production budget spent: 1800 / 3000 = 60.00%
    assert data["budget_spent_percent"] == Decimal("60.00")
    # Production budget remaining: 3000 - 1800 = 1200
    assert data["budget_remaining"] == Decimal("1200.00")
    assert len(data["invoices"]) == 1
    assert len(data["expenses_list"]) == 2

    db.close()
