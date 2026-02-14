"use client";
import { cn } from "@/lib/utils";

import * as React from "react";
import { 
  ToggleButtonGroup, 
  ToggleButton,
} from "@mui/material";
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
        "group/toggle-group ui-nav control flex w-fit items-center rounded-[var(--cmp-card-radius)] border",
        className,
      )}
      sx={{
        gap: '0px',
        padding: '2px',
        borderColor: 'var(--cmp-segmented-border)',
        backgroundColor: 'var(--cmp-segmented-bg)',
        boxShadow: 'var(--cmp-card-shadow)',
        borderRadius: 'var(--cmp-card-radius)',
        '& .MuiToggleButtonGroup-grouped': {
          border: 0,
          '&.Mui-disabled': {
            border: 0,
          },
          '&:not(:first-of-type)': {
            borderRadius: 0,
            borderLeft: variant === 'outline' ? '1px solid var(--cmp-segmented-border)' : 'none',
          },
          '&:first-of-type': {
            borderTopLeftRadius: 'var(--cmp-card-radius)',
            borderBottomLeftRadius: 'var(--cmp-card-radius)',
          },
          '&:last-of-type': {
            borderTopRightRadius: 'var(--cmp-card-radius)',
            borderBottomRightRadius: 'var(--cmp-card-radius)',
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
        color: 'var(--sys-text-secondary)',
        border: 'none',
        '&.Mui-selected': {
          backgroundColor: 'var(--cmp-segmented-selected-bg)',
          color: 'var(--cmp-segmented-selected-text)',
          boxShadow: 'inset 0 0 0 1px var(--cmp-segmented-border)',
          '&:hover': {
            backgroundColor: 'var(--cmp-segmented-selected-bg)',
          }
        },
        '&:hover': {
          backgroundColor: 'var(--sys-interactive-hover)',
          color: 'var(--sys-text-primary)',
        }
      }}
      {...props}
    >
      {children}
    </ToggleButton>
  );
}

export { ToggleGroup, ToggleGroupItem };
