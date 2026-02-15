"use client";
import { cn } from "@/lib/utils";

import * as React from "react";
import { 
  Accordion as MuiAccordion, 
  AccordionSummary, 
  AccordionDetails,
  AccordionProps as MuiAccordionProps
} from "@/ui-bridge/material";
import { KeyboardArrowDown } from "@/ui-bridge/icons-material";

// Sub-component state management
interface AccordionContextValue {
  value?: string | string[];
  type?: "single" | "multiple";
}

const AccordionContext = React.createContext<AccordionContextValue>({});

function Accordion({
  className,
  type = "single",
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

  const handleChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    let newValue: any;
    if (type === "single") {
      newValue = isExpanded ? panel : "";
    } else {
      const current = Array.isArray(internalValue) ? internalValue : [];
      newValue = isExpanded 
        ? [...current, panel]
        : current.filter((v) => v !== panel);
    }
    
    if (value === undefined) setInternalValue(newValue);
    onValueChange?.(newValue);
  };

  return (
    <AccordionContext.Provider value={{ value: internalValue, type }}>
      <div data-slot="accordion" className={cn("", className)}>
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child as React.ReactElement, {
              expanded: type === "single" 
                ? internalValue === (child.props as any).value
                : (Array.isArray(internalValue) && internalValue.includes((child.props as any).value)),
              onChange: handleChange((child.props as any).value),
            } as any);
          }
          return child;
        })}
      </div>
    </AccordionContext.Provider>
  );
}

function AccordionItem({
  className,
  children,
  expanded,
  onChange,
  value,
  ...props
}: any) {
  return (
    <MuiAccordion
      expanded={expanded}
      onChange={onChange}
      disableGutters
      elevation={0}
      square
      data-slot="accordion-item"
      className={cn("border-b last:border-b-0 before:hidden bg-transparent", className)}
      {...props}
    >
      {children}
    </MuiAccordion>
  );
}

function AccordionTrigger({
  className,
  children,
  ...props
}: any) {
  return (
    <AccordionSummary
      data-slot="accordion-trigger"
      expandIcon={<KeyboardArrowDown className="text-muted-foreground size-4 shrink-0 transition-transform duration-200" />}
      className={cn(
        "focus-visible:border-ring focus-visible:ring-ring/50 flex flex-1 items-start justify-between gap-4 rounded-md text-left text-sm font-medium transition-all outline-none hover:underline focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 min-h-0 px-0 py-4",
        className,
      )}
      sx={{
        "& .MuiAccordionSummary-content": {
          margin: 0,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
        },
        "& .MuiAccordionSummary-expandIconWrapper.Mui-expanded": {
          transform: "rotate(180deg)",
        }
      }}
      {...props}
    >
      {children}
    </AccordionSummary>
  );
}

function AccordionContent({
  className,
  children,
  ...props
}: any) {
  return (
    <AccordionDetails
      data-slot="accordion-content"
      className={cn("p-0 pb-4 text-sm", className)}
      {...props}
    >
      {children}
    </AccordionDetails>
  );
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
