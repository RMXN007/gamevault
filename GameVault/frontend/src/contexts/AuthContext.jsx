import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { X, Lock, Mail, User as UserIcon, AlertCircle } from 'lucide-react';
import Button from '../components/ui/Button';
import { usersApi } from '../services/api';

const AuthContext = createContext(null);

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);

function AuthModal({ mode, setMode, close, submit }) {
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const onSubmit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      await submit(mode, form);
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/75 backdrop-blur-md flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      onClick={close}
    >
      <div
        className="relative w-full max-w-md rounded-[var(--radius-card)] bg-[var(--color-bg-card)] border border-[var(--color-border-color)] p-6 sm:p-8 shadow-2xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={close}
          className="absolute top-4 right-4 p-2 rounded-full text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-bg-secondary)] transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-6">
          <span className="text-[var(--color-accent)] text-xs font-bold uppercase tracking-widest">
            GameVault Account
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-text-main)] mt-1 tracking-tight">
            {mode === 'login' ? 'Sign in to Continue' : 'Create an Account'}
          </h2>
          <p className="text-xs sm:text-sm text-[var(--color-text-muted)] mt-1.5">
            {mode === 'login'
              ? 'Access your library, post threads, and vote on community discussions.'
              : 'Join the community, create discussions, and customize your profile.'}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center gap-2.5 text-red-400 text-xs font-medium">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={onSubmit} className="space-y-3.5">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1.5">
                Username
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3.5 top-3 w-4 h-4 text-[var(--color-text-muted)]" />
                <input
                  required
                  type="text"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  placeholder="Choose a username"
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-[var(--radius-card)] bg-[var(--color-bg-secondary)] border border-[var(--color-border-color)] text-[var(--color-text-main)] focus:outline-none focus:border-[var(--color-accent)]"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 w-4 h-4 text-[var(--color-text-muted)]" />
              <input
                required
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
                className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-[var(--radius-card)] bg-[var(--color-bg-secondary)] border border-[var(--color-border-color)] text-[var(--color-text-main)] focus:outline-none focus:border-[var(--color-accent)]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 w-4 h-4 text-[var(--color-text-muted)]" />
              <input
                required
                minLength={6}
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-[var(--radius-card)] bg-[var(--color-bg-secondary)] border border-[var(--color-border-color)] text-[var(--color-text-main)] focus:outline-none focus:border-[var(--color-accent)]"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={busy}
            className="w-full py-2.5 font-bold shadow-md shadow-[var(--color-accent)]/20 mt-2"
          >
            {busy
              ? 'Please wait…'
              : mode === 'login'
              ? 'Sign In'
              : 'Create Account'}
          </Button>
        </form>

        {/* Mode Switcher */}
        <div className="mt-6 pt-4 border-t border-[var(--color-border-color)] flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={() => {
              setError('');
              setMode(mode === 'login' ? 'register' : 'login');
            }}
            className="font-semibold text-[var(--color-accent)] hover:underline cursor-pointer"
          >
            {mode === 'login'
              ? "Don't have an account? Sign Up"
              : 'Already have an account? Sign In'}
          </button>
          <button
            type="button"
            onClick={close}
            className="text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('gamevaultUser') || 'null');
    } catch {
      return null;
    }
  });
  const [modal, setModal] = useState(null);
  const [ready, setReady] = useState(() => !localStorage.getItem('token'));

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('authToken');
    localStorage.removeItem('gamevaultUser');
    setUser(null);
    setReady(true);
  }, []);

  const refreshUser = useCallback(
    (nextUser) =>
      setUser((current) => {
        const next = typeof nextUser === 'function' ? nextUser(current) : nextUser;
        if (next) localStorage.setItem('gamevaultUser', JSON.stringify(next));
        return next;
      }),
    []
  );

  useEffect(() => {
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');
    if (!token) return undefined;
    usersApi
      .profile()
      .then((profile) => refreshUser((current) => ({ ...current, ...profile })))
      .catch((error) => {
        if (error.status === 401) logout();
      })
      .finally(() => setReady(true));

    window.addEventListener('gamevault:auth-expired', logout);
    return () => window.removeEventListener('gamevault:auth-expired', logout);
  }, [logout, refreshUser]);

  const authenticate = async (mode, form) => {
    const data =
      mode === 'login' ? await usersApi.login(form) : await usersApi.register(form);
    localStorage.setItem('token', data.token);
    localStorage.setItem('gamevaultUser', JSON.stringify(data));
    setUser(data);
    setModal(null);
  };

  const requireAuth = useCallback(
    (action) => {
      if (user) return action?.();
      setModal('login');
      return undefined;
    },
    [user]
  );

  const value = {
    user,
    isAuthenticated: Boolean(user),
    ready,
    logout,
    requireAuth,
    openAuth: (mode = 'login') => setModal(mode),
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
      {modal && (
        <AuthModal
          mode={modal}
          setMode={setModal}
          close={() => setModal(null)}
          submit={authenticate}
        />
      )}
    </AuthContext.Provider>
  );
}
