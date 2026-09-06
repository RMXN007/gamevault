import React, { useEffect, useState } from 'react';
import {
  Calendar,
  CheckCircle,
  Edit3,
  Mail,
  Shield,
  ShieldCheck,
  User as UserIcon,
  X,
  AlertCircle
} from 'lucide-react';
import Button from '../components/ui/Button';
import { usersApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export default function AccountProfile() {
  const { user, isAuthenticated, ready, openAuth, refreshUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ username: '', avatar: '', bio: '' });
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) return undefined;

    let isMounted = true;
    usersApi
      .profile()
      .then((data) => {
        if (!isMounted) return;
        setProfile(data);
        setEditForm({
          username: data.username || '',
          avatar: data.avatar || '',
          bio: data.bio || '',
        });
        refreshUser((prev) => ({ ...prev, ...data }));
      })
      .catch((err) => {
        if (!isMounted) return;
        setStatusMessage({ type: 'error', text: err.message || 'Unable to load profile data.' });
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, refreshUser]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setStatusMessage({ type: '', text: '' });

    try {
      const updated = await usersApi.updateProfile(editForm);
      setProfile(updated);
      refreshUser((prev) => ({ ...prev, ...updated }));
      setIsEditing(false);
      setStatusMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to update profile.' });
    } finally {
      setIsSaving(false);
    }
  };

  // --------------------------------------------------
  // RESTORING SESSION SKELETON
  // --------------------------------------------------
  if (!ready || (isAuthenticated && isLoading)) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-4xl animate-pulse">
        <div className="p-8 rounded-[var(--radius-card)] bg-[var(--color-bg-card)] border border-[var(--color-border-color)] flex flex-col md:flex-row items-center gap-8">
          <div className="w-28 h-28 rounded-full bg-[var(--color-bg-secondary)]" />
          <div className="flex-1 space-y-3 w-full">
            <div className="w-1/2 h-8 bg-[var(--color-bg-secondary)] rounded" />
            <div className="w-1/3 h-4 bg-[var(--color-bg-secondary)] rounded" />
            <div className="w-2/3 h-4 bg-[var(--color-bg-secondary)] rounded" />
          </div>
        </div>
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
            <UserIcon className="w-8 h-8" />
          </div>
          <span className="text-[var(--color-accent)] text-xs font-bold uppercase tracking-widest">
            Profile Access
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--color-text-main)] mt-1 tracking-tight">
            Sign in to Your Account
          </h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-2 max-w-md mx-auto leading-relaxed">
            Manage your gaming preferences, customize your profile bio and avatar, and view your community contributions.
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

  const currentData = profile || user;
  const initial = (currentData?.username?.[0] || 'U').toUpperCase();
  const joinDate = currentData?.createdAt
    ? new Date(currentData.createdAt).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      })
    : null;

  // --------------------------------------------------
  // LOGGED-IN STATE
  // --------------------------------------------------
  return (
    <div className="container mx-auto px-4 py-10 max-w-5xl space-y-8">
      {/* STATUS NOTICES */}
      {statusMessage.text && (
        <div
          className={`p-4 rounded-[var(--radius-card)] flex items-center gap-3 text-xs sm:text-sm font-medium ${
            statusMessage.type === 'error'
              ? 'bg-red-500/10 border border-red-500/30 text-red-400'
              : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
          }`}
        >
          {statusMessage.type === 'error' ? (
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
          ) : (
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* PROFILE HEADER CARD */}
      <div className="relative overflow-hidden bg-[var(--color-bg-card)] border border-[var(--color-border-color)] rounded-[var(--radius-card)] p-6 sm:p-10 shadow-sm flex flex-col md:flex-row items-center gap-8">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          {currentData?.avatar ? (
            <img
              src={currentData.avatar}
              alt={currentData.username}
              className="w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-[var(--color-accent)] shadow-lg"
            />
          ) : (
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-[var(--color-accent)] bg-[var(--color-bg-secondary)] flex items-center justify-center text-4xl font-extrabold text-[var(--color-accent)] shadow-lg">
              {initial}
            </div>
          )}
          {currentData?.isAdmin && (
            <div
              className="absolute -bottom-1 -right-1 p-2 rounded-full bg-[var(--color-accent)] text-white shadow-md"
              title="Administrator"
            >
              <ShieldCheck className="w-4 h-4" />
            </div>
          )}
        </div>

        {/* User Info */}
        <div className="flex-1 text-center md:text-left min-w-0">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-1">
            <h1 className="text-3xl sm:text-4xl font-black text-[var(--color-text-main)] tracking-tight truncate">
              {currentData?.username}
            </h1>
            {currentData?.isAdmin && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[var(--color-accent)]/20 text-[var(--color-accent)] border border-[var(--color-accent)]/30">
                Admin
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs sm:text-sm text-[var(--color-text-muted)] mt-2">
            {currentData?.email && (
              <span className="flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-[var(--color-accent)]" />
                {currentData.email}
              </span>
            )}
            {joinDate && (
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[var(--color-accent)]" />
                Member since {joinDate}
              </span>
            )}
          </div>

          {currentData?.bio && (
            <p className="mt-4 text-sm text-[var(--color-text-main)] leading-relaxed max-w-2xl whitespace-pre-wrap">
              {currentData.bio}
            </p>
          )}

          <div className="mt-6 flex justify-center md:justify-start">
            <Button
              variant={isEditing ? 'outline' : 'secondary'}
              size="sm"
              className="gap-2"
              onClick={() => {
                setIsEditing(!isEditing);
                setStatusMessage({ type: '', text: '' });
              }}
            >
              {isEditing ? (
                <>
                  <X className="w-4 h-4" /> Cancel Editing
                </>
              ) : (
                <>
                  <Edit3 className="w-4 h-4" /> Edit Profile
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* EDIT PROFILE FORM */}
      {isEditing && (
        <form
          onSubmit={handleSaveProfile}
          className="bg-[var(--color-bg-card)] border border-[var(--color-border-color)] rounded-[var(--radius-card)] p-6 sm:p-8 shadow-sm space-y-5"
        >
          <div>
            <h2 className="text-xl font-bold text-[var(--color-text-main)]">
              Update Profile Information
            </h2>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">
              Changes will be saved directly to your GameVault account.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1.5">
                Username
              </label>
              <input
                required
                type="text"
                value={editForm.username}
                onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm rounded-[var(--radius-card)] bg-[var(--color-bg-secondary)] border border-[var(--color-border-color)] text-[var(--color-text-main)] focus:outline-none focus:border-[var(--color-accent)]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1.5">
                Avatar Image URL
              </label>
              <input
                type="url"
                value={editForm.avatar}
                onChange={(e) => setEditForm({ ...editForm, avatar: e.target.value })}
                placeholder="https://example.com/avatar.png"
                className="w-full px-3.5 py-2.5 text-sm rounded-[var(--radius-card)] bg-[var(--color-bg-secondary)] border border-[var(--color-border-color)] text-[var(--color-text-main)] focus:outline-none focus:border-[var(--color-accent)]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1.5">
              Bio / About You
            </label>
            <textarea
              rows={4}
              value={editForm.bio}
              onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
              placeholder="Tell other gamers about your favorite genres, gaming rig, or handles…"
              className="w-full p-3.5 text-sm rounded-[var(--radius-card)] bg-[var(--color-bg-secondary)] border border-[var(--color-border-color)] text-[var(--color-text-main)] focus:outline-none focus:border-[var(--color-accent)]"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--color-border-color)]">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving} className="font-bold">
              {isSaving ? 'Saving…' : 'Save Changes'}
            </Button>
          </div>
        </form>
      )}

      {/* ACCOUNT DETAILS & SECURITY SUMMARY */}
      <div className="bg-[var(--color-bg-card)] border border-[var(--color-border-color)] rounded-[var(--radius-card)] p-6 sm:p-8 shadow-sm space-y-4">
        <h2 className="text-xl font-bold text-[var(--color-text-main)] flex items-center gap-2">
          <Shield className="w-5 h-5 text-[var(--color-accent)]" />
          Account & Security
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
          <div className="p-4 rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border-color)]">
            <span className="text-[var(--color-text-muted)] block text-xs uppercase font-bold tracking-wider mb-1">
              Account Status
            </span>
            <span className="font-semibold text-emerald-400 flex items-center gap-1">
              <CheckCircle className="w-4 h-4" /> Active & Verified
            </span>
          </div>

          <div className="p-4 rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border-color)]">
            <span className="text-[var(--color-text-muted)] block text-xs uppercase font-bold tracking-wider mb-1">
              Access Role
            </span>
            <span className="font-semibold text-[var(--color-text-main)]">
              {currentData?.isAdmin ? 'Administrator Access' : 'Standard Member'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
