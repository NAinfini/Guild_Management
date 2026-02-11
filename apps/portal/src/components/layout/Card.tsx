import * as React from "react";
import { cn } from "@/lib/utils";
import { Paper, PaperProps, Box, Typography } from "@mui/material";

function Card({ className, ...props }: PaperProps) {
  return (
    <Paper
      data-slot="card"
      data-ui="card"
      elevation={0}
      className={cn(
        "ui-card flex flex-col gap-6 rounded-xl border",
        className,
      )}
      sx={{
        backgroundImage: 'none',
        backgroundColor: 'var(--cmp-card-bg)',
        borderColor: 'var(--cmp-card-border)',
        borderRadius: 'var(--cmp-card-radius)',
        boxShadow: 'var(--cmp-card-shadow)',
        color: 'var(--sys-text-primary)',
        transition: 'box-shadow var(--motionFast) var(--ease), border-color var(--motionFast) var(--ease), transform var(--motionFast) var(--ease)',
      }}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      data-ui="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 pt-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className,
      )}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }: React.ComponentProps<"h4">) {
  return (
    <Typography
      variant="h4"
      component="h4"
      data-slot="card-title"
      data-ui="card-title"
      className={cn("leading-none font-semibold", className)}
      sx={{ fontSize: 'inherit', fontWeight: 'inherit' }}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <Typography
      variant="body2"
      component="p"
      data-slot="card-description"
      data-ui="card-description"
      className={cn("text-muted-foreground", className)}
      sx={{ fontSize: 'inherit', color: 'inherit' }}
      {...props}
    />
  );
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      data-ui="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className,
      )}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      data-ui="card-content"
      className={cn("px-6 [&:last-child]:pb-6", className)}
      {...props}
    />
  );
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      data-ui="card-footer"
      className={cn("flex items-center px-6 pb-6 [.border-t]:pt-6", className)}
      {...props}
    />
  );
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
};
