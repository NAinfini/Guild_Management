import React from 'react';
import { 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  Skeleton, 
  Stack, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper,
  useTheme,
  alpha
} from '@mui/material';

export { Skeleton };

/**
 * A standard card skeleton that mimics the structure of most cards in the app.
 */
export function CardSkeleton({ aspectRatio = '4/3', hasMeta = true }) {
  const theme = useTheme();
  
  return (
    <Card 
      sx={{ 
        borderRadius: 4, 
        overflow: 'hidden', 
        border: '1px solid', 
        borderColor: 'divider',
        height: '100%'
      }}
    >
      <Skeleton 
        variant="rectangular" 
        width="100%" 
        sx={{ 
          aspectRatio,
          bgcolor: alpha(theme.palette.text.primary, 0.05)
        }} 
      />
      <CardContent sx={{ p: 2 }}>
        <Stack spacing={1.5}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Skeleton variant="text" width="60%" height={24} />
            {hasMeta && <Skeleton variant="rounded" width={40} height={16} />}
          </Box>
          <Skeleton variant="text" width="80%" height={20} />
          {hasMeta && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
              <Skeleton variant="text" width="30%" height={16} />
              <Skeleton variant="text" width="20%" height={16} />
            </Box>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}

/**
 * A responsive grid of card skeletons.
 */
export function CardGridSkeleton({ 
  count = 8, 
  xs = 12, 
  sm = 6, 
  md = 4, 
  lg = 3, 
  xl = 2,
  aspectRatio = '4/3',
  hasMeta = true
}) {
  return (
    <Grid container spacing={3}>
      {Array.from({ length: count }).map((_, i) => (
        <Grid key={i} size={{ xs, sm, md, lg, xl }}>
          <CardSkeleton aspectRatio={aspectRatio} hasMeta={hasMeta} />
        </Grid>
      ))}
    </Grid>
  );
}

/**
 * Skeleton for listing views like Admin Members.
 */
export function TableSkeleton({ rows = 5, cols = 5 }) {
  return (
    <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 4, overflow: 'hidden' }}>
      <Table>
        <TableHead sx={{ bgcolor: 'action.hover' }}>
          <TableRow>
            {Array.from({ length: cols }).map((_, i) => (
              <TableCell key={i}>
                <Skeleton variant="text" width="60%" height={20} />
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {Array.from({ length: rows }).map((_, ri) => (
            <TableRow key={ri}>
              {Array.from({ length: cols }).map((_, ci) => (
                <TableCell key={ci}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {ci === 0 && <Skeleton variant="rounded" width={40} height={40} />}
                    <Skeleton variant="text" width={ci === 0 ? "70%" : "90%"} height={24} />
                  </Box>
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

/**
 * A standard page header skeleton with search bar and filter button placeholders.
 */
export function PageHeaderSkeleton() {
  return (
    <Box sx={{ mb: 4, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', gap: 2 }}>
      <Skeleton variant="rounded" width={260} height={40} sx={{ borderRadius: 3 }} />
      <Stack direction="row" spacing={2}>
        <Skeleton variant="rounded" width={100} height={40} sx={{ borderRadius: 3 }} />
        <Skeleton variant="rounded" width={40} height={40} sx={{ borderRadius: 3 }} />
      </Stack>
    </Box>
  );
}
