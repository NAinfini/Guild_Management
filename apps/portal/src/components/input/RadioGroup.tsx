import * as React from "react";
import MuiRadioGroup, { RadioGroupProps as MuiRadioGroupProps } from "@mui/material/RadioGroup";
import MuiRadio, { RadioProps as MuiRadioProps } from "@mui/material/Radio";
import { cn } from "@/lib/utils";
import CircleIcon from "@mui/icons-material/Circle"; 

const RadioGroup = React.forwardRef<HTMLDivElement, MuiRadioGroupProps>(
  ({ className, ...props }, ref) => {
    return (
      <MuiRadioGroup
        className={cn("grid gap-2", className)}
        {...props}
        ref={ref}
      />
    );
  }
);
RadioGroup.displayName = "RadioGroup";

const RadioGroupItem = React.forwardRef<HTMLButtonElement, MuiRadioProps>(
  ({ className, ...props }, ref) => {
    return (
      <MuiRadio
        ref={ref}
        icon={
          <span className="flex h-4 w-4 items-center justify-center rounded-full border border-primary text-primary ring-offset-background" />
        }
        checkedIcon={
          <span className="flex h-4 w-4 items-center justify-center rounded-full border border-primary text-primary ring-offset-background">
            <CircleIcon className="h-2.5 w-2.5 fill-current text-current" />
          </span>
        }
        className={cn(
          "aspect-square h-4 w-4 rounded-full border border-primary text-primary opacity-70 ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      />
    );
  }
);
RadioGroupItem.displayName = "RadioGroupItem";

export { RadioGroup, RadioGroupItem };
