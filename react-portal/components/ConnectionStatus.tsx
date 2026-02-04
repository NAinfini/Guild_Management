/**
 * WebSocket Connection Status Indicator
 * Shows real-time connection status with animated indicators
 */

import { Box, Chip, Tooltip, useTheme, alpha } from '@mui/material';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { useWebSocket } from '../hooks/useWebSocket';
import { useTranslation } from 'react-i18next';

export function ConnectionStatus() {
  const { isConnected, reconnectAttempts } = useWebSocket();
  const { t } = useTranslation();
  const theme = useTheme();

  // Determine status
  const status = isConnected 
    ? 'connected' 
    : reconnectAttempts > 0 
    ? 'reconnecting' 
    : 'disconnected';

  // Status configurations
  const statusConfig = {
    connected: {
      label: t('connection.connected'),
      icon: Wifi,
      color: theme.palette.success.main,
      bgColor: alpha(theme.palette.success.main, 0.1),
      tooltip: t('connection.realtime_active'),
    },
    disconnected: {
      label: t('connection.disconnected'),
      icon: WifiOff,
      color: theme.palette.error.main,
      bgColor: alpha(theme.palette.error.main, 0.1),
      tooltip: t('connection.no_connection'),
    },
    reconnecting: {
      label: t('connection.reconnecting'),
      icon: RefreshCw,
      color: theme.palette.warning.main,
      bgColor: alpha(theme.palette.warning.main, 0.1),
      tooltip: `${t('connection.attempting_reconnect')} (${reconnectAttempts})`,
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Tooltip title={config.tooltip} arrow>
      <Chip
        icon={
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              animation: status === 'reconnecting' ? 'spin 2s linear infinite' : 'none',
              '@keyframes spin': {
                '0%': { transform: 'rotate(0deg)' },
                '100%': { transform: 'rotate(360deg)' },
              },
            }}
          >
            <Icon size={14} />
          </Box>
        }
        label={config.label}
        size="small"
        sx={{
          height: 24,
          fontSize: '0.7rem',
          fontWeight: 700,
          color: config.color,
          backgroundColor: config.bgColor,
          border: `1px solid ${alpha(config.color, 0.3)}`,
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          '& .MuiChip-icon': {
            color: config.color,
            marginLeft: '6px',
          },
          '&:hover': {
            backgroundColor: alpha(config.color, 0.2),
            transform: 'translateY(-1px)',
            boxShadow: `0 2px 8px ${alpha(config.color, 0.3)}`,
          },
          // Pulse animation for disconnected state
          ...(status === 'disconnected' && {
            animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            '@keyframes pulse': {
              '0%, 100%': {
                opacity: 1,
              },
              '50%': {
                opacity: 0.7,
              },
            },
          }),
        }}
      />
    </Tooltip>
  );
}
