export type ActivitySeverity = 'healthy' | 'warning' | 'concerning' | 'critical';

export type RelativeActivity = {
  label: string;
  severity: ActivitySeverity;
};

export const formatRelativeActivity = (
  lastActivityAt?: string | null,
): RelativeActivity => {
  if (!lastActivityAt) {
    return {
      label: 'No recent activity',
      severity: 'critical',
    };
  }

  const lastSeen = new Date(lastActivityAt);
  if (Number.isNaN(lastSeen.getTime())) {
    return {
      label: 'Unknown activity',
      severity: 'critical',
    };
  }

  const now = Date.now();
  const diffMs = Math.max(0, now - lastSeen.getTime());
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 60) {
    return {
      label: diffMinutes <= 1 ? 'Active just now' : `Active ${diffMinutes}m ago`,
      severity: 'healthy',
    };
  }

  if (diffHours < 24) {
    return {
      label: `Active ${diffHours}h ago`,
      severity: 'healthy',
    };
  }

  if (diffDays < 7) {
    return {
      label: `Last seen ${diffDays} day${diffDays === 1 ? '' : 's'} ago`,
      severity: 'warning',
    };
  }

  if (diffDays < 14) {
    return {
      label: `Last seen ${diffDays} days ago`,
      severity: 'concerning',
    };
  }

  if (diffDays >= 30) {
    return {
      label: 'Last seen 30+ days ago',
      severity: 'critical',
    };
  }

  return {
    label: `Last seen ${diffDays} days ago`,
    severity: 'critical',
  };
};

