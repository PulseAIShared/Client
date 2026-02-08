import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

type EmailActionDefaults = {
  defaultDisplayName: string;
  defaultReplyTo: string;
  defaultSubjectPrefix: string;
  defaultFooterTemplate: string;
};

const STORAGE_KEY = 'pulse:email-action-defaults:v1';

const DEFAULTS: EmailActionDefaults = {
  defaultDisplayName: 'Customer Success',
  defaultReplyTo: '',
  defaultSubjectPrefix: '',
  defaultFooterTemplate:
    'Thanks,\n{{company_name}} Team',
};

export const EmailActionDefaultsSettings: React.FC = () => {
  const [values, setValues] = useState<EmailActionDefaults>(DEFAULTS);
  const [isDirty, setIsDirty] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return;
      }

      const parsed = JSON.parse(raw) as Partial<EmailActionDefaults>;
      setValues((previous) => ({
        ...previous,
        ...parsed,
      }));
    } catch {
      // Ignore malformed local preferences and keep safe defaults.
    }
  }, []);

  const updateField = <K extends keyof EmailActionDefaults>(
    key: K,
    value: EmailActionDefaults[K],
  ) => {
    setValues((previous) => ({
      ...previous,
      [key]: value,
    }));
    setIsDirty(true);
  };

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(values));
    setIsDirty(false);
    setSavedAt(new Date().toLocaleTimeString());
  };

  const handleReset = () => {
    setValues(DEFAULTS);
    setIsDirty(true);
  };

  return (
    <div className="space-y-4 rounded-2xl border border-border-primary/40 bg-surface-secondary/30 p-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
        <div>
          <h4 className="text-lg font-semibold text-text-primary">
            Email Action Defaults
          </h4>
          <p className="text-sm text-text-muted">
            Configure default sender display and template preferences for email playbook actions.
          </p>
        </div>
        <Link
          to="/app/integrations?capability=action_channel"
          className="text-sm font-medium text-accent-primary hover:underline"
        >
          Manage provider connections
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-text-secondary">
            Default display name
          </label>
          <input
            value={values.defaultDisplayName}
            onChange={(event) =>
              updateField('defaultDisplayName', event.target.value)
            }
            className="w-full rounded-lg border border-border-primary/40 bg-surface-primary/60 px-3 py-2 text-text-primary focus:border-accent-primary focus:outline-none"
            placeholder="Customer Success"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-text-secondary">
            Default reply-to
          </label>
          <input
            type="email"
            value={values.defaultReplyTo}
            onChange={(event) =>
              updateField('defaultReplyTo', event.target.value)
            }
            className="w-full rounded-lg border border-border-primary/40 bg-surface-primary/60 px-3 py-2 text-text-primary focus:border-accent-primary focus:outline-none"
            placeholder="support@company.com"
          />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-text-secondary">
          Default subject prefix
        </label>
        <input
          value={values.defaultSubjectPrefix}
          onChange={(event) =>
            updateField('defaultSubjectPrefix', event.target.value)
          }
          className="w-full rounded-lg border border-border-primary/40 bg-surface-primary/60 px-3 py-2 text-text-primary focus:border-accent-primary focus:outline-none"
          placeholder="[PulseLTV]"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-text-secondary">
          Default footer template
        </label>
        <textarea
          value={values.defaultFooterTemplate}
          onChange={(event) =>
            updateField('defaultFooterTemplate', event.target.value)
          }
          rows={4}
          className="w-full rounded-lg border border-border-primary/40 bg-surface-primary/60 px-3 py-2 text-text-primary focus:border-accent-primary focus:outline-none"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={handleSave} disabled={!isDirty}>
          Save defaults
        </Button>
        <Button variant="outline" onClick={handleReset}>
          Reset defaults
        </Button>
        {savedAt && (
          <span className="text-xs text-text-muted">
            Saved at {savedAt}
          </span>
        )}
      </div>
    </div>
  );
};
