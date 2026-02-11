
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Button
} from '@/components';
import LockIcon from "@mui/icons-material/Lock";
import { useAuth } from '@/hooks';
import { useTranslation } from 'react-i18next';

interface SessionExpiredModalProps {
  open: boolean;
  onLogin?: () => void; // Added onLogin prop to match usage in SessionInitializer
}

export function SessionExpiredModal({ open, onLogin }: SessionExpiredModalProps) {
  const { logout } = useAuth();
  const { t } = useTranslation();

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-[400px] p-6 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-warning/10 text-warning">
            <LockIcon className="h-8 w-8 text-yellow-500" />
          </div>
          
          <DialogHeader>
            <DialogTitle className="text-xl font-bold uppercase tracking-tight text-center">
              {t('auth.session_expired_title', 'Session Expired')}
            </DialogTitle>
             <p className="text-sm text-muted-foreground text-center">
              {t('auth.session_expired_message', 'Your security clearance has timed out. Please re-authenticate to continue operations.')}
            </p>
          </DialogHeader>

          <DialogFooter className="w-full sm:justify-center">
            <Button
              className="w-full font-bold shadow-lg shadow-primary/20"
              size="lg"
              variant="default"
              onClick={() => {
                logout();
                if (onLogin) {
                  onLogin();
                } else {
                  window.location.href = '/login';
                }
              }}
            >
              {t('auth.return_to_login', 'Re-authenticate')}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
