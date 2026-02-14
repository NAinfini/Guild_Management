import React from 'react';
import { Box, ButtonBase, Stack } from '@mui/material';
import { useTheme, type SxProps, type Theme } from '@mui/material/styles';
import { SortArrows } from './SortArrows';

type SortDirection = 'asc' | 'desc';

export interface ThemedSortButtonOption<T extends string = string> {
  value: T;
  label: React.ReactNode;
}

export interface ThemedSortButtonGroupProps<T extends string = string> {
  sortState: { field: T; direction: SortDirection };
  options: ThemedSortButtonOption<T>[];
  onFieldChange: (field: T) => void;
  sx?: SxProps<Theme>;
  className?: string;
}

export function ThemedSortButtonGroup<T extends string = string>({
  sortState,
  options,
  onFieldChange,
  sx,
  className,
}: ThemedSortButtonGroupProps<T>) {
  const theme = useTheme();
  const custom = (theme as any)?.custom ?? {};
  const segmented = custom?.components?.segmentedControl ?? {};
  const panel = custom?.components?.panel ?? {};
  const semanticText = custom?.semantic?.text ?? {};
  const interactive = custom?.semantic?.interactive ?? {};

  const bg = panel.controlBg ?? segmented.bg ?? 'var(--cmp-segmented-bg)';
  const border = segmented.border ?? 'var(--cmp-segmented-border)';
  const text = segmented.text ?? semanticText.secondary ?? theme.palette.text.secondary;
  const selectedBg = segmented.selectedBg ?? 'var(--cmp-segmented-selected-bg)';
  const selectedText = segmented.selectedText ?? semanticText.primary ?? theme.palette.text.primary;
  const selectedBorder = segmented.selectedBorder ?? border;
  const hoverBg = segmented.hoverBg ?? interactive.hover ?? 'var(--sys-interactive-hover)';
  const rootClassName = ['ui-nav', 'control', 'themed-sort-group', className].filter(Boolean).join(' ');

  return (
    <Box
      className={rootClassName}
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
              overflow: 'hidden',
            }
      }
    >
      {options.map((option, index) => {
        const active = option.value === sortState.field;
        const isLast = index === options.length - 1;
        const isFirst = index === 0;

        return (
          <ButtonBase
            key={String(option.value)}
            className="control ui-button"
            data-ui="button"
            onClick={() => onFieldChange(option.value)}
            sx={{
              px: 1.2,
              py: 0.45,
              minHeight: 34,
              borderRadius: isFirst || isLast ? '999px' : 0,
              color: active ? selectedText : text,
              bgcolor: active ? selectedBg : 'transparent',
              fontFamily: 'var(--theme-font-body)',
              boxShadow: active ? `inset 0 0 0 1px ${selectedBorder}` : 'none',
              borderRight: !isLast ? 'var(--theme-border-width, 1px) var(--theme-border-style, solid)' : 'none',
              borderColor: border,
              transition: 'background-color 180ms ease, color 180ms ease, box-shadow 180ms ease',
              '&:hover': {
                bgcolor: active ? selectedBg : hoverBg,
              },
            }}
          >
            <Stack
              direction="row"
              alignItems="center"
              spacing={0.2}
              sx={{ fontSize: '0.72rem', fontWeight: 800 }}
            >
              <span>{option.label}</span>
              <SortArrows isActive={active} direction={sortState.direction} />
            </Stack>
          </ButtonBase>
        );
      })}
    </Box>
  );
}

export default ThemedSortButtonGroup;
