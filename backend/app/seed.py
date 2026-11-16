"""Create a realistic, repeatable sample workspace for the public demo."""

from calendar import monthrange
from datetime import date, timedelta
from threading import Lock

from sqlalchemy.orm import Session

from backend.app.api.v1.auth import seed_default_categories
from backend.app.core.database import SessionLocal
from backend.app.engine.calculations import FinancialEngine
from backend.app.models.models import (
    Account,
    AccountType,
    Budget,
    BudgetCategory,
    BudgetPeriod,
    BillingFrequency,
    Category,
    Client,
    Invoice,
    InvoiceItem,
    InvoicePayment,
    InvoiceStatus,
    Loan,
    LoanType,
    Project,
    SavingsContribution,
    SavingsGoal,
    Subscription,
    TaxProfile,
    Transaction,
    TransactionType,
    UserProfile,
)


DEMO_USER_ID = "incomedesk-public-demo"
DEMO_EMAIL = "alex.morgan@example.com"
DEMO_NAME = "Alex Morgan"
_seed_lock = Lock()
_seed_initialized = False


def ensure_demo_data(db: Session) -> None:
    """Initialize the public sample once per worker before serving demo APIs."""
    global _seed_initialized
    if _seed_initialized:
        return
    with _seed_lock:
        if _seed_initialized:
            return
        seed_demo_data(db=db)
        _seed_initialized = True


def _month_start(today: date, month_offset: int) -> date:
    absolute_month = today.year * 12 + today.month - 1 + month_offset
    return date(absolute_month // 12, absolute_month % 12 + 1, 1)


def _month_date(month: date, day: int, today: date) -> date:
    desired_day = min(day, monthrange(month.year, month.month)[1])
    if month.year == today.year and month.month == today.month:
        desired_day = min(desired_day, max(1, today.day - 1))
    return date(month.year, month.month, desired_day)


def _get_category(db: Session, user_id: str, name: str) -> Category:
    return db.query(Category).filter(Category.user_id == user_id, Category.name == name).one()


def _get_or_create_transaction(
    db: Session,
    *,
    user_id: str,
    description: str,
    tx_type: TransactionType,
    amount: int,
    tx_date: date,
    account_id: str,
    category_id: str | None = None,
    client_id: str | None = None,
    project_id: str | None = None,
    fee_amount: int = 0,
    source_account_id: str | None = None,
    destination_account_id: str | None = None,
) -> Transaction:
    transaction = db.query(Transaction).filter(
        Transaction.user_id == user_id,
        Transaction.description == description,
    ).first()
    if transaction:
        return transaction

    category = db.query(Category).filter(Category.id == category_id).first() if category_id else None
    transaction = Transaction(
        user_id=user_id,
        type=tx_type,
        amount=amount,
        currency="USD",
        fee_amount=fee_amount,
        description=description,
        date=tx_date,
        source_account_id=source_account_id or (account_id if tx_type == TransactionType.EXPENSE else None),
        destination_account_id=destination_account_id or (account_id if tx_type == TransactionType.INCOME else None),
        category_id=category_id,
        client_id=client_id,
        project_id=project_id,
        is_business=True,
        is_tax_deductible=bool(category and category.is_tax_deductible),
        payment_method="Bank transfer",
        status="CONFIRMED",
    )
    db.add(transaction)
    db.flush()
    return transaction


def _get_or_create_invoice(
    db: Session,
    *,
    user_id: str,
    client: Client,
    project_id: str,
    invoice_number: str,
    issue_date: date,
    due_date: date,
    total: int,
    amount_paid: int = 0,
    status: InvoiceStatus,
    item_description: str,
) -> Invoice:
    invoice = db.query(Invoice).filter(
        Invoice.user_id == user_id,
        Invoice.invoice_number == invoice_number,
    ).first()
    if invoice:
        return invoice

    invoice = Invoice(
        user_id=user_id,
        client_id=client.id,
        project_id=project_id,
        invoice_number=invoice_number,
        status=status,
        issue_date=issue_date,
        due_date=due_date,
        currency="USD",
        subtotal=total,
        total_amount=total,
        amount_paid=amount_paid,
        balance_due=total - amount_paid,
        notes="Sample client work and payment history.",
        payment_instructions="Payment by ACH within the agreed terms.",
    )
    db.add(invoice)
    db.flush()
    db.add(InvoiceItem(
        invoice_id=invoice.id,
        description=item_description,
        quantity=1,
        unit_price=total,
        total_amount=total,
    ))
    return invoice


def _record_invoice_payment(
    db: Session,
    *,
    user_id: str,
    invoice: Invoice,
    amount: int,
    fee: int,
    payment_date: date,
    account_id: str,
    client_id: str,
    project_id: str,
) -> None:
    existing = db.query(InvoicePayment).filter(
        InvoicePayment.user_id == user_id,
        InvoicePayment.invoice_id == invoice.id,
        InvoicePayment.payment_date == payment_date,
    ).first()
    if existing:
        return

    transaction = _get_or_create_transaction(
        db,
        user_id=user_id,
        description=f"Payment for {invoice.invoice_number}",
        tx_type=TransactionType.INCOME,
        amount=amount,
        tx_date=payment_date,
        account_id=account_id,
        category_id=_get_category(
            db,
            user_id,
            "Monthly Retainers" if invoice.invoice_number.endswith("-RET") else "Client Projects",
        ).id,
        client_id=client_id,
        project_id=project_id,
        fee_amount=fee,
    )
    db.add(InvoicePayment(
        user_id=user_id,
        invoice_id=invoice.id,
        amount=amount,
        fee_amount=fee,
        payment_date=payment_date,
        account_id=account_id,
        transaction_id=transaction.id,
        notes="Sample payment received by ACH.",
    ))


def seed_demo_data(user_id: str = DEMO_USER_ID, db: Session | None = None) -> None:
    """Seed at least four months of linked demo data; safe to call repeatedly."""
    owns_session = db is None
    session = db or SessionLocal()
    today = date.today()

    try:
        # Once a complete ledger exists, avoid doing seed work on each API call.
        seeded_transactions = session.query(Transaction).filter(
            Transaction.user_id == user_id,
            Transaction.description.like("Tax reserve transfer · %"),
        ).count()
        existing_profile = session.query(UserProfile).filter(UserProfile.user_id == user_id).first()
        if existing_profile and seeded_transactions >= 4:
            return

        profile = existing_profile or UserProfile(
            user_id=user_id,
            full_name=DEMO_NAME,
            email=DEMO_EMAIL,
            base_currency="USD",
            fiscal_year_start=1,
            country="US",
            tax_reserve_rate=25,
            user_type="demo",
        )
        if existing_profile is None:
            session.add(profile)
            session.flush()

        seed_default_categories(session, user_id)

        checking = session.query(Account).filter(
            Account.user_id == user_id,
            Account.name == "Northstar Business Checking",
        ).first()
        if checking is None:
            checking = Account(
                user_id=user_id,
                name="Northstar Business Checking",
                account_type=AccountType.BANK,
                currency="USD",
                opening_balance=685000,
                opening_balance_date=_month_start(today, -4),
                current_balance=685000,
                notes="Primary account for client receipts and business expenses.",
            )
            session.add(checking)

        reserve = session.query(Account).filter(
            Account.user_id == user_id,
            Account.name == "Tax & Emergency Reserve",
        ).first()
        if reserve is None:
            reserve = Account(
                user_id=user_id,
                name="Tax & Emergency Reserve",
                account_type=AccountType.SAVINGS,
                currency="USD",
                opening_balance=420000,
                opening_balance_date=_month_start(today, -4),
                current_balance=420000,
                notes="Quarterly tax and cash-flow reserve.",
            )
            session.add(reserve)
        session.flush()

        clients_data = [
            ("Northstar Studio", "Northstar Studio LLC", "finance@northstarstudio.example", "Net 15", "United States"),
            ("Cedar & Slate", "Cedar & Slate Home", "ap@cedarandslate.example", "Net 30", "United States"),
            ("Harbor & Pine", "Harbor & Pine Goods", "accounts@harborpine.example", "Net 30", "Canada"),
        ]
        clients: dict[str, Client] = {}
        for name, company, email, terms, country in clients_data:
            client = session.query(Client).filter(Client.user_id == user_id, Client.name == name).first()
            if client is None:
                client = Client(
                    user_id=user_id,
                    name=name,
                    company_name=company,
                    email=email,
                    country=country,
                    default_currency="USD",
                    payment_terms=terms,
                    notes="Sample freelance design client.",
                )
                session.add(client)
            clients[name] = client
        session.flush()

        projects_data = [
            ("Product design retainer", clients["Northstar Studio"], 540000, 130000),
            ("E-commerce refresh", clients["Cedar & Slate"], 840000, 250000),
            ("Brand launch toolkit", clients["Harbor & Pine"], 590000, 175000),
        ]
        projects: dict[str, object] = {}
        for name, client, agreed_amount, budget in projects_data:
            project = session.query(Project).filter(
                Project.user_id == user_id,
                Project.name == name,
            ).first()
            if project is None:
                project = Project(
                    user_id=user_id,
                    client_id=client.id,
                    name=name,
                    description=f"Design and creative services for {client.company_name}.",
                    agreed_amount=agreed_amount,
                    currency="USD",
                    budget=budget,
                    status="IN_PROGRESS",
                    start_date=_month_start(today, -3),
                    end_date=today + timedelta(days=45),
                )
                session.add(project)
            projects[name] = project
        session.flush()

        months = [_month_start(today, offset) for offset in (-3, -2, -1, 0)]
        month_names = [month.strftime("%b %Y") for month in months]

        # Monthly retainer invoices and payments for four consecutive months.
        for month, label in zip(months, month_names):
            issue_date = _month_date(month, 2, today)
            payment_date = _month_date(month, 10, today)
            invoice_number = f"INV-{month:%Y%m}-RET"
            invoice = _get_or_create_invoice(
                session,
                user_id=user_id,
                client=clients["Northstar Studio"],
                project_id=projects["Product design retainer"].id,
                invoice_number=invoice_number,
                issue_date=issue_date,
                due_date=issue_date + timedelta(days=15),
                total=540000,
                amount_paid=540000,
                status=InvoiceStatus.PAID,
                item_description=f"Product design retainer — {label}",
            )
            _record_invoice_payment(
                session,
                user_id=user_id,
                invoice=invoice,
                amount=540000,
                fee=1500,
                payment_date=payment_date,
                account_id=checking.id,
                client_id=clients["Northstar Studio"].id,
                project_id=projects["Product design retainer"].id,
            )

        # Two completed project milestones give the ledger some varied income.
        milestone_specs = [
            (months[1], "Cedar & Slate", "E-commerce refresh", 320000, "INV-CEDAR-01"),
            (months[2], "Harbor & Pine", "Brand launch toolkit", 275000, "INV-HARBOR-01"),
        ]
        for month, client_name, project_name, amount, invoice_number in milestone_specs:
            issue_date = _month_date(month, 3, today)
            payment_date = _month_date(month, 13, today)
            invoice = _get_or_create_invoice(
                session,
                user_id=user_id,
                client=clients[client_name],
                project_id=projects[project_name].id,
                invoice_number=invoice_number,
                issue_date=issue_date,
                due_date=issue_date + timedelta(days=30),
                total=amount,
                amount_paid=amount,
                status=InvoiceStatus.PAID,
                item_description=f"Project milestone — {project_name}",
            )
            _record_invoice_payment(
                session,
                user_id=user_id,
                invoice=invoice,
                amount=amount,
                fee=0,
                payment_date=payment_date,
                account_id=checking.id,
                client_id=clients[client_name].id,
                project_id=projects[project_name].id,
            )

        # A partially paid invoice and a recent invoice make receivables useful.
        partial_issue = today - timedelta(days=12)
        partial_payment = today - timedelta(days=4)
        partial_invoice = _get_or_create_invoice(
            session,
            user_id=user_id,
            client=clients["Cedar & Slate"],
            project_id=projects["E-commerce refresh"].id,
            invoice_number=f"INV-{today:%Y%m}-CEDAR-02",
            issue_date=partial_issue,
            due_date=today + timedelta(days=18),
            total=480000,
            amount_paid=240000,
            status=InvoiceStatus.PARTIALLY_PAID,
            item_description="E-commerce product page and checkout milestone",
        )
        _record_invoice_payment(
            session,
            user_id=user_id,
            invoice=partial_invoice,
            amount=240000,
            fee=0,
            payment_date=partial_payment,
            account_id=checking.id,
            client_id=clients["Cedar & Slate"].id,
            project_id=projects["E-commerce refresh"].id,
        )

        sent_issue = today - timedelta(days=3)
        _get_or_create_invoice(
            session,
            user_id=user_id,
            client=clients["Harbor & Pine"],
            project_id=projects["Brand launch toolkit"].id,
            invoice_number=f"INV-{today:%Y%m}-HARBOR-02",
            issue_date=sent_issue,
            due_date=today + timedelta(days=27),
            total=315000,
            status=InvoiceStatus.SENT,
            item_description="Brand launch asset production",
        )

        # A small consulting engagement adds another realistic income source.
        _get_or_create_transaction(
            session,
            user_id=user_id,
            description="UX workshop and research review",
            tx_type=TransactionType.INCOME,
            amount=125000,
            tx_date=_month_date(months[3], 12, today),
            account_id=checking.id,
            category_id=_get_category(session, user_id, "Consulting & Advisory").id,
            client_id=clients["Northstar Studio"].id,
            project_id=projects["Product design retainer"].id,
        )

        expense_specs = [
            ("Adobe Creative Cloud", "Software & Subscriptions", 8999, 4),
            ("Figma Professional", "Software & Subscriptions", 2400, 6),
            ("Coworking desk", "Office Supplies & Workspace", 38000, 8),
            ("Business internet", "Internet & Utilities", 8500, 10),
            ("Contract design support", "Freelance Contractors & Crew", 95000, 12),
            ("Client research lunch", "Meals & Entertainment", 7200, 14),
            ("Bank and payment fees", "Bank & Transaction Fees", 1899, 2),
        ]
        for month, label in zip(months, month_names):
            for description, category_name, amount, day in expense_specs:
                _get_or_create_transaction(
                    session,
                    user_id=user_id,
                    description=f"{description} · {label}",
                    tx_type=TransactionType.EXPENSE,
                    amount=amount,
                    tx_date=_month_date(month, day, today),
                    account_id=checking.id,
                    category_id=_get_category(session, user_id, category_name).id,
                    project_id=projects["Product design retainer"].id if category_name == "Freelance Contractors & Crew" else None,
                )

        subscription_specs = [
            ("Adobe Creative Cloud", "Adobe", 8999, "Software & Subscriptions", 5),
            ("Figma Professional", "Figma", 2400, "Software & Subscriptions", 11),
            ("Google Workspace", "Google", 1800, "Internet & Utilities", 19),
        ]
        for name, vendor, amount, category_name, days_until_renewal in subscription_specs:
            subscription = session.query(Subscription).filter(
                Subscription.user_id == user_id,
                Subscription.name == name,
            ).first()
            if subscription is None:
                session.add(Subscription(
                    user_id=user_id,
                    name=name,
                    vendor=vendor,
                    amount=amount,
                    currency="USD",
                    billing_frequency=BillingFrequency.MONTHLY,
                    next_payment_date=today + timedelta(days=days_until_renewal),
                    account_id=checking.id,
                    category_id=_get_category(session, user_id, category_name).id,
                    is_active=True,
                    notes="Sample recurring business subscription.",
                ))

        # Transfers keep cash flow and account balances believable without
        # inflating income or expenses.
        for month, label in zip(months, month_names):
            transfer = session.query(Transaction).filter(
                Transaction.user_id == user_id,
                Transaction.description == f"Tax reserve transfer · {label}",
            ).first()
            if transfer is None:
                session.add(Transaction(
                    user_id=user_id,
                    type=TransactionType.TRANSFER,
                    amount=135000,
                    currency="USD",
                    fee_amount=0,
                    description=f"Tax reserve transfer · {label}",
                    date=_month_date(month, 24, today),
                    source_account_id=checking.id,
                    destination_account_id=reserve.id,
                    is_business=True,
                    is_tax_deductible=False,
                    payment_method="Internal transfer",
                    status="CONFIRMED",
                ))

        # Monthly budget with categories that match the spending history.
        budget = session.query(Budget).filter(
            Budget.user_id == user_id,
            Budget.name == "Monthly studio operating budget",
        ).first()
        if budget is None:
            month_end = date(today.year, today.month, monthrange(today.year, today.month)[1])
            budget = Budget(
                user_id=user_id,
                name="Monthly studio operating budget",
                period=BudgetPeriod.MONTHLY,
                start_date=date(today.year, today.month, 1),
                end_date=month_end,
                total_allocated=200000,
                currency="USD",
                is_rollover=False,
            )
            session.add(budget)
            session.flush()
            for name, amount in [
                ("Software & Subscriptions", 18000),
                ("Office Supplies & Workspace", 50000),
                ("Internet & Utilities", 12000),
                ("Freelance Contractors & Crew", 100000),
                ("Meals & Entertainment", 10000),
                ("Bank & Transaction Fees", 10000),
            ]:
                session.add(BudgetCategory(
                    budget_id=budget.id,
                    category_id=_get_category(session, user_id, name).id,
                    allocated_amount=amount,
                ))

        # Goals and contributions echo the monthly reserve transfers.
        goal_specs = [
            ("Quarterly tax reserve", 850000, 540000, "Tax set-aside for quarterly estimates."),
            ("Studio equipment upgrade", 350000, 125000, "Saving toward a calibrated design monitor."),
        ]
        goals: dict[str, SavingsGoal] = {}
        for name, target, current, notes in goal_specs:
            goal = session.query(SavingsGoal).filter(
                SavingsGoal.user_id == user_id,
                SavingsGoal.name == name,
            ).first()
            if goal is None:
                goal = SavingsGoal(
                    user_id=user_id,
                    name=name,
                    target_amount=target,
                    currency="USD",
                    current_amount=current,
                    target_date=today + timedelta(days=120),
                    notes=notes,
                )
                session.add(goal)
            goals[name] = goal
        session.flush()

        tax_goal = goals["Quarterly tax reserve"]
        for month, label in zip(months, month_names):
            contribution_date = _month_date(month, 24, today)
            existing_contribution = session.query(SavingsContribution).filter(
                SavingsContribution.user_id == user_id,
                SavingsContribution.savings_goal_id == tax_goal.id,
                SavingsContribution.contribution_date == contribution_date,
            ).first()
            if existing_contribution is None:
                session.add(SavingsContribution(
                    savings_goal_id=tax_goal.id,
                    user_id=user_id,
                    amount=135000,
                    contribution_date=contribution_date,
                    account_id=reserve.id,
                    notes=f"Monthly reserve contribution — {label}",
                ))

        equipment_goal = goals["Studio equipment upgrade"]
        for month in months[-2:]:
            contribution_date = _month_date(month, 25, today)
            existing_contribution = session.query(SavingsContribution).filter(
                SavingsContribution.user_id == user_id,
                SavingsContribution.savings_goal_id == equipment_goal.id,
                SavingsContribution.contribution_date == contribution_date,
            ).first()
            if existing_contribution is None:
                session.add(SavingsContribution(
                    savings_goal_id=equipment_goal.id,
                    user_id=user_id,
                    amount=62500,
                    contribution_date=contribution_date,
                    account_id=reserve.id,
                    notes=f"Equipment fund contribution — {contribution_date:%b %Y}",
                ))

        # A modest equipment loan fills out the debt view without dominating it.
        loan = session.query(Loan).filter(
            Loan.user_id == user_id,
            Loan.lender_name == "Studio equipment financing",
        ).first()
        if loan is None:
            loan = Loan(
                user_id=user_id,
                lender_name="Studio equipment financing",
                loan_type=LoanType.BUSINESS.value,
                principal_amount=420000,
                currency="USD",
                date_borrowed=today - timedelta(days=150),
                due_date=today + timedelta(days=215),
                annual_interest_rate=7.5,
                purpose="Color-accurate monitor and desk setup.",
                notes="Sample equipment financing balance.",
                received_into_account_id=checking.id,
            )
            session.add(loan)

        tax_profile = session.query(TaxProfile).filter(
            TaxProfile.user_id == user_id,
            TaxProfile.tax_year == today.year,
        ).first()
        if tax_profile is None:
            session.add(TaxProfile(
                user_id=user_id,
                country="US",
                jurisdiction="Federal",
                tax_year=today.year,
                estimated_tax_rate=25,
                tax_reserve_percentage=25,
                notes="Sample quarterly estimated tax reserve target.",
            ))

        session.flush()
        FinancialEngine.recalculate_account_balance(session, checking.id)
        FinancialEngine.recalculate_account_balance(session, reserve.id)
        session.commit()
        print(f"Demo workspace successfully seeded for '{user_id}'.")
    except Exception:
        session.rollback()
        raise
    finally:
        if owns_session:
            session.close()


if __name__ == "__main__":
    seed_demo_data()
