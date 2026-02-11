"use client";
import { cn } from "@/lib/utils";

import * as React from "react";
import { 
  Menu, 
  MenuItem, 
  Divider, 
  ListItemIcon, 
  ListItemText, 
  Typography,
  Popover,
  Box
} from "@mui/material";
import { Check, ChevronRight, Circle } from "@mui/icons-material";

// Context for managing state across sub-components
const DropdownMenuContext = React.createContext<{
  open: boolean;
  anchorEl: HTMLElement | null;
  handleClose: () => void;
  handleOpen: (event: React.MouseEvent<HTMLElement>) => void;
} | null>(null);

function DropdownMenu({ children }: { children: React.ReactNode }) {
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);
  
  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <DropdownMenuContext.Provider value={{ open, anchorEl, handleOpen, handleClose }}>
      {children}
    </DropdownMenuContext.Provider>
  );
}

function DropdownMenuTrigger({ children }: { children: React.ReactElement<any> }) {
  const { handleOpen } = React.useContext(DropdownMenuContext)!;
  
  return React.cloneElement(children, {
    onClick: (e: React.MouseEvent<HTMLElement>) => {
      children.props.onClick?.(e);
      handleOpen(e);
    },
  });
}

function DropdownMenuContent({
  className,
  children,
  ...props
}: any) {
  const { open, anchorEl, handleClose } = React.useContext(DropdownMenuContext)!;

  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={handleClose}
      onClick={handleClose}
      data-slot="dropdown-menu-content"
      transformOrigin={{ horizontal: 'right', vertical: 'top' }}
      anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
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

function DropdownMenuItem({
  className,
  inset,
  variant = "default",
  children,
  ...props
}: any) {
  return (
    <MenuItem
      data-slot="dropdown-menu-item"
      className={cn(
        "focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none",
        variant === "destructive" && "text-destructive focus:bg-destructive/10!",
        inset && "pl-8",
        className
      )}
      sx={{
        minHeight: 'auto',
        '&.Mui-focusVisible': {
          backgroundColor: 'var(--accent)',
          color: 'var(--accent-foreground)',
        }
      }}
      {...props}
    >
      {children}
    </MenuItem>
  );
}

function DropdownMenuSeparator({ className, ...props }: any) {
  return (
    <Divider 
      className={cn("-mx-1 my-1", className)} 
      sx={{ borderColor: 'var(--border)' }}
      {...props} 
    />
  );
}

function DropdownMenuLabel({ className, inset, ...props }: any) {
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

function DropdownMenuGroup({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

function DropdownMenuPortal({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

function DropdownMenuShortcut({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="dropdown-menu-shortcut"
      className={cn(
        "text-muted-foreground ml-auto text-xs tracking-widest",
        className,
      )}
      {...props}
    />
  );
}

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuShortcut
};
