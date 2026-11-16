import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Plus, Briefcase, Calendar, Edit3, Trash2, BarChart3, Receipt, FileText, CheckCircle2, AlertTriangle, Layers, DollarSign } from 'lucide-react';
import { api } from '../api/client';
import { Modal } from '../components/Modal';
import { Badge } from '../components/Badge';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
import { formatCurrency, formatDate } from '../utils/formatters';
import { useToast } from '../contexts/ToastContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { appPath } from '../utils/appPath';

export function Projects() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const { currency: defaultCurrency, convert } = useCurrency();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  // Financials & Breakdown Modal State
  const [isFinancialsModalOpen, setIsFinancialsModalOpen] = useState(false);
  const [financialsProject, setFinancialsProject] = useState(null);

  // Quick Expense Modal State
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [expenseForm, setExpenseForm] = useState({
    amount: '',
    currency: defaultCurrency || 'USD',
    description: '',
    date: new Date().toISOString().split('T')[0],
    source_account_id: '',
    category_id: '',
    project_id: '',
    client_id: '',
    is_business: true,
    is_tax_deductible: true,
    notes: ''
  });

  const [form, setForm] = useState({
    name: '',
    client_id: '',
    description: '',
    agreed_amount: '0.00',
    currency: defaultCurrency || 'USD',
    budget: '0.00',
    status: 'IN_PROGRESS',
    start_date: '',
    end_date: ''
  });

  const { data: projects, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => api.get('/projects'),
  });

  const { data: clients } = useQuery({
    queryKey: ['clients'],
    queryFn: () => api.get('/clients'),
  });

  const { data: accounts } = useQuery({
    queryKey: ['accounts'],
    queryFn: () => api.get('/accounts'),
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get('/categories'),
  });

  const expenseCategories = categories?.filter(c => c.type === 'EXPENSE') || [];

  const createProjectMutation = useMutation({
    mutationFn: (newProj) => api.post('/projects', newProj),
    onSuccess: (res) => {
      queryClient.invalidateQueries(['projects']);
      setIsModalOpen(false);
      setForm({ name: '', client_id: '', description: '', agreed_amount: '0.00', currency: defaultCurrency || 'USD', budget: '0.00', status: 'IN_PROGRESS', start_date: '', end_date: '' });
      showSuccess(`Project "${res.name}" created.`);
    },
    onError: (err) => {
      showError(err.message, 'Could not create project');
    }
  });

  const updateProjectMutation = useMutation({
    mutationFn: ({ id, data }) => api.put(`/projects/${id}`, data),
    onSuccess: (res) => {
      queryClient.invalidateQueries(['projects']);
      setIsEditModalOpen(false);
      setSelectedProject(null);
      if (financialsProject?.id === id) {
        setFinancialsProject(res);
      }
      showSuccess(`Project "${res.name}" updated.`);
    },
    onError: (err) => {
      showError(err.message, 'Could not update project');
    }
  });

  const deleteProjectMutation = useMutation({
    mutationFn: (id) => api.delete(`/projects/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['projects']);
      showSuccess('Project deleted.');
    },
    onError: (err) => {
      showError(err.message, 'Could not delete project');
    }
  });

  const createExpenseMutation = useMutation({
    mutationFn: (newExp) => api.post('/transactions', {
      ...newExp,
      type: 'EXPENSE',
      amount: parseFloat(newExp.amount)
    }),
    onSuccess: (res) => {
      queryClient.invalidateQueries(['projects']);
      queryClient.invalidateQueries(['transactions']);
      queryClient.invalidateQueries(['accounts']);
      queryClient.invalidateQueries(['dashboardSummary']);
      setIsExpenseModalOpen(false);
      showSuccess(`Project expense "${res.description}" recorded.`);
    },
    onError: (err) => {
      showError(err.message, 'Could not record project expense');
    }
  });

  const handleCreate = (e) => {
    e.preventDefault();
    createProjectMutation.mutate({
      ...form,
      agreed_amount: parseFloat(form.agreed_amount || 0),
      budget: parseFloat(form.budget || 0),
      start_date: form.start_date || null,
      end_date: form.end_date || null
    });
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    if (!selectedProject) return;
    updateProjectMutation.mutate({
      id: selectedProject.id,
      data: {
        ...form,
        agreed_amount: parseFloat(form.agreed_amount || 0),
        budget: parseFloat(form.budget || 0),
        start_date: form.start_date || null,
        end_date: form.end_date || null
      }
    });
  };

  const openEditModal = (proj) => {
    setSelectedProject(proj);
    setForm({
      name: proj.name || '',
      client_id: proj.client_id || '',
      description: proj.description || '',
      agreed_amount: proj.agreed_amount || '0.00',
      currency: proj.currency || 'USD',
      budget: proj.budget || '0.00',
      status: proj.status || 'IN_PROGRESS',
      start_date: proj.start_date ? proj.start_date.split('T')[0] : '',
      end_date: proj.end_date ? proj.end_date.split('T')[0] : ''
    });
    setIsEditModalOpen(true);
  };

  const openAddExpenseForProject = (proj) => {
    setExpenseForm({
      amount: '',
      currency: proj.currency || defaultCurrency || 'USD',
      description: '',
      date: new Date().toISOString().split('T')[0],
      source_account_id: accounts?.[0]?.id || '',
      category_id: expenseCategories[0]?.id || '',
      project_id: proj.id,
      client_id: proj.client_id || '',
      is_business: true,
      is_tax_deductible: true,
      notes: `Project Cost: ${proj.name}`
    });
    setIsExpenseModalOpen(true);
  };

  // Synchronize financials modal data if projects query refetches
  const activeFinancialsProject = financialsProject ? (projects?.find(p => p.id === financialsProject.id) || financialsProject) : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Project Management & Production Financials</h2>
          <p className="text-xs sm:text-sm text-slate-500">Track client contract value, direct production/gear costs, budgets, and net take-home margin</p>
        </div>

        <button
          onClick={() => {
            setForm({ name: '', client_id: '', description: '', agreed_amount: '0.00', currency: defaultCurrency || 'USD', budget: '0.00', status: 'IN_PROGRESS', start_date: '', end_date: '' });
            setIsModalOpen(true);
          }}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 shadow-sm transition"
        >
          <Plus className="w-3.5 h-3.5" />
          New Project
        </button>
      </div>

      {isLoading ? (
        <LoadingSpinner text="Loading projects..." />
      ) : !projects || projects.length === 0 ? (
        <EmptyState
          title="No projects created yet"
          description="Create client projects to track agreed value, allocated expenses, and profit margins."
          actionLabel="New Project"
          onAction={() => setIsModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((p) => {
            const hasBudget = parseFloat(p.budget || 0) > 0;
            const isOverBudget = hasBudget && parseFloat(p.expenses || 0) > parseFloat(p.budget);
            const profitMarginNum = parseFloat(p.profit_margin_percent || 0);

            return (
              <div key={p.id} className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs hover:shadow transition flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{p.name}</h4>
                      <p className="text-xs text-indigo-600 font-medium">{p.client_name || 'Direct / Independent'}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Badge status={p.status} />
                      <button
                        onClick={() => openEditModal(p)}
                        className="text-slate-400 hover:text-indigo-600 transition p-1"
                        title="Edit Project"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete project "${p.name}"?`)) {
                            deleteProjectMutation.mutate(p.id);
                          }
                        }}
                        className="text-slate-400 hover:text-rose-600 transition p-1"
                        title="Delete Project"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {p.description && (
                    <p className="mt-2 text-xs text-slate-500 line-clamp-2">{p.description}</p>
                  )}

                  {/* Financial Grid */}
                  <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Contract Value</span>
                      <span className="font-semibold text-slate-800">{formatCurrency(p.agreed_amount, p.currency)}</span>
                      {p.currency !== defaultCurrency && (
                        <div className="text-[10px] text-slate-400 font-normal">
                          ≈ {formatCurrency(convert(p.agreed_amount, p.currency), defaultCurrency)}
                        </div>
                      )}
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Revenue Realized</span>
                      <span className="font-semibold text-emerald-600">{formatCurrency(p.revenue, p.currency)}</span>
                      {p.currency !== defaultCurrency && (
                        <div className="text-[10px] text-slate-400 font-normal">
                          ≈ {formatCurrency(convert(p.revenue, p.currency), defaultCurrency)}
                        </div>
                      )}
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Direct Project Costs</span>
                      <span className="font-semibold text-rose-600">{formatCurrency(p.expenses, p.currency)}</span>
                      {p.currency !== defaultCurrency && (
                        <div className="text-[10px] text-slate-400 font-normal">
                          ≈ {formatCurrency(convert(p.expenses, p.currency), defaultCurrency)}
                        </div>
                      )}
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Take-Home Profit</span>
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-slate-900">{formatCurrency(p.profit, p.currency)}</span>
                        <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                          profitMarginNum >= 40
                            ? 'bg-emerald-50 text-emerald-700'
                            : profitMarginNum >= 15
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}>
                          {p.profit_margin_percent}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Production Budget Progress Bar */}
                  {hasBudget && (
                    <div className="mt-3 pt-3 border-t border-slate-100">
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="text-slate-500 font-medium">Production Budget</span>
                        <span className={`font-semibold ${isOverBudget ? 'text-rose-600' : 'text-slate-700'}`}>
                          {formatCurrency(p.expenses, p.currency)} / {formatCurrency(p.budget, p.currency)}
                          <span className="text-[10px] text-slate-400 font-normal ml-1">({p.budget_spent_percent}%)</span>
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            isOverBudget
                              ? 'bg-rose-500'
                              : parseFloat(p.budget_spent_percent || 0) > 85
                              ? 'bg-amber-500'
                              : 'bg-indigo-600'
                          }`}
                          style={{ width: `${Math.min(parseFloat(p.budget_spent_percent || 0), 100)}%` }}
                        />
                      </div>
                      {p.budget_remaining !== null && (
                        <div className="mt-1 text-[10px] flex justify-between">
                          <span className="text-slate-400">
                            {parseFloat(p.budget_remaining) >= 0 ? 'Remaining budget' : 'Over budget by'}
                          </span>
                          <span className={`font-semibold ${parseFloat(p.budget_remaining) >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {formatCurrency(Math.abs(parseFloat(p.budget_remaining)), p.currency)}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Card Action Footer */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setFinancialsProject(p);
                      setIsFinancialsModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-semibold transition"
                  >
                    <BarChart3 className="w-3.5 h-3.5" />
                    Financials & Ledger
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => openAddExpenseForProject(p)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-medium transition"
                      title="Record direct cost (Gear rental, Crew, Travel)"
                    >
                      <Receipt className="w-3.5 h-3.5 text-rose-500" />
                      + Cost
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Project Financials & Ledger Modal */}
      {activeFinancialsProject && (
        <Modal
          isOpen={isFinancialsModalOpen}
          onClose={() => setIsFinancialsModalOpen(false)}
          title={`Project Financials: ${activeFinancialsProject.name}`}
          maxWidth="max-w-3xl"
        >
          <div className="space-y-5 text-xs">
            {/* Top Metrics Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-500 font-medium block">Contract Value</span>
                <span className="text-sm font-bold text-slate-900 font-mono">
                  {formatCurrency(activeFinancialsProject.agreed_amount, activeFinancialsProject.currency)}
                </span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-500 font-medium block">Total Invoiced</span>
                <span className="text-sm font-bold text-indigo-600 font-mono">
                  {formatCurrency(activeFinancialsProject.invoiced_total || '0.00', activeFinancialsProject.currency)}
                </span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-500 font-medium block">Direct Project Costs</span>
                <span className="text-sm font-bold text-rose-600 font-mono">
                  {formatCurrency(activeFinancialsProject.expenses, activeFinancialsProject.currency)}
                </span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-500 font-medium block">Net Take-Home Profit</span>
                <div className="flex items-center gap-1">
                  <span className="text-sm font-bold text-emerald-600 font-mono">
                    {formatCurrency(activeFinancialsProject.profit, activeFinancialsProject.currency)}
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">
                    {activeFinancialsProject.profit_margin_percent}%
                  </span>
                </div>
              </div>
            </div>

            {/* Production Budget details if active */}
            {parseFloat(activeFinancialsProject.budget || 0) > 0 && (
              <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold text-slate-800">Production Expense Budget Limit</span>
                  <span className="font-mono font-bold text-slate-900">
                    {formatCurrency(activeFinancialsProject.expenses, activeFinancialsProject.currency)} / {formatCurrency(activeFinancialsProject.budget, activeFinancialsProject.currency)}
                    <span className="ml-1 text-[11px] text-slate-500">({activeFinancialsProject.budget_spent_percent}% spent)</span>
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      parseFloat(activeFinancialsProject.expenses || 0) > parseFloat(activeFinancialsProject.budget)
                        ? 'bg-rose-500'
                        : parseFloat(activeFinancialsProject.budget_spent_percent || 0) > 85
                        ? 'bg-amber-500'
                        : 'bg-indigo-600'
                    }`}
                    style={{ width: `${Math.min(parseFloat(activeFinancialsProject.budget_spent_percent || 0), 100)}%` }}
                  />
                </div>
                {activeFinancialsProject.budget_remaining !== null && (
                  <div className="mt-1.5 flex justify-between text-[11px]">
                    <span className="text-slate-500">
                      {parseFloat(activeFinancialsProject.budget_remaining) >= 0 ? 'Remaining Production Budget:' : 'Over Budget Surcharge:'}
                    </span>
                    <span className={`font-bold font-mono ${parseFloat(activeFinancialsProject.budget_remaining) >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {formatCurrency(Math.abs(parseFloat(activeFinancialsProject.budget_remaining)), activeFinancialsProject.currency)}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Direct Project Expenses Table */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">Direct Project Expenses & Costs</h4>
                  <p className="text-[11px] text-slate-500">Gear rental, contractor crew, sound, location permits, and consumable assets</p>
                </div>
                <button
                  type="button"
                  onClick={() => openAddExpenseForProject(activeFinancialsProject)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-indigo-600 text-white font-semibold text-[11px] hover:bg-indigo-700 transition"
                >
                  <Plus className="w-3 h-3" /> Log Cost
                </button>
              </div>

              {activeFinancialsProject.expenses_list && activeFinancialsProject.expenses_list.length > 0 ? (
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-[10px] uppercase">
                        <th className="py-2 px-3">Date</th>
                        <th className="py-2 px-3">Description</th>
                        <th className="py-2 px-3">Category</th>
                        <th className="py-2 px-3 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {activeFinancialsProject.expenses_list.map((exp) => (
                        <tr key={exp.id} className="hover:bg-slate-50/50">
                          <td className="py-2 px-3 text-slate-500 whitespace-nowrap">{formatDate(exp.date)}</td>
                          <td className="py-2 px-3 font-medium text-slate-900">{exp.description}</td>
                          <td className="py-2 px-3 text-slate-600 whitespace-nowrap">{exp.category_name || 'Project Cost'}</td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-rose-600 whitespace-nowrap">
                            -{formatCurrency(exp.amount, exp.currency)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-4 rounded-lg border border-dashed border-slate-200 text-center text-slate-400 text-xs">
                  No direct expenses logged for this project yet. Click "+ Log Cost" to record gear rentals, crew fees, or software.
                </div>
              )}
            </div>

            {/* Invoices List */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">Project Invoices & Milestone Billings</h4>
                  <p className="text-[11px] text-slate-500">Invoices and milestone schedules billed to the client for this project</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsFinancialsModalOpen(false);
                    navigate(appPath('/invoices?new=1'));
                  }}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 hover:bg-slate-200 font-semibold text-[11px] transition"
                >
                  <Plus className="w-3 h-3" /> Issue Invoice
                </button>
              </div>

              {activeFinancialsProject.invoices && activeFinancialsProject.invoices.length > 0 ? (
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-[10px] uppercase">
                        <th className="py-2 px-3">Invoice #</th>
                        <th className="py-2 px-3">Due Date</th>
                        <th className="py-2 px-3">Status</th>
                        <th className="py-2 px-3 text-right">Total</th>
                        <th className="py-2 px-3 text-right">Balance Due</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {activeFinancialsProject.invoices.map((inv) => (
                        <tr key={inv.id} className="hover:bg-slate-50/50">
                          <td className="py-2 px-3 font-mono font-bold text-slate-900 whitespace-nowrap">#{inv.invoice_number}</td>
                          <td className="py-2 px-3 text-slate-500 whitespace-nowrap">{formatDate(inv.due_date)}</td>
                          <td className="py-2 px-3 whitespace-nowrap">
                            <Badge status={inv.status} />
                          </td>
                          <td className="py-2 px-3 text-right font-mono font-semibold text-slate-900 whitespace-nowrap">
                            {formatCurrency(inv.total_amount, inv.currency)}
                          </td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-indigo-600 whitespace-nowrap">
                            {formatCurrency(inv.balance_due, inv.currency)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-4 rounded-lg border border-dashed border-slate-200 text-center text-slate-400 text-xs">
                  No invoices billed under this project yet.
                </div>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsFinancialsModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 font-semibold transition"
              >
                Close Ledger
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Quick Add Project Expense Modal */}
      <Modal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        title="Log Project Cost / Expense"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createExpenseMutation.mutate(expenseForm);
          }}
          className="space-y-4 text-xs"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-700 mb-1">Expense Amount</label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="0.00"
                value={expenseForm.amount}
                onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Currency</label>
              <select
                value={expenseForm.currency}
                onChange={(e) => setExpenseForm({ ...expenseForm, currency: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 font-semibold"
              >
                <option value="PKR">PKR (Rs.)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="CAD">CAD ($)</option>
                <option value="AUD">AUD ($)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Description</label>
            <input
              type="text"
              required
              placeholder="e.g. Sony FX6 camera rental, Sound Recordist day rate, Location permit"
              value={expenseForm.description}
              onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Category</label>
              <select
                value={expenseForm.category_id}
                onChange={(e) => setExpenseForm({ ...expenseForm, category_id: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              >
                <option value="">Default Cost</option>
                {expenseCategories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Paid From Account</label>
              <select
                required
                value={expenseForm.source_account_id}
                onChange={(e) => setExpenseForm({ ...expenseForm, source_account_id: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              >
                <option value="">Select Account...</option>
                {accounts?.map((a) => (
                  <option key={a.id} value={a.id}>{a.name} ({formatCurrency(a.current_balance, a.currency)})</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Date</label>
            <input
              type="date"
              required
              value={expenseForm.date}
              onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsExpenseModalOpen(false)}
              className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createExpenseMutation.isPending}
              className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 shadow-sm transition disabled:opacity-50"
            >
              {createExpenseMutation.isPending ? 'Logging...' : 'Save Cost'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Project Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Client Project">
        <form onSubmit={handleCreate} className="space-y-4 text-xs">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Project Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Brand Commercial Video Shoot, SaaS App Redesign"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Client</label>
              <select
                value={form.client_id}
                onChange={(e) => setForm({ ...form, client_id: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select Client...</option>
                {clients?.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Currency</label>
              <select
                value={form.currency}
                onChange={(e) => setForm({ ...form, currency: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 font-bold"
              >
                <option value="PKR">PKR - Pakistani Rupee (Rs.)</option>
                <option value="USD">USD - US Dollar ($)</option>
                <option value="EUR">EUR - Euro (€)</option>
                <option value="GBP">GBP - British Pound (£)</option>
                <option value="CAD">CAD - Canadian Dollar ($)</option>
                <option value="AUD">AUD - Australian Dollar ($)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Contract / Agreed Value</label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={form.agreed_amount}
                onChange={(e) => setForm({ ...form, agreed_amount: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Production / Cost Budget</label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={form.budget}
                onChange={(e) => setForm({ ...form, budget: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Start Date / Shoot Date</label>
              <input
                type="date"
                value={form.start_date || ''}
                onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Target End Date</label>
              <input
                type="date"
                value={form.end_date || ''}
                onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 font-medium"
            >
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="ON_HOLD">On Hold</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Description & Deliverables</label>
            <textarea
              rows={2}
              placeholder="Key deliverable details, milestones, crew and gear scope"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createProjectMutation.isPending}
              className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 shadow-sm transition disabled:opacity-50"
            >
              {createProjectMutation.isPending ? 'Saving...' : 'Create Project'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Project Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title={`Edit Project: ${selectedProject?.name}`}>
        <form onSubmit={handleUpdate} className="space-y-4 text-xs">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Project Name</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Client</label>
              <select
                value={form.client_id}
                onChange={(e) => setForm({ ...form, client_id: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select Client...</option>
                {clients?.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Currency</label>
              <select
                value={form.currency}
                onChange={(e) => setForm({ ...form, currency: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 font-bold"
              >
                <option value="PKR">PKR - Pakistani Rupee (Rs.)</option>
                <option value="USD">USD - US Dollar ($)</option>
                <option value="EUR">EUR - Euro (€)</option>
                <option value="GBP">GBP - British Pound (£)</option>
                <option value="CAD">CAD - Canadian Dollar ($)</option>
                <option value="AUD">AUD - Australian Dollar ($)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Contract / Agreed Value</label>
              <input
                type="number"
                step="0.01"
                value={form.agreed_amount}
                onChange={(e) => setForm({ ...form, agreed_amount: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Production / Cost Budget</label>
              <input
                type="number"
                step="0.01"
                value={form.budget}
                onChange={(e) => setForm({ ...form, budget: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Start Date / Shoot Date</label>
              <input
                type="date"
                value={form.start_date || ''}
                onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Target End Date</label>
              <input
                type="date"
                value={form.end_date || ''}
                onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 font-medium"
            >
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="ON_HOLD">On Hold</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Description & Deliverables</label>
            <textarea
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateProjectMutation.isPending}
              className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 shadow-sm transition disabled:opacity-50"
            >
              {updateProjectMutation.isPending ? 'Saving...' : 'Update Project'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
