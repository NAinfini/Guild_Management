import * as React from "react";
import InputBase, { InputBaseProps } from "@mui/material/InputBase";
import { cn } from "@/lib/utils";

export type InputProps = Omit<InputBaseProps, "color">;

const Input = React.forwardRef<HTMLDivElement, InputProps>(
  ({ className, startAdornment, endAdornment, ...props }, ref) => {
    return (
      <InputBase
        ref={ref}
        data-ui="input"
        startAdornment={startAdornment}
        endAdornment={endAdornment}
        className={cn(
          "ui-input flex h-10 w-full text-sm disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        sx={{
          borderRadius: "var(--cmp-input-radius)",
          border: "1px solid var(--cmp-input-border)",
          backgroundColor: "var(--cmp-input-bg)",
          color: "var(--cmp-input-text)",
          paddingInline: "0.75rem",
          paddingBlock: "0.5rem",
          transition:
            "background-color var(--motionFast) var(--ease), border-color var(--motionFast) var(--ease), box-shadow var(--motionFast) var(--ease), transform var(--motionFast) var(--ease)",
          "& .MuiInputBase-input": {
            color: "inherit",
            padding: 0,
            "&::placeholder": {
              color: "var(--cmp-input-placeholder)",
              opacity: 1,
            },
          },
          "& .MuiInputAdornment-root": {
            color: "var(--sys-text-secondary)",
          },
          "&:hover:not(.Mui-disabled)": {
            borderColor: "var(--sys-border-strong)",
            backgroundColor: "color-mix(in srgb, var(--cmp-input-bg) 85%, var(--sys-interactive-hover))",
          },
          "&:focus-within": {
            borderColor: "var(--cmp-input-focus-border)",
            boxShadow: "0 0 0 2px var(--sys-interactive-focus-ring)",
          },
          "&.Mui-disabled": {
            color: "var(--sys-text-tertiary)",
            borderColor: "color-mix(in srgb, var(--cmp-input-border) 50%, transparent)",
          },
        }}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
