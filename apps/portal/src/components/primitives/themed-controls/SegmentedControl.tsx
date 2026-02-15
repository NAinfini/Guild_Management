import React from 'react';
import {
  ToggleButton,
  ToggleButtonGroup,
  type ToggleButtonGroupProps,
} from '@/ui-bridge/material';
import { useTheme, type SxProps, type Theme } from '@/ui-bridge/material/styles';

type OptionValue = string | number;

export interface SegmentedControlOption<T extends OptionValue = OptionValue> {
  value: T;
  label: React.ReactNode;
  disabled?: boolean;
}

export interface SegmentedControlProps<T extends OptionValue = OptionValue>
  extends Omit<ToggleButtonGroupProps, 'value' | 'onChange' | 'children'> {
  value: T | null;
  options?: SegmentedControlOption<T>[];
  children?: React.ReactNode;
  onChange?: ((event: React.MouseEvent<HTMLElement>, value: T | null) => void) | ((value: T | null) => void);
  onValueChange?: (value: T) => void;
  allowDeselect?: boolean;
  optionSx?: SxProps<Theme>;
}

export const SegmentedControl = <T extends OptionValue = OptionValue>({
  value,
  options,
  children,
  onChange,
  onValueChange,
  allowDeselect = false,
  optionSx,
  sx,
  ...groupProps
}: SegmentedControlProps<T>) => {
  const theme = useTheme();
  const custom = (theme as any)?.custom;
  const token = custom?.components?.segmentedControl ?? {};

  const bg = token.bg ?? 'var(--cmp-segmented-bg, var(--sys-surface-elevated))';
  const border = token.border ?? 'var(--cmp-segmented-border, var(--sys-border-default))';
  const text = token.text ?? 'var(--sys-text-secondary, var(--color-text-secondary))';
  const selectedBg =
    token.selectedBg ?? 'var(--cmp-segmented-selected-bg, var(--color-accent-primary-subtle))';
  const selectedText = token.selectedText ?? 'var(--cmp-segmented-selected-text, var(--sys-text-primary))';

  const handleChange = (
    event: React.MouseEvent<HTMLElement>,
    nextValue: T | null
  ) => {
    if (!allowDeselect && nextValue === null) {
      return;
    }
    if (onChange) {
      if (onChange.length <= 1) {
        (onChange as (value: T | null) => void)(nextValue);
      } else {
        (onChange as (event: React.MouseEvent<HTMLElement>, value: T | null) => void)(event, nextValue);
      }
    }
    if (nextValue !== null) {
      onValueChange?.(nextValue);
    }
  };

  return (
    <ToggleButtonGroup
      exclusive
      value={value}
      onChange={handleChange}
      sx={{
        bgcolor: bg,
        border: `1px solid ${border}`,
        borderRadius: '999px',
        p: 0.25,
        '& .MuiToggleButton-root': {
          border: 0,
          borderRadius: '999px !important',
          color: text,
          textTransform: 'none',
          minHeight: 34,
          px: 1.2,
          py: 0.45,
          fontSize: '0.74rem',
          fontWeight: 700,
        },
        '& .MuiToggleButton-root.Mui-selected': {
          bgcolor: selectedBg,
          color: selectedText,
        },
        '& .MuiToggleButton-root.Mui-selected:hover': {
          bgcolor: selectedBg,
        },
        ...(sx as any),
      }}
      {...groupProps}
    >
      {Array.isArray(options) && options.length > 0
        ? options.map((option) => (
            <ToggleButton
              key={String(option.value)}
              value={option.value}
              disabled={option.disabled}
              sx={optionSx}
            >
              {option.label}
            </ToggleButton>
          ))
        : children}
    </ToggleButtonGroup>
  );
};

export default SegmentedControl;
