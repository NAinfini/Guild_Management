import * as React from "react";
import { cn } from "@/lib/utils";
import { Box } from "@/ui-bridge/material";
import { cva, type VariantProps } from "class-variance-authority";

const badgeVariants = cva(
  "ui-chip inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none transition-[color,box-shadow,border-color,background-color] overflow-hidden",
  {
    variants: {
      variant: {
        default: "",
        secondary: "",
        destructive: "",
        outline: "",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Badge({
  className,
  variant,
  component: Component = "span",
  ...props
}: any) {
  const resolvedVariant = (variant ?? "default") as "default" | "secondary" | "destructive" | "outline";
  const variantStyles: Record<typeof resolvedVariant, React.CSSProperties> = {
    default: {
      backgroundColor: "var(--cmp-chip-bg)",
      color: "var(--cmp-chip-text)",
      borderColor: "var(--cmp-chip-border)",
    },
    secondary: {
      backgroundColor: "color-mix(in srgb, var(--sys-surface-elevated) 70%, var(--sys-interactive-hover))",
      color: "var(--sys-text-primary)",
      borderColor: "var(--sys-border-default)",
    },
    destructive: {
      backgroundColor: "color-mix(in srgb, var(--color-status-error-bg) 85%, transparent)",
      color: "var(--color-status-error-fg)",
      borderColor: "color-mix(in srgb, var(--color-status-error) 52%, transparent)",
    },
    outline: {
      backgroundColor: "transparent",
      color: "var(--sys-text-primary)",
      borderColor: "var(--sys-border-default)",
    },
  };

  return (
    <Box
      component={Component}
      data-slot="badge"
      data-ui="chip"
      className={cn(badgeVariants({ variant: resolvedVariant }), className)}
      sx={{
        borderRadius: "999px",
        lineHeight: 1.2,
        ...variantStyles[resolvedVariant],
        "&:focus-visible": {
          outline: "2px solid var(--sys-interactive-focus-ring)",
          outlineOffset: "2px",
        },
      }}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
