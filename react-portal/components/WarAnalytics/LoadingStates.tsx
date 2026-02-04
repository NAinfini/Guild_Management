/**
 * War Analytics - Loading States & Skeletons
 *
 * Reusable loading skeletons for different components
 */

import { Box, Skeleton, Stack, Card, CardContent } from '@mui/material';

// ============================================================================
// Chart Loading Skeleton
// ============================================================================

export function ChartLoadingSkeleton() {
  return (
    <Box sx={{ p: 3 }}>
      {/* Title */}
      <Skeleton variant="text" width="60%" height={40} sx={{ mb: 2 }} />

      {/* Chart area */}
      <Skeleton variant="rectangular" width="100%" height={300} sx={{ mb: 2, borderRadius: 1 }} />

      {/* Legend */}
      <Stack direction="row" spacing={2} justifyContent="center">
        <Skeleton variant="rectangular" width="25%" height={30} />
        <Skeleton variant="rectangular" width="25%" height={30} />
        <Skeleton variant="rectangular" width="25%" height={30} />
      </Stack>
    </Box>
  );
}

// ============================================================================
// Table Loading Skeleton
// ============================================================================

export function TableLoadingSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <Box sx={{ p: 2 }}>
      {/* Header */}
      <Stack direction="row" spacing={2} mb={2}>
        <Skeleton variant="rectangular" width="25%" height={40} />
        <Skeleton variant="rectangular" width="25%" height={40} />
        <Skeleton variant="rectangular" width="25%" height={40} />
        <Skeleton variant="rectangular" width="25%" height={40} />
      </Stack>

      {/* Rows */}
      {Array.from({ length: rows }).map((_, index) => (
        <Stack key={index} direction="row" spacing={2} mb={1}>
          <Skeleton variant="text" width="25%" height={30} />
          <Skeleton variant="text" width="25%" height={30} />
          <Skeleton variant="text" width="25%" height={30} />
          <Skeleton variant="text" width="25%" height={30} />
        </Stack>
      ))}
    </Box>
  );
}

// ============================================================================
// Card Loading Skeleton
// ============================================================================

export function CardLoadingSkeleton() {
  return (
    <Card>
      <CardContent>
        <Stack spacing={2}>
          <Skeleton variant="text" width="40%" height={24} />
          <Skeleton variant="text" width="80%" height={40} />
          <Skeleton variant="text" width="60%" height={20} />
        </Stack>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// List Loading Skeleton
// ============================================================================

export function ListLoadingSkeleton({ items = 5 }: { items?: number }) {
  return (
    <Stack spacing={1}>
      {Array.from({ length: items }).map((_, index) => (
        <Card key={index}>
          <CardContent>
            <Stack direction="row" spacing={2} alignItems="center">
              <Skeleton variant="circular" width={40} height={40} />
              <Box flex={1}>
                <Skeleton variant="text" width="60%" height={24} />
                <Skeleton variant="text" width="40%" height={20} />
              </Box>
            </Stack>
          </CardContent>
        </Card>
      ))}
    </Stack>
  );
}

// ============================================================================
// Full Page Loading
// ============================================================================

export function FullPageLoading() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        p: 2,
        height: '100%',
      }}
    >
      {/* Header */}
      <Skeleton variant="rectangular" width="100%" height={60} />

      {/* Content */}
      <Box sx={{ display: 'flex', gap: 2, flex: 1 }}>
        {/* Left panel */}
        <Box sx={{ width: '25%' }}>
          <CardLoadingSkeleton />
        </Box>

        {/* Center panel */}
        <Box sx={{ flex: 1 }}>
          <ChartLoadingSkeleton />
        </Box>

        {/* Right panel */}
        <Box sx={{ width: '25%' }}>
          <Stack spacing={2}>
            <CardLoadingSkeleton />
            <CardLoadingSkeleton />
            <CardLoadingSkeleton />
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}
