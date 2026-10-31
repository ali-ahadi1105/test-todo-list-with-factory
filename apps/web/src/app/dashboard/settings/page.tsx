'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserSettings, useUpdateUserSettings } from '@/hooks/useApi';
import { Button, Select, Switch, Card } from '@todo/ui';
import { useTheme } from 'next-themes';
import { Toaster } from 'react-hot-toast';

export const dynamic = 'force-dynamic';

const commonTimezones = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Anchorage',
  'Pacific/Honolulu',
  'America/Toronto',
  'America/Vancouver',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Europe/Rome',
  'Europe/Madrid',
  'Europe/Amsterdam',
  'Europe/Stockholm',
  'Europe/Oslo',
  'Europe/Copenhagen',
  'Europe/Helsinki',
  'Europe/Warsaw',
  'Europe/Moscow',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Asia/Singapore',
  'Asia/Hong_Kong',
  'Asia/Seoul',
  'Asia/Dubai',
  'Asia/Kolkata',
  'Australia/Sydney',
  'Australia/Melbourne',
  'Australia/Perth',
  'Australia/Brisbane',
  'Pacific/Auckland',
];

const timezoneOptions = commonTimezones.map((tz) => ({ value: tz, label: tz }));

export default function SettingsPage() {
  const router = useRouter();
  const { setTheme } = useTheme();
  const { data: settings, isLoading } = useUserSettings();
  const updateSettingsMutation = useUpdateUserSettings();
  const [localTheme, setLocalTheme] = useState<'light' | 'dark' | 'system'>('system');
  const [localTimezone, setLocalTimezone] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);

  // Sync local state with fetched settings
  React.useEffect(() => {
    if (settings) {
      setLocalTheme(settings.theme);
      setLocalTimezone(settings.timezone);
      setNotificationsEnabled(settings.notificationsEnabled);
      setEmailNotifications(settings.emailNotifications);
    }
  }, [settings]);

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setLocalTheme(newTheme);
    setTheme(newTheme);
    updateSettingsMutation.mutate({ theme: newTheme });
  };

  const handleTimezoneChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setLocalTimezone(value);
    updateSettingsMutation.mutate({ timezone: value });
  };

  const handleNotificationsToggle = (enabled: boolean) => {
    setNotificationsEnabled(enabled);
    updateSettingsMutation.mutate({ notificationsEnabled: enabled });
  };

  const handleEmailNotificationsToggle = (enabled: boolean) => {
    setEmailNotifications(enabled);
    updateSettingsMutation.mutate({ emailNotifications: enabled });
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="border-primary-main h-8 w-8 animate-spin rounded-full border-b-2"></div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Settings</h1>
        <p className="mt-1 text-neutral-500">Manage your account preferences and appearance.</p>
      </div>

      <Toaster position="top-right" />

      {/* Appearance Section */}
      <Card className="p-6">
        <h2 className="mb-4 text-lg font-semibold text-neutral-900">Appearance</h2>
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-700">Theme</label>
            <div className="flex gap-4">
              {(['light', 'dark', 'system'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => handleThemeChange(t)}
                  className={`flex-1 rounded-lg border-2 px-4 py-3 text-sm font-medium transition-all ${
                    localTheme === t
                      ? 'border-primary-main bg-primary-main/5 text-primary-main'
                      : 'border-neutral-200 text-neutral-700 hover:border-neutral-300'
                  }`}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
            <p className="mt-1 text-sm text-neutral-500">
              System theme follows your OS preference.
            </p>
          </div>
        </div>
      </Card>

      {/* Timezone Section */}
      <Card className="p-6">
        <h2 className="mb-4 text-lg font-semibold text-neutral-900">Timezone</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="timezone" className="mb-2 block text-sm font-medium text-neutral-700">
              Timezone
            </label>
            <Select
              id="timezone"
              value={localTimezone}
              onChange={handleTimezoneChange}
              options={timezoneOptions}
              className="w-full md:w-64"
            />
            <p className="mt-1 text-sm text-neutral-500">
              Used for Today, Upcoming, and Overdue views. Dates are stored in UTC.
            </p>
          </div>
        </div>
      </Card>

      {/* Notifications Section */}
      <Card className="p-6">
        <h2 className="mb-4 text-lg font-semibold text-neutral-900">Notifications</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="block text-sm font-medium text-neutral-700">Push Notifications</span>
              <p className="mt-0.5 text-sm text-neutral-500">
                Receive browser notifications for task reminders and updates.
              </p>
            </div>
            <Switch checked={notificationsEnabled} onCheckedChange={handleNotificationsToggle} />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <span className="block text-sm font-medium text-neutral-700">
                Email Notifications
              </span>
              <p className="mt-0.5 text-sm text-neutral-500">
                Receive email notifications for task assignments and comments.
              </p>
            </div>
            <Switch checked={emailNotifications} onCheckedChange={handleEmailNotificationsToggle} />
          </div>
        </div>
      </Card>

      {/* Danger Zone */}
      <Card className="border-error-main/20 p-6">
        <h2 className="mb-4 text-lg font-semibold text-neutral-900">Danger Zone</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-neutral-900">Delete Account</h3>
              <p className="mt-0.5 text-sm text-neutral-500">
                Permanently delete your account and all associated data. This action cannot be
                undone.
              </p>
            </div>
            <Button
              variant="destructive"
              onClick={() => {
                if (
                  confirm(
                    'Are you sure you want to delete your account? This action cannot be undone.'
                  )
                ) {
                  // TODO: Implement account deletion
                  alert('Account deletion not yet implemented');
                }
              }}
            >
              Delete Account
            </Button>
          </div>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button variant="ghost" onClick={() => router.push('/dashboard')}>
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
}
