import { create } from 'zustand';

export type AiRecommendationPriority = 'low' | 'medium' | 'high';

export interface AiRecommendationChecklistItem {
  id: string;
  label: string;
  completed?: boolean;
  priority?: AiRecommendationPriority;
  source?: string;
}

type AiInsightsStatus = 'idle' | 'fresh' | 'stale' | 'refreshing';

export interface CustomerAiInsightsState {
  customerId?: string;
  signature?: string;
  lastRun?: string;
  aiScore?: number;
  baselineScore?: number;
  aiLevel?: string;
  summaryMarkdown?: string;
  recommendations: AiRecommendationChecklistItem[];
  status: AiInsightsStatus;
  syncInsights: (
    customerId: string,
    payload: Partial<Omit<CustomerAiInsightsState, 'customerId' | 'recommendations' | 'status' | 'syncInsights' | 'markRecommendation' | 'setStatus'>> & {
      recommendations?: Array<AiRecommendationChecklistItem | string>;
      signature?: string;
      lastRun?: string;
    }
  ) => void;
  markRecommendation: (id: string, completed: boolean) => void;
  setStatus: (status: AiInsightsStatus) => void;
}

const normalizeRecommendations = (
  recommendations?: Array<AiRecommendationChecklistItem | string>
): AiRecommendationChecklistItem[] => {
  if (!recommendations || recommendations.length === 0) {
    return [];
  }

  return recommendations.map((item, index) => {
    if (typeof item === 'string') {
      return {
        id: `item-${index}`,
        label: item,
        completed: false,
      };
    }

    return {
      id: item.id ?? `item-${index}`,
      label: item.label,
      completed: item.completed ?? false,
      priority: item.priority,
      source: item.source,
    };
  });
};

export const useCustomerAiInsightsStore = create<CustomerAiInsightsState>((set, get) => ({
  customerId: undefined,
  signature: undefined,
  lastRun: undefined,
  aiScore: undefined,
  baselineScore: undefined,
  aiLevel: undefined,
  summaryMarkdown: undefined,
  recommendations: [],
  status: 'idle',
  syncInsights: (customerId, payload) => {
    const currentSignature = get().signature;
    const nextSignature = payload.signature ?? currentSignature;
    const recommendations = payload.recommendations !== undefined ? normalizeRecommendations(payload.recommendations) : undefined;
    const signatureChanged = Boolean(nextSignature && nextSignature !== currentSignature);

    set((state) => ({
      customerId,
      signature: nextSignature,
      lastRun: payload.lastRun ?? state.lastRun,
      aiScore: payload.aiScore ?? state.aiScore,
      baselineScore: payload.baselineScore ?? state.baselineScore,
      aiLevel: payload.aiLevel ?? state.aiLevel,
      summaryMarkdown: payload.summaryMarkdown ?? state.summaryMarkdown,
      recommendations: recommendations ?? state.recommendations,
      status: signatureChanged
        ? 'stale'
        : state.status === 'idle' || state.status === 'refreshing'
        ? 'fresh'
        : state.status,
    }));
  },
  markRecommendation: (id, completed) => {
    set((state) => ({
      recommendations: state.recommendations.map((item) =>
        item.id === id
          ? {
              ...item,
              completed,
            }
          : item
      ),
    }));
  },
  setStatus: (status) => {
    set({ status });
  },
}));
