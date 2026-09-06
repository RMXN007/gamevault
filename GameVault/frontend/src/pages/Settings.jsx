import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { usersApi } from '../services/api';
import Button from '../components/ui/Button';
import { Settings as SettingsIcon, User as UserIcon, Palette, Shield, Info, LogOut, CheckCircle, AlertCircle } from 'lucide-react';
import { Link, Routes, Route, Navigate, useLocation } from 'react-router-dom';

const Settings = () => {
  const { theme, setTheme, themes } = useTheme();
  const { user, isAuthenticated, ready, logout, openAuth } = useAuth();
  const location = useLocation();

  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordStatus, setPasswordStatus] = useState({ type: '', message: '' });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordStatus({ type: 'error', message: 'New passwords do not match.' });
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setPasswordStatus({ type: 'error', message: 'Password must be at least 6 characters.' });
      return;
    }
    
    setIsChangingPassword(true);
    setPasswordStatus({ type: '', message: '' });

    try {
      await usersApi.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      setPasswordStatus({ type: 'success', message: 'Password updated successfully!' });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      setPasswordStatus({ type: 'error', message: error.message || 'Failed to update password.' });
    } finally {
      setIsChangingPassword(false);
    }
  };

  // --------------------------------------------------
  // RESTORING SESSION SKELETON
  // --------------------------------------------------
  if (!ready) {
    return (
      <div className="container mx-auto px-4 py-16 text-center text-[var(--color-text-muted)] animate-pulse">
        Restoring your session…
      </div>
    );
  }

  // --------------------------------------------------
  // LOGGED-OUT STATE
  // --------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-2xl text-center">
        <div className="p-8 sm:p-12 rounded-[var(--radius-card)] bg-[var(--color-bg-card)] border border-[var(--color-border-color)] shadow-xl">
          <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-[var(--color-bg-secondary)] flex items-center justify-center text-[var(--color-accent)]">
            <SettingsIcon className="w-8 h-8" />
          </div>
          <span className="text-[var(--color-accent)] text-xs font-bold uppercase tracking-widest">
            Settings
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--color-text-main)] mt-1 tracking-tight">
            Account Preferences
          </h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-2 max-w-md mx-auto leading-relaxed">
            Sign in to manage your account settings, themes, and security preferences.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button onClick={() => openAuth('login')} size="lg" className="gap-2 font-bold">
              Sign In
            </Button>
            <Button
              variant="secondary"
              onClick={() => openAuth('register')}
              size="lg"
              className="gap-2 font-bold"
            >
              Create Account
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const NavItem = ({ to, icon: Icon, label }) => {
    const isActive = location.pathname === `/settings/${to}`;
    return (
      <Link 
        to={`/settings/${to}`} 
        className={`flex items-center gap-3 px-4 py-2.5 rounded-[var(--radius-button)] font-medium transition-colors ${isActive ? 'text-[var(--color-text-main)] bg-[var(--color-bg-secondary)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-bg-secondary)]'}`}
      >
        <Icon className={`w-4 h-4 ${isActive ? 'text-[var(--color-accent)]' : ''}`} /> {label}
      </Link>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl space-y-8">
      {/* HEADER */}
      <div className="pb-6 border-b border-[var(--color-border-color)]">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[var(--color-accent)] mb-1">
          <SettingsIcon className="w-4 h-4" />
          <span>Preferences</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-[var(--color-text-main)] tracking-tight">
          Settings
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] gap-8 items-start">
        {/* SIDEBAR NAVIGATION */}
        <aside className="flex flex-col gap-2 md:sticky top-24">
          <NavItem to="account" icon={UserIcon} label="Account" />
          <NavItem to="appearance" icon={Palette} label="Appearance" />
          <NavItem to="security" icon={Shield} label="Security" />
          <NavItem to="about" icon={Info} label="About" />
        </aside>

        {/* SETTINGS CONTENT */}
        <div className="space-y-8 min-h-[400px]">
          <Routes>
            <Route path="/" element={<Navigate to="/settings/account" replace />} />
            
            <Route path="account" element={
              <section className="bg-[var(--color-bg-card)] rounded-[var(--radius-card)] p-6 sm:p-8 border border-[var(--color-border-color)] shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
                <h2 className="text-xl font-bold mb-4 text-[var(--color-text-main)] flex items-center gap-2">
                  <UserIcon className="w-5 h-5 text-[var(--color-accent)]" /> Account
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-[var(--color-border-color)]">
                    <div>
                      <div className="font-semibold text-[var(--color-text-main)]">Profile Information</div>
                      <div className="text-sm text-[var(--color-text-muted)]">Update your username, bio, and avatar.</div>
                    </div>
                    <Link to="/profile">
                      <Button variant="secondary" size="sm">Edit Profile</Button>
                    </Link>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-[var(--color-border-color)]">
                    <div>
                      <div className="font-semibold text-[var(--color-text-main)]">Public Profile</div>
                      <div className="text-sm text-[var(--color-text-muted)]">View how others see your profile.</div>
                    </div>
                    <Link to={`/profile/${user?.username}`}>
                      <Button variant="secondary" size="sm">View Public</Button>
                    </Link>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-[var(--color-border-color)]">
                    <div>
                      <div className="font-semibold text-[var(--color-text-main)]">Email Address</div>
                      <div className="text-sm text-[var(--color-text-muted)]">{user?.email}</div>
                    </div>
                  </div>
                </div>
              </section>
            } />

            <Route path="appearance" element={
              <section className="bg-[var(--color-bg-card)] rounded-[var(--radius-card)] p-6 sm:p-8 border border-[var(--color-border-color)] shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
                <h2 className="text-xl font-bold mb-4 text-[var(--color-text-main)] flex items-center gap-2">
                  <Palette className="w-5 h-5 text-[var(--color-accent)]" /> Appearance
                </h2>
                <p className="mb-6 text-sm text-[var(--color-text-muted)]">Select your preferred UI style. Changes are saved automatically.</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {themes.map((t) => (
                    <button
                      key={t}
                      onClick={() => setTheme(t)}
                      className={`flex items-center justify-between p-4 rounded-[var(--radius-card)] border-2 transition-all cursor-pointer ${theme === t ? 'border-[var(--color-accent)] bg-[var(--color-bg-secondary)]' : 'border-[var(--color-border-color)] bg-[var(--color-bg-primary)] hover:border-[var(--color-text-muted)]'}`}
                    >
                      <div className="text-left">
                        <h3 className={`font-bold text-base capitalize ${theme === t ? 'text-[var(--color-text-main)]' : 'text-[var(--color-text-muted)]'}`}>{t}</h3>
                        <p className="text-xs text-[var(--color-text-muted)] mt-1">
                          {t === 'minimal' && 'Clean, monochrome style.'}
                          {t === 'futuristic' && 'Neon accents, dark glow.'}
                          {t === 'apple' && 'Soft shadows, bright colors.'}
                          {t === 'cyberpunk' && 'High contrast, neon.'}
                        </p>
                      </div>
                      <div 
                        className={`w-5 h-5 rounded-full border-2 flex-shrink-0 ${theme === t ? 'border-[var(--color-accent)] bg-[var(--color-accent)]' : 'border-[var(--color-text-muted)] bg-transparent'}`}
                      />
                    </button>
                  ))}
                </div>
              </section>
            } />

            <Route path="security" element={
              <section className="bg-[var(--color-bg-card)] rounded-[var(--radius-card)] p-6 sm:p-8 border border-[var(--color-border-color)] shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
                <h2 className="text-xl font-bold mb-6 text-[var(--color-text-main)] flex items-center gap-2">
                  <Shield className="w-5 h-5 text-[var(--color-accent)]" /> Security
                </h2>
                
                <div className="space-y-8">
                  {/* Password Change Form */}
                  <div>
                    <h3 className="font-semibold text-lg text-[var(--color-text-main)] mb-1">Change Password</h3>
                    <p className="text-sm text-[var(--color-text-muted)] mb-4">Ensure your account is using a long, random password to stay secure.</p>
                    
                    {passwordStatus.message && (
                      <div className={`p-4 mb-4 rounded-lg flex items-center gap-2 text-sm font-medium ${
                        passwordStatus.type === 'error' ? 'bg-red-500/10 border border-red-500/30 text-red-400' : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                      }`}>
                        {passwordStatus.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                        {passwordStatus.message}
                      </div>
                    )}
                    
                    <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                      <div>
                        <label className="block text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1.5">Current Password</label>
                        <input
                          type="password"
                          required
                          value={passwordForm.currentPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                          className="w-full px-3.5 py-2.5 text-sm rounded-[var(--radius-card)] bg-[var(--color-bg-secondary)] border border-[var(--color-border-color)] text-[var(--color-text-main)] focus:outline-none focus:border-[var(--color-accent)]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1.5">New Password</label>
                        <input
                          type="password"
                          required
                          value={passwordForm.newPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                          className="w-full px-3.5 py-2.5 text-sm rounded-[var(--radius-card)] bg-[var(--color-bg-secondary)] border border-[var(--color-border-color)] text-[var(--color-text-main)] focus:outline-none focus:border-[var(--color-accent)]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1.5">Confirm New Password</label>
                        <input
                          type="password"
                          required
                          value={passwordForm.confirmPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                          className="w-full px-3.5 py-2.5 text-sm rounded-[var(--radius-card)] bg-[var(--color-bg-secondary)] border border-[var(--color-border-color)] text-[var(--color-text-main)] focus:outline-none focus:border-[var(--color-accent)]"
                        />
                      </div>
                      <Button type="submit" disabled={isChangingPassword} className="mt-2 font-bold">
                        {isChangingPassword ? 'Updating...' : 'Update Password'}
                      </Button>
                    </form>
                  </div>
                  
                  <div className="pt-6 border-t border-[var(--color-border-color)] flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-[var(--color-text-main)]">Sign Out</div>
                      <div className="text-sm text-[var(--color-text-muted)]">End your current session safely.</div>
                    </div>
                    <Button 
                      onClick={logout} 
                      className="bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border-0 font-bold gap-2"
                    >
                      <LogOut className="w-4 h-4" /> Logout
                    </Button>
                  </div>
                </div>
              </section>
            } />

            <Route path="about" element={
              <section className="bg-[var(--color-bg-card)] rounded-[var(--radius-card)] p-6 sm:p-8 border border-[var(--color-border-color)] shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
                <h2 className="text-xl font-bold mb-4 text-[var(--color-text-main)] flex items-center gap-2">
                  <Info className="w-5 h-5 text-[var(--color-accent)]" /> About GameVault
                </h2>
                <div className="text-sm text-[var(--color-text-muted)] space-y-2">
                  <p>GameVault Version 1.0.0</p>
                  <p>Built with React, Vite, Node.js, and MongoDB.</p>
                  <p className="pt-4 text-xs">© {new Date().getFullYear()} GameVault. All rights reserved.</p>
                </div>
              </section>
            } />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default Settings;
