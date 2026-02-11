"use client";
import { cn } from "@/lib/utils";

import * as React from "react";
import { 
  Menu, 
  MenuItem, 
  Divider, 
  Box,
  Typography
} from "@mui/material";
import { Check, ChevronRight, Circle } from "@mui/icons-material";

function ContextMenu({ children }: { children: React.ReactNode }) {
  const [contextMenu, setContextMenu] = React.useState<{
    mouseX: number;
    mouseY: number;
  } | null>(null);

  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();
    setContextMenu(
      contextMenu === null
        ? {
            mouseX: event.clientX + 2,
            mouseY: event.clientY - 6,
          }
        : null,
    );
  };

  const handleClose = () => {
    setContextMenu(null);
  };

  return (
    <Box onContextMenu={handleContextMenu} style={{ cursor: 'context-menu' }}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          // Pass the context state to children if needed, or use a context provider
          if ((child.type as any).displayName === 'ContextMenuContent' || (child.type as any).name === 'ContextMenuContent') {
            return React.cloneElement(child as React.ReactElement<any>, { 
              open: contextMenu !== null,
              anchorReference: 'anchorPosition',
              anchorPosition: contextMenu !== null
                ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
                : undefined,
              onClose: handleClose,
            });
          }
        }
        return child;
      })}
    </Box>
  );
}

function ContextMenuTrigger({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

function ContextMenuContent({
  className,
  open,
  anchorReference,
  anchorPosition,
  onClose,
  children,
  ...props
}: any) {
  return (
    <Menu
      open={open}
      onClose={onClose}
      anchorReference={anchorReference}
      anchorPosition={anchorPosition}
      data-slot="context-menu-content"
      PaperProps={{
        className: cn(
          "bg-popover text-popover-foreground min-w-[8rem] overflow-hidden rounded-md border p-1 shadow-md",
          className
        ),
        sx: {
          backgroundImage: 'none',
          backgroundColor: 'var(--popover)',
          color: 'var(--popover-foreground)',
          borderColor: 'var(--border)',
        }
      }}
      {...props}
    >
      {children}
    </Menu>
  );
}

function ContextMenuItem({
  className,
  inset,
  variant = "default",
  children,
  ...props
}: any) {
  return (
    <MenuItem
      data-slot="context-menu-item"
      className={cn(
        "focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none",
        variant === "destructive" && "text-destructive focus:bg-destructive/10!",
        inset && "pl-8",
        className
      )}
      sx={{
        minHeight: 'auto',
      }}
      {...props}
    >
      {children}
    </MenuItem>
  );
}

function ContextMenuSeparator({ className, ...props }: any) {
  return (
    <Divider 
      className={cn("-mx-1 my-1", className)} 
      sx={{ borderColor: 'var(--border)' }}
      {...props} 
    />
  );
}

function ContextMenuLabel({ className, inset, ...props }: any) {
  return (
    <Box
      className={cn(
        "px-2 py-1.5 text-sm font-medium",
        inset && "pl-8",
        className
      )}
      {...props}
    />
  );
}

function ContextMenuGroup({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

function ContextMenuPortal({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

function ContextMenuShortcut({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="context-menu-shortcut"
      className={cn(
        "text-muted-foreground ml-auto text-xs tracking-widest",
        className,
      )}
      {...props}
    />
  );
}

export {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuItem as ContextMenuCheckboxItem,
  ContextMenuItem as ContextMenuRadioItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuGroup,
  ContextMenuPortal,
  ContextMenuGroup as ContextMenuRadioGroup
};
