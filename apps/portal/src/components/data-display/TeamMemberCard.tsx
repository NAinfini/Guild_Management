import React from 'react';
import { Box, Stack, Typography, useTheme, alpha } from '@/ui-bridge/material';
import { 
  EmojiEvents, 
  ElectricBolt, 
  Shield, 
  Favorite, 
  AutoAwesome,
  Logout
} from '@/ui-bridge/icons-material';
import { ThemedIconButton } from '@/components/primitives/themed-controls';
import { 
  formatPower, 
  formatClassDisplayName, 
  getMemberCardAccentColors, 
  getClassPillTone,
  buildMemberAccentGradient,
  getClassBackgroundColor,
} from '@/lib/utils';
import { User, ClassType } from '@/types';
import { useTranslation } from 'react-i18next';

export interface TeamMemberCardProps {
  member: User;
  variant?: 'compact' | 'default' | 'draggable';
  selected?: boolean;
  highlighted?: boolean;
  role?: string; // For guild war role tags (lead, dmg, tank, healer, support)
  canManage?: boolean;
  onClick?: (id: string, e: React.MouseEvent) => void;
  onDoubleClick?: (id: string, e: React.MouseEvent) => void;
  onKick?: () => void;
  // Draggable-specific props
  draggableProps?: {
    attributes: any;
    listeners: any;
    setNodeRef: any;
    isDragging: boolean;
  };
}

export function TeamMemberCard({
  member,
  variant = 'default',
  selected = false,
  highlighted = false,
  role,
  canManage = false,
  onClick,
  onDoubleClick,
  onKick,
  draggableProps,
}: TeamMemberCardProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  
  const accentColors = getMemberCardAccentColors(member.classes as ClassType[] | undefined, theme);
  const primaryClass = member.classes?.[0] as ClassType | undefined;
  const classTone = getClassPillTone(primaryClass, theme);
  const classLabel = primaryClass ? formatClassDisplayName(primaryClass) : t('common.unknown');
  const cardBaseColor = getClassBackgroundColor(primaryClass);
  const inverseText = theme.custom?.semantic?.text?.inverse ?? theme.palette.common?.white ?? '#FFFFFF';

  const getRoleIcon = (r?: string) => {
    switch(r) {
      case 'lead': return <EmojiEvents sx={{ fontSize: 14, color: theme.custom?.warRoles?.lead?.main || theme.palette.warning.main }} />;
      case 'dmg': return <ElectricBolt sx={{ fontSize: 14, color: theme.custom?.warRoles?.dps?.main || theme.palette.error.main }} />;
      case 'tank': return <Shield sx={{ fontSize: 14, color: theme.custom?.warRoles?.tank?.main || theme.palette.primary.main }} />;
      case 'healer': return <Favorite sx={{ fontSize: 14, color: theme.custom?.warRoles?.heal?.main || theme.palette.success.main }} />;
      case 'support': return <AutoAwesome sx={{ fontSize: 14, color: theme.custom?.eventTypes?.other?.main ?? theme.palette.secondary.main }} />;
      default: return null;
    }
  };

  // Variant-specific sizing
  const sizing = {
    compact: {
      padding: 1,
      paddingRight: 1,
      borderRadius: 1.5,
      borderWidth: '1px',
      fontSize: '0.75rem',
      pillPx: 0.6,
      pillPy: 0.2,
      pillFontSize: '0.65rem',
      iconSize: 18,
      kickSize: 20,
    },
    default: {
      padding: 1.25,
      paddingRight: 1,
      borderRadius: 2,
      borderWidth: '1px',
      fontSize: '0.875rem',
      pillPx: 1,
      pillPy: 0.15,
      pillFontSize: '0.62rem',
      iconSize: 20,
      kickSize: 24,
    },
  };

  const size = variant === 'compact' ? sizing.compact : sizing.default;
  const isDragging = draggableProps?.isDragging ?? false;
  const { attributes, listeners, setNodeRef } = draggableProps || {};

  // For event style, we want explicit color control
  const cardColor = alpha(cardBaseColor, 0.24);
  const cardBorderColor = alpha(cardBaseColor, 0.42);

  return (
    <Box
      data-testid={`participant-card-${member.id}`}
      ref={setNodeRef}
      {...(variant === 'draggable' && canManage ? listeners : {})}
      {...(variant === 'draggable' && canManage ? attributes : {})}
      onClick={(e: React.MouseEvent) => onClick?.(member.id, e)}
      onDoubleClick={(e: React.MouseEvent) => onDoubleClick?.(member.id, e)}
      sx={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 1.2, // Matches Events spacing={1.2}
        p: size.padding,
        pr: variant === 'default' ? size.paddingRight : size.padding,
        borderRadius: size.borderRadius,
        border: size.borderWidth + ' solid',
        borderColor: (() => {
           if (selected) return theme.palette.primary.main;
           if (highlighted) return theme.palette.warning.main;
           return cardBorderColor;
        })(),
        bgcolor: (() => {
           if (selected) return alpha(theme.palette.primary.main, 0.15);
           if (highlighted) return alpha(theme.palette.warning.main, 0.2);
           return cardColor;
        })(),
        cursor: onClick || (variant === 'draggable' && canManage) ? 'pointer' : 'default',
        opacity: isDragging ? 0.4 : 1,
        transition: 'all 0.2s',
        overflow: 'hidden',
        backgroundClip: 'padding-box',
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0, // Event style uses inset 0, not inset 2px
          background: buildMemberAccentGradient(accentColors),
          pointerEvents: 'none',
          zIndex: 0,
        },
        '&:hover': {
          borderColor: highlighted 
            ? theme.palette.warning.main 
            : selected 
              ? theme.palette.primary.main 
              : alpha(cardBaseColor, 0.85),
          boxShadow: 1.5,
          transform: 'translateY(-1px)'
        },
        '&:active': variant === 'draggable' && canManage ? { 
          cursor: 'grabbing',
          transform: 'scale(0.98)',
        } : undefined,
      }}
    >
      {/* Keep participant metadata in its own row so action controls cannot overlap in dense grids. */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1.2} sx={{ position: 'relative', zIndex: 1, width: '100%' }}>
         <Box sx={{ minWidth: 0, flex: 1 }} data-testid={`participant-meta-${member.id}`}>
             <Stack direction="row" alignItems="center" spacing={1}>
                 {variant === 'draggable' && role && (
                   <Box sx={{ flexShrink: 0, display: 'flex', alignItems: 'center', mr: 0.5 }}>
                     {getRoleIcon(role)}
                   </Box>
                 )}
                 <Typography 
                   variant="body2" 
                   noWrap 
                   sx={{ 
                     fontWeight: 900, 
                     color: 'common.white', 
                     fontSize: size.fontSize,
                     mb: 0.5 
                   }}
                 >
                   {member.username}
                 </Typography>
             </Stack>
             
             <Stack direction="row" spacing={0.6} sx={{ alignItems: 'center', flexWrap: 'nowrap' }}>
               <Box sx={{
                   px: size.pillPx, py: size.pillPy, borderRadius: 6,
                   fontSize: size.pillFontSize, fontWeight: 900, lineHeight: 1.2,
                   bgcolor: classTone.bg,
                   color: classTone.text,
                   border: 1,
                   borderColor: alpha(classTone.main, 0.55),
                   textTransform: 'uppercase',
                   whiteSpace: 'nowrap',
               }}>
                   {classLabel}
               </Box>
               <Box sx={{
                   px: size.pillPx, py: size.pillPy, borderRadius: 6,
                   fontSize: size.pillFontSize, fontWeight: 800, lineHeight: 1.2, 
                   fontFamily: 'monospace',
                   bgcolor: alpha(theme.palette.primary.light, 0.14),
                   color: 'common.white',
                   border: 1,
                   borderColor: alpha(theme.palette.primary.light, 0.4),
                   flexShrink: 0,
               }}>
                   {formatPower(member.power)}
                </Box>
             </Stack>
         </Box>
         
         {canManage && onKick && (
            <ThemedIconButton
              data-testid={`participant-kick-${member.id}`}
              size="small"
              variant="overlayDanger"
              data-ui="square-icon-button" // Override circular shape
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                onKick();
              }}
              sx={{
                width: size.kickSize,
                height: size.kickSize,
                minWidth: size.kickSize,
                borderRadius: '6px !important', // Force square shape
                aspectRatio: 'unset', // Remove 1:1 aspect ratio
              }}
            >
              <Logout sx={{ fontSize: size.kickSize * 0.5 }} />
            </ThemedIconButton>
         )}
      </Stack>
    </Box>
  );
}
