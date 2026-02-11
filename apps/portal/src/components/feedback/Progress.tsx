"use client";
import { cn } from "@/lib/utils";

import * as React from "react";
import { LinearProgress, LinearProgressProps, Box } from "@mui/material";

function Progress({
  className,
  value,
  ...props
}: any) {
  return (
    <LinearProgress
      variant="determinate"
      value={value || 0}
      data-slot="progress"
      className={cn(
        "bg-primary/20 relative h-2 w-full overflow-hidden rounded-full",
        className,
      )}
      sx={{
        backgroundColor: 'rgba(var(--primary), 0.2)',
        '& .MuiLinearProgress-bar': {
          backgroundColor: 'var(--primary)',
          borderRadius: 'inherit',
        }
      }}
      {...props}
    />
  );
}

export { Progress };
