import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Save, User, Globe, Shield, CheckCircle2, FileText, Scale, Lock, ExternalLink, Camera, Trash2 } from 'lucide-react';
import { api } from '../api/client';
import { useAuth } from '../contexts/AuthContext';
import { FieldHints } from '../components/FieldHints';
import { LoadingSpinner } from '../components/LoadingSpinner';

const MAX_PROFILE_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_PROFILE_IMAGE_DATA_URL_LENGTH = 180_000;
const PROFILE_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const COUNTRY_CODES = `
  AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ
  CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR
  GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY HK HM HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE JM JO JP
  KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT
  MU MV MW MX MY MZ NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS RU RW
  SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ UA UG
  UM US UY UZ VA VC VE VG VI VN VU WF WS XK YE YT ZA ZM ZW
`.trim().split(/\s+/);

function createFallbackCountries() {
  const displayNames = typeof Intl.DisplayNames === 'function'
    ? new Intl.DisplayNames(['en'], { type: 'region' })
    : null;

  return COUNTRY_CODES.map((code) => ({
    code,
    name: code === 'XK' ? 'Kosovo' : (displayNames?.of(code) || code),
  })).sort((a, b) => a.name.localeCompare(b.name));
}

const FALLBACK_COUNTRIES = createFallbackCountries();

function resolveCountryCode(value, countries) {
  const normalizedValue = String(value || '').trim().toLocaleLowerCase();
  if (!normalizedValue) return '';

  const byCode = countries.find((country) => country.code.toLocaleLowerCase() === normalizedValue);
  if (byCode) return byCode.code;

  const aliases = {
    'united states': 'US',
    'united states of america': 'US',
    usa: 'US',
    'united kingdom': 'GB',
    uk: 'GB',
    'russian federation': 'RU',
    russia: 'RU',
    'south korea': 'KR',
    'north korea': 'KP',
    'czech republic': 'CZ',
    'ivory coast': 'CI',
    'cape verde': 'CV',
    'palestine': 'PS',
  };
  const aliasCode = aliases[normalizedValue];
  if (aliasCode && countries.some((country) => country.code === aliasCode)) return aliasCode;

  return countries.find((country) => country.name.toLocaleLowerCase() === normalizedValue)?.code || '';
}

function resizeProfileImage(file) {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      try {
        const size = 256;
        const scale = Math.max(size / image.naturalWidth, size / image.naturalHeight);
        const width = image.naturalWidth * scale;
        const height = image.naturalHeight * scale;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const context = canvas.getContext('2d');
        if (!context) throw new Error('Could not process this image. Please try another file.');

        context.drawImage(image, (size - width) / 2, (size - height) / 2, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
        if (dataUrl.length > MAX_PROFILE_IMAGE_DATA_URL_LENGTH) {
          throw new Error('This image could not be compressed enough. Please choose another one.');
        }
        resolve(dataUrl);
      } catch (error) {
        reject(error);
      } finally {
        URL.revokeObjectURL(objectUrl);
      }
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Could not read this image. Please choose a JPEG, PNG, or WebP file.'));
    };
    image.src = objectUrl;
  });
}

export function Settings() {
  const queryClient = useQueryClient();
  const { user, refreshUser, requestPasswordReset } = useAuth();
  const [successMsg, setSuccessMsg] = useState('');
  const [avatarError, setAvatarError] = useState('');
  const [isProcessingAvatar, setIsProcessingAvatar] = useState(false);
  const [isSendingPasswordReset, setIsSendingPasswordReset] = useState(false);
  const [passwordResetMessage, setPasswordResetMessage] = useState('');
  const [passwordResetError, setPasswordResetError] = useState('');

  const { data: profile, isLoading } = useQuery({
    queryKey: ['userProfile'],
    queryFn: () => api.get('/auth/profile'),
  });

  const {
    data: fetchedCountries,
    isError: countryFetchFailed,
  } = useQuery({
    queryKey: ['countryOptions'],
    queryFn: async ({ signal }) => {
      const response = await fetch('https://countries.dev/countries?fields=name,alpha2Code&sort=name', { signal });
      if (!response.ok) throw new Error('Could not load the country list.');

      const data = await response.json();
      const countries = Array.isArray(data) ? data : data?.countries;
      if (!Array.isArray(countries)) throw new Error('The country list response was invalid.');

      const normalizedCountries = countries
        .map((country) => ({ code: country.alpha2Code, name: country.name }))
        .filter((country) => typeof country.code === 'string' && country.code.length === 2 && typeof country.name === 'string');
      if (normalizedCountries.length === 0) throw new Error('The country list was empty.');

      return normalizedCountries.sort((a, b) => a.name.localeCompare(b.name));
    },
    staleTime: 24 * 60 * 60 * 1000,
    retry: 1,
  });
  const countries = fetchedCountries || FALLBACK_COUNTRIES;

  const [form, setForm] = useState({
    full_name: '',
    email: '',
    avatar_url: null,
    base_currency: 'USD',
    country: 'US',
    fiscal_year_start: 1,
    tax_reserve_rate: '25.00'
  });
  const resolvedCountry = resolveCountryCode(form.country, countries);
  const countrySelectValue = resolvedCountry || form.country;

  useEffect(() => {
    // Prioritize authenticated user details (such as from OAuth) and saved profile info
    const resolvedName = (user?.full_name && user.full_name !== 'Freelancer' && user.full_name !== 'Independent Freelancer' && user.full_name !== 'Guest Freelancer')
      ? user.full_name
      : ((profile?.full_name && profile.full_name !== 'Independent Freelancer' && profile.full_name !== 'Guest Freelancer')
        ? profile.full_name
        : (user?.full_name || profile?.full_name || ''));

    const resolvedEmail = (user?.email && !user.email.includes('@freelancer.local') && !user.email.includes('guest@'))
      ? user.email
      : ((profile?.email && !profile.email.includes('@freelancer.local'))
        ? profile.email
        : (user?.email || profile?.email || ''));

    if (profile || user) {
      setForm(prev => ({
        ...prev,
        full_name: resolvedName || prev.full_name,
        email: resolvedEmail || prev.email,
        avatar_url: profile ? profile.avatar_url : (user?.avatar_url ?? prev.avatar_url ?? null),
        base_currency: profile?.base_currency || prev.base_currency || 'USD',
        country: profile?.country || prev.country || 'US',
        fiscal_year_start: profile?.fiscal_year_start || prev.fiscal_year_start || 1,
        tax_reserve_rate: profile?.tax_reserve_rate ? String(profile.tax_reserve_rate) : prev.tax_reserve_rate
      }));
    }
  }, [profile, user]);

  const updateProfileMutation = useMutation({
    mutationFn: (data) => api.put('/auth/profile', data),
    onSuccess: (updated) => {
      queryClient.setQueryData(['userProfile'], updated);
      queryClient.invalidateQueries(['dashboardSummary']);
      if (refreshUser) refreshUser();
      setSuccessMsg('Profile and financial settings updated successfully.');
      setTimeout(() => setSuccessMsg(''), 4000);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    updateProfileMutation.mutate({
      ...form,
      country: resolveCountryCode(form.country, countries) || form.country,
      fiscal_year_start: parseInt(form.fiscal_year_start, 10),
      tax_reserve_rate: parseFloat(form.tax_reserve_rate)
    });
  };

  const handleAvatarChange = async (event) => {
    const input = event.target;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;

    setAvatarError('');
    if (!PROFILE_IMAGE_TYPES.includes(file.type)) {
      setAvatarError('Choose a JPEG, PNG, or WebP image.');
      return;
    }
    if (file.size > MAX_PROFILE_IMAGE_BYTES) {
      setAvatarError('Choose an image smaller than 5 MB.');
      return;
    }

    setIsProcessingAvatar(true);
    try {
      const avatarUrl = await resizeProfileImage(file);
      setForm((prev) => ({ ...prev, avatar_url: avatarUrl }));
    } catch (error) {
      setAvatarError(error.message || 'Could not process this image.');
    } finally {
      setIsProcessingAvatar(false);
    }
  };

  const handlePasswordReset = async () => {
    setPasswordResetMessage('');
    setPasswordResetError('');
    if (!user?.email || !requestPasswordReset) {
      setPasswordResetError('Your sign-in email is unavailable. Please sign in again and retry.');
      return;
    }

    setIsSendingPasswordReset(true);
    try {
      await requestPasswordReset(user.email);
      setPasswordResetMessage(`A password reset link was requested for ${user.email}.`);
    } catch (error) {
      setPasswordResetError(error.message || 'Could not send a password reset email. Please try again.');
    } finally {
      setIsSendingPasswordReset(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner text="Loading user preferences..." />;
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Account & Financial Settings</h2>
        <p className="text-xs sm:text-sm text-slate-500">Configure your base currency, tax reserve preferences, and profile identity</p>
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          {successMsg}
        </div>
      )}
      {updateProfileMutation.error && (
        <div role="alert" className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
          {updateProfileMutation.error.message || 'Could not save your profile settings.'}
        </div>
      )}

      <FieldHints>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs space-y-6 text-xs">
        {/* Personal Details */}
        <div className="space-y-4">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <User className="w-4 h-4 text-slate-400" />
            Personal Profile
          </h3>

          <div className="flex flex-wrap items-center gap-4">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700">
              {form.avatar_url ? (
                <img src={form.avatar_url} alt="Profile preview" className="w-full h-full object-cover" />
              ) : (
                <User className="w-7 h-7" aria-hidden="true" />
              )}
            </div>
            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-slate-700">Profile photo</p>
              <div className="flex flex-wrap items-center gap-2">
                <label
                  htmlFor="profile-image-upload"
                  className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 font-semibold cursor-pointer hover:bg-slate-50 transition ${isProcessingAvatar ? 'opacity-50 pointer-events-none' : ''}`}
                >
                  <Camera className="w-3.5 h-3.5" />
                  {isProcessingAvatar ? 'Preparing image…' : form.avatar_url ? 'Change photo' : 'Choose photo'}
                </label>
                {form.avatar_url && (
                  <button
                    type="button"
                    onClick={() => { setForm((prev) => ({ ...prev, avatar_url: null })); setAvatarError(''); }}
                    className="inline-flex items-center gap-1 px-2.5 py-2 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Remove
                  </button>
                )}
                <input
                  id="profile-image-upload"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleAvatarChange}
                  className="sr-only"
                />
              </div>
              <p className="text-[11px] text-slate-400">JPEG, PNG, or WebP up to 5 MB. The image is resized before saving.</p>
              {avatarError && <p role="alert" className="text-[11px] font-medium text-rose-600">{avatarError}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Full Legal / Business Name</label>
              <input
                type="text"
                required
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g. Jane Doe"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Billing & Notice Email</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g. jane@example.com"
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-800">Password & sign-in</p>
              <p className="mt-1 text-[11px] text-slate-500">
                Send a password reset link to {user?.email || 'your sign-in email'}.
              </p>
              {passwordResetMessage && <p role="status" className="mt-2 text-[11px] font-medium text-emerald-700">{passwordResetMessage}</p>}
              {passwordResetError && <p role="alert" className="mt-2 text-[11px] font-medium text-rose-600">{passwordResetError}</p>}
            </div>
            <button
              type="button"
              onClick={handlePasswordReset}
              disabled={isSendingPasswordReset || !user?.email}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
            >
              <Lock className="h-3.5 w-3.5" />
              {isSendingPasswordReset ? 'Sending reset link…' : 'Reset password'}
            </button>
          </div>
        </div>

        {/* Currency & Financial Configuration */}
        <div className="pt-4 border-t border-slate-100 space-y-4">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Globe className="w-4 h-4 text-slate-400" />
            Currency & Accounting Defaults
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Base Currency</label>
              <select
                value={form.base_currency}
                onChange={(e) => setForm({ ...form, base_currency: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 font-semibold"
              >
                <option value="PKR">PKR - Pakistani Rupee (Rs.)</option>
                <option value="USD">USD - United States Dollar ($)</option>
                <option value="EUR">EUR - Euro (€)</option>
                <option value="GBP">GBP - British Pound (£)</option>
                <option value="CAD">CAD - Canadian Dollar ($)</option>
                <option value="AUD">AUD - Australian Dollar ($)</option>
              </select>
              <p className="text-[11px] text-slate-400 mt-1">Multi-currency transactions convert to this base on their transaction date</p>
            </div>

            <div>
              <label htmlFor="profile-country" className="block text-xs font-medium text-slate-700 mb-1">Country of Tax Residence</label>
              <select
                id="profile-country"
                value={countrySelectValue}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
                aria-describedby="profile-country-help"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select a country...</option>
                {form.country && !resolvedCountry && (
                  <option value={form.country}>{form.country} (saved value)</option>
                )}
                {countries.map((country) => (
                  <option key={country.code} value={country.code}>{country.name}</option>
                ))}
              </select>
              <p id="profile-country-help" className="text-[11px] text-slate-400 mt-1">
                {countryFetchFailed ? 'Using the built-in country list because the country service is unavailable.' : 'Select your country from the full country list.'}
              </p>
            </div>
          </div>
        </div>

        {/* Tax Planning Defaults */}
        <div className="pt-4 border-t border-slate-100 space-y-4">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Shield className="w-4 h-4 text-slate-400" />
            Tax Reserve Rule
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Target Tax Reserve Percentage (%)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="60"
                value={form.tax_reserve_rate}
                onChange={(e) => setForm({ ...form, tax_reserve_rate: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 font-bold"
              />
              <p className="text-[11px] text-slate-400 mt-1">Standard self-employment & income tax withholding reserve recommendation is 25-30%</p>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Fiscal Year Start Month</label>
              <select
                value={form.fiscal_year_start}
                onChange={(e) => setForm({ ...form, fiscal_year_start: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              >
                <option value="1">January (Calendar Year)</option>
                <option value="4">April (UK / Commonwealth Fiscal)</option>
                <option value="7">July (Australia Fiscal)</option>
                <option value="10">October (US Federal Fiscal)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            disabled={updateProfileMutation.isPending || isProcessingAvatar}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 shadow-sm transition disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {updateProfileMutation.isPending ? 'Saving Settings...' : 'Save Settings'}
          </button>
        </div>
      </form>
      </FieldHints>

      {/* Legal & Compliance Section */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-slate-800 font-bold text-base pb-3 border-b border-slate-100">
          <Shield className="w-5 h-5 text-slate-400" />
          <h3>Legal, Privacy & Compliance Disclosures</h3>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed">
          IncomeDesk is engineered under strict tenant isolation. Review our official privacy commitments, 
          data collection disclosures, and user agreements anytime.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <Link
            to="/privacy"
            className="p-3.5 rounded-xl border border-slate-200 hover:border-slate-400 hover:bg-slate-50 transition group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-slate-400 group-hover:text-slate-900 mb-1.5">
                <FileText className="w-5 h-5" />
                <ExternalLink className="w-3.5 h-3.5 transition" />
              </div>
              <h4 className="font-bold text-slate-800 text-xs">Privacy Policy</h4>
              <p className="text-[11px] text-slate-500 mt-1">What data we collect, why, and how your financial records are protected.</p>
            </div>
            <span className="text-[10px] font-semibold text-slate-400 group-hover:text-slate-900 mt-3 block">Read Policy →</span>
          </Link>

          <Link
            to="/terms"
            className="p-3.5 rounded-xl border border-slate-200 hover:border-slate-400 hover:bg-slate-50 transition group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-slate-400 group-hover:text-slate-900 mb-1.5">
                <Scale className="w-5 h-5" />
                <ExternalLink className="w-3.5 h-3.5 transition" />
              </div>
              <h4 className="font-bold text-slate-800 text-xs">Terms of Service</h4>
              <p className="text-[11px] text-slate-500 mt-1">Platform service agreement, acceptable use, and accounting disclaimers.</p>
            </div>
            <span className="text-[10px] font-semibold text-slate-400 group-hover:text-slate-900 mt-3 block">View Agreement →</span>
          </Link>

          <Link
            to="/security"
            className="p-3.5 rounded-xl border border-slate-200 hover:border-slate-400 hover:bg-slate-50 transition group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-slate-400 group-hover:text-slate-900 mb-1.5">
                <Lock className="w-5 h-5" />
                <ExternalLink className="w-3.5 h-3.5 transition" />
              </div>
              <h4 className="font-bold text-slate-800 text-xs">Security Safeguards</h4>
              <p className="text-[11px] text-slate-500 mt-1">Multi-tenant isolation, TLS 1.3 encryption, and Decimal engine integrity.</p>
            </div>
            <span className="text-[10px] font-semibold text-slate-400 group-hover:text-slate-900 mt-3 block">Learn More →</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
