type CreationMode = 'ai-assisted' | 'from-scratch';

type CreationModeSelectorProps = {
  onSelect: (mode: CreationMode) => void;
};

const cardClass =
  'w-full rounded-2xl border border-border-primary/30 bg-surface-primary/70 p-5 text-left transition-all duration-200 hover:border-accent-primary/40 hover:bg-surface-secondary/40 focus:outline-none focus:ring-2 focus:ring-accent-primary/40';

export const CreationModeSelector = ({
  onSelect,
}: CreationModeSelectorProps) => {
  return (
    <div className="rounded-2xl border border-border-primary/30 bg-surface-primary/80 p-5 sm:p-6 space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-text-primary">
          How would you like to create your playbook?
        </h2>
        <p className="text-sm text-text-muted mt-1">
          Choose AI-assisted generation or configure each step
          manually.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          type="button"
          className={cardClass}
          onClick={() => onSelect('ai-assisted')}
        >
          <div className="text-sm font-semibold text-text-primary">
            AI-Assisted
          </div>
          <p className="text-sm text-text-muted mt-1">
            Generate a draft from your integrations and adjust
            every field before saving.
          </p>
        </button>

        <button
          type="button"
          className={cardClass}
          onClick={() => onSelect('from-scratch')}
        >
          <div className="text-sm font-semibold text-text-primary">
            From Scratch
          </div>
          <p className="text-sm text-text-muted mt-1">
            Configure trigger, execution, and actions manually
            across all steps.
          </p>
        </button>
      </div>
    </div>
  );
};

