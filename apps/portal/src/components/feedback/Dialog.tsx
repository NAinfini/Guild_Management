"use client";
import { cn } from "@/lib/utils";

import * as React from "react";
import { 
  Dialog as MuiDialog, 
  DialogTitle as MuiDialogTitle, 
  DialogActions as MuiDialogActions,
  IconButton,
  Typography,
  Fade
} from "@/ui-bridge/material";
import { Close } from "@/ui-bridge/icons-material";

// Context to manage dialog state for sub-components
interface DialogContextValue {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DialogContext = React.createContext<DialogContextValue>({
  open: false,
  onOpenChange: () => {},
});

function Dialog({
  open: controlledOpen,
  onOpenChange,
  defaultOpen = false,
  children,
  ...props
}: any) {
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;

  const handleOpenChange = (val: boolean) => {
    if (controlledOpen === undefined) setInternalOpen(val);
    onOpenChange?.(val);
  };

  return (
    <DialogContext.Provider value={{ open, onOpenChange: handleOpenChange }}>
      {children}
    </DialogContext.Provider>
  );
}

function DialogTrigger({
  children,
  asChild,
  ...props
}: any) {
  const { onOpenChange } = React.useContext(DialogContext);
  
  // We expect a single trigger child we can attach onClick to
  return React.cloneElement(children as React.ReactElement, {
    onClick: (e: React.MouseEvent) => {
      (children as any).props.onClick?.(e);
      onOpenChange(true);
    },
    ...props,
  });
}

function DialogPortal({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

function DialogClose({
  children,
  ...props
}: any) {
  const { onOpenChange } = React.useContext(DialogContext);
  
  if (!children) return null;

  return React.cloneElement(children as React.ReactElement, {
    onClick: (e: React.MouseEvent) => {
      (children as any).props.onClick?.(e);
      onOpenChange(false);
    },
    ...props,
  });
}

function DialogOverlay() {
  return null; // Handled by MuiDialog backdrop
}

function DialogContent({
  className,
  children,
  hideCloseButton = false,
  ...props
}: any) {
  const { open, onOpenChange } = React.useContext(DialogContext);

  return (
    <MuiDialog
      open={open}
      onClose={() => onOpenChange(false)}
      data-slot="dialog-content"
      data-ui="dialog"
      TransitionComponent={Fade}
      PaperProps={{
        className: cn(
          "ui-dialog relative grid w-full max-w-[calc(100%-2rem)] gap-4 border p-6 sm:max-w-lg",
          className
        ),
        sx: {
          backgroundImage: 'none',
          backgroundColor: 'var(--cmp-dialog-bg)',
          borderColor: 'var(--cmp-dialog-border)',
          borderRadius: 'var(--cmp-dialog-radius)',
          boxShadow: 'var(--cmp-dialog-shadow)',
          color: 'var(--sys-text-primary)',
          transition:
            'background-color var(--motionFast) var(--ease), border-color var(--motionFast) var(--ease), box-shadow var(--motionFast) var(--ease)',
        }
      }}
      {...props}
    >
      {children}
      {!hideCloseButton && (
        <IconButton
          onClick={() => onOpenChange(false)}
          data-ui="dialog-close"
          className="absolute top-4 right-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 disabled:pointer-events-none"
          sx={{
            padding: '4px',
            color: 'var(--sys-text-secondary)',
            '&:hover': {
              backgroundColor: 'var(--sys-interactive-hover)',
              color: 'var(--sys-text-primary)',
            },
            '&:focus-visible, &.Mui-focusVisible': {
              outline: '2px solid var(--sys-interactive-focus-ring)',
              outlineOffset: '2px',
            },
          }}
        >
          <Close className="size-4" />
          <span className="sr-only">Close</span>
        </IconButton>
      )}
    </MuiDialog>
  );
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      data-ui="dialog-header"
      className={cn("flex flex-col gap-2 text-center sm:text-left", className)}
      {...props}
    />
  );
}

function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <MuiDialogActions
      data-slot="dialog-footer"
      data-ui="dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end p-0",
        className,
      )}
      disableSpacing
      {...props}
    />
  );
}

function DialogTitle({
  className,
  ...props
}: any) {
  return (
    <MuiDialogTitle
      data-slot="dialog-title"
      data-ui="dialog-title"
      className={cn("text-lg leading-none font-semibold p-0", className)}
      {...props}
    />
  );
}

function DialogDescription({
  className,
  ...props
}: any) {
  return (
    <Typography
      variant="body2"
      data-slot="dialog-description"
      data-ui="dialog-description"
      className={cn("text-muted-foreground text-sm", className)}
      component="p"
      {...props}
    />
  );
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};
