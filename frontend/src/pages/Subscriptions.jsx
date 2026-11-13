import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Repeat, Calendar, Check, Edit3, Trash2, DollarSign, Sparkles, ChevronDown, CheckCircle2 } from 'lucide-react';
import { api } from '../api/client';
import { Modal } from '../components/Modal';
import { MetricCard } from '../components/MetricCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
import { formatCurrency, formatDate } from '../utils/formatters';
import { useToast } from '../contexts/ToastContext';
import { useCurrency } from '../contexts/CurrencyContext';

const POPULAR_SUBSCRIPTION_PRESETS = [
  {
    category: 'Film, Video & Creative Suite',
    items: [
      { name: 'Adobe Creative Cloud', vendor: 'Adobe', amount: '54.99', currency: 'USD', billing_frequency: 'MONTHLY', notes: 'Premiere Pro, After Effects, Photoshop, Audition' },
      { name: 'Frame.io Video Review', vendor: 'Adobe / Frame.io', amount: '15.00', currency: 'USD', billing_frequency: 'MONTHLY', notes: 'Client review and cloud dailies collaboration' },
      { name: 'Artlist / Musicbed Music Licensing', vendor: 'Artlist', amount: '29.99', currency: 'USD', billing_frequency: 'MONTHLY', notes: 'Commercial royalty-free music and sound effects' },
      { name: 'DaVinci Resolve Studio', vendor: 'Blackmagic Design', amount: '295.00', currency: 'USD', billing_frequency: 'ANNUALLY', notes: 'Color grading, editing, and Fairlight audio post' },
      { name: 'Envato Elements', vendor: 'Envato', amount: '16.50', currency: 'USD', billing_frequency: 'MONTHLY', notes: 'Video motion templates, graphic elements, stock footage' },
      { name: 'Vimeo Pro Video Showcase', vendor: 'Vimeo', amount: '20.00', currency: 'USD', billing_frequency: 'MONTHLY', notes: 'Ad-free client portfolio presentation and review player' },
      { name: 'Epidemic Sound', vendor: 'Epidemic Sound', amount: '15.00', currency: 'USD', billing_frequency: 'MONTHLY', notes: 'Direct music and SFX licensing for social & brand campaigns' },
    ]
  },
  {
    category: 'Freelance Tech & Productivity',
    items: [
      { name: 'Google Workspace', vendor: 'Google', amount: '12.00', currency: 'USD', billing_frequency: 'MONTHLY', notes: 'Custom business domain email, Drive storage, Meet' },
      { name: 'Figma Professional', vendor: 'Figma', amount: '15.00', currency: 'USD', billing_frequency: 'MONTHLY', notes: 'UI/UX design, interactive prototyping, moodboards' },
      { name: 'ChatGPT Plus / Claude Pro', vendor: 'OpenAI / Anthropic', amount: '20.00', currency: 'USD', billing_frequency: 'MONTHLY', notes: 'AI assistance for treatments, scripting, and client proposals' },
      { name: 'Notion Plus', vendor: 'Notion', amount: '10.00', currency: 'USD', billing_frequency: 'MONTHLY', notes: 'Production wiki, call sheets, storyboard schedules' },
      { name: 'GitHub Pro / Team', vendor: 'GitHub', amount: '4.00', currency: 'USD', billing_frequency: 'MONTHLY', notes: 'Code hosting, issue tracking, continuous deployment' },
      { name: 'Dropbox Pro (2TB)', vendor: 'Dropbox', amount: '11.99', currency: 'USD', billing_frequency: 'MONTHLY', notes: 'High-speed raw media transfer and project archiving' },
      { name: 'Zoom Workplace', vendor: 'Zoom', amount: '15.99', currency: 'USD', billing_frequency: 'MONTHLY', notes: 'Client video calls, pre-production meetings' }
    ]
  }
];

export function Subscriptions() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();
  const { currency: defaultCurrency, convert } = useCurrency();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedSub, setSelectedSub] = useState(null);
  const [showPresetsDropdown, setShowPresetsDropdown] = useState(false);

  const [form, setForm] = useState({
    name: '',
    vendor: '',
    amount: '',
    currency: defaultCurrency || 'USD',
    billing_frequency: 'MONTHLY',
    next_payment_date: new Date().toISOString().split('T')[0],
    account_id: '',
    category_id: '',
    notes: ''
  });

  const { data: subscriptions, isLoading } = useQuery({
    queryKey: ['subscriptions'],
    queryFn: () => api.get('/subscriptions'),
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
  const defaultSoftwareCat = expenseCategories.find(c => c.name.toLowerCase().includes('software'))?.id || '';

  const createSubMutation = useMutation({
    mutationFn: (newSub) => api.post('/subscriptions', newSub),
    onSuccess: (res) => {
      queryClient.invalidateQueries(['subscriptions']);
      queryClient.invalidateQueries(['dashboardUpcoming']);
      setIsModalOpen(false);
      setForm({ name: '', vendor: '', amount: '', currency: defaultCurrency || 'USD', billing_frequency: 'MONTHLY', next_payment_date: new Date().toISOString().split('T')[0], account_id: '', notes: '' });
      showSuccess(`Subscription "${res.name}" created.`);
    },
    onError: (err) => {
      showError(err.message, 'Could not create subscription');
    }
  });

  const updateSubMutation = useMutation({
    mutationFn: ({ id, data }) => api.put(`/subscriptions/${id}`, data),
    onSuccess: (res) => {
      queryClient.invalidateQueries(['subscriptions']);
      queryClient.invalidateQueries(['dashboardUpcoming']);
      setIsEditModalOpen(false);
      setSelectedSub(null);
      showSuccess(`Subscription "${res.name}" updated.`);
    },
    onError: (err) => {
      showError(err.message, 'Could not update subscription');
    }
  });

  const confirmPaymentMutation = useMutation({
    mutationFn: (subId) => api.post(`/subscriptions/${subId}/confirm-payment`),
    onSuccess: () => {
      queryClient.invalidateQueries(['subscriptions']);
      queryClient.invalidateQueries(['transactions']);
      queryClient.invalidateQueries(['accounts']);
      queryClient.invalidateQueries(['dashboardSummary']);
      showSuccess('Subscription payment confirmed & recorded in ledger.');
    },
    onError: (err) => {
      showError(err.message, 'Could not record subscription payment');
    }
  });

  const deleteSubMutation = useMutation({
    mutationFn: (id) => api.delete(`/subscriptions/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['subscriptions']);
      showSuccess('Subscription deleted.');
    },
    onError: (err) => {
      showError(err.message, 'Could not delete subscription');
    }
  });

  const subs = subscriptions || [];
  const monthlyCost = subs.reduce((sum, s) => {
    const amt = convert(parseFloat(s.amount || 0), s.currency);
    if (s.billing_frequency === 'ANNUALLY') return sum + amt / 12;
    if (s.billing_frequency === 'WEEKLY') return sum + amt * 4.33;
    if (s.billing_frequency === 'QUARTERLY') return sum + amt / 3;
    return sum + amt;
  }, 0);
  const annualCost = monthlyCost * 12;

  const handleCreate = (e) => {
    e.preventDefault();
    createSubMutation.mutate({
      ...form,
      amount: parseFloat(form.amount)
    });
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    if (!selectedSub) return;
    updateSubMutation.mutate({
      id: selectedSub.id,
      data: {
        ...form,
        amount: parseFloat(form.amount)
      }
    });
  };

  const openEditModal = (s) => {
    setSelectedSub(s);
    setForm({
      name: s.name || '',
      vendor: s.vendor || '',
      amount: String(s.amount),
      currency: s.currency || 'USD',
      billing_frequency: s.billing_frequency || 'MONTHLY',
      next_payment_date: s.next_payment_date || new Date().toISOString().split('T')[0],
      account_id: s.account_id || '',
      category_id: s.category_id || defaultSoftwareCat,
      notes: s.notes || ''
    });
    setIsEditModalOpen(true);
  };

  const applySubscriptionPreset = (preset) => {
    setForm({
      name: preset.name,
      vendor: preset.vendor,
      amount: preset.amount,
      currency: preset.currency || defaultCurrency || 'USD',
      billing_frequency: preset.billing_frequency,
      next_payment_date: new Date().toISOString().split('T')[0],
      account_id: accounts?.[0]?.id || '',
      category_id: defaultSoftwareCat,
      notes: preset.notes
    });
    setShowPresetsDropdown(false);
    setIsModalOpen(true);
    showSuccess(`Selected: ${preset.name}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Recurring Subscriptions</h2>
          <p className="text-xs sm:text-sm text-slate-500">Track recurring software tools, creative suites, hosting, and memberships</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Presets Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowPresetsDropdown(!showPresetsDropdown)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-semibold shadow-xs transition"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Popular Presets
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {showPresetsDropdown && (
              <div className="absolute right-0 mt-1.5 w-80 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50 text-xs max-h-80 overflow-y-auto">
                <div className="text-[10px] font-bold uppercase text-slate-400 px-2 py-1">Popular Tools & Subscriptions</div>
                {POPULAR_SUBSCRIPTION_PRESETS.map((group) => (
                  <div key={group.category} className="mb-2">
                    <div className="text-[10px] font-semibold text-indigo-600 bg-indigo-50/70 px-2 py-0.5 rounded mb-1">
                      {group.category}
                    </div>
                    {group.items.map((preset, pIdx) => (
                      <button
                        key={pIdx}
                        type="button"
                        onClick={() => applySubscriptionPreset(preset)}
                        className="w-full text-left px-2 py-1.5 rounded hover:bg-slate-50 flex items-center justify-between text-slate-700 transition"
                      >
                        <div className="pr-2 truncate">
                          <div className="font-semibold text-slate-900 truncate">{preset.name}</div>
                          <div className="text-[10px] text-slate-400 truncate">{preset.notes}</div>
                        </div>
                        <span className="font-mono text-slate-500 font-bold shrink-0">
                          {formatCurrency(preset.amount, preset.currency)}
                          <span className="text-[9px] text-slate-400 font-normal">/{preset.billing_frequency === 'ANNUALLY' ? 'yr' : 'mo'}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => {
              setForm({ name: '', vendor: '', amount: '', currency: defaultCurrency || 'USD', billing_frequency: 'MONTHLY', next_payment_date: new Date().toISOString().split('T')[0], account_id: '', notes: '' });
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 shadow-sm transition"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Subscription
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <MetricCard
          title="Estimated Monthly Cost"
          amount={monthlyCost}
          currency={defaultCurrency}
          icon={Repeat}
          color="indigo"
          subtitle={`Normalized recurring burn rate in ${defaultCurrency}`}
        />
        <MetricCard
          title="Estimated Annual Cost"
          amount={annualCost}
          currency={defaultCurrency}
          icon={DollarSign}
          color="stone"
          subtitle={`Annualized software & services in ${defaultCurrency}`}
        />
      </div>

      {isLoading ? (
        <LoadingSpinner text="Loading subscriptions..." />
      ) : subs.length === 0 ? (
        <EmptyState
          title="No active subscriptions"
          description="Keep track of recurring SaaS, domain renewals, or design tools so you never get surprised by billing."
          actionLabel="Add Subscription"
          onAction={() => setIsModalOpen(true)}
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Subscription</th>
                  <th className="py-3 px-4">Vendor</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Frequency</th>
                  <th className="py-3 px-4">Next Renewal</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {subs.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4 font-semibold text-slate-900">{s.name}</td>
                    <td className="py-3 px-4 text-slate-600">{s.vendor || '—'}</td>
                    <td className="py-3 px-4 text-slate-600">
                      <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-[10px] font-medium text-indigo-700">
                        {expenseCategories.find(c => c.id === s.category_id)?.name || 'Software & Subscriptions'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-[10px] font-medium text-slate-700">
                        {s.billing_frequency}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{formatDate(s.next_payment_date)}</td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900 font-mono">
                      {formatCurrency(s.amount, s.currency)}
                      {s.currency !== defaultCurrency && (
                        <div className="text-[10px] text-slate-400 font-normal">
                          ≈ {formatCurrency(convert(s.amount, s.currency), defaultCurrency)}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center space-x-1 whitespace-nowrap">
                      <button
                        onClick={() => confirmPaymentMutation.mutate(s.id)}
                        disabled={confirmPaymentMutation.isPending}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-[11px] font-semibold transition"
                        title="Record payment in ledger & advance due date"
                      >
                        <Check className="w-3 h-3" />
                        Confirm Paid
                      </button>
                      <button
                        onClick={() => openEditModal(s)}
                        className="p-1 text-slate-400 hover:text-indigo-600"
                        title="Edit Subscription"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Remove subscription "${s.name}"?`)) {
                            deleteSubMutation.mutate(s.id);
                          }
                        }}
                        className="p-1 text-slate-400 hover:text-rose-600"
                        title="Delete Subscription"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Subscription Modal */}
      <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setShowPresetsDropdown(false); }} title="Track Recurring Subscription">
        <form onSubmit={handleCreate} className="space-y-4 text-xs">
          {/* Quick Preset Selector Chips inside Modal */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1.5 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              Quick Fill from Popular Tools:
            </label>
            <div className="flex flex-wrap gap-1.5">
              {[
                { name: 'Adobe CC', vendor: 'Adobe', amount: '54.99', currency: 'USD', billing_frequency: 'MONTHLY', notes: 'Premiere Pro & After Effects' },
                { name: 'Frame.io', vendor: 'Adobe / Frame.io', amount: '15.00', currency: 'USD', billing_frequency: 'MONTHLY', notes: 'Video review' },
                { name: 'Artlist', vendor: 'Artlist', amount: '29.99', currency: 'USD', billing_frequency: 'MONTHLY', notes: 'Royalty-free music' },
                { name: 'DaVinci Studio', vendor: 'Blackmagic Design', amount: '295.00', currency: 'USD', billing_frequency: 'ANNUALLY', notes: 'Color grading' },
                { name: 'Google Workspace', vendor: 'Google', amount: '12.00', currency: 'USD', billing_frequency: 'MONTHLY', notes: 'Domain email & Drive' },
                { name: 'Figma', vendor: 'Figma', amount: '15.00', currency: 'USD', billing_frequency: 'MONTHLY', notes: 'Design sprint' },
                { name: 'ChatGPT Plus', vendor: 'OpenAI', amount: '20.00', currency: 'USD', billing_frequency: 'MONTHLY', notes: 'AI assistant' }
              ].map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setForm(prev => ({
                      ...prev,
                      name: p.name,
                      vendor: p.vendor,
                      amount: p.amount,
                      currency: p.currency,
                      billing_frequency: p.billing_frequency,
                      notes: p.notes
                    }));
                  }}
                  className="px-2 py-1 rounded-md bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 text-[11px] font-medium transition"
                >
                  + {p.name}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Subscription Name</label>
              <input
                type="text"
                required
                placeholder="e.g. GitHub Copilot, Adobe CC, Figma"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Vendor / Provider</label>
              <input
                type="text"
                placeholder="e.g. Microsoft, Adobe Inc."
                value={form.vendor}
                onChange={(e) => setForm({ ...form, vendor: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Billing Amount</label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="0.00"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 font-bold"
              />
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
              <label className="block text-xs font-medium text-slate-700 mb-1">Frequency</label>
              <select
                value={form.billing_frequency}
                onChange={(e) => setForm({ ...form, billing_frequency: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              >
                <option value="MONTHLY">Monthly</option>
                <option value="ANNUALLY">Annually</option>
                <option value="QUARTERLY">Quarterly</option>
                <option value="WEEKLY">Weekly</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Next Payment Date</label>
              <input
                type="date"
                required
                value={form.next_payment_date}
                onChange={(e) => setForm({ ...form, next_payment_date: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Expense Category</label>
              <select
                value={form.category_id}
                onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              >
                <option value="">Software & Subscriptions (Default)</option>
                {expenseCategories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Paid From Account</label>
              <select
                value={form.account_id}
                onChange={(e) => setForm({ ...form, account_id: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              >
                <option value="">Select Account...</option>
                {accounts?.map((a) => (
                  <option key={a.id} value={a.id}>{a.name} ({formatCurrency(a.current_balance, a.currency)})</option>
                ))}
              </select>
            </div>
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
              disabled={createSubMutation.isPending}
              className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 shadow-sm transition disabled:opacity-50"
            >
              {createSubMutation.isPending ? 'Saving...' : 'Add Subscription'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Subscription Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title={`Edit Subscription: ${selectedSub?.name}`}>
        <form onSubmit={handleUpdate} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Subscription Name</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Vendor / Provider</label>
              <input
                type="text"
                value={form.vendor}
                onChange={(e) => setForm({ ...form, vendor: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Billing Amount</label>
              <input
                type="number"
                step="0.01"
                required
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 font-bold"
              />
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
              <label className="block text-xs font-medium text-slate-700 mb-1">Frequency</label>
              <select
                value={form.billing_frequency}
                onChange={(e) => setForm({ ...form, billing_frequency: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              >
                <option value="MONTHLY">Monthly</option>
                <option value="ANNUALLY">Annually</option>
                <option value="QUARTERLY">Quarterly</option>
                <option value="WEEKLY">Weekly</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Next Payment Date</label>
              <input
                type="date"
                required
                value={form.next_payment_date}
                onChange={(e) => setForm({ ...form, next_payment_date: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Expense Category</label>
              <select
                value={form.category_id}
                onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              >
                <option value="">Software & Subscriptions (Default)</option>
                {expenseCategories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Paid From Account</label>
              <select
                value={form.account_id}
                onChange={(e) => setForm({ ...form, account_id: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              >
                <option value="">Select Account...</option>
                {accounts?.map((a) => (
                  <option key={a.id} value={a.id}>{a.name} ({formatCurrency(a.current_balance, a.currency)})</option>
                ))}
              </select>
            </div>
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
              disabled={updateSubMutation.isPending}
              className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 shadow-sm transition disabled:opacity-50"
            >
              {updateSubMutation.isPending ? 'Saving...' : 'Update Subscription'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
