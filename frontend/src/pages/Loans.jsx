import React, { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Calendar, CheckCircle2, DollarSign, FileText, Plus, Trash2, Pencil, Wallet } from 'lucide-react';
import { api } from '../api/client';
import { EmptyState } from '../components/EmptyState';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Modal } from '../components/Modal';
import { useCurrency } from '../contexts/CurrencyContext';
import { useToast } from '../contexts/ToastContext';
import { formatCurrency, formatDate } from '../utils/formatters';

const LOAN_TYPES = [
  ['PERSONAL', 'Personal loan'],
  ['BUSINESS', 'Business loan'],
  ['AUTO', 'Auto loan'],
  ['MORTGAGE', 'Mortgage'],
  ['STUDENT', 'Student loan'],
  ['CREDIT_CARD', 'Credit card balance'],
  ['FAMILY_FRIEND', 'Loan from family or friend'],
  ['OTHER', 'Other'],
];

const today = () => new Date().toISOString().slice(0, 10);

function emptyLoanForm(currency) {
  return {
    lender_name: '',
    loan_type: 'PERSONAL',
    principal_amount: '',
    currency: currency || 'USD',
    date_borrowed: today(),
    due_date: '',
    annual_interest_rate: '',
    purpose: '',
    received_into_account_id: '',
    notes: '',
  };
}

function loanFormFromLoan(loan) {
  return {
    lender_name: loan.lender_name || '',
    loan_type: loan.loan_type || 'OTHER',
    principal_amount: String(loan.principal_amount ?? ''),
    currency: loan.currency || 'USD',
    date_borrowed: loan.date_borrowed || today(),
    due_date: loan.due_date || '',
    annual_interest_rate: loan.annual_interest_rate == null ? '' : String(loan.annual_interest_rate),
    purpose: loan.purpose || '',
    received_into_account_id: loan.received_into_account_id || '',
    notes: loan.notes || '',
  };
}

function serializeLoanForm(form) {
  return {
    ...form,
    principal_amount: Number(form.principal_amount),
    currency: form.currency.toUpperCase(),
    due_date: form.due_date || null,
    annual_interest_rate: form.annual_interest_rate === '' ? null : Number(form.annual_interest_rate),
    received_into_account_id: form.received_into_account_id || null,
  };
}

function SummaryCard({ label, value, hint, icon: Icon, tone = 'indigo' }) {
  const tones = {
    indigo: 'bg-indigo-50 text-indigo-700',
    amber: 'bg-amber-50 text-amber-700',
    emerald: 'bg-emerald-50 text-emerald-700',
  };
  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-4 sm:p-5 shadow-xs">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-slate-500">{label}</p>
          <p className="mt-1 text-xl sm:text-2xl font-bold text-slate-900 truncate">{value}</p>
          <p className="mt-1 text-[10px] text-slate-400">{hint}</p>
        </div>
        <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${tones[tone]}`}>
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
      </div>
    </div>
  );
}

function LoanForm({ form, setForm, accounts = [], onSubmit, onCancel, isSaving, isEditing }) {
  const setField = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));
  const inputClass = 'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500';
  const labelClass = 'mb-1 block text-xs font-medium text-slate-700';

  return (
    <form onSubmit={onSubmit} className="space-y-4 text-xs">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Lender</label>
          <input required maxLength={200} value={form.lender_name} onChange={setField('lender_name')} placeholder="Bank, company, or person's name" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Loan type</label>
          <select value={form.loan_type} onChange={setField('loan_type')} className={inputClass}>
            {LOAN_TYPES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </div>
        <div>
          <label className={labelClass}>Original amount</label>
          <input required min="0.01" step="0.01" type="number" value={form.principal_amount} onChange={setField('principal_amount')} placeholder="0.00" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Currency</label>
          <select value={form.currency} onChange={setField('currency')} className={inputClass}>
            {['PKR', 'USD', 'EUR', 'GBP', 'CAD', 'AUD'].map((code) => <option key={code} value={code}>{code}</option>)}
          </select>
        </div>
        <div>
          <label className={labelClass}>Date borrowed</label>
          <input required type="date" value={form.date_borrowed} onChange={setField('date_borrowed')} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Due date</label>
          <input type="date" min={form.date_borrowed} value={form.due_date} onChange={setField('due_date')} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Annual interest rate (%)</label>
          <input min="0" max="999.9999" step="0.0001" type="number" value={form.annual_interest_rate} onChange={setField('annual_interest_rate')} placeholder="Optional" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Deposit account</label>
          <select value={form.received_into_account_id} onChange={setField('received_into_account_id')} className={inputClass}>
            <option value="">Not linked to an account</option>
            {accounts.filter((account) => !account.is_archived || account.id === form.received_into_account_id).map((account) => (
              <option key={account.id} value={account.id}>{account.name} ({account.currency}){account.is_archived ? ' — Archived' : ''}</option>
            ))}
          </select>
          <p className="mt-1 text-[10px] text-slate-400">Optional. Linking an account records the loan funds as a transfer, not income.</p>
        </div>
      </div>
      <div>
        <label className={labelClass}>What did you use the money for?</label>
        <textarea rows={2} maxLength={1000} value={form.purpose} onChange={setField('purpose')} placeholder="For example: equipment, rent, business startup costs" className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>Additional notes</label>
        <textarea rows={2} value={form.notes} onChange={setField('notes')} placeholder="Terms, reference number, or other details" className={inputClass} />
      </div>
      <p className="rounded-lg bg-amber-50 border border-amber-100 px-3 py-2 text-[11px] leading-relaxed text-amber-800">
        The interest rate is saved for reference. Interest does not accrue automatically; enter the interest portion when recording each repayment.
      </p>
      <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 border-t border-slate-100 pt-3">
        <button type="button" onClick={onCancel} className="rounded-lg border border-slate-200 px-4 py-2 font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
        <button type="submit" disabled={isSaving} className="rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-700 disabled:opacity-50">
          {isSaving ? 'Saving…' : isEditing ? 'Save loan details' : 'Add loan'}
        </button>
      </div>
    </form>
  );
}

function LoanPaymentForm({ loan, form, setForm, accounts = [], onSubmit, onCancel, isSaving }) {
  const setField = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));
  const inputClass = 'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500';
  const total = (Number(form.principal_amount) || 0) + (Number(form.interest_amount) || 0);
  return (
    <form onSubmit={onSubmit} className="space-y-4 text-xs">
      <p className="rounded-lg bg-slate-50 px-3 py-2 text-slate-600">
        Remaining principal: <strong className="text-slate-900">{formatCurrency(loan.balance_due, loan.currency)}</strong>
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-700">Principal paid</label>
          <input required min="0" step="0.01" type="number" value={form.principal_amount} onChange={setField('principal_amount')} className={inputClass} />
          <p className="mt-1 text-[10px] text-slate-400">This amount reduces the remaining balance.</p>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-700">Interest paid</label>
          <input min="0" step="0.01" type="number" value={form.interest_amount} onChange={setField('interest_amount')} className={inputClass} />
          <p className="mt-1 text-[10px] text-slate-400">Recorded separately from principal.</p>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-700">Payment date</label>
          <input required type="date" value={form.payment_date} onChange={setField('payment_date')} className={inputClass} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-700">Paid from account</label>
          <select value={form.account_id} onChange={setField('account_id')} className={inputClass}>
            <option value="">Do not change an account balance</option>
            {accounts.filter((account) => !account.is_archived).map((account) => (
              <option key={account.id} value={account.id}>{account.name} ({account.currency})</option>
            ))}
          </select>
          <p className="mt-1 text-[10px] text-slate-400">Optional. The total repayment reduces this account as a transfer.</p>
        </div>
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-700">Notes</label>
        <textarea rows={2} value={form.notes} onChange={setField('notes')} placeholder="Optional payment reference" className={inputClass} />
      </div>
      <div className="flex items-center justify-between rounded-lg border border-indigo-100 bg-indigo-50 px-3 py-2 text-xs">
        <span className="font-medium text-indigo-800">Total payment</span>
        <strong className="text-indigo-900">{formatCurrency(total, loan.currency)}</strong>
      </div>
      <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 border-t border-slate-100 pt-3">
        <button type="button" onClick={onCancel} className="rounded-lg border border-slate-200 px-4 py-2 font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
        <button type="submit" disabled={isSaving || total <= 0} className="rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-700 disabled:opacity-50">
          {isSaving ? 'Saving…' : 'Record repayment'}
        </button>
      </div>
    </form>
  );
}

export function Loans() {
  const queryClient = useQueryClient();
  const { currency, convert } = useCurrency();
  const { showSuccess, showError } = useToast();
  const [isLoanModalOpen, setIsLoanModalOpen] = useState(false);
  const [editingLoan, setEditingLoan] = useState(null);
  const [paymentLoan, setPaymentLoan] = useState(null);
  const [loanForm, setLoanForm] = useState(emptyLoanForm(currency));
  const [paymentForm, setPaymentForm] = useState({ principal_amount: '', interest_amount: '0', payment_date: today(), account_id: '', notes: '' });

  const { data: loans = [], isLoading } = useQuery({
    queryKey: ['loans'],
    queryFn: () => api.get('/loans'),
  });
  const { data: accounts = [] } = useQuery({
    queryKey: ['accounts'],
    queryFn: () => api.get('/accounts'),
  });

  const refreshLoanData = () => {
    queryClient.invalidateQueries(['loans']);
    queryClient.invalidateQueries(['accounts']);
    queryClient.invalidateQueries(['transactions']);
    queryClient.invalidateQueries(['dashboardSummary']);
  };

  const createMutation = useMutation({
    mutationFn: (data) => api.post('/loans', data),
    onSuccess: (loan) => {
      refreshLoanData();
      setIsLoanModalOpen(false);
      setEditingLoan(null);
      showSuccess(`Loan from ${loan.lender_name} added.`);
    },
    onError: (error) => showError(error.message, 'Could not add loan'),
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => api.put(`/loans/${id}`, data),
    onSuccess: (loan) => {
      refreshLoanData();
      setIsLoanModalOpen(false);
      setEditingLoan(null);
      showSuccess(`Loan from ${loan.lender_name} updated.`);
    },
    onError: (error) => showError(error.message, 'Could not update loan'),
  });
  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/loans/${id}`),
    onSuccess: () => {
      refreshLoanData();
      showSuccess('Loan record and its linked transfers were deleted.');
    },
    onError: (error) => showError(error.message, 'Could not delete loan'),
  });
  const paymentMutation = useMutation({
    mutationFn: ({ loanId, data }) => api.post(`/loans/${loanId}/payments`, data),
    onSuccess: (loan) => {
      refreshLoanData();
      setPaymentLoan(null);
      showSuccess(`Repayment to ${loan.lender_name} recorded.`);
    },
    onError: (error) => showError(error.message, 'Could not record repayment'),
  });
  const deletePaymentMutation = useMutation({
    mutationFn: ({ loanId, paymentId }) => api.delete(`/loans/${loanId}/payments/${paymentId}`),
    onSuccess: () => {
      refreshLoanData();
      showSuccess('Repayment removed. The loan balance has been recalculated.');
    },
    onError: (error) => showError(error.message, 'Could not remove repayment'),
  });

  const summary = useMemo(() => loans.reduce((totals, loan) => ({
    balance: totals.balance + convert(loan.balance_due, loan.currency),
    borrowed: totals.borrowed + convert(loan.principal_amount, loan.currency),
    repaid: totals.repaid + convert(loan.total_repaid, loan.currency),
    activeCount: totals.activeCount + (loan.status === 'ACTIVE' ? 1 : 0),
  }), { balance: 0, borrowed: 0, repaid: 0, activeCount: 0 }), [loans, convert]);

  const openCreate = () => {
    setEditingLoan(null);
    setLoanForm(emptyLoanForm(currency));
    setIsLoanModalOpen(true);
  };
  const openEdit = (loan) => {
    setEditingLoan(loan);
    setLoanForm(loanFormFromLoan(loan));
    setIsLoanModalOpen(true);
  };
  const openPayment = (loan) => {
    setPaymentLoan(loan);
    setPaymentForm({ principal_amount: String(loan.balance_due), interest_amount: '0', payment_date: today(), account_id: '', notes: '' });
  };
  const submitLoan = (event) => {
    event.preventDefault();
    const data = serializeLoanForm(loanForm);
    if (editingLoan) updateMutation.mutate({ id: editingLoan.id, data });
    else createMutation.mutate(data);
  };
  const submitPayment = (event) => {
    event.preventDefault();
    if (!paymentLoan) return;
    paymentMutation.mutate({
      loanId: paymentLoan.id,
      data: {
        principal_amount: Number(paymentForm.principal_amount) || 0,
        interest_amount: Number(paymentForm.interest_amount) || 0,
        payment_date: paymentForm.payment_date,
        account_id: paymentForm.account_id || null,
        notes: paymentForm.notes,
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Loans &amp; Debt</h2>
          <p className="text-xs sm:text-sm text-slate-500">Track lenders, loan terms, what the money went toward, and repayments.</p>
        </div>
        <button onClick={openCreate} className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-700">
          <Plus className="h-3.5 w-3.5" /> Add loan
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <SummaryCard label="Outstanding principal" value={formatCurrency(summary.balance, currency)} hint={`${summary.activeCount} active ${summary.activeCount === 1 ? 'loan' : 'loans'}`} icon={DollarSign} tone="amber" />
        <SummaryCard label="Total borrowed" value={formatCurrency(summary.borrowed, currency)} hint="Original principal across all loans" icon={Wallet} />
        <SummaryCard label="Total repaid" value={formatCurrency(summary.repaid, currency)} hint="Principal plus recorded interest" icon={CheckCircle2} tone="emerald" />
      </div>

      {isLoading ? (
        <LoadingSpinner text="Loading loan records..." />
      ) : loans.length === 0 ? (
        <EmptyState
          title="No loans recorded"
          description="Add a loan to keep track of the lender, amount borrowed, how you used it, due dates, and repayments."
          actionLabel="Add loan"
          onAction={openCreate}
          icon={FileText}
        />
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {loans.map((loan) => {
            const isOverdue = loan.status === 'ACTIVE' && loan.due_date && loan.due_date < today();
            const paidPercent = loan.principal_amount > 0 ? Math.min(100, (loan.principal_repaid / loan.principal_amount) * 100) : 0;
            return (
              <article key={loan.id} className="bg-white rounded-xl border border-slate-200/80 p-4 sm:p-5 shadow-xs space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-sm text-slate-900 truncate">{loan.lender_name}</h3>
                      <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-700">
                        {LOAN_TYPES.find(([value]) => value === loan.loan_type)?.[1] || 'Other'}
                      </span>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${loan.status === 'PAID_OFF' ? 'bg-emerald-50 text-emerald-700' : isOverdue ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'}`}>
                        {loan.status === 'PAID_OFF' ? 'Paid off' : isOverdue ? 'Past due' : 'Active'}
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] text-slate-500">Borrowed {formatDate(loan.date_borrowed)}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <button type="button" onClick={() => openEdit(loan)} title="Edit loan" className="rounded-md p-1.5 text-slate-400 hover:bg-slate-50 hover:text-indigo-600"><Pencil className="h-3.5 w-3.5" /></button>
                    <button type="button" onClick={() => {
                      if (window.confirm(`Delete the loan from ${loan.lender_name}? Its recorded repayments and linked account transfers will also be removed.`)) deleteMutation.mutate(loan.id);
                    }} title="Delete loan" className="rounded-md p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 rounded-lg bg-slate-50/80 p-3">
                  <div>
                    <p className="text-[10px] font-medium text-slate-500">Balance remaining</p>
                    <p className="mt-0.5 text-base font-bold text-amber-700">{formatCurrency(loan.balance_due, loan.currency)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-medium text-slate-500">Original amount</p>
                    <p className="mt-0.5 text-sm font-semibold text-slate-800">{formatCurrency(loan.principal_amount, loan.currency)}</p>
                  </div>
                  <div className="col-span-2">
                    <div className="mb-1 flex items-center justify-between text-[10px] text-slate-500">
                      <span>Principal repaid</span><span>{Math.round(paidPercent)}%</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
                      <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${paidPercent}%` }} />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-[11px]">
                  <p className="text-slate-500">Principal repaid <strong className="ml-1 text-slate-800">{formatCurrency(loan.principal_repaid, loan.currency)}</strong></p>
                  <p className="text-slate-500">Interest paid <strong className="ml-1 text-slate-800">{formatCurrency(loan.interest_paid, loan.currency)}</strong></p>
                  {loan.annual_interest_rate != null && <p className="text-slate-500">Rate <strong className="ml-1 text-slate-800">{Number(loan.annual_interest_rate)}% APR</strong></p>}
                  {loan.due_date && <p className={`flex items-center gap-1 ${isOverdue ? 'text-rose-600' : 'text-slate-500'}`}><Calendar className="h-3 w-3" /> Due {formatDate(loan.due_date)}</p>}
                  {loan.received_into_account_name && <p className="col-span-2 flex items-center gap-1 text-slate-500"><Wallet className="h-3 w-3 shrink-0" /> Deposited into {loan.received_into_account_name}</p>}
                </div>

                {loan.purpose && (
                  <div className="rounded-lg border border-slate-100 px-3 py-2">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Used for</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-slate-700">{loan.purpose}</p>
                  </div>
                )}

                <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-2 border-t border-slate-100 pt-3">
                  <details className="min-w-0 flex-1 text-xs">
                    <summary className="cursor-pointer font-semibold text-slate-600 hover:text-slate-900">
                      Payment history ({loan.payments.length})
                    </summary>
                    {loan.payments.length ? (
                      <div className="mt-2 space-y-1.5">
                        {loan.payments.map((payment) => (
                          <div key={payment.id} className="flex items-center justify-between gap-2 rounded-md bg-slate-50 px-2.5 py-2 text-[10px]">
                            <div className="min-w-0">
                              <p className="font-semibold text-slate-700">{formatDate(payment.payment_date)} · Principal {formatCurrency(payment.principal_amount, loan.currency)} · Interest {formatCurrency(payment.interest_amount, loan.currency)}</p>
                              <p className="truncate text-slate-400">{payment.account_name ? `Paid from ${payment.account_name}` : payment.notes || 'No payment note'}</p>
                            </div>
                            <button type="button" title="Remove repayment" onClick={() => {
                              if (window.confirm('Remove this repayment and restore its principal to the loan balance?')) deletePaymentMutation.mutate({ loanId: loan.id, paymentId: payment.id });
                            }} className="shrink-0 rounded p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600"><Trash2 className="h-3 w-3" /></button>
                          </div>
                        ))}
                      </div>
                    ) : <p className="mt-2 text-[10px] text-slate-400">No repayments recorded yet.</p>}
                  </details>
                  {loan.status === 'ACTIVE' && (
                    <button type="button" onClick={() => openPayment(loan)} className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-[11px] font-semibold text-white hover:bg-emerald-700">
                      <DollarSign className="h-3.5 w-3.5" /> Record repayment
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      <Modal isOpen={isLoanModalOpen} onClose={() => { setIsLoanModalOpen(false); setEditingLoan(null); }} title={editingLoan ? `Edit loan from ${editingLoan.lender_name}` : 'Add a loan'} maxWidth="max-w-2xl">
        <LoanForm
          form={loanForm}
          setForm={setLoanForm}
          accounts={accounts}
          onSubmit={submitLoan}
          onCancel={() => { setIsLoanModalOpen(false); setEditingLoan(null); }}
          isSaving={createMutation.isPending || updateMutation.isPending}
          isEditing={Boolean(editingLoan)}
        />
      </Modal>

      <Modal isOpen={Boolean(paymentLoan)} onClose={() => setPaymentLoan(null)} title={paymentLoan ? `Record repayment to ${paymentLoan.lender_name}` : 'Record repayment'}>
        {paymentLoan && (
          <LoanPaymentForm
            loan={paymentLoan}
            form={paymentForm}
            setForm={setPaymentForm}
            accounts={accounts}
            onSubmit={submitPayment}
            onCancel={() => setPaymentLoan(null)}
            isSaving={paymentMutation.isPending}
          />
        )}
      </Modal>
    </div>
  );
}
