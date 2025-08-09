import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ContentLayout } from '@/components/layouts';
import { useGetSegmentById, useUpdateSegment } from '@/features/segments/api/segments';
import { CriteriaOperator, SegmentStatus, SegmentType } from '@/types/api';
import { Input, Textarea } from '@/components/ui/form';
import { Spinner } from '@/components/ui/spinner';
import { useNotifications } from '@/components/ui/notifications';

type EditableCriteria = {
  id: string;
  field: string;
  operator: CriteriaOperator;
  value: string;
  label: string;
};

export const SegmentEditRoute: React.FC = () => {
  const navigate = useNavigate();
  const { segmentId } = useParams();
  const { addNotification } = useNotifications();

  const { data: segment, isLoading, error } = useGetSegmentById(segmentId || '');

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<SegmentType>(SegmentType.Behavioral);
  const [color, setColor] = useState('#8b5cf6');
  const [status, setStatus] = useState<SegmentStatus>(SegmentStatus.Active);
  const [criteria, setCriteria] = useState<EditableCriteria[]>([]);

  useEffect(() => {
    if (segment) {
      setName(segment.name);
      setDescription(segment.description);
      // Map legacy type/status back to enums where possible
      setType(
        ((): SegmentType => {
          switch (segment.type) {
            case 'behavioral':
              return SegmentType.Behavioral;
            case 'demographic':
              return SegmentType.Demographic;
            case 'geographic':
              return SegmentType.Geographic;
            case 'psychographic':
              return SegmentType.Psychographic;
            case 'ai-generated':
              return SegmentType.AiGenerated;
            default:
              return SegmentType.Behavioral;
          }
        })()
      );
      setStatus(
        ((): SegmentStatus => {
          switch (segment.status) {
            case 'active':
              return SegmentStatus.Active;
            case 'inactive':
              return SegmentStatus.Inactive;
            case 'draft':
              return SegmentStatus.Draft;
            default:
              return SegmentStatus.Active;
          }
        })()
      );
      setColor(segment.color || '#8b5cf6');
      setCriteria(
        segment.criteria.map((c, idx) => ({
          id: String(idx),
          field: c.field,
          // Convert string operator back to enum best-effort
          operator: ((): CriteriaOperator => {
            const map: Record<string, CriteriaOperator> = {
              equals: CriteriaOperator.Equals,
              'not equals': CriteriaOperator.NotEquals,
              greater: CriteriaOperator.GreaterThan,
              'greater than': CriteriaOperator.GreaterThan,
              less: CriteriaOperator.LessThan,
              'less than': CriteriaOperator.LessThan,
              contains: CriteriaOperator.Contains,
              in: CriteriaOperator.In,
              'not in': CriteriaOperator.NotIn,
            };
            return map[String(c.operator).toLowerCase()] ?? CriteriaOperator.Equals;
          })(),
          value: String(c.value),
          label: c.label,
        }))
      );
    }
  }, [segment]);

  const updateSegmentMutation = useUpdateSegment({
    mutationConfig: {
      onSuccess: () => {
        addNotification({
          type: 'success',
          title: 'Segment updated',
          message: 'Your changes have been saved.',
        });
        navigate(`/app/segments/${segmentId}`);
      },
      onError: (err) => {
        addNotification({
          type: 'error',
          title: 'Update failed',
          message: err instanceof Error ? err.message : 'Failed to update segment',
        });
      },
    },
  });

  const addCriterion = () => {
    setCriteria((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        field: 'age',
        operator: CriteriaOperator.Equals,
        value: '',
        label: '',
      },
    ]);
  };

  const removeCriterion = (id: string) => {
    setCriteria((prev) => prev.filter((c) => c.id !== id));
  };

  const updateCriterion = (id: string, patch: Partial<EditableCriteria>) => {
    setCriteria((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  };

  const handleSave = () => {
    if (!segmentId) return;
    updateSegmentMutation.mutate({
      segmentId,
      name,
      description,
      type,
      color,
      status,
      criteria: criteria.map((c) => ({
        field: c.field,
        operator: c.operator,
        value: c.value,
        label: c.label || `${c.field} ${c.value}`,
      })),
    });
  };

  if (isLoading) {
    return (
      <ContentLayout>
        <div className="flex items-center justify-center py-12">
          <Spinner size="xl" />
        </div>
      </ContentLayout>
    );
  }

  if (error || !segment) {
    return (
      <ContentLayout>
        <div className="bg-surface-primary/80 backdrop-blur-lg p-6 rounded-2xl border border-border-primary/30 shadow-lg">
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gradient-to-br from-error/20 to-error-muted/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-error-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="text-error-muted font-medium mb-2">Segment not found</div>
            <Link to="/app/segments" className="px-4 py-2 bg-surface-secondary/50 text-text-primary rounded-lg border border-border-primary/30 hover:bg-surface-secondary/80">
              Back to Segments
            </Link>
          </div>
        </div>
      </ContentLayout>
    );
  }

  return (
    <ContentLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-accent-primary/10 to-accent-secondary/10 rounded-2xl blur-3xl"></div>
          <div className="relative bg-surface-primary/90 backdrop-blur-xl p-6 rounded-2xl border border-border-primary/30 shadow-xl">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate(-1)}
                  className="p-2 text-text-muted hover:text-text-primary hover:bg-surface-secondary/60 rounded-lg transition-colors"
                  aria-label="Back"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-text-primary">Edit Segment</h1>
                  <p className="text-text-secondary text-sm">Update properties and criteria.</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSave}
                  disabled={updateSegmentMutation.isPending}
                  className="px-4 py-2 bg-gradient-to-r from-accent-primary to-accent-secondary text-white rounded-lg hover:shadow-lg hover:shadow-accent-primary/25 transform hover:-translate-y-0.5 transition-all duration-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {updateSegmentMutation.isPending && <Spinner size="sm" />}
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-surface-primary/80 backdrop-blur-lg p-6 rounded-2xl border border-border-primary/30 shadow-lg space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-text-primary font-medium mb-2">Name</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} registration={{ name: 'name' }} />
            </div>
            <div>
              <label className="block text-text-primary font-medium mb-2">Type</label>
              <select
                value={type}
                onChange={(e) => setType(Number(e.target.value) as SegmentType)}
                className="w-full bg-surface-secondary/50 border border-border-primary/30 rounded-xl px-3 py-2 text-text-primary"
              >
                <option value={SegmentType.Behavioral}>Behavioral</option>
                <option value={SegmentType.Demographic}>Demographic</option>
                <option value={SegmentType.Geographic}>Geographic</option>
                <option value={SegmentType.Psychographic}>Psychographic</option>
                <option value={SegmentType.AiGenerated}>AI Generated</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-text-primary font-medium mb-2">Description</label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} registration={{ name: 'description' }} />
            </div>
            <div>
              <label className="block text-text-primary font-medium mb-2">Color</label>
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="h-10 w-20 bg-transparent"
              />
            </div>
            <div>
              <label className="block text-text-primary font-medium mb-2">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(Number(e.target.value) as SegmentStatus)}
                className="w-full bg-surface-secondary/50 border border-border-primary/30 rounded-xl px-3 py-2 text-text-primary"
              >
                <option value={SegmentStatus.Active}>Active</option>
                <option value={SegmentStatus.Inactive}>Inactive</option>
                <option value={SegmentStatus.Draft}>Draft</option>
              </select>
            </div>
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-text-primary">Criteria</h3>
              <button
                onClick={addCriterion}
                className="px-3 py-2 bg-accent-primary/20 text-accent-primary rounded-lg hover:bg-accent-primary/30"
              >
                Add Criterion
              </button>
            </div>
            <div className="space-y-3">
              {criteria.map((c) => (
                <div key={c.id} className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-surface-secondary/30 p-4 rounded-xl border border-border-primary/30">
                  <div>
                    <label className="block text-text-primary font-medium mb-2">Field</label>
                    <input
                      className="w-full bg-surface-primary/50 border border-border-primary/30 rounded-lg px-3 py-2 text-text-primary"
                      value={c.field}
                      onChange={(e) => updateCriterion(c.id, { field: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-text-primary font-medium mb-2">Operator</label>
                    <select
                      value={c.operator}
                      onChange={(e) => updateCriterion(c.id, { operator: Number(e.target.value) as CriteriaOperator })}
                      className="w-full bg-surface-primary/50 border border-border-primary/30 rounded-lg px-3 py-2 text-text-primary"
                    >
                      <option value={CriteriaOperator.Equals}>Equals</option>
                      <option value={CriteriaOperator.NotEquals}>Does not equal</option>
                      <option value={CriteriaOperator.GreaterThan}>Greater than</option>
                      <option value={CriteriaOperator.LessThan}>Less than</option>
                      <option value={CriteriaOperator.Contains}>Contains</option>
                      <option value={CriteriaOperator.In}>Is one of</option>
                      <option value={CriteriaOperator.NotIn}>Is not one of</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-text-primary font-medium mb-2">Value</label>
                    <Input
                      value={c.value}
                      onChange={(e) => updateCriterion(c.id, { value: e.target.value })}
                      registration={{ name: `criteria-${c.id}-value` }}
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={() => removeCriterion(c.id)}
                      className="w-full px-3 py-2 bg-error/20 text-error rounded-lg hover:bg-error/30"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </ContentLayout>
  );
};


