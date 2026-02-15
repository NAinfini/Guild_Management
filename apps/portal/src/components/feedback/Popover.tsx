"use client";
import { cn } from "@/lib/utils";

import * as React from "react";
import { 
  Popover as MuiPopover, 
  PopoverProps as MuiPopoverProps,
  Box
} from "@/ui-bridge/material";

// Sub-component state management
interface PopoverContextValue {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  anchorEl: HTMLElement | null;
  setAnchorEl: (el: HTMLElement | null) => void;
}

const PopoverContext = React.createContext<PopoverContextValue>({
  open: false,
  onOpenChange: () => {},
  anchorEl: null,
  setAnchorEl: () => {},
});

function Popover({
  children,
  open: controlledOpen,
  onOpenChange,
}: any) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
  
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;

  const handleOpenChange = (val: boolean) => {
    if (controlledOpen === undefined) setInternalOpen(val);
    onOpenChange?.(val);
  };

  return (
    <PopoverContext.Provider value={{ open, onOpenChange: handleOpenChange, anchorEl, setAnchorEl }}>
      {children}
    </PopoverContext.Provider>
  );
}

function PopoverTrigger({ children }: { children: React.ReactElement }) {
  const { onOpenChange, setAnchorEl } = React.useContext(PopoverContext);
  
  if (!React.isValidElement(children)) return <>{children}</>;

  return React.cloneElement(children, {
    onClick: (e: React.MouseEvent<HTMLElement>) => {
      (children.props as any).onClick?.(e);
      setAnchorEl(e.currentTarget);
      onOpenChange(true);
    },
  } as any);
}

function PopoverContent({
  className,
  children,
  align = "center",
  sideOffset = 4,
  ...props
}: any) {
  const { open, onOpenChange, anchorEl } = React.useContext(PopoverContext);

  return (
    <MuiPopover
      open={open}
      anchorEl={anchorEl}
      onClose={() => onOpenChange(false)}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: align === 'center' ? 'center' : (align === 'start' ? 'left' : 'right'),
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: align === 'center' ? 'center' : (align === 'start' ? 'left' : 'right'),
      }}
      slotProps={{
        paper: {
          className: cn(
            "bg-popover text-popover-foreground z-50 w-72 rounded-md border p-4 shadow-md outline-hidden mt-1",
            className
          ),
          sx: {
            backgroundImage: 'none',
            backgroundColor: 'var(--popover)',
            borderColor: 'var(--border)',
            color: 'var(--popover-foreground)',
          }
        }
      }}
      {...props}
    >
      {children}
    </MuiPopover>
  );
}

function PopoverAnchor({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor };
