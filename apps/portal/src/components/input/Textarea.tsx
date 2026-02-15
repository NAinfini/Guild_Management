import * as React from "react";
import InputBase, { InputBaseProps } from "@/ui-bridge/material/InputBase";
import { cn } from "@/lib/utils";

export type TextareaProps = InputBaseProps;

const Textarea = React.forwardRef<HTMLDivElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <InputBase
        ref={ref}
        multiline
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
