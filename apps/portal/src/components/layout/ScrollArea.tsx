"use client";
import { cn } from "@/lib/utils";

import * as React from "react";
import { Box } from "@mui/material";

function ScrollArea({
  className,
  children,
  ...props
}: any) {
  return (
    <Box
      data-slot="scroll-area"
      className={cn("relative overflow-hidden", className)}
      {...props}
    >
      <Box
        data-slot="scroll-area-viewport"
        className="size-full overflow-auto scrollbar-hide focus-visible:ring-ring/50 rounded-[inherit] transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:outline-1"
        sx={{
          scrollbarWidth: 'none',
          '&::-webkit-scrollbar': {
            display: 'none',
          }
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

function ScrollBar({ className, ...props }: any) {
  return null; // Using native scroll or hidden for now
}

export { ScrollArea, ScrollBar };
