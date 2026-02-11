
import { cn } from "@/lib/utils";
import React from 'react';
import { ErrorOutline, Refresh } from "@mui/icons-material";
import { useTranslation } from 'react-i18next';
import { Button } from '../button/Button';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
  title?: string;
  className?: string;
}

export function ErrorState({ message, onRetry, title, className }: ErrorStateProps) {
  const { t } = useTranslation();

  return (
    <div 
      className={cn(
        "flex items-center justify-center min-h-[300px] w-full p-6",
        className
      )}
    >
      <div 
        className={cn(
            "p-8 text-center max-w-[500px] rounded-3xl bg-card border-2 border-dashed border-destructive/20 flex flex-col items-center gap-6",
            "shadow-xl shadow-destructive/5"
        )}
      >
          <div className="p-4 rounded-full bg-destructive/10 text-destructive flex items-center justify-center">
            <ErrorOutline className="w-12 h-12" />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-xl font-black tracking-tight">
              {title || t('common.error_title', 'System Malfunction')}
            </h3>
            <p className="text-sm text-muted-foreground font-medium">
              {message || t('common.error_message', 'The requested data could not be retrieved from the server core.')}
            </p>
          </div>

          {onRetry && (
            <Button 
              variant="destructive" 
              onClick={onRetry}
              className="gap-2 font-extrabold"
            >
              <Refresh className="w-4 h-4" />
              {t('common.retry', 'Attempt Resync')}
            </Button>
          )}
      </div>
    </div>
  );
}
