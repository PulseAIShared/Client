import { PlaybookFieldRecommendation } from '@/types/playbooks';

type RecommendationHintProps = {
  recommendation?: PlaybookFieldRecommendation;
  overridden?: boolean;
};

const formatReasonCode = (reasonCode: string) =>
  reasonCode
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());

const formatRecommendedValue = (
  recommendedValue: string,
) => {
  try {
    const parsed = JSON.parse(recommendedValue);
    if (parsed === null || parsed === undefined) {
      return 'None';
    }
    if (Array.isArray(parsed)) {
      return parsed.length > 0
        ? parsed.join(', ')
        : 'None';
    }
    if (typeof parsed === 'object') {
      return JSON.stringify(parsed);
    }
    return String(parsed);
  } catch {
    return recommendedValue;
  }
};

export const RecommendationHint = ({
  recommendation,
  overridden = false,
}: RecommendationHintProps) => {
  if (!recommendation) {
    return null;
  }

  return (
    <details className="mt-2 rounded-lg border border-border-primary/25 bg-surface-secondary/20 px-3 py-2 text-xs">
      <summary className="cursor-pointer list-none font-medium text-text-secondary">
        Why this value
        {overridden
          ? ' (overridden)'
          : ' (recommended)'}
      </summary>
      <div className="mt-2 space-y-1 text-text-muted">
        <p>{recommendation.humanExplanation}</p>
        <p>
          Rule:{' '}
          {formatReasonCode(recommendation.reasonCode)}
        </p>
        <p>
          Recommended:{' '}
          {formatRecommendedValue(
            recommendation.recommendedValue,
          )}
        </p>
        <p>
          Recommender confidence:{' '}
          {Math.round(recommendation.confidence * 100)}%
        </p>
      </div>
    </details>
  );
};
