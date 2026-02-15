
import React, { useState } from 'react';
import { Link, useLocation } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { 
  Dashboard, 
  CalendarToday, 
  Groups, 
  MoreHoriz,
  Close,
  Book,
  Build,
  ReportProblem,
  Image as ImageIcon,
  Settings,
  ManageAccounts,
  MilitaryTech as MilitaryTechIcon,
  Palette,
  ColorLens,
  Translate,
  ExpandMore,
  ExpandLess,
} from '@/ui-bridge/icons-material';

import { useAuthStore } from '@/store';
import { canAccessAdminArea, getEffectiveRole } from '@/lib/permissions';
import {
  Drawer,
  Paper,
  Box,
  Typography,
  IconButton,
  useTheme,
  useMediaQuery,
  Stack,
  ButtonBase,
  Divider,
  Grid
} from '@/ui-bridge/material';
import {
  useThemeController,
  NEXUS_THEME_OPTIONS,
  NEXUS_COLOR_OPTIONS,
  getThemeModeIcon,
} from '@/theme/ThemeController';
import { useMotionTokens } from '@/theme/useMotionTokens';

export function BottomNavigation() {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const { user, viewRole } = useAuthStore();
  const [moreOpen, setMoreOpen] = useState(false);
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const [colorMenuOpen, setColorMenuOpen] = useState(false);
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);
  const theme = useTheme();
  const themeController = useThemeController();
  const motionTokens = useMotionTokens();
  const smallMobileQuery = theme?.breakpoints?.down ? theme.breakpoints.down('sm') : '(max-width: 600px)';
  const isSmallMobile = useMediaQuery(smallMobileQuery);
  const effectiveRole = getEffectiveRole(user?.role, viewRole);
  const canSeeAdmin = canAccessAdminArea(effectiveRole);
  const motionFastMs = Math.max(0, Math.round(motionTokens.fastMs));
  const pressTapScale = Math.max(0.9, Math.min(1, motionTokens.pressScale));

  const handleLanguageChange = (lng: 'en' | 'zh') => {
    i18n.changeLanguage(lng);
    localStorage.setItem('i18nextLng', lng);
  };

  const mainNav = [
    { label: t('nav.dashboard'), href: '/', icon: Dashboard },
    { label: t('nav.events'), href: '/events', icon: CalendarToday },
    { label: t('nav.guild_war'), href: '/guild-war', icon: MilitaryTechIcon },
    { label: t('nav.roster'), href: '/roster', icon: Groups },
  ];

  const moreItems = [
    { label: t('nav.tools'), href: '/tools', icon: Build },
    { label: t('nav.wiki'), href: '/wiki', icon: Book },
    { label: t('nav.gallery'), href: '/gallery', icon: ImageIcon },
  ];

  const adminItems = [
    { label: t('nav.admin'), href: '/admin', icon: ReportProblem },
  ];

  const isActive = (href: string) => location.pathname === href || (href !== '/' && location.pathname.startsWith(href));

  return (
    <>
      <Paper 
        elevation={0}
        className="bottom-nav"
        sx={{ 
          position: 'fixed', 
          bottom: 0, 
          left: 0, 
          right: 0, 
          zIndex: theme?.zIndex?.appBar ?? 1100,
          display: { lg: 'none' },
          borderTop: theme.custom?.border,
          bgcolor: 'background.paper',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 -2px 12px rgba(0,0,0,0.08)',
          pb: 'env(safe-area-inset-bottom)'
        }}
      >
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          height: { xs: 60, sm: 64 },
          px: { xs: 0.5, sm: 1 }
        }}>
          {mainNav.map((item) => {
            const active = isActive(item.href);
            return (
              <Box key={item.href} sx={{ flex: 1, height: '100%' }}>
                <ButtonBase
                  className="control"
                  data-ui="nav"
                  component={Link}
                  to={item.href}
                  aria-label={item.label}
                  aria-current={active ? 'page' : undefined}
                  data-active={active ? 'true' : undefined}
                  sx={{
                    width: '100%',
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    minWidth: { xs: 60, sm: 70 },
                    color: active ? 'primary.main' : 'text.secondary',
                    transition: `all ${motionFastMs}ms ${motionTokens.ease}`,
                    borderRadius: 2,
                    '&:active': {
                      bgcolor: 'action.hover',
                      transform: `scale(${pressTapScale})`,
                    }
                  }}
                >
                  <Box sx={{
                      p: { xs: 0.75, sm: 1 },
                      borderRadius: 3,
                      bgcolor: active ? 'action.selected' : 'transparent',
                      mb: { xs: 0.25, sm: 0.5 }
                  }}>
                      <item.icon sx={{ fontSize: isSmallMobile ? 18 : 20 }} />
                  </Box>
                  <Typography
                    variant="caption"
                    sx={{
                      fontSize: { xs: '0.55rem', sm: '0.6rem' },
                      fontWeight: 900,
                      textTransform: 'var(--cmp-nav-label-transform, uppercase)',
                      letterSpacing: 'var(--cmp-nav-label-letter-spacing, 0.1em)',
                      lineHeight: 1,
                      display: { xs: 'none', sm: 'block' }
                    }}
                  >
                      {item.label}
                  </Typography>
                </ButtonBase>
              </Box>
            );
          })}

          <Box sx={{ flex: 1, height: '100%' }}>
            <ButtonBase
              className="control"
              data-ui="nav"
              onClick={() => setMoreOpen(true)}
              aria-label={t('common.more')}
              data-active={moreOpen ? 'true' : undefined}
              sx={{
                width: '100%',
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                minWidth: { xs: 60, sm: 70 },
                color: moreOpen ? 'primary.main' : 'text.secondary',
                borderRadius: 2,
                transition: `all ${motionFastMs}ms ${motionTokens.ease}`,
                '&:active': {
                  bgcolor: 'action.hover',
                  transform: `scale(${pressTapScale})`,
                }
              }}
            >
              <Box sx={{
                  p: { xs: 0.75, sm: 1 },
                  borderRadius: 3,
                  bgcolor: moreOpen ? 'action.selected' : 'transparent',
                  mb: { xs: 0.25, sm: 0.5 }
              }}>
                  <MoreHoriz sx={{ fontSize: isSmallMobile ? 18 : 20 }} />
              </Box>
              <Typography
                variant="caption"
                sx={{
                  fontSize: { xs: '0.55rem', sm: '0.6rem' },
                  fontWeight: 900,
                  textTransform: 'var(--cmp-nav-label-transform, uppercase)',
                  letterSpacing: 'var(--cmp-nav-label-letter-spacing, 0.1em)',
                  lineHeight: 1,
                  display: { xs: 'none', sm: 'block' }
                }}
              >
                 {t('common.more')}
              </Typography>
            </ButtonBase>
          </Box>
        </Box>
      </Paper>

      {/* More Menu Drawer */}
      <Drawer
         anchor="bottom"
         open={moreOpen}
         onClose={() => setMoreOpen(false)}
         ModalProps={{ keepMounted: true }}
         PaperProps={{
            sx: {
                bgcolor: 'background.paper',
                borderTopLeftRadius: { xs: 24, sm: 32 },
                borderTopRightRadius: { xs: 24, sm: 32 },
                borderTop: theme.custom?.border,
                maxHeight: '80vh',
                backgroundImage: 'none'
            }
         }}
      >
         <Box sx={{ p: { xs: 2, sm: 3 }, pb: { xs: 3, sm: 4 } }}>
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              mb: { xs: 2, sm: 3 },
              borderBottom: `1px solid ${theme.palette.divider}`,
              pb: { xs: 1.5, sm: 2 }
            }}>
               <Typography
                 variant={isSmallMobile ? "subtitle1" : "h6"}
                 sx={{
                   fontWeight: 900,
                   textTransform: 'uppercase',
                   fontStyle: 'italic',
                   letterSpacing: '0.1em',
                   fontSize: { xs: '1rem', sm: '1.25rem' }
                 }}
               >
                  {t('common.more')}
               </Typography>
               <IconButton
                 onClick={() => setMoreOpen(false)}
                 size={isSmallMobile ? "small" : "medium"}
                 sx={{
                   bgcolor: 'action.hover',
                   minWidth: 40,
                   minHeight: 40
                 }}
               >
                   <Close sx={{ fontSize: isSmallMobile ? 18 : 20 }} />
               </IconButton>
            </Box>

            <Box sx={{
              display: 'grid',
              gridTemplateColumns: { xs: 'repeat(3, 1fr)', sm: 'repeat(3, 1fr)' },
              gap: { xs: 1.5, sm: 2 },
              mb: { xs: 2, sm: 3 }
            }}>
                {moreItems.map((item) => (
                  <Box key={item.href}>
                    <ButtonBase
                       className="control"
                       data-ui="button"
                       component={Link}
                       to={item.href}
                       onClick={() => setMoreOpen(false)}
                       sx={{
                           width: '100%',
                           flexDirection: 'column',
                           gap: { xs: 1, sm: 1.5 },
                           p: { xs: 1.5, sm: 2 },
                           borderRadius: { xs: 3, sm: 4 },
                           bgcolor: 'action.hover',
                           border: theme.custom?.cardBorder,
                           aspectRatio: '1/1',
                           minHeight: { xs: 80, sm: 100 },
                           transition: `all ${motionFastMs}ms ${motionTokens.ease}`,
                           '&:hover': {
                               borderColor: 'primary.main',
                               bgcolor: 'action.selected',
                               boxShadow: theme.custom?.glow
                           },
                           '&:active': {
                               transform: `scale(${pressTapScale})`
                           }
                       }}
                    >
                        <item.icon sx={{ fontSize: isSmallMobile ? 24 : 28, color: theme.palette.text.secondary }} />
                       <Typography
                         variant="caption"
                         align="center"
                         sx={{
                           fontSize: { xs: '0.55rem', sm: '0.6rem' },
                           fontWeight: 900,
                           textTransform: 'uppercase',
                           letterSpacing: '0.1em',
                           lineHeight: 1.2
                         }}
                       >
                           {item.label}
                       </Typography>
                    </ButtonBase>
                  </Box>
                ))}
            </Box>

            {canSeeAdmin && (
               <Box sx={{ mb: 3 }}>
                  <Typography variant="caption" display="block" sx={{ mb: 1.5, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em', color: 'text.secondary' }}>
                      {t('nav.admin')}
                  </Typography>
                  <Stack spacing={1}>
                      {adminItems.map(item => (
                         <ButtonBase 
                            className="control"
                            data-ui="button"
                            key={item.href}
                            component={Link}
                            to={item.href}
                            onClick={() => setMoreOpen(false)}
                            sx={{
                                width: '100%',
                                justifyContent: 'flex-start',
                                gap: 2,
                                p: 2,
                                borderRadius: 3,
                                bgcolor: theme.palette.error.main + '15', // 15 = low opacity hex
                                border: `1px solid ${theme.palette.error.main}30`,
                                color: theme.palette.error.main,
                                transition: `all ${motionFastMs}ms ${motionTokens.ease}`,
                                '&:hover': {
                                    bgcolor: theme.palette.error.main + '25'
                                }
                            }}
                         >
                             <item.icon sx={{ fontSize: 18 }} />
                            <Typography variant="caption" sx={{ fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{item.label}</Typography>
                         </ButtonBase>
                      ))}
                  </Stack>
               </Box>
            )}
            
            <Divider sx={{ my: 2 }} />

            <Stack spacing={1}>
                <ButtonBase className="control" data-ui="button" component={Link} to="/profile" onClick={() => setMoreOpen(false)} sx={{ width: '100%', justifyContent: 'flex-start', gap: 2, p: 2, borderRadius: 3, transition: `all ${motionFastMs}ms ${motionTokens.ease}`, '&:hover': { bgcolor: 'action.hover' } }}>
                     <ManageAccounts sx={{ fontSize: 20, color: theme.palette.text.secondary }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{t('nav.profile')}</Typography>
                </ButtonBase>

                <ButtonBase
                  className="control"
                  data-ui="button"
                  onClick={() => setThemeMenuOpen((prev) => !prev)}
                  sx={{ width: '100%', justifyContent: 'space-between', gap: 2, p: 2, borderRadius: 3, transition: `all ${motionFastMs}ms ${motionTokens.ease}`, '&:hover': { bgcolor: 'action.hover' } }}
                >
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Palette sx={{ fontSize: 20, color: theme.palette.text.secondary }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                      {t('settings.interface_theme', { defaultValue: t('settings.visual_theme') })}
                    </Typography>
                  </Stack>
                  {themeMenuOpen ? <ExpandLess sx={{ fontSize: 18 }} /> : <ExpandMore sx={{ fontSize: 18 }} />}
                </ButtonBase>
                {themeMenuOpen && (
                  <Stack spacing={0.5} sx={{ pl: 4 }}>
                    {NEXUS_THEME_OPTIONS.map((opt: any) => {
                      const ThemeIcon = getThemeModeIcon(opt.id);
                      const isSelected = themeController.currentTheme === opt.id;

                      return (
                        <ButtonBase
                          className="control"
                          data-ui="button"
                          key={`mobile-theme-${opt.id}`}
                          onClick={() => themeController.setTheme(opt.id)}
                          sx={{
                            width: '100%',
                            justifyContent: 'flex-start',
                            p: 1.25,
                            borderRadius: 2,
                            bgcolor: isSelected ? 'action.selected' : 'transparent',
                            transition: `all ${motionFastMs}ms ${motionTokens.ease}`,
                            '&:hover': { bgcolor: 'action.hover' },
                          }}
                        >
                          <Stack direction="row" spacing={1.25} alignItems="center">
                            <ThemeIcon
                              sx={{
                                fontSize: 16,
                                color: isSelected ? 'primary.main' : 'text.secondary',
                                flexShrink: 0,
                              }}
                            />
                            <Typography variant="body2" sx={{ fontWeight: 700 }}>
                              {t(`theme_menu.themes.${opt.id}.label`, { defaultValue: opt.label })}
                            </Typography>
                          </Stack>
                        </ButtonBase>
                      );
                    })}
                  </Stack>
                )}

                <ButtonBase
                  className="control"
                  data-ui="button"
                  onClick={() => setColorMenuOpen((prev) => !prev)}
                  sx={{ width: '100%', justifyContent: 'space-between', gap: 2, p: 2, borderRadius: 3, transition: `all ${motionFastMs}ms ${motionTokens.ease}`, '&:hover': { bgcolor: 'action.hover' } }}
                >
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <ColorLens sx={{ fontSize: 20, color: theme.palette.text.secondary }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                      {t('settings.color_palette')}
                    </Typography>
                  </Stack>
                  {colorMenuOpen ? <ExpandLess sx={{ fontSize: 18 }} /> : <ExpandMore sx={{ fontSize: 18 }} />}
                </ButtonBase>
                {colorMenuOpen && (
                  <Stack spacing={0.5} sx={{ pl: 4 }}>
                    {NEXUS_COLOR_OPTIONS.map((opt: any) => (
                      <ButtonBase
                        className="control"
                        data-ui="button"
                        key={`mobile-color-${opt.id}`}
                        onClick={() => themeController.setColor(opt.id)}
                        sx={{
                          width: '100%',
                          justifyContent: 'flex-start',
                          p: 1.25,
                          borderRadius: 2,
                          bgcolor: themeController.currentColor === opt.id ? 'action.selected' : 'transparent',
                          transition: `all ${motionFastMs}ms ${motionTokens.ease}`,
                          '&:hover': { bgcolor: 'action.hover' },
                        }}
                      >
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {t(`theme_menu.colors.${opt.id}.label`, { defaultValue: opt.label })}
                        </Typography>
                      </ButtonBase>
                    ))}
                  </Stack>
                )}

                <ButtonBase
                  className="control"
                  data-ui="button"
                  onClick={() => setLanguageMenuOpen((prev) => !prev)}
                  sx={{ width: '100%', justifyContent: 'space-between', gap: 2, p: 2, borderRadius: 3, transition: `all ${motionFastMs}ms ${motionTokens.ease}`, '&:hover': { bgcolor: 'action.hover' } }}
                >
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Translate sx={{ fontSize: 20, color: theme.palette.text.secondary }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                      {t('settings.language')}
                    </Typography>
                  </Stack>
                  {languageMenuOpen ? <ExpandLess sx={{ fontSize: 18 }} /> : <ExpandMore sx={{ fontSize: 18 }} />}
                </ButtonBase>
                {languageMenuOpen && (
                  <Stack spacing={0.5} sx={{ pl: 4 }}>
                    <ButtonBase
                      className="control"
                      data-ui="button"
                      onClick={() => handleLanguageChange('en')}
                      sx={{
                        width: '100%',
                        justifyContent: 'flex-start',
                        p: 1.25,
                        borderRadius: 2,
                        bgcolor: !i18n.language.startsWith('zh') ? 'action.selected' : 'transparent',
                        transition: `all ${motionFastMs}ms ${motionTokens.ease}`,
                        '&:hover': { bgcolor: 'action.hover' },
                      }}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {t('settings.language_english')}
                      </Typography>
                    </ButtonBase>
                    <ButtonBase
                      className="control"
                      data-ui="button"
                      onClick={() => handleLanguageChange('zh')}
                      sx={{
                        width: '100%',
                        justifyContent: 'flex-start',
                        p: 1.25,
                        borderRadius: 2,
                        bgcolor: i18n.language.startsWith('zh') ? 'action.selected' : 'transparent',
                        transition: `all ${motionFastMs}ms ${motionTokens.ease}`,
                        '&:hover': { bgcolor: 'action.hover' },
                      }}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {t('settings.language_chinese')}
                      </Typography>
                    </ButtonBase>
                  </Stack>
                )}

                <ButtonBase className="control" data-ui="button" component={Link} to="/settings" onClick={() => setMoreOpen(false)} sx={{ width: '100%', justifyContent: 'flex-start', gap: 2, p: 2, borderRadius: 3, transition: `all ${motionFastMs}ms ${motionTokens.ease}`, '&:hover': { bgcolor: 'action.hover' } }}>
                     <Settings sx={{ fontSize: 20, color: theme.palette.text.secondary }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{t('nav.settings')}</Typography>
            </ButtonBase>
            </Stack>
         </Box>
      </Drawer>
    </>
  );
}
