import { useEffect, useState } from 'react';
import { Alert, AlertTitle, Slide } from '@mui/material';
import { WifiOff } from "@mui/icons-material";

export function OfflineBanner() {
  const [online, setOnline] = useState(() => typeof navigator !== 'undefined' ? navigator.onLine : true);

  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <Slide direction="down" in={!online} mountOnEnter unmountOnExit>
      <Alert
        severity="warning"
        icon={<WifiOff sx={{ fontSize: 18 }} />}
        sx={{ borderRadius: 0, borderBottom: '1px solid', borderColor: 'divider', alignItems: 'center' }}
      >
        <AlertTitle>Offline</AlertTitle>
        Connection lost. Destructive actions are disabled until you reconnect.
      </Alert>
    </Slide>
  );
}
