import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { usersApi } from '../services/api';
import { User as UserIcon, Calendar, ArrowLeft } from 'lucide-react';
import Button from '../components/ui/Button';

export default function PublicProfile() {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setError('');

    usersApi.getPublicProfile(username)
      .then((data) => {
        if (isMounted) setProfile(data);
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.status === 404 ? 'User not found.' : 'Failed to load profile.');
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [username]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-4xl animate-pulse">
        <div className="p-8 rounded-[var(--radius-card)] bg-[var(--color-bg-card)] border border-[var(--color-border-color)] flex flex-col md:flex-row items-center gap-8">
          <div className="w-28 h-28 rounded-full bg-[var(--color-bg-secondary)]" />
          <div className="flex-1 space-y-3 w-full">
            <div className="w-1/2 h-8 bg-[var(--color-bg-secondary)] rounded" />
            <div className="w-1/3 h-4 bg-[var(--color-bg-secondary)] rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="container mx-auto px-4 py-16 text-center max-w-md">
        <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-[var(--color-bg-secondary)] flex items-center justify-center text-[var(--color-text-muted)]">
          <UserIcon className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-[var(--color-text-main)] mb-2">Profile Unavailable</h1>
        <p className="text-[var(--color-text-muted)] mb-6">{error || 'This user does not exist.'}</p>
        <Link to="/">
          <Button variant="secondary" className="gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Button>
        </Link>
      </div>
    );
  }

  const initial = (profile.username?.[0] || 'U').toUpperCase();
  const joinDate = profile.createdAt
    ? new Date(profile.createdAt).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      })
    : null;

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl space-y-8">
      {/* HEADER CARD */}
      <div className="relative overflow-hidden bg-[var(--color-bg-card)] border border-[var(--color-border-color)] rounded-[var(--radius-card)] p-6 sm:p-10 shadow-sm flex flex-col md:flex-row items-center gap-8">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          {profile.avatar ? (
            <img
              src={profile.avatar}
              alt={profile.username}
              className="w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-[var(--color-bg-secondary)] shadow-lg"
            />
          ) : (
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-[var(--color-bg-secondary)] bg-[var(--color-bg-secondary)] flex items-center justify-center text-4xl font-extrabold text-[var(--color-accent)] shadow-lg">
              {initial}
            </div>
          )}
        </div>

        {/* User Info */}
        <div className="flex-1 text-center md:text-left min-w-0">
          <h1 className="text-3xl sm:text-4xl font-black text-[var(--color-text-main)] tracking-tight truncate">
            {profile.username}
          </h1>

          {joinDate && (
            <div className="flex items-center justify-center md:justify-start gap-1.5 text-xs sm:text-sm text-[var(--color-text-muted)] mt-2">
              <Calendar className="w-4 h-4 text-[var(--color-accent)]" />
              Member since {joinDate}
            </div>
          )}

          {profile.bio && (
            <p className="mt-4 text-sm text-[var(--color-text-main)] leading-relaxed max-w-2xl whitespace-pre-wrap">
              {profile.bio}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
