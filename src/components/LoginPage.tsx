import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

// ─────────────────────────────────────────────────────────────────────────────
// IMPORTANT: Replace this with your real Google Cloud OAuth Client ID
// Steps: https://console.cloud.google.com → APIs & Services → Credentials
// → Create Credentials → OAuth Client ID → Web Application
// Add your deployed URL to "Authorized JavaScript Origins"
// ─────────────────────────────────────────────────────────────────────────────
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

declare global {
  interface Window {
    google: any;
    handleGoogleCredential: (response: any) => void;
  }
}

export default function LoginPage() {
  const { loginWithGoogleResponse, isDark } = useAuth();
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [googleLoaded, setGoogleLoaded] = useState(false);
  const [googleError, setGoogleError] = useState('');

  const handleGoogleCredential = useCallback(
    (response: any) => {
      if (response?.credential) {
        loginWithGoogleResponse({ credential: response.credential });
      }
    },
    [loginWithGoogleResponse]
  );

  useEffect(() => {
    // Expose callback globally for Google GSI
    window.handleGoogleCredential = handleGoogleCredential;
  }, [handleGoogleCredential]);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) {
      setGoogleError('no-client-id');
      return;
    }

    const initGoogle = () => {
      if (!window.google?.accounts?.id) return;
      try {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleCredential,
          auto_select: false,
          cancel_on_tap_outside: true,
        });
        renderGoogleButton();
        setGoogleLoaded(true);
      } catch {
        setGoogleError('init-failed');
      }
    };

    const renderGoogleButton = () => {
      const container = document.getElementById('g_id_btn');
      if (!container || !window.google?.accounts?.id) return;
      container.innerHTML = '';
      window.google.accounts.id.renderButton(container, {
        type: 'standard',
        shape: 'pill',
        theme: isDark ? 'filled_black' : 'outline',
        text: isRegisterMode ? 'signup_with' : 'signin_with',
        size: 'large',
        logo_alignment: 'left',
        width: container.offsetWidth || 360,
      });
    };

    if (window.google?.accounts?.id) {
      initGoogle();
    } else {
      const existing = document.querySelector('script[src*="accounts.google.com/gsi"]');
      if (!existing) {
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = initGoogle;
        script.onerror = () => setGoogleError('script-failed');
        document.head.appendChild(script);
      } else {
        existing.addEventListener('load', initGoogle);
      }
    }
  }, [isDark, isRegisterMode, handleGoogleCredential]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim()) {
      setErrorMessage('Please enter your email address');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setErrorMessage('Please enter a valid email address');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your password');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters');
      return;
    }
    if (isRegisterMode && password !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }

    const displayName = name.trim() || email.split('@')[0].replace(/[._]/g, ' ');
    const capitalizedName = displayName.charAt(0).toUpperCase() + displayName.slice(1);

    loginWithGoogleResponse({
      user: {
        sub: 'email_usr_' + Date.now(),
        name: capitalizedName,
        email: email.trim().toLowerCase(),
        picture: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(email)}`,
      },
    });
  };

  const inputCls = `w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
    isDark
      ? 'bg-slate-900/70 border-slate-700 text-white placeholder-slate-500 focus:border-blue-500'
      : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-blue-400'
  }`;
  const labelCls = `block text-xs font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`;

  return (
    <div
      className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-300 ${
        isDark
          ? 'bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 text-white'
          : 'bg-gradient-to-br from-slate-100 via-slate-50 to-blue-50 text-slate-900'
      }`}
    >
      {/* Background glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className={`absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl animate-pulse ${
            isDark ? 'bg-blue-600/10' : 'bg-blue-400/20'
          }`}
        />
        <div
          className={`absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl animate-pulse ${
            isDark ? 'bg-purple-600/10' : 'bg-purple-400/15'
          }`}
          style={{ animationDelay: '1.2s' }}
        />
      </div>

      <div
        className={`relative w-full max-w-md rounded-2xl border shadow-2xl overflow-hidden transition-all ${
          isDark
            ? 'bg-gray-800/85 border-gray-700 backdrop-blur-xl'
            : 'bg-white/95 border-slate-200 shadow-slate-200/80'
        }`}
      >
        {/* Top accent bar */}
        <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600" />

        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-7">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-500/10 rounded-2xl mb-4 border border-blue-500/20">
              <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              {isRegisterMode ? 'Create IDS Account' : 'IDS Portal Sign In'}
            </h1>
            <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {isRegisterMode
                ? 'Register your analyst credentials'
                : 'AI-Powered Security Monitoring Access'}
            </p>
          </div>

          {/* DB Badge */}
          <div
            className={`mb-5 px-3 py-2 rounded-xl border text-xs flex items-center justify-between ${
              isDark
                ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-300'
                : 'bg-emerald-50 border-emerald-200 text-emerald-700'
            }`}
          >
            <span className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-mono">Neon PostgreSQL · neondb</span>
            </span>
            <span className="font-semibold text-[10px] uppercase tracking-wide">Live</span>
          </div>

          {/* ── Google Sign-In Button ── */}
          <div className="mb-5">
            {googleError === 'no-client-id' ? (
              <div
                className={`w-full px-4 py-3 rounded-xl border text-sm text-center ${
                  isDark
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                    : 'bg-amber-50 border-amber-300 text-amber-700'
                }`}
              >
                ⚠️ Google Sign-In requires a Client ID.{' '}
                <a
                  href="https://console.cloud.google.com/apis/credentials"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline font-semibold"
                >
                  Set up in Google Cloud Console →
                </a>
              </div>
            ) : (
              <div
                id="g_id_btn"
                className="w-full flex justify-center min-h-[44px]"
                style={{ colorScheme: 'normal' }}
              />
            )}

            {!googleLoaded && !googleError && (
              <div
                className={`w-full mt-2 flex items-center justify-center gap-3 py-3 px-4 rounded-xl border text-sm ${
                  isDark
                    ? 'border-slate-700 text-slate-400'
                    : 'border-slate-200 text-slate-400'
                }`}
              >
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Loading Google Sign-In…
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="relative mb-5">
            <div className="absolute inset-0 flex items-center">
              <div className={`w-full border-t ${isDark ? 'border-slate-700' : 'border-slate-200'}`} />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className={`px-3 font-medium ${isDark ? 'bg-gray-800 text-slate-500' : 'bg-white text-slate-400'}`}>
                Or {isRegisterMode ? 'register' : 'sign in'} with email
              </span>
            </div>
          </div>

          {/* Error */}
          {errorMessage && (
            <div className="mb-4 px-3 py-2.5 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-sm font-medium text-center">
              {errorMessage}
            </div>
          )}

          {/* Email / Password form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {isRegisterMode && (
              <div>
                <label className={labelCls}>Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Sai Sujith"
                  className={inputCls}
                />
              </div>
            )}

            <div>
              <label className={labelCls}>Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@gmail.com"
                className={inputCls}
              />
            </div>

            <div>
              <label className={labelCls}>Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 6 characters"
                className={inputCls}
              />
            </div>

            {isRegisterMode && (
              <div>
                <label className={labelCls}>Confirm Password</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className={inputCls}
                />
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 mt-1 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm transition-all shadow-lg shadow-blue-500/20 cursor-pointer"
            >
              {isRegisterMode ? '🚀 Create Account & Launch' : '🔐 Sign In to Dashboard'}
            </button>
          </form>

          {/* Toggle login / register */}
          <p className={`mt-5 text-center text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {isRegisterMode ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              type="button"
              onClick={() => {
                setIsRegisterMode(!isRegisterMode);
                setErrorMessage('');
              }}
              className="text-blue-500 hover:text-blue-400 font-semibold cursor-pointer transition-colors"
            >
              {isRegisterMode ? 'Sign In' : 'Register Now'}
            </button>
          </p>

          {/* Google setup notice when no client ID */}
          {googleError === 'no-client-id' && (
            <div
              className={`mt-5 p-3 rounded-xl border text-[11px] leading-relaxed ${
                isDark
                  ? 'bg-slate-900/50 border-slate-700 text-slate-400'
                  : 'bg-slate-50 border-slate-200 text-slate-500'
              }`}
            >
              <p className="font-semibold mb-1 text-xs">📋 Enable Google Sign-In in 3 steps:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Go to <a className="underline text-blue-400" href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noreferrer">Google Cloud Console → Credentials</a></li>
                <li>Create OAuth Client ID → Web Application → add your domain to Authorized Origins</li>
                <li>Copy Client ID → add <code className="bg-black/20 px-1 rounded">VITE_GOOGLE_CLIENT_ID=your_id</code> to <code className="bg-black/20 px-1 rounded">.env</code> file</li>
              </ol>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
