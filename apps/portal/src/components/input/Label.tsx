import * as React from "react";
import FormLabel, { FormLabelProps } from "@/ui-bridge/material/FormLabel";
import { cn } from "@/lib/utils";

const Label = React.forwardRef<HTMLLabelElement, FormLabelProps>(
  ({ className, ...props }, ref) => (
    <FormLabel
      ref={ref}
      className={cn(
        "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-foreground",
        className
      )}
      {...props}
    />
  )
);
Label.displayName = "Label";

export { Label };
