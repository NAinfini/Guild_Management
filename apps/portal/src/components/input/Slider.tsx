import * as React from "react";
import MuiSlider, { SliderProps as MuiSliderProps } from "@mui/material/Slider";
import { cn } from "@/lib/utils";

const Slider = React.forwardRef<HTMLSpanElement, MuiSliderProps>(
  ({ className, ...props }, ref) => (
    <MuiSlider
      ref={ref}
      className={cn(
        "relative flex w-full touch-none select-none items-center",
        className
      )}
      sx={{
        color: 'var(--primary)',
        height: 8,
        '& .MuiSlider-track': {
          border: 'none',
        },
        '& .MuiSlider-thumb': {
          height: 20,
          width: 20,
          backgroundColor: 'var(--background)',
          border: '2px solid currentColor',
          '&:focus, &:hover, &.Mui-active, &.Mui-focusVisible': {
            boxShadow: 'inherit',
          },
          '&:before': {
            display: 'none',
          },
        },
        '& .MuiSlider-valueLabel': {
          lineHeight: 1.2,
          fontSize: 12,
          background: 'unset',
          padding: 0,
          width: 32,
          height: 32,
          borderRadius: '50% 50% 50% 0',
          backgroundColor: 'var(--primary)',
          transformOrigin: 'bottom left',
          transform: 'translate(50%, -100%) rotate(-45deg) scale(0)',
          '&:before': { display: 'none' },
          '&.MuiSlider-valueLabelOpen': {
            transform: 'translate(50%, -100%) rotate(-45deg) scale(1)',
          },
          '& > *': {
            transform: 'rotate(45deg)',
          },
        },
      }}
      {...props}
    />
  )
);
Slider.displayName = "Slider";

export { Slider };
