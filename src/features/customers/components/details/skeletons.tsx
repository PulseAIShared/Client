/**
 * Skeleton loader components for customer detail page sections.
 * These provide visual feedback during data loading while maintaining layout stability.
 */

const Skeleton = ({ className = '', style }: { className?: string; style?: React.CSSProperties }) => (
  <div className={`animate-pulse bg-surface-secondary rounded ${className}`} style={style} />
);

const SkeletonText = ({ width = 'w-full', height = 'h-4' }: { width?: string; height?: string }) => (
  <Skeleton className={`${width} ${height}`} />
);

const SkeletonCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-surface-primary rounded-xl border border-border-primary p-4 ${className}`}>{children}</div>
);

/**
 * Skeleton for the customer header section
 */
export const HeaderSkeleton = () => (
  <div className="flex items-center gap-4 p-4">
    {/* Avatar */}
    <Skeleton className="w-16 h-16 rounded-full flex-shrink-0" />

    <div className="flex-1 space-y-2">
      {/* Name and email */}
      <SkeletonText width="w-48" height="h-6" />
      <SkeletonText width="w-64" height="h-4" />

      {/* Tags/badges row */}
      <div className="flex gap-2 mt-2">
        <Skeleton className="w-16 h-5 rounded-full" />
        <Skeleton className="w-20 h-5 rounded-full" />
        <Skeleton className="w-14 h-5 rounded-full" />
      </div>
    </div>

    {/* Right side metrics */}
    <div className="flex gap-4">
      <div className="text-center">
        <SkeletonText width="w-12" height="h-3" />
        <Skeleton className="w-16 h-8 mt-1 rounded" />
      </div>
      <div className="text-center">
        <SkeletonText width="w-16" height="h-3" />
        <Skeleton className="w-12 h-8 mt-1 rounded" />
      </div>
    </div>
  </div>
);

/**
 * Skeleton for risk score cards in the overview
 */
export const RiskCardsSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    {[1, 2, 3].map((i) => (
      <SkeletonCard key={i}>
        <SkeletonText width="w-24" height="h-3" />
        <div className="flex items-center justify-between mt-3">
          <Skeleton className="w-16 h-10 rounded" />
          <Skeleton className="w-20 h-6 rounded-full" />
        </div>
      </SkeletonCard>
    ))}
  </div>
);

/**
 * Skeleton for the data completeness section
 */
export const CompletenessSkeleton = () => (
  <SkeletonCard>
    <div className="flex justify-between items-center mb-4">
      <SkeletonText width="w-32" height="h-5" />
      <SkeletonText width="w-12" height="h-6" />
    </div>
    <div className="space-y-3">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="flex items-center gap-3">
          <SkeletonText width="w-24" height="h-4" />
          <div className="flex-1">
            <Skeleton className="w-full h-2 rounded-full" />
          </div>
          <SkeletonText width="w-8" height="h-4" />
        </div>
      ))}
    </div>
  </SkeletonCard>
);

/**
 * Skeleton for AI recommendations section
 */
export const RecommendationsSkeleton = () => (
  <SkeletonCard>
    <div className="flex justify-between items-center mb-4">
      <SkeletonText width="w-36" height="h-5" />
      <Skeleton className="w-16 h-5 rounded-full" />
    </div>
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-start gap-3 p-2 bg-surface-secondary rounded-lg">
          <Skeleton className="w-6 h-6 rounded flex-shrink-0" />
          <div className="flex-1 space-y-1">
            <SkeletonText width="w-full" height="h-4" />
            <SkeletonText width="w-3/4" height="h-3" />
          </div>
        </div>
      ))}
    </div>
  </SkeletonCard>
);

/**
 * Skeleton for risk factors chart
 */
export const RiskFactorsSkeleton = () => (
  <SkeletonCard>
    <SkeletonText width="w-32" height="h-5" />
    <div className="flex items-center justify-center mt-4">
      {/* Donut chart placeholder */}
      <Skeleton className="w-40 h-40 rounded-full" />
    </div>
    <div className="grid grid-cols-2 gap-2 mt-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex items-center gap-2">
          <Skeleton className="w-3 h-3 rounded-full" />
          <SkeletonText width="w-20" height="h-3" />
        </div>
      ))}
    </div>
  </SkeletonCard>
);

/**
 * Skeleton for customer pulse/signals section
 */
export const CustomerPulseSkeleton = () => (
  <SkeletonCard>
    <SkeletonText width="w-28" height="h-5" />
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="text-center space-y-2">
          <Skeleton className="w-10 h-10 rounded-full mx-auto" />
          <SkeletonText width="w-16" height="h-3" />
          <SkeletonText width="w-12" height="h-4" />
        </div>
      ))}
    </div>
  </SkeletonCard>
);

/**
 * Skeleton for financial snapshot section
 */
export const FinancialSnapshotSkeleton = () => (
  <SkeletonCard>
    <SkeletonText width="w-32" height="h-5" />
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="space-y-1">
          <SkeletonText width="w-16" height="h-3" />
          <Skeleton className="w-full h-8 rounded" />
        </div>
      ))}
    </div>
  </SkeletonCard>
);

/**
 * Skeleton for the full overview tab
 */
export const OverviewTabSkeleton = () => (
  <div className="space-y-6">
    <RiskCardsSkeleton />
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <CompletenessSkeleton />
      <RecommendationsSkeleton />
    </div>
    <CustomerPulseSkeleton />
    <FinancialSnapshotSkeleton />
    <RiskFactorsSkeleton />
  </div>
);

/**
 * Skeleton for payment/billing tab
 */
export const PaymentTabSkeleton = () => (
  <div className="space-y-6">
    {/* Revenue chart placeholder */}
    <SkeletonCard className="h-64">
      <SkeletonText width="w-32" height="h-5" />
      <div className="flex items-end justify-between h-48 mt-4 px-4">
        {[40, 60, 45, 75, 55, 80, 65, 90, 70, 85, 60, 95].map((h, i) => (
          <Skeleton key={i} className="w-6" style={{ height: `${h}%` }} />
        ))}
      </div>
    </SkeletonCard>

    {/* Payment details grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <SkeletonCard key={i}>
          <SkeletonText width="w-20" height="h-3" />
          <Skeleton className="w-24 h-8 mt-2 rounded" />
        </SkeletonCard>
      ))}
    </div>

    {/* Invoice list placeholder */}
    <SkeletonCard>
      <SkeletonText width="w-24" height="h-5" />
      <div className="space-y-3 mt-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center justify-between py-2 border-b border-border-primary">
            <div className="flex items-center gap-3">
              <Skeleton className="w-8 h-8 rounded" />
              <div className="space-y-1">
                <SkeletonText width="w-24" height="h-4" />
                <SkeletonText width="w-16" height="h-3" />
              </div>
            </div>
            <SkeletonText width="w-16" height="h-5" />
          </div>
        ))}
      </div>
    </SkeletonCard>
  </div>
);

/**
 * Skeleton for engagement tab
 */
export const EngagementTabSkeleton = () => (
  <div className="space-y-6">
    {/* Login activity chart */}
    <SkeletonCard className="h-48">
      <SkeletonText width="w-28" height="h-5" />
      <div className="grid grid-cols-12 gap-1 mt-4 h-24">
        {Array.from({ length: 84 }).map((_, i) => (
          <Skeleton
            key={i}
            className="w-full h-4 rounded-sm"
            style={{ opacity: Math.random() * 0.5 + 0.2 }}
          />
        ))}
      </div>
    </SkeletonCard>

    {/* Feature adoption */}
    <SkeletonCard>
      <div className="flex justify-between items-center mb-4">
        <SkeletonText width="w-32" height="h-5" />
        <SkeletonText width="w-16" height="h-5" />
      </div>
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <SkeletonText width="w-24" height="h-4" />
            <div className="flex-1">
              <Skeleton className="w-full h-3 rounded-full" />
            </div>
            <SkeletonText width="w-10" height="h-4" />
          </div>
        ))}
      </div>
    </SkeletonCard>

    {/* Session list */}
    <SkeletonCard>
      <SkeletonText width="w-28" height="h-5" />
      <div className="space-y-2 mt-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center justify-between p-2 bg-surface-secondary rounded">
            <div className="flex items-center gap-3">
              <Skeleton className="w-8 h-8 rounded" />
              <SkeletonText width="w-32" height="h-4" />
            </div>
            <SkeletonText width="w-20" height="h-3" />
          </div>
        ))}
      </div>
    </SkeletonCard>
  </div>
);

/**
 * Skeleton for support tab
 */
export const SupportTabSkeleton = () => (
  <div className="space-y-6">
    {/* Support metrics */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <SkeletonCard key={i}>
          <SkeletonText width="w-20" height="h-3" />
          <Skeleton className="w-16 h-8 mt-2 rounded" />
        </SkeletonCard>
      ))}
    </div>

    {/* Ticket timeline */}
    <SkeletonCard className="h-48">
      <SkeletonText width="w-28" height="h-5" />
      <div className="flex items-center justify-between mt-8 px-8">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <Skeleton className="w-4 h-4 rounded-full" />
            <Skeleton className="w-0.5 h-16 rounded" />
            <SkeletonText width="w-12" height="h-3" />
          </div>
        ))}
      </div>
    </SkeletonCard>

    {/* Open tickets list */}
    <SkeletonCard>
      <SkeletonText width="w-24" height="h-5" />
      <div className="space-y-3 mt-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center justify-between p-3 bg-surface-secondary rounded-lg">
            <div className="flex items-center gap-3">
              <Skeleton className="w-6 h-6 rounded" />
              <div className="space-y-1">
                <SkeletonText width="w-40" height="h-4" />
                <SkeletonText width="w-24" height="h-3" />
              </div>
            </div>
            <Skeleton className="w-16 h-5 rounded-full" />
          </div>
        ))}
      </div>
    </SkeletonCard>
  </div>
);

/**
 * Skeleton for data health tab
 */
export const DataHealthTabSkeleton = () => (
  <div className="space-y-6">
    <CompletenessSkeleton />

    {/* Data sources */}
    <SkeletonCard>
      <SkeletonText width="w-28" height="h-5" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-3 bg-surface-secondary rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Skeleton className="w-8 h-8 rounded" />
                <SkeletonText width="w-20" height="h-4" />
              </div>
              <Skeleton className="w-12 h-5 rounded-full" />
            </div>
            <SkeletonText width="w-32" height="h-3" />
          </div>
        ))}
      </div>
    </SkeletonCard>

    {/* Sync history */}
    <SkeletonCard>
      <SkeletonText width="w-24" height="h-5" />
      <div className="space-y-2 mt-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center justify-between py-2 border-b border-border-primary">
            <div className="flex items-center gap-3">
              <Skeleton className="w-6 h-6 rounded" />
              <SkeletonText width="w-24" height="h-4" />
            </div>
            <SkeletonText width="w-32" height="h-3" />
          </div>
        ))}
      </div>
    </SkeletonCard>
  </div>
);

/**
 * Generic tab skeleton for tabs that don't have specific skeletons
 */
export const GenericTabSkeleton = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {[1, 2, 3].map((i) => (
        <SkeletonCard key={i}>
          <SkeletonText width="w-20" height="h-3" />
          <Skeleton className="w-24 h-8 mt-2 rounded" />
        </SkeletonCard>
      ))}
    </div>
    <SkeletonCard className="h-64">
      <SkeletonText width="w-32" height="h-5" />
      <div className="flex items-center justify-center h-48">
        <Skeleton className="w-48 h-48 rounded-lg" />
      </div>
    </SkeletonCard>
    <SkeletonCard>
      <SkeletonText width="w-28" height="h-5" />
      <div className="space-y-3 mt-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center justify-between p-2 border-b border-border-primary">
            <SkeletonText width="w-32" height="h-4" />
            <SkeletonText width="w-20" height="h-4" />
          </div>
        ))}
      </div>
    </SkeletonCard>
  </div>
);
