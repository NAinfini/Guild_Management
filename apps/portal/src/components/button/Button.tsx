import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import MuiButton, { ButtonProps as MuiButtonProps } from "@mui/material/Button";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "ui-button inline-flex items-center justify-center whitespace-nowrap font-medium disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "",
        destructive: "",
        outline: "",
        secondary: "",
        ghost: "",
        link: "underline-offset-4 hover:underline",
      },
      size: {
        default: "text-sm",
        sm: "text-sm",
        lg: "text-base",
        icon: "w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends Omit<MuiButtonProps, "variant" | "size" | "color">,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const variantSxMap: Record<NonNullable<ButtonProps["variant"]>, MuiButtonProps["sx"]> = {
  default: {
    backgroundColor: "var(--cmp-button-bg)",
    color: "var(--cmp-button-text)",
    border: "1px solid var(--cmp-button-border)",
    "&:hover": {
      backgroundColor: "var(--cmp-button-hover-bg)",
      borderColor: "var(--cmp-button-border)",
    },
    "&:active": {
      backgroundColor: "var(--cmp-button-active-bg)",
    },
    "&.Mui-disabled": {
      backgroundColor: "color-mix(in srgb, var(--cmp-button-bg) 35%, transparent)",
      color: "color-mix(in srgb, var(--cmp-button-text) 55%, transparent)",
      borderColor: "color-mix(in srgb, var(--cmp-button-border) 45%, transparent)",
    },
  },
  destructive: {
    backgroundColor: "var(--color-status-error)",
    color: "var(--color-text-inverse)",
    border: "1px solid color-mix(in srgb, var(--color-status-error) 72%, transparent)",
    "&:hover": {
      backgroundColor: "color-mix(in srgb, var(--color-status-error) 86%, black)",
    },
    "&:active": {
      backgroundColor: "color-mix(in srgb, var(--color-status-error) 76%, black)",
    },
    "&.Mui-disabled": {
      backgroundColor: "color-mix(in srgb, var(--color-status-error) 38%, transparent)",
      color: "color-mix(in srgb, var(--color-text-inverse) 60%, transparent)",
    },
  },
  outline: {
    backgroundColor: "transparent",
    color: "var(--sys-text-primary)",
    border: "1px solid var(--cmp-input-border)",
    "&:hover": {
      backgroundColor: "var(--sys-interactive-hover)",
      borderColor: "var(--sys-border-strong)",
    },
    "&:active": {
      backgroundColor: "var(--sys-interactive-active)",
    },
    "&.Mui-disabled": {
      borderColor: "color-mix(in srgb, var(--cmp-input-border) 50%, transparent)",
      color: "var(--sys-text-tertiary)",
    },
  },
  secondary: {
    backgroundColor: "var(--sys-surface-elevated)",
    color: "var(--sys-text-primary)",
    border: "1px solid var(--sys-border-default)",
    "&:hover": {
      backgroundColor: "color-mix(in srgb, var(--sys-surface-elevated) 72%, var(--sys-interactive-hover))",
      borderColor: "var(--sys-border-strong)",
    },
    "&:active": {
      backgroundColor: "color-mix(in srgb, var(--sys-surface-elevated) 62%, var(--sys-interactive-active))",
    },
    "&.Mui-disabled": {
      color: "var(--sys-text-tertiary)",
      borderColor: "color-mix(in srgb, var(--sys-border-default) 55%, transparent)",
    },
  },
  ghost: {
    backgroundColor: "transparent",
    color: "var(--sys-text-primary)",
    border: "1px solid transparent",
    "&:hover": {
      backgroundColor: "var(--sys-interactive-hover)",
    },
    "&:active": {
      backgroundColor: "var(--sys-interactive-active)",
    },
    "&.Mui-disabled": {
      color: "var(--sys-text-tertiary)",
    },
  },
  link: {
    backgroundColor: "transparent",
    color: "var(--sys-text-link)",
    border: "1px solid transparent",
    minWidth: "unset",
    paddingInline: "0.25rem",
    "&:hover": {
      color: "var(--sys-text-link)",
      backgroundColor: "color-mix(in srgb, var(--sys-interactive-hover) 50%, transparent)",
    },
    "&:active": {
      color: "var(--sys-text-link)",
    },
    "&.Mui-disabled": {
      color: "color-mix(in srgb, var(--sys-text-link) 55%, transparent)",
    },
  },
};

const sizeSxMap: Record<NonNullable<ButtonProps["size"]>, MuiButtonProps["sx"]> = {
  default: {
    minHeight: "2.5rem",
    paddingInline: "1rem",
    paddingBlock: "0.5rem",
  },
  sm: {
    minHeight: "2.25rem",
    paddingInline: "0.75rem",
    paddingBlock: "0.375rem",
  },
  lg: {
    minHeight: "2.75rem",
    paddingInline: "1.5rem",
    paddingBlock: "0.625rem",
  },
  icon: {
    width: "2.5rem",
    minWidth: "2.5rem",
    minHeight: "2.5rem",
    padding: "0.5rem",
  },
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", asChild = false, sx, ...props }, ref) => {
    const resolvedVariant = (variant ?? "default") as NonNullable<ButtonProps["variant"]>;
    const resolvedSize = (size ?? "default") as NonNullable<ButtonProps["size"]>;
    let muiVariant: MuiButtonProps["variant"] = "contained";
    let muiColor: MuiButtonProps["color"] = "primary";

    switch (resolvedVariant) {
      case "destructive":
        muiColor = "error";
        break;
      case "outline":
        muiVariant = "outlined";
        break;
      case "secondary":
        muiColor = "secondary";
        break;
      case "ghost":
        muiVariant = "text";
        muiColor = "inherit";
        break;
      case "link":
        muiVariant = "text";
        break;
      default:
        break;
    }

    const muiSize = resolvedSize === "sm" ? "small" : resolvedSize === "lg" ? "large" : "medium";
    const _asChild = asChild; // kept for API compatibility

    return (
      <MuiButton
        ref={ref}
        variant={muiVariant}
        color={muiColor}
        size={muiSize}
        data-ui="button"
        className={cn("control", buttonVariants({ variant: resolvedVariant, size: resolvedSize }), className)}
        sx={[
          {
            borderRadius: "var(--cmp-button-radius)",
            textTransform: "none",
            boxShadow: "none",
            "&:focus-visible, &.Mui-focusVisible": {
              outline: "var(--interaction-focus-ring-width, 2px) solid var(--interaction-focus-ring-color, var(--sys-interactive-focus-ring))",
              outlineOffset: "2px",
              boxShadow: "var(--interaction-focus-ring-glow, none)",
            },
            "& .MuiTouchRipple-root": {
              color: "var(--sys-interactive-accent)",
            },
          },
          sizeSxMap[resolvedSize],
          variantSxMap[resolvedVariant],
          ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
        ]}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
