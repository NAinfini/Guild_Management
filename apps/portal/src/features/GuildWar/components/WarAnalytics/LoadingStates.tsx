
/**
 * War Analytics - Loading States & Skeletons
 *
 * Reusable loading skeletons for different components
 */

import { Skeleton, Card, CardContent, Button } from '@/components';
import { useTranslation } from 'react-i18next';

// ============================================================================
// Chart Loading Skeleton
// ============================================================================

export function ChartLoadingSkeleton() {
  return (
    <div className="p-3">
      {/* Title */}
      <Skeleton className="w-3/5 h-10 mb-2" />

      {/* Chart area */}
      <Skeleton className="w-full h-[300px] mb-2 rounded-sm" />

      {/* Legend */}
      <div className="flex justify-center gap-2">
        <Skeleton className="w-1/4 h-[30px]" />
        <Skeleton className="w-1/4 h-[30px]" />
        <Skeleton className="w-1/4 h-[30px]" />
      </div>
    </div>
  );
}

// ============================================================================
// Table Loading Skeleton
// ============================================================================

export function TableLoadingSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="p-2">
      {/* Header */}
      <div className="flex gap-2 mb-2">
        <Skeleton className="w-1/4 h-10" />
        <Skeleton className="w-1/4 h-10" />
        <Skeleton className="w-1/4 h-10" />
        <Skeleton className="w-1/4 h-10" />
      </div>

      {/* Rows */}
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="flex gap-2 mb-1">
          <Skeleton className="w-1/4 h-[30px]" />
          <Skeleton className="w-1/4 h-[30px]" />
          <Skeleton className="w-1/4 h-[30px]" />
          <Skeleton className="w-1/4 h-[30px]" />
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// Card Loading Skeleton
// ============================================================================

export function CardLoadingSkeleton() {
  return (
    <Card>
      <CardContent className="space-y-2">
        <Skeleton className="w-2/5 h-6" />
        <Skeleton className="w-4/5 h-10" />
        <Skeleton className="w-3/5 h-5" />
      </CardContent>
    </Card>
  );
}

// ============================================================================
// List Loading Skeleton
// ============================================================================

export function ListLoadingSkeleton({ items = 5 }: { items?: number }) {
  return (
    <div className="space-y-1">
      {Array.from({ length: items }).map((_, index) => (
        <Card key={index}>
          <CardContent>
            <div className="flex items-center gap-2">
              <Skeleton className="w-10 h-10 rounded-full shrink-0" />
              <div className="flex-1 space-y-1">
                <Skeleton className="w-3/5 h-6" />
                <Skeleton className="w-2/5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ============================================================================
// Full Page Loading
// ============================================================================

export function FullPageLoading() {
  return (
    <div className="flex flex-col gap-2 p-2 h-full">
      {/* Header */}
      <Skeleton className="w-full h-[60px]" />

      {/* Content */}
      <div className="flex gap-2 flex-1">
        {/* Left panel */}
        <div className="w-[25%]">
          <CardLoadingSkeleton />
        </div>

        {/* Center panel */}
        <div className="flex-1">
          <ChartLoadingSkeleton />
        </div>

        {/* Right panel */}
        <div className="w-[25%] space-y-2">
          <CardLoadingSkeleton />
          <CardLoadingSkeleton />
          <CardLoadingSkeleton />
        </div>
      </div>
    </div>
  );
}// ============================================================================
// Loading Panel (Shorthand)
// ============================================================================

export const LoadingPanel = FullPageLoading;

// ============================================================================
// Error Panel
// ============================================================================



// Actually, let's use MUI icons for migration consistency
import { ErrorOutline, Refresh } from '@mui/icons-material';

export function ErrorPanel({ error, retry }: { error: any; retry?: () => void }) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center h-full min-h-[400px]">
      <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
        <ErrorOutline className="w-8 h-8 text-destructive" />
      </div>
      <h3 className="text-xl font-bold mb-2">{t('guild_war.analytics_error_title')}</h3>
      <p className="text-muted-foreground mb-6 max-w-md">
        {error?.message || t('guild_war.analytics_error_body')}
      </p>
      {retry && (
        <Button onClick={retry} variant="outline" className="gap-2">
          <Refresh className="w-4 h-4" />
          {t('common.retry')}
        </Button>
      )}
    </div>
  );
}
