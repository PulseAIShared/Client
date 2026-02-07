import { Link } from 'react-router-dom';

export const NoIntegrationState = () => {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="max-w-2xl w-full rounded-2xl border border-border-primary/40 bg-surface-primary/85 backdrop-blur-lg p-8 sm:p-10 text-center space-y-5 shadow-xl">
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-text-primary">
            Connect your first integration to get started
          </h2>
          <p className="text-sm sm:text-base text-text-muted">
            PulseLTV analyzes your customer data to predict churn
            and automate recovery. Connect an integration to begin.
          </p>
        </div>

        <div>
          <Link
            to="/app/integrations"
            className="inline-flex items-center justify-center rounded-lg bg-accent-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent-secondary transition-colors"
          >
            Connect Integration
          </Link>
        </div>
      </div>
    </div>
  );
};

