import React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { cn } from '@/lib/utils';
import styles from './Dialog.module.css';

export type PrimitiveDialogProps = React.ComponentPropsWithoutRef<typeof DialogPrimitive.Root>;
export type PrimitiveDialogTriggerProps = React.ComponentPropsWithoutRef<typeof DialogPrimitive.Trigger>;
export type PrimitiveDialogCloseProps = React.ComponentPropsWithoutRef<typeof DialogPrimitive.Close>;
export type PrimitiveDialogPortalProps = React.ComponentPropsWithoutRef<typeof DialogPrimitive.Portal>;
export type PrimitiveDialogOverlayProps = React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>;
export type PrimitiveDialogTitleProps = React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>;
export type PrimitiveDialogDescriptionProps = React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>;

export interface PrimitiveDialogContentProps extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  hideCloseButton?: boolean;
  closeLabel?: string;
}

export type PrimitiveDialogSectionProps = React.HTMLAttributes<HTMLDivElement>;

/**
 * Dialog primitives wrap Radix semantics with our tokenized visual layer.
 * Feature dialogs compose these pieces to keep a consistent interaction model.
 */
export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogPortal = DialogPrimitive.Portal;
export const DialogClose = DialogPrimitive.Close;

export const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  PrimitiveDialogOverlayProps
>(({ className, ...props }, ref) => {
  return <DialogPrimitive.Overlay ref={ref} className={cn(styles.overlay, className)} {...props} />;
});

DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

export const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  PrimitiveDialogContentProps
>(({ className, children, hideCloseButton = false, closeLabel = 'Close dialog', ...props }, ref) => {
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content ref={ref} className={cn(styles.content, className)} {...props}>
        {children}
        {!hideCloseButton ? (
          <DialogPrimitive.Close asChild>
            <button type="button" className={styles.closeButton} aria-label={closeLabel}>
              ×
            </button>
          </DialogPrimitive.Close>
        ) : null}
      </DialogPrimitive.Content>
    </DialogPortal>
  );
});

DialogContent.displayName = DialogPrimitive.Content.displayName;

export const DialogHeader = ({ className, ...props }: PrimitiveDialogSectionProps) => {
  return <div className={cn(styles.header, className)} {...props} />;
};

export const DialogFooter = ({ className, ...props }: PrimitiveDialogSectionProps) => {
  return <div className={cn(styles.footer, className)} {...props} />;
};

export const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  PrimitiveDialogTitleProps
>(({ className, ...props }, ref) => {
  return <DialogPrimitive.Title ref={ref} className={cn(styles.title, className)} {...props} />;
});

DialogTitle.displayName = DialogPrimitive.Title.displayName;

export const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  PrimitiveDialogDescriptionProps
>(({ className, ...props }, ref) => {
  return <DialogPrimitive.Description ref={ref} className={cn(styles.description, className)} {...props} />;
});

DialogDescription.displayName = DialogPrimitive.Description.displayName;
