"use client";

import * as React from "react";
import { 
  Select as MuiSelect, 
  MenuItem as MuiMenuItem, 
  SelectProps as MuiSelectProps,
  MenuItemProps as MuiMenuItemProps,
  ListItemIcon,
  ListItemText
} from "@/ui-bridge/material";
import { KeyboardArrowDown, Check } from "@/ui-bridge/icons-material";
import { cn } from "@/lib/utils";

// Re-export MuiSelectProps for consumers
export type SelectProps = MuiSelectProps;

const Select = React.forwardRef<HTMLDivElement, SelectProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <MuiSelect
        ref={ref}
        displayEmpty
        IconComponent={(iconProps: React.ComponentProps<typeof KeyboardArrowDown>) => (
          <KeyboardArrowDown 
            {...iconProps} 
            className={cn("h-4 w-4 opacity-50 mr-2", iconProps.className)} 
          />
        )}
        className={cn(
          "flex w-full items-center justify-between rounded-md border border-input bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        sx={{
          "& .MuiSelect-select": {
            paddingLeft: "0.75rem",
            paddingRight: "2rem",
            py: 1, // h-10 equivalent approx
            display: "flex",
            alignItems: "center",
            minHeight: "unset",
          },
          "& .MuiOutlinedInput-notchedOutline": {
            border: "none",
          },
        }}
        MenuProps={{
          PaperProps: {
            className: "bg-popover text-popover-foreground rounded-md border border-border shadow-md mt-1",
            sx: {
              backgroundImage: "none",
              backgroundColor: "var(--popover) !important",
              // Ensure generic Menu style overrides
            }
          },
          MenuListProps: {
            className: "p-1",
          }
        }}
        {...props}
      >
        {children}
      </MuiSelect>
    );
  }
);
Select.displayName = "Select";

const SelectItem = React.forwardRef<HTMLLIElement, MuiMenuItemProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <MuiMenuItem
        ref={ref}
        className={cn(
          "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
          className
        )}
        sx={{
          "&.Mui-selected": {
             backgroundColor: "var(--accent) !important",
             color: "var(--accent-foreground) !important",
          },
          "&:hover": {
             backgroundColor: "var(--accent)",
             color: "var(--accent-foreground)",
          },
          // Hide the checkmark by default unless we specifically want it,
          // but Radix UI typically has the checkmark separate or absolute positioned.
          // MUI MenuItem doesn't incorporate Check automatically.
        }}
        {...props}
      >
        {/* We can reproduce the Radix checkmark behavior if needed, 
            but for simple Select, children is enough. 
            Radix aligns text and puts check on left/right. 
            MUI puts check in ListItemIcon usually.
        */}
        <ListItemText primary={children} />
        {/* Use a check icon that only shows when selected? 
            MuiMenuItem doesn't expose 'selected' state to children easily without context.
            We'll stick to simple text for now, or letting MUI handle selected state visual (bg color).
        */}
      </MuiMenuItem>
    );
  }
);
SelectItem.displayName = "SelectItem";

export { Select, SelectItem };
