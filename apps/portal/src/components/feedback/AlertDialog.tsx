"use client";
import { cn } from "@/lib/utils";

import * as React from "react";
import { 
  Dialog as MuiDialog, 
  DialogTitle as MuiDialogTitle, 
  DialogContent as MuiDialogContent, 
  DialogActions as MuiDialogActions,
  Typography,
  Box,
  Fade
} from "@mui/material";
import { buttonVariants } from "../button/Button";

// State management context
interface AlertDialogContextValue {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AlertDialogContext = React.createContext<AlertDialogContextValue>({
  open: false,
  onOpenChange: () => {},
});

function AlertDialog({
  children,
  open: controlledOpen,
  onOpenChange,
  defaultOpen = false,
}: any) {
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;

  const handleOpenChange = (val: boolean) => {
    if (controlledOpen === undefined) setInternalOpen(val);
    onOpenChange?.(val);
  };

  return (
    <AlertDialogContext.Provider value={{ open, onOpenChange: handleOpenChange }}>
      {children}
    </AlertDialogContext.Provider>
  );
}

function AlertDialogTrigger({ children }: { children: React.ReactElement }) {
  const { onOpenChange } = React.useContext(AlertDialogContext);
  
  return React.cloneElement(children as any, {
    onClick: (e: React.MouseEvent) => {
      (children.props as any).onClick?.(e);
      onOpenChange(true);
    },
  });
}

function AlertDialogPortal({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

function AlertDialogOverlay() {
  return null; // Handled by MuiDialog backdrop
}

function AlertDialogContent({
  className,
  children,
  ...props
}: any) {
  const { open, onOpenChange } = React.useContext(AlertDialogContext);

  return (
    <MuiDialog
      open={open}
      onClose={() => onOpenChange(false)}
      data-slot="alert-dialog-content"
      TransitionComponent={Fade}
      PaperProps={{
        className: cn(
          "bg-background relative grid w-full max-w-[calc(100%-2rem)] gap-4 rounded-lg border p-6 shadow-lg sm:max-w-lg",
          className
        ),
        sx: {
          backgroundImage: 'none',
          backgroundColor: 'var(--background)',
          borderColor: 'var(--border)',
        }
      }}
      {...props}
    >
      {children}
    </MuiDialog>
  );
}

function AlertDialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-dialog-header"
      className={cn("flex flex-col gap-2 text-center sm:text-left", className)}
      {...props}
    />
  );
}

function AlertDialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <MuiDialogActions
      data-slot="alert-dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end p-0",
        className,
      )}
      disableSpacing
      {...props}
    />
  );
}

function AlertDialogTitle({ className, ...props }: any) {
  return (
    <MuiDialogTitle
      data-slot="alert-dialog-title"
      className={cn("text-lg font-semibold p-0", className)}
      {...props}
    />
  );
}

function AlertDialogDescription({ className, ...props }: any) {
  return (
    <Typography
      variant="body2"
      data-slot="alert-dialog-description"
      className={cn("text-muted-foreground text-sm", className)}
      component="p"
      {...props}
    />
  );
}

function AlertDialogAction({ className, ...props }: any) {
  const { onOpenChange } = React.useContext(AlertDialogContext);
  
  return (
    <button
      className={cn(buttonVariants(), className)}
      onClick={() => onOpenChange(false)}
      {...props}
    />
  );
}

function AlertDialogCancel({ className, ...props }: any) {
  const { onOpenChange } = React.useContext(AlertDialogContext);
  
  return (
    <button
      className={cn(buttonVariants({ variant: "outline" }), className)}
      onClick={() => onOpenChange(false)}
      {...props}
    />
  );
}

export {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
};
