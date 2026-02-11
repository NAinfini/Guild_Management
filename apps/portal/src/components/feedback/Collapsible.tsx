"use client";

import * as React from "react";
import { Collapse } from "@mui/material";

interface CollapsibleContextValue {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CollapsibleContext = React.createContext<CollapsibleContextValue>({
  open: false,
  onOpenChange: () => {},
});

function Collapsible({
  children,
  open: controlledOpen,
  onOpenChange,
  defaultOpen = false,
  ...props
}: any) {
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;

  const handleOpenChange = (val: boolean) => {
    if (controlledOpen === undefined) setInternalOpen(val);
    onOpenChange?.(val);
  };

  return (
    <CollapsibleContext.Provider value={{ open, onOpenChange: handleOpenChange }}>
      <div data-slot="collapsible" {...props}>
        {children}
      </div>
    </CollapsibleContext.Provider>
  );
}

function CollapsibleTrigger({ children, ...props }: { children: React.ReactElement }) {
  const { open, onOpenChange } = React.useContext(CollapsibleContext);
  
  if (!React.isValidElement(children)) return <>{children}</>;

  return React.cloneElement(children, {
    onClick: (e: React.MouseEvent) => {
      (children.props as any).onClick?.(e);
      onOpenChange(!open);
    },
    "data-state": open ? "open" : "closed",
    ...props,
  } as any);
}

function CollapsibleContent({ children, className, ...props }: any) {
  const { open } = React.useContext(CollapsibleContext);

  return (
    <Collapse in={open} data-slot="collapsible-content" {...props}>
      <div className={className}>
        {children}
      </div>
    </Collapse>
  );
}

export { Collapsible, CollapsibleTrigger, CollapsibleContent };
