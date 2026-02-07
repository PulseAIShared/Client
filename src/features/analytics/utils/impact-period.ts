export type ImpactPeriodPreset =
  | 'today'
  | '7d'
  | '30d'
  | '90d'
  | 'custom';

export type ImpactPeriodState = {
  period: ImpactPeriodPreset;
  from?: string;
  to?: string;
};

export type ImpactPeriodRange = {
  fromIso: string;
  toIso: string;
  isCustom: boolean;
  isValid: boolean;
};

const DEFAULT_PERIOD: ImpactPeriodPreset = '7d';

const presetDays: Record<Exclude<ImpactPeriodPreset, 'custom' | 'today'>, number> = {
  '7d': 7,
  '30d': 30,
  '90d': 90,
};

const isValidPreset = (value: string | null): value is ImpactPeriodPreset =>
  value === 'today'
  || value === '7d'
  || value === '30d'
  || value === '90d'
  || value === 'custom';

const toDateStartUtc = (value: string): Date | null => {
  const dateOnlyMatch = /^\d{4}-\d{2}-\d{2}$/.test(value.trim());
  const date = dateOnlyMatch
    ? new Date(`${value.trim()}T00:00:00.000Z`)
    : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  if (!dateOnlyMatch) {
    return date;
  }

  return new Date(Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    0,
    0,
    0,
    0,
  ));
};

const toDateEndUtc = (value: string): Date | null => {
  const start = toDateStartUtc(value);
  if (!start) {
    return null;
  }

  const dateOnlyMatch = /^\d{4}-\d{2}-\d{2}$/.test(value.trim());
  if (!dateOnlyMatch) {
    return start;
  }

  return new Date(Date.UTC(
    start.getUTCFullYear(),
    start.getUTCMonth(),
    start.getUTCDate(),
    23,
    59,
    59,
    999,
  ));
};

const toDateInput = (value?: string): string => {
  if (!value) {
    return '';
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return '';
  }

  const year = parsed.getUTCFullYear();
  const month = String(parsed.getUTCMonth() + 1).padStart(2, '0');
  const day = String(parsed.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const parseImpactPeriodFromSearchParams = (
  searchParams: URLSearchParams,
): ImpactPeriodState => {
  const periodParam = searchParams.get('period');
  const period = isValidPreset(periodParam)
    ? periodParam
    : DEFAULT_PERIOD;

  const from = searchParams.get('from') ?? undefined;
  const to = searchParams.get('to') ?? undefined;

  if (period !== 'custom') {
    return { period };
  }

  return {
    period,
    from: toDateInput(from),
    to: toDateInput(to),
  };
};

export const resolveImpactPeriodRange = (
  state: ImpactPeriodState,
  now: Date = new Date(),
): ImpactPeriodRange => {
  if (state.period === 'custom') {
    const fromDate = state.from ? toDateStartUtc(state.from) : null;
    const toDate = state.to ? toDateEndUtc(state.to) : null;
    const isValid = Boolean(fromDate && toDate && fromDate <= toDate);

    if (!fromDate || !toDate || !isValid) {
      return {
        fromIso: now.toISOString(),
        toIso: now.toISOString(),
        isCustom: true,
        isValid: false,
      };
    }

    return {
      fromIso: fromDate.toISOString(),
      toIso: toDate.toISOString(),
      isCustom: true,
      isValid: true,
    };
  }

  if (state.period === 'today') {
    const start = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      0,
      0,
      0,
      0,
    ));

    return {
      fromIso: start.toISOString(),
      toIso: now.toISOString(),
      isCustom: false,
      isValid: true,
    };
  }

  const days = presetDays[state.period];
  const fromDate = new Date(now);
  fromDate.setUTCDate(fromDate.getUTCDate() - days);

  return {
    fromIso: fromDate.toISOString(),
    toIso: now.toISOString(),
    isCustom: false,
    isValid: true,
  };
};

export const applyImpactPeriodToSearchParams = (
  searchParams: URLSearchParams,
  state: ImpactPeriodState,
): URLSearchParams => {
  const next = new URLSearchParams(searchParams);
  next.set('period', state.period);

  if (state.period === 'custom') {
    if (state.from) {
      next.set('from', state.from);
    } else {
      next.delete('from');
    }

    if (state.to) {
      next.set('to', state.to);
    } else {
      next.delete('to');
    }
  } else {
    next.delete('from');
    next.delete('to');
  }

  return next;
};

export const getImpactPeriodLabel = (state: ImpactPeriodState): string => {
  switch (state.period) {
    case 'today':
      return 'Today';
    case '7d':
      return 'Last 7 days';
    case '30d':
      return 'Last 30 days';
    case '90d':
      return 'Last 90 days';
    case 'custom': {
      const from = state.from ?? '';
      const to = state.to ?? '';
      if (from && to) {
        return `${from} to ${to}`;
      }
      return 'Custom range';
    }
    default:
      return 'Last 7 days';
  }
};

