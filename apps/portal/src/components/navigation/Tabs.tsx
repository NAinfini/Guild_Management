"use client";
import { cn } from "@/lib/utils";

import * as React from "react";
import { Tabs as MuiTabs, Tab as MuiTab } from "@mui/material";

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
        "ui-nav control inline-flex w-fit items-center justify-center",
        className
      )}
      sx={{
        minHeight: "auto",
        borderRadius: "var(--cmp-card-radius)",
        border: "var(--theme-border-width, 1px) var(--theme-border-style, solid)",
        borderColor: "var(--cmp-segmented-border)",
        backgroundColor: "var(--cmp-segmented-bg)",
        boxShadow: "var(--cmp-card-shadow)",
        padding: "2px",
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
        "ui-button control inline-flex flex-1 items-center justify-center gap-1.5 rounded-[var(--cmp-card-radius)] border border-transparent px-2 py-1 text-sm font-semibold whitespace-nowrap disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      sx={{
        minWidth: "auto",
        minHeight: "2.125rem",
        padding: "0.35rem 0.72rem",
        textTransform: "none",
        opacity: 1,
        color: "var(--sys-text-secondary)",
        transition:
          "background-color var(--motionFast) var(--ease), color var(--motionFast) var(--ease), box-shadow var(--motionFast) var(--ease), border-color var(--motionFast) var(--ease), transform var(--motionFast) var(--ease)",
        borderColor: "transparent",
        "&:hover": {
          backgroundColor: "var(--cmp-tab-hover-bg, var(--sys-interactive-hover))",
          color: "var(--sys-text-primary)",
          borderColor: "var(--cmp-segmented-border)",
          transform: "translateY(-0.5px)",
        },
        "&.Mui-selected": {
          backgroundColor: "var(--cmp-segmented-selected-bg)",
          color: "var(--cmp-segmented-selected-text)",
          borderColor: "var(--cmp-segmented-border)",
          boxShadow: "var(--theme-shadow-sm, 0 1px 2px rgba(0,0,0,0.2))",
        },
        "&.Mui-focusVisible": {
          outline: "var(--interaction-focus-ring-width, 2px) solid var(--interaction-focus-ring-color, var(--sys-interactive-focus-ring))",
          outlineOffset: "2px",
          boxShadow: "var(--interaction-focus-ring-glow, none)",
        },
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
