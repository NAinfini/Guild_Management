import React from 'react';
import { Box, type SxProps, type Theme } from '@/ui-bridge/material';
import { useTheme } from '@/ui-bridge/material/styles';

export interface ThemedPanelBoxProps {
  left: React.ReactNode;
  right?: React.ReactNode;
  children: React.ReactNode;
  variant?: 'default' | 'pool' | 'team';
  accentColor?: string;
  dropOver?: boolean;
  rootRef?: React.Ref<HTMLDivElement>;
  className?: string;
  sx?: SxProps<Theme>;
  headerSx?: SxProps<Theme>;
  contentSx?: SxProps<Theme>;
}

export function ThemedPanelBox({
  left,
  right,
  variant = 'default',
  children,
  dropOver = false,
  rootRef,
  className,
  sx,
  headerSx,
  contentSx,
}: ThemedPanelBoxProps) {
  const theme = useTheme();
  const custom = (theme as any)?.custom ?? {};
  const panel = custom?.components?.panel ?? {};
  const semanticBorder = custom?.semantic?.border ?? {};
  const semanticInteractive = custom?.semantic?.interactive ?? {};
  const semanticText = custom?.semantic?.text ?? {};
  const card = custom?.components?.card ?? {};

  const panelBg = card.bg ?? panel.bg ?? 'var(--cmp-panel-bg)';
  const headerBg = panel.headerBg ?? card.bg ?? 'var(--cmp-panel-header-bg)';
  const panelBorder = card.border ?? panel.border ?? semanticBorder.default ?? 'var(--cmp-panel-border)';
  const dropBg = panel.dropTargetBg ?? semanticInteractive.hover ?? 'var(--cmp-panel-drop-target-bg)';
  const dropBorder = panel.dropTargetBorder ?? semanticInteractive.accent ?? 'var(--cmp-panel-drop-target-border)';
  const panelText = semanticText.primary ?? theme.palette.text.primary;
  const panelShadow = card.shadow ?? theme.shadows[1];
  const variantBg = variant === 'pool'
    ? (panel.poolBg ?? panelBg)
    : variant === 'team'
      ? (panel.teamBg ?? panelBg)
      : panelBg;
  const variantHeaderBg = variant === 'pool'
    ? (panel.poolHeaderBg ?? headerBg)
    : variant === 'team'
      ? (panel.teamHeaderBg ?? headerBg)
      : headerBg;
  const rootClassName = ['ui-card', 'control', 'themed-panel-box', className].filter(Boolean).join(' ');
  const contentSxResolved = contentSx ?? {};

  return (
    <Box
      ref={rootRef}
      className={rootClassName}
      data-ui="card"
      data-ui-panel={variant}
      sx={
        sx
          ? [
              {
                borderRadius: 'var(--cmp-card-radius)',
                border: 'var(--theme-border-width, 1px) var(--theme-border-style, solid)',
                borderColor: dropOver ? dropBorder : panelBorder,
                bgcolor: dropOver ? dropBg : variantBg,
                color: panelText,
                boxShadow: panelShadow,
                overflow: 'hidden',
                transition: 'border-color 160ms ease, background-color 160ms ease',
              },
              sx,
            ]
          : {
              borderRadius: 'var(--cmp-card-radius)',
              border: 'var(--theme-border-width, 1px) var(--theme-border-style, solid)',
              borderColor: dropOver ? dropBorder : panelBorder,
              bgcolor: dropOver ? dropBg : variantBg,
              color: panelText,
              boxShadow: panelShadow,
              overflow: 'hidden',
              transition: 'border-color 160ms ease, background-color 160ms ease',
            }
      }
    >
      <Box
        data-ui="card-header"
        sx={
          headerSx
            ? [
                {
                  px: 1.75,
                  py: 1.1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottom: 'var(--theme-border-width, 1px) var(--theme-border-style, solid)',
                  borderColor: panelBorder,
                  bgcolor: variantHeaderBg,
                  color: panelText,
                  gap: 1.5,
                },
                headerSx,
              ]
            : {
                px: 1.75,
                py: 1.1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: 'var(--theme-border-width, 1px) var(--theme-border-style, solid)',
                borderColor: panelBorder,
                bgcolor: variantHeaderBg,
                color: panelText,
                gap: 1.5,
              }
        }
      >
        <Box sx={{ minWidth: 0, flex: 1 }}>{left}</Box>
        {right ? <Box sx={{ flexShrink: 0 }}>{right}</Box> : null}
      </Box>
      <Box data-ui="card-content" sx={{ p: 1.75, ...contentSxResolved }}>{children}</Box>
    </Box>
  );
}

export default ThemedPanelBox;
