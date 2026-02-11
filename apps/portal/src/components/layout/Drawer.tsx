"use client";
import { cn } from "@/lib/utils";

import * as React from "react";
import { Drawer as MuiDrawer, Box, Typography, IconButton } from "@mui/material";

interface DrawerContextValue {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  direction: "left" | "right" | "top" | "bottom";
}

const DrawerContext = React.createContext<DrawerContextValue>({
  open: false,
  onOpenChange: () => {},
  direction: "bottom",
});

function Drawer({
  children,
  open: controlledOpen,
  onOpenChange,
  defaultOpen = false,
  direction = "bottom",
  ...props
}: any) {
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;

  const handleOpenChange = (val: boolean) => {
    if (controlledOpen === undefined) setInternalOpen(val);
    onOpenChange?.(val);
  };

  return (
    <DrawerContext.Provider value={{ open, onOpenChange: handleOpenChange, direction }}>
      {children}
    </DrawerContext.Provider>
  );
}

function DrawerTrigger({ children }: { children: React.ReactElement }) {
  const { onOpenChange } = React.useContext(DrawerContext);
  
  if (!React.isValidElement(children)) return <>{children}</>;

  return React.cloneElement(children as any, {
    onClick: (e: React.MouseEvent) => {
      (children.props as any).onClick?.(e);
      onOpenChange(true);
    },
  });
}

function DrawerPortal({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

function DrawerClose({ children }: { children: React.ReactElement }) {
  const { onOpenChange } = React.useContext(DrawerContext);
  
  if (!React.isValidElement(children)) return <>{children}</>;

  return React.cloneElement(children as any, {
    onClick: (e: React.MouseEvent) => {
      (children.props as any).onClick?.(e);
      onOpenChange(false);
    },
  });
}

function DrawerOverlay() {
  return null;
}

function DrawerContent({
  className,
  children,
  ...props
}: any) {
  const { open, onOpenChange, direction } = React.useContext(DrawerContext);

  const anchorMapping = {
    top: "top",
    bottom: "bottom",
    left: "left",
    right: "right",
  } as const;

  return (
    <MuiDrawer
      anchor={anchorMapping[direction]}
      open={open}
      onClose={() => onOpenChange(false)}
      data-slot="drawer-content"
      PaperProps={{
        className: cn(
          "bg-background group/drawer-content fixed z-50 flex h-auto flex-col border-border",
          direction === "top" && "rounded-b-lg border-b",
          direction === "bottom" && "rounded-t-lg border-t",
          direction === "right" && "border-l sm:max-w-sm",
          direction === "left" && "border-r sm:max-w-sm",
          className
        ),
        sx: {
          backgroundImage: 'none',
          backgroundColor: 'var(--background)',
        }
      }}
      {...props}
    >
      {direction === "bottom" && (
        <div className="bg-muted mx-auto mt-4 h-2 w-[100px] shrink-0 rounded-full" />
      )}
      {children}
    </MuiDrawer>
  );
}

function DrawerHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="drawer-header"
      className={cn("flex flex-col gap-1.5 p-4", className)}
      {...props}
    />
  );
}

function DrawerFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="drawer-footer"
      className={cn("mt-auto flex flex-col gap-2 p-4", className)}
      {...props}
    />
  );
}

function DrawerTitle({ className, ...props }: any) {
  return (
    <Typography
      variant="h6"
      data-slot="drawer-title"
      className={cn("text-foreground font-semibold leading-none", className)}
      {...props}
    />
  );
}

function DrawerDescription({ className, ...props }: any) {
  return (
    <Typography
      variant="body2"
      data-slot="drawer-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

export {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
};
