"use client";
import { cn } from "@/lib/utils";

import * as React from "react";
import { Divider as MuiDivider, DividerProps as MuiDividerProps } from "@mui/material";

function Separator({
  className,
  orientation = "horizontal",
  decorative = true,
  ...props
}: any) {
  return (
    <MuiDivider
      data-slot="separator-root"
      orientation={orientation}
      flexItem={orientation === 'vertical'}
      role={decorative ? "presentation" : "separator"}
      className={cn(
        "bg-border shrink-0 border-none",
        orientation === "horizontal" ? "h-px w-full" : "h-full w-px",
        className,
      )}
      sx={{
        backgroundColor: 'var(--border)',
        opacity: 1,
      }}
      {...props}
    />
  );
}

export { Separator };
