import React from 'react';
import { Link } from 'react-router-dom';

const templates = [
  { id: 'high-value', name: 'High-Value Customers' },
  { id: 'at-risk', name: 'At-Risk Customers' },
  { id: 'payment-recovery', name: 'Payment Recovery Needed' },
];

export const FirstTimeEmptyState: React.FC = () => {
  return (
    <div className="bg-surface-primary/80 backdrop-blur-lg rounded-2xl border border-border-primary/30 p-8 sm:p-10 shadow-lg text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-accent-primary/15 text-2xl">
        <span aria-hidden>O</span>
      </div>

      <h3 className="text-2xl font-semibold text-text-primary">Create your first segment</h3>
      <p className="mx-auto mt-3 max-w-2xl text-text-muted">
        Segments help you group customers by risk, value, and behavior so you can run targeted playbooks and track outcomes.
      </p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link
          to="/app/segments?tab=create&mode=ai"
          className="rounded-xl bg-gradient-to-r from-accent-primary to-accent-secondary px-5 py-2.5 font-medium text-white hover:shadow-lg"
        >
          Create with AI
        </Link>
        <Link
          to="/app/segments?tab=create&mode=manual"
          className="rounded-xl border border-border-primary/40 bg-surface-secondary/40 px-5 py-2.5 font-medium text-text-primary hover:bg-surface-secondary/60"
        >
          Create Manually
        </Link>
      </div>

      <div className="mt-8">
        <p className="text-sm font-medium text-text-secondary">Or start from a template</p>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {templates.map((template) => (
            <Link
              key={template.id}
              to={`/app/segments?tab=create&mode=manual&template=${template.id}`}
              className="rounded-xl border border-border-primary/40 bg-surface-secondary/30 px-4 py-3 text-sm text-text-primary hover:border-accent-primary/40 hover:bg-accent-primary/10"
            >
              {template.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};
