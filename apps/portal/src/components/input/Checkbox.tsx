import * as React from "react";
import MuiCheckbox, { CheckboxProps } from "@mui/material/Checkbox";
import CheckIcon from "@mui/icons-material/Check";
import { cn } from "@/lib/utils";

const Checkbox = React.forwardRef<HTMLButtonElement, CheckboxProps>(
  ({ className, ...props }, ref) => (
    <MuiCheckbox
      ref={ref}
      icon={<span className="flex h-4 w-4 items-center justify-center rounded-sm border border-primary ring-offset-background" />}
      checkedIcon={
        <span className="flex h-4 w-4 items-center justify-center rounded-sm border border-primary bg-primary text-primary-foreground ring-offset-background">
          <CheckIcon className="h-3 w-3" />
        </span>
      }
      className={cn(
        "peer h-4 w-4 shrink-0 rounded-sm p-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
        className
      )}
      {...props}
    />
  )
);
Checkbox.displayName = "Checkbox";

export { Checkbox };
