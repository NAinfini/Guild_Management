"use client";
import { cn } from "@/lib/utils";

import * as React from "react";
import { 
  ToggleButtonGroup, 
  ToggleButton,
  ToggleButtonGroupProps,
  ToggleButtonProps
} from "@mui/material";
import { VariantProps } from "class-variance-authority";
import { toggleVariants } from "./Toggle";

function ToggleGroup({
  className,
  variant,
  size,
  children,
  value,
  onChange,
  type = "single",
  ...props
}: any) {
  const handleChange = (event: React.MouseEvent<HTMLElement>, newValue: any) => {
    if (newValue !== null) {
      onChange?.(newValue);
    }
  };

  return (
    <ToggleButtonGroup
      data-slot="toggle-group"
      value={value}
      onChange={handleChange}
      exclusive={type === "single"}
      className={cn(
        "group/toggle-group flex w-fit items-center rounded-md border-none",
        className,
      )}
      sx={{
        gap: '0px',
        '& .MuiToggleButtonGroup-grouped': {
          border: 0,
          '&.Mui-disabled': {
            border: 0,
          },
          '&:not(:first-of-type)': {
            borderRadius: 0,
            borderLeft: variant === 'outline' ? '1px solid var(--border)' : 'none',
          },
          '&:first-of-type': {
            borderTopLeftRadius: 'var(--radius)',
            borderBottomLeftRadius: 'var(--radius)',
          },
          '&:last-of-type': {
            borderTopRightRadius: 'var(--radius)',
            borderBottomRightRadius: 'var(--radius)',
          },
        },
      }}
      {...props}
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, { variant, size });
        }
        return child;
      })}
    </ToggleButtonGroup>
  );
}

function ToggleGroupItem({
  className,
  children,
  variant,
  size,
  value,
  ...props
}: any) {
  return (
    <ToggleButton
      data-slot="toggle-group-item"
      value={value}
      className={cn(
        toggleVariants({ variant, size }),
        "min-w-0 flex-1 shrink-0 rounded-none shadow-none focus:z-10 focus-visible:z-10",
        className,
      )}
      sx={{
        backgroundColor: 'transparent',
        color: 'inherit',
        border: 'none',
        '&.Mui-selected': {
          backgroundColor: 'var(--accent)',
          color: 'var(--accent-foreground)',
          '&:hover': {
            backgroundColor: 'var(--accent)',
          }
        },
        '&:hover': {
          backgroundColor: 'var(--muted)',
        }
      }}
      {...props}
    >
      {children}
    </ToggleButton>
  );
}

export { ToggleGroup, ToggleGroupItem };
