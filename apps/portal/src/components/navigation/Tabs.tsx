"use client";
import { cn } from "@/lib/utils";

import * as React from "react";
import { Tabs as MuiTabs, Tab as MuiTab, Box, TabsProps as MuiTabsProps } from "@mui/material";

// We'll maintain a similar API to the Radix-based version, 
// using a context to manage the value across sub-components since MUI's Tabs are also integrated.

interface TabsContextValue {
  value?: string;
  onValueChange?: (value: string) => void;
}

const TabsContext = React.createContext<TabsContextValue>({});

function Tabs({
  className,
  value,
  onValueChange,
  defaultValue,
  children,
  ...props
}: any) {
  const [internalValue, setInternalValue] = React.useState(value || defaultValue);

  React.useEffect(() => {
    if (value !== undefined) setInternalValue(value);
  }, [value]);

  const handleValueChange = (val: string) => {
    if (value === undefined) setInternalValue(val);
    onValueChange?.(val);
  };

  return (
    <TabsContext.Provider value={{ value: internalValue, onValueChange: handleValueChange }}>
      <div
        data-slot="tabs"
        className={cn("flex flex-col gap-2", className)}
        {...props}
      >
        {children}
      </div>
    </TabsContext.Provider>
  );
}

function TabsList({
  className,
  children,
  ...props
}: any) {
  const { value, onValueChange } = React.useContext(TabsContext);

  return (
    <MuiTabs
      value={value}
      onChange={(_, val) => onValueChange?.(val)}
      data-slot="tabs-list"
      className={cn(
        "bg-muted text-muted-foreground inline-flex h-9 w-fit items-center justify-center rounded-xl p-[3px]",
        className
      )}
      sx={{
        minHeight: "auto",
        "& .MuiTabs-indicator": {
          display: "none",
        },
        "& .MuiTabs-flexContainer": {
          gap: "2px",
        }
      }}
      {...props}
    >
      {children}
    </MuiTabs>
  );
}

function TabsTrigger({
  className,
  value,
  children,
  ...props
}: any) {
  // MUI Tab expects to be inside MuiTabs. We use it with value.
  return (
    <MuiTab
      value={value}
      label={children} // TabsTrigger children are usually the label
      data-slot="tabs-trigger"
      disableRipple
      className={cn(
        "text-foreground dark:text-muted-foreground inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-xl border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      sx={{
        minWidth: "auto",
        minHeight: "auto",
        padding: "0.25rem 0.5rem",
        textTransform: "none",
        opacity: 1,
        "&.Mui-selected": {
          backgroundColor: "var(--color-surface-default, var(--surface1))",
          color: "var(--color-text-primary, var(--text0))",
          border: "1px solid var(--color-border-default, var(--divider))",
          boxShadow: "var(--theme-shadow-sm, var(--shadow1))",
        },
        // We need to re-apply the active classes manually because data-state active is Radix-specific
        "&.Mui-selected [data-slot='tabs-trigger']": {
           backgroundColor: "var(--color-surface-default, var(--surface1))",
        }
      }}
      {...props}
    />
  );
}

function TabsContent({
  className,
  value,
  children,
  ...props
}: any) {
  const { value: selectedValue } = React.useContext(TabsContext);
  
  if (selectedValue !== value) return null;

  return (
    <div
      data-slot="tabs-content"
      className={cn("flex-1 outline-none", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
