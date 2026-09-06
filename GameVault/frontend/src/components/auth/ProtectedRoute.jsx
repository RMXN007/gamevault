import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

/**
 * ProtectedRoute — wraps any route that requires authentication.
 * If the user is not logged in, the auth modal is opened automatically
 * and a friendly sign-in prompt is displayed in place of the page content.
 */
export default function ProtectedRoute({ children }) {
  const { isAuthenticated, ready, openAuth } = useAuth();

  // Still restoring the session — show a loading skeleton
  if (!ready) {
    return (
      <div className="container mx-auto px-4 py-20 text-center text-[var(--color-text-muted)] animate-pulse">
        Restoring your session…
      </div>
    );
  }

  // Not authenticated — show a prompt and trigger the login modal
  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-20 max-w-lg text-center">
        <div className="p-10 rounded-[var(--radius-card)] bg-[var(--color-bg-card)] border border-[var(--color-border-color)] shadow-xl space-y-4">
          <div className="w-14 h-14 mx-auto rounded-full bg-[var(--color-bg-secondary)] flex items-center justify-center text-[var(--color-accent)]">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <h2 className="text-2xl font-extrabold text-[var(--color-text-main)] tracking-tight">
            Authentication Required
          </h2>
          <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
            You need to sign in to access this page. Create an account or log in to continue.
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <button
              onClick={() => openAuth('login')}
              className="px-5 py-2.5 text-sm font-bold rounded-[var(--radius-button)] bg-[var(--color-accent)] text-white hover:opacity-90 transition-opacity"
            >
              Sign In
            </button>
            <button
              onClick={() => openAuth('register')}
              className="px-5 py-2.5 text-sm font-bold rounded-[var(--radius-button)] bg-[var(--color-bg-secondary)] text-[var(--color-text-main)] border border-[var(--color-border-color)] hover:border-[var(--color-accent)] transition-colors"
            >
              Create Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  return children;
}
