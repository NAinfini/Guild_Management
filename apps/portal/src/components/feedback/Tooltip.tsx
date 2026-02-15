"use client";
import { cn } from "@/lib/utils";

import * as React from "react";
import { 
  Tooltip as MuiTooltip, 
  TooltipProps as MuiTooltipProps,
} from "@/ui-bridge/material";

// We maintain the sub-component pattern to match expectations, 
// even if MUI's Tooltip is a single component.

export function TooltipProvider({ children }: { children: React.ReactNode, delayDuration?: number }) {
  return <>{children}</>; // MUI doesn't require a global provider for basic tooltip
}

type ThemedTooltipProps = Omit<MuiTooltipProps, "title" | "children"> & {
  children: React.ReactElement;
  content?: React.ReactNode;
  title?: React.ReactNode;
  className?: string;
};

const getThemedSlotProps = (className?: string, slotProps?: MuiTooltipProps["slotProps"]): MuiTooltipProps["slotProps"] => {
  const tooltipSlot = slotProps?.tooltip ?? {};
  const arrowSlot = slotProps?.arrow ?? {};

  return {
    ...slotProps,
    tooltip: {
      ...tooltipSlot,
      className: cn("z-50 rounded-md px-3 py-1.5 text-xs font-semibold shadow-md", className, (tooltipSlot as { className?: string }).className),
      sx: {
        backgroundColor: "var(--cmp-panel-bg)",
        color: "var(--color-text-primary)",
        border: "1px solid var(--cmp-panel-border)",
        boxShadow: "var(--theme-shadow-md)",
        borderRadius: "calc(var(--theme-border-radius) * 0.75)",
        maxWidth: 260,
        ...(tooltipSlot as { sx?: object }).sx,
      },
    },
    arrow: {
      ...arrowSlot,
      sx: {
        color: "var(--cmp-panel-bg)",
        ...(arrowSlot as { sx?: object }).sx,
      },
    },
  };
};

export function Tooltip({ children, content, title, className, slotProps, enterDelay, ...props }: ThemedTooltipProps) {
  const resolvedTitle = content ?? title;

  if (resolvedTitle === undefined || resolvedTitle === null || resolvedTitle === "") {
    return <>{children}</>;
  }

  return (
    <TooltipProvider>
      <MuiTooltip
        title={resolvedTitle}
        arrow
        enterDelay={enterDelay ?? 140}
        slotProps={getThemedSlotProps(className, slotProps)}
        {...props}
      >
        {children}
      </MuiTooltip>
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
    <Tooltip content={content} className={className} {...props}>
      {children}
    </Tooltip>
  );
};

// export { NexusTooltip, NexusTooltip as Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
