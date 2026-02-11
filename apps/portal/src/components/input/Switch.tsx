import * as React from "react";
import MuiSwitch, { SwitchProps as MuiSwitchProps } from "@mui/material/Switch";
import { cn } from "@/lib/utils";

const Switch = React.forwardRef<HTMLButtonElement, MuiSwitchProps>(
  ({ className, ...props }, ref) => (
    <MuiSwitch
      ref={ref}
      className={cn(
        "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input",
        className
      )}
      sx={{
        width: 44,
        height: 24,
        padding: 0,
        '& .MuiSwitch-switchBase': {
          padding: 0,
          margin: '2px',
          transitionDuration: '300ms',
          '&.Mui-checked': {
            transform: 'translateX(20px)',
            color: 'common.white',
            '& + .MuiSwitch-track': {
              backgroundColor: 'primary.main',
              opacity: 1,
              border: 0,
            },
            '&.Mui-disabled + .MuiSwitch-track': {
              opacity: 0.5,
            },
          },
          '&.Mui-focusVisible .MuiSwitch-thumb': {
            color: 'primary.light',
            border: '6px solid #fff',
          },
          '&.Mui-disabled .MuiSwitch-thumb': {
            color: 'action.disabled',
          },
          '&.Mui-disabled + .MuiSwitch-track': {
            opacity: 0.3, // Match default
          },
        },
        '& .MuiSwitch-thumb': {
          boxSizing: 'border-box',
          width: 20,
          height: 20,
        },
        '& .MuiSwitch-track': {
          borderRadius: 26 / 2,
          backgroundColor: 'var(--input)',
          opacity: 1,
          transition: 'background-color 500ms',
        },
      }}
      {...props}
    />
  )
);
Switch.displayName = "Switch";

export { Switch };
