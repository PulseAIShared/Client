type RecoveryProgressBarProps = {
  missedAmount: number;
  recoveredAmount: number;
};

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

export const RecoveryProgressBar = ({
  missedAmount,
  recoveredAmount,
}: RecoveryProgressBarProps) => {
  const safeMissed = Math.max(0, missedAmount || 0);
  const safeRecovered = Math.max(0, recoveredAmount || 0);
  const total = safeMissed + safeRecovered;

  const recoveredPercent =
    total > 0 ? (safeRecovered / total) * 100 : 0;
  const missedPercent =
    total > 0 ? (safeMissed / total) * 100 : 100;

  return (
    <div className="rounded-xl border border-border-primary/30 bg-surface-secondary/30 p-4 space-y-3">
      <div className="flex items-center justify-between text-xs text-text-muted">
        <span>Recovery progress</span>
        <span>{Math.round(recoveredPercent)}% recovered</span>
      </div>

      <div className="w-full h-3 rounded-full overflow-hidden bg-surface-primary/60 border border-border-primary/30 flex">
        <div
          className="h-full bg-warning transition-all duration-300"
          style={{ width: `${Math.max(0, missedPercent)}%` }}
          aria-label="Missed amount"
        />
        <div
          className="h-full bg-success transition-all duration-300"
          style={{ width: `${Math.max(0, recoveredPercent)}%` }}
          aria-label="Recovered amount"
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <span className="text-warning">
          Missed: {currency.format(safeMissed)}
        </span>
        <span className="text-success">
          Recovered: {currency.format(safeRecovered)}
        </span>
      </div>
    </div>
  );
};

