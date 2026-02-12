
import React, { useState } from 'react';
import { Link, useLocation } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { motion, useReducedMotion } from 'motion/react';
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
} from '@mui/icons-material';

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
} from '@mui/material';
import {
  useThemeController,
  NEXUS_THEME_OPTIONS,
  NEXUS_COLOR_OPTIONS,
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
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const prefersReducedMotion = useReducedMotion();
  const effectiveRole = getEffectiveRole(user?.role, viewRole);
  const canSeeAdmin = canAccessAdminArea(effectiveRole);
  const motionEase = React.useMemo<[number, number, number, number]>(() => {
    const match = motionTokens.ease.trim().match(/^cubic-bezier\(([^)]+)\)$/i);
    if (!match?.[1]) {
      return [0.22, 1, 0.36, 1];
    }

    const values = match[1]
      .split(',')
      .map((part) => Number.parseFloat(part.trim()))
      .filter((part) => Number.isFinite(part));

    if (values.length !== 4) {
      return [0.22, 1, 0.36, 1];
    }

    return [values[0]!, values[1]!, values[2]!, values[3]!];
  }, [motionTokens.ease]);
  const motionFastMs = Math.max(0, Math.round(motionTokens.fastMs));
  const motionMediumMs = Math.max(0, Math.round(motionTokens.mediumMs));
  const motionFastSec = motionFastMs / 1000;
  const motionMediumSec = motionMediumMs / 1000;
  const navDelayStepSec = motionFastSec / 5;
  const navDelayCapSec = motionMediumSec;
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
        sx={{ 
          position: 'fixed', 
          bottom: 0, 
          left: 0, 
          right: 0, 
          zIndex: theme.zIndex.appBar,
          display: { lg: 'none' },
          borderTop: theme.custom?.border,
          bgcolor: 'background.paper',
          backdropFilter: 'blur(20px)',
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
          {mainNav.map((item, index) => {
            const active = isActive(item.href);
            return (
              <motion.div
                key={item.href}
                style={{ flex: 1, height: '100%' }}
                initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
                animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
                transition={
                  prefersReducedMotion
                    ? undefined
                    : {
                        duration: motionMediumSec,
                        delay: Math.min(index * navDelayStepSec, navDelayCapSec),
                        ease: motionEase,
                      }
                }
                whileTap={prefersReducedMotion ? undefined : { scale: pressTapScale }}
              >
                <ButtonBase
                  className="control"
                  data-ui="nav"
                  component={Link}
                  to={item.href}
                  aria-label={item.label}
                  aria-current={active ? 'page' : undefined}
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
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      lineHeight: 1,
                      display: { xs: 'none', sm: 'block' }
                    }}
                  >
                      {item.label}
                  </Typography>
                </ButtonBase>
              </motion.div>
            );
          })}

          <motion.div
            style={{ flex: 1, height: '100%' }}
            initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
            animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
            transition={prefersReducedMotion ? undefined : { duration: motionMediumSec, delay: navDelayCapSec, ease: motionEase }}
            whileTap={prefersReducedMotion ? undefined : { scale: pressTapScale }}
          >
            <ButtonBase
              className="control"
              data-ui="nav"
              onClick={() => setMoreOpen(true)}
              aria-label={t('common.more')}
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
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  lineHeight: 1,
                  display: { xs: 'none', sm: 'block' }
                }}
              >
                 {t('common.more')}
              </Typography>
            </ButtonBase>
          </motion.div>
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
                {moreItems.map((item, index) => (
                  <motion.div
                    key={item.href}
                    initial={prefersReducedMotion ? false : { opacity: 0, y: 10, scale: 0.98 }}
                    animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
                    transition={
                      prefersReducedMotion
                        ? undefined
                        : {
                            duration: motionMediumSec,
                            delay: Math.min(index * navDelayStepSec, navDelayCapSec),
                            ease: motionEase,
                          }
                    }
                    whileHover={prefersReducedMotion ? undefined : { y: motionTokens.liftPx }}
                    whileTap={prefersReducedMotion ? undefined : { scale: pressTapScale }}
                  >
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
                  </motion.div>
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
                    {NEXUS_THEME_OPTIONS.map((opt: any) => (
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
                          bgcolor: themeController.currentTheme === opt.id ? 'action.selected' : 'transparent',
                          transition: `all ${motionFastMs}ms ${motionTokens.ease}`,
                          '&:hover': { bgcolor: 'action.hover' },
                        }}
                      >
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {t(`theme_menu.themes.${opt.id}.label`, { defaultValue: opt.label })}
                        </Typography>
                      </ButtonBase>
                    ))}
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
