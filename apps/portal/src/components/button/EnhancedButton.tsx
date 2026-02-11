
import { cn } from "@/lib/utils";
import React from 'react';
import { Button, ButtonProps } from './Button';

export interface EnhancedButtonProps extends ButtonProps {
  shine?: boolean;
}

export const EnhancedButton: React.FC<EnhancedButtonProps> = ({
  shine = true,
  children,
  className,
  variant = 'default',
  ...props
}) => {
  return (
    <Button
      variant={variant}
      className={cn(
        "rounded-xl font-black tracking-widest uppercase transition-all duration-200",
        shine && "bg-gradient-to-r from-primary/95 to-secondary/90 shadow-lg shadow-primary/35 hover:-translate-y-[1px] text-primary-foreground border-0",
        className
      )}
      {...props}
    >
      {children}
    </Button>
  );
};
