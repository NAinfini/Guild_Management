"use client";
import { cn } from "@/lib/utils";

import * as React from "react";
import { 
  Tooltip as MuiTooltip, 
  TooltipProps as MuiTooltipProps,
  Box
} from "@mui/material";

// We maintain the sub-component pattern to match expectations, 
// even if MUI's Tooltip is a single component.

export function TooltipProvider({ children }: { children: React.ReactNode, delayDuration?: number }) {
  return <>{children}</>; // MUI doesn't require a global provider for basic tooltip
}

export function Tooltip({ children, ...props }: any) {
  return (
    <TooltipProvider>
      {React.cloneElement(children as React.ReactElement, props)}
    </TooltipProvider>
  );
}

export function TooltipTrigger({ children, ...props }: any) {
  // TooltipTrigger is usually handled by the Tooltip itself in MUI
  return <>{children}</>;
}

export const TooltipContent = React.forwardRef<HTMLDivElement, any>(
  ({ className, children, ...props }, ref) => {
    // This is a bit of a shim to match the Nexus API
    // In actual usage, MUI Tooltip wraps the trigger and takes title as content.
    return (
      <div ref={ref} className={cn("tooltip-content-shim", className)}>
        {children}
      </div>
    );
  }
);

// A more MUI-compatible version that still follows the Nexus naming
export const NexusTooltip = ({ 
  children, 
  content, 
  className,
  ...props 
}: { 
  children: React.ReactElement; 
  content: React.ReactNode;
  className?: string;
} & Partial<MuiTooltipProps>) => {
  return (
    <MuiTooltip
      title={content}
      slotProps={{
        tooltip: {
          className: cn(
            "bg-primary text-primary-foreground z-50 rounded-md px-3 py-1.5 text-xs shadow-md",
            className
          ),
          sx: {
            backgroundColor: 'var(--primary) !important',
            color: 'var(--primary-foreground) !important',
          }
        },
        arrow: {
          sx: {
            color: 'var(--primary)',
          }
        }
      }}
      arrow
      {...props}
    >
      {children}
    </MuiTooltip>
  );
};

// export { NexusTooltip, NexusTooltip as Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
