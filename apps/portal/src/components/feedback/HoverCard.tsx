"use client";
import { cn } from "@/lib/utils";

import * as React from "react";
import { 
  Popover as MuiPopover, 
  Box
} from "@mui/material";

// HoverCard is essentially a Popover that triggers on hover with a delay.

interface HoverCardContextValue {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  anchorEl: HTMLElement | null;
  setAnchorEl: (el: HTMLElement | null) => void;
}

const HoverCardContext = React.createContext<HoverCardContextValue>({
  open: false,
  onOpenChange: () => {},
  anchorEl: null,
  setAnchorEl: () => {},
});

function HoverCard({
  children,
  open: controlledOpen,
  onOpenChange,
  openDelay = 700,
  closeDelay = 300,
}: any) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;

  const handleOpen = (el: HTMLElement) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setAnchorEl(el);
      if (controlledOpen === undefined) setInternalOpen(true);
      onOpenChange?.(true);
    }, openDelay);
  };

  const handleClose = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      if (controlledOpen === undefined) setInternalOpen(false);
      onOpenChange?.(false);
    }, closeDelay);
  };

  const handleOpenChange = (val: boolean) => {
    if (val) handleOpen(anchorEl as any);
    else handleClose();
  };

  return (
    <HoverCardContext.Provider value={{ open, onOpenChange: handleOpenChange, anchorEl, setAnchorEl }}>
      <div 
        onMouseEnter={(e) => handleOpen(e.currentTarget as any)} 
        onMouseLeave={handleClose}
        style={{ display: 'contents' }}
      >
        {children}
      </div>
    </HoverCardContext.Provider>
  );
}

function HoverCardTrigger({ children }: { children: React.ReactElement }) {
  return children;
}

function HoverCardContent({
  className,
  children,
  align = "center",
  sideOffset = 4,
  ...props
}: any) {
  const { open, anchorEl } = React.useContext(HoverCardContext);

  return (
    <MuiPopover
      open={open}
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: align === 'center' ? 'center' : (align === 'start' ? 'left' : 'right'),
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: align === 'center' ? 'center' : (align === 'start' ? 'left' : 'right'),
      }}
      sx={{
        pointerEvents: 'none', // Allow clicking through to the trigger
        "& .MuiPopover-paper": {
          pointerEvents: 'auto', // Re-enable pointer events for the content
          backgroundImage: 'none',
          backgroundColor: 'var(--popover)',
          borderColor: 'var(--border)',
          color: 'var(--popover-foreground)',
        }
      }}
      slotProps={{
        paper: {
          className: cn(
            "bg-popover text-popover-foreground z-50 w-64 rounded-md border p-4 shadow-md outline-hidden mt-1",
            className
          ),
        }
      }}
      disableRestoreFocus
      {...props}
    >
      {children}
    </MuiPopover>
  );
}

export { HoverCard, HoverCardTrigger, HoverCardContent };
