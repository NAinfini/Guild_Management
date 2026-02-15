import React from 'react';
import { Box, ButtonBase } from '@/ui-bridge/material';
import { useTheme, type SxProps, type Theme } from '@/ui-bridge/material/styles';

export interface ThemedTabOption<T extends string = string> {
  value: T;
  label: React.ReactNode;
}

export interface ThemedTabControlProps<T extends string = string> {
  value: T;
  options: ThemedTabOption<T>[];
  onValueChange: (next: T) => void;
  sx?: SxProps<Theme>;
  className?: string;
}

export function ThemedTabControl<T extends string = string>({
  value,
  options,
  onValueChange,
  sx,
  className,
}: ThemedTabControlProps<T>) {
  const theme = useTheme();
  const custom = (theme as any)?.custom ?? {};
  const segmented = custom?.components?.segmentedControl ?? {};
  const panel = custom?.components?.panel ?? {};
  const semanticText = custom?.semantic?.text ?? {};
  const interactive = custom?.semantic?.interactive ?? {};

  const bg = segmented.bg ?? panel.controlBg ?? 'var(--cmp-segmented-bg)';
  const border = segmented.border ?? 'var(--cmp-segmented-border)';
  const text = segmented.text ?? semanticText.secondary ?? theme.palette.text.secondary;
  const selectedBg = segmented.selectedBg ?? 'var(--cmp-segmented-selected-bg)';
  const selectedText = segmented.selectedText ?? semanticText.primary ?? theme.palette.text.primary;
  const selectedBorder = segmented.selectedBorder ?? border;
  const hoverBg = segmented.hoverBg ?? interactive.hover ?? 'var(--sys-interactive-hover)';
  const rootClassName = ['ui-nav', 'control', 'themed-segmented-control', className].filter(Boolean).join(' ');

  return (
    <Box
      className={rootClassName}
      role="tablist"
      data-ui="nav"
      sx={
        sx
          ? [
              {
                display: 'inline-flex',
                alignItems: 'stretch',
                borderRadius: '999px',
                border: 'var(--theme-border-width, 1px) var(--theme-border-style, solid)',
                borderColor: border,
                bgcolor: bg,
                boxShadow: 'var(--cmp-card-shadow)',
                p: 0.25,
                gap: 0.25,
                overflow: 'hidden',
              },
              sx,
            ]
          : {
              display: 'inline-flex',
              alignItems: 'stretch',
              borderRadius: '999px',
              border: 'var(--theme-border-width, 1px) var(--theme-border-style, solid)',
              borderColor: border,
              bgcolor: bg,
              boxShadow: 'var(--cmp-card-shadow)',
              p: 0.25,
              gap: 0.25,
              overflow: 'hidden',
            }
      }
    >
      {options.map((option) => {
        const active = option.value === value;

        return (
          <ButtonBase
            key={String(option.value)}
            className="control ui-button"
            role="tab"
            aria-selected={active}
            data-ui="button"
            onClick={() => onValueChange(option.value)}
            sx={{
              px: 1.9,
              py: 0.6,
              minHeight: 34,
              borderRadius: '999px',
              color: active ? selectedText : text,
              bgcolor: active ? selectedBg : 'transparent',
              fontFamily: 'var(--theme-font-body)',
              fontSize: '0.74rem',
              fontWeight: active ? 800 : 700,
              border: 'var(--theme-border-width, 1px) var(--theme-border-style, solid)',
              borderColor: active ? selectedBorder : 'transparent',
              transition: 'background-color 180ms ease, color 180ms ease, box-shadow 180ms ease',
              '&:hover': {
                bgcolor: active ? selectedBg : hoverBg,
              },
              '& .MuiSvgIcon-root': {
                color: 'inherit',
              },
            }}
          >
            {option.label}
          </ButtonBase>
        );
      })}
    </Box>
  );
}

export default ThemedTabControl;
