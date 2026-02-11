import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import WifiIcon from '@mui/icons-material/Wifi';
import GraphicEqIcon from '@mui/icons-material/GraphicEq';
import StorageIcon from '@mui/icons-material/Storage';

import { useTranslation } from 'react-i18next';

export const DashboardHeader = () => {
  const { t } = useTranslation();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div
      className="w-full backdrop-blur-md border border-[color:var(--cmp-card-border)] p-2 flex items-center justify-between text-[10px] font-mono tracking-widest text-primary/80 uppercase mb-4 rounded-lg shadow-sm"
      style={{ backgroundColor: 'color-mix(in srgb, var(--cmp-card-bg) 84%, transparent)' }}
    >
      <div className="flex items-center gap-4 px-2">
        <div className="flex items-center gap-2">
          <GraphicEqIcon
            sx={{ fontSize: 12 }}
            className="text-primary animate-pulse"
            style={{ filter: 'drop-shadow(0 0 8px color-mix(in srgb, var(--sys-interactive-accent) 55%, transparent))' }}
          />
          <span className="font-bold">{t('dashboard.system.normal')}</span>
        </div>
        <div className="h-3 w-[1px] bg-[color:var(--sys-border-subtle)]" />
        <div className="flex items-center gap-2 opacity-60">
          <StorageIcon sx={{ fontSize: 12 }} />
          <span>{t('dashboard.system.linked')}</span>
        </div>
      </div>

      <div className="flex items-center gap-4 px-2">
         {/* Blinking Dot for live feeling */}
         <div
           className="w-1.5 h-1.5 rounded-full animate-pulse"
           style={{
             backgroundColor: 'var(--color-status-success)',
             boxShadow: '0 0 5px color-mix(in srgb, var(--color-status-success) 60%, transparent)',
           }}
         />
         <span>{format(time, 'HH:mm:ss')} <span className="opacity-50">UTC</span></span>
      </div>
    </div>
  );
};
