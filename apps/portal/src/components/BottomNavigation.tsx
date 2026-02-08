
import React, { useState } from 'react';
import { Link, useLocation } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { motion, useReducedMotion } from 'motion/react';
import { 
  LayoutDashboard, 
  CalendarDays, 
  Swords, 
  Users, 
  MoreHorizontal,
  X,
  BookOpen,
  Hammer,
  ShieldAlert,
  Image as ImageIcon,
  Settings,
  UserCog
} from 'lucide-react';
import { useAuthStore } from '../store';
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

export function BottomNavigation() {
  const { t } = useTranslation();
  const location = useLocation();
  const { user, viewRole } = useAuthStore();
  const [moreOpen, setMoreOpen] = useState(false);
  const theme = useTheme();
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const prefersReducedMotion = useReducedMotion();
  const effectiveRole = viewRole || user?.role;
  const canSeeAdmin = effectiveRole === 'admin' || effectiveRole === 'moderator';

  const mainNav = [
    { label: t('nav.dashboard'), href: '/', icon: LayoutDashboard },
    { label: t('nav.events'), href: '/events', icon: CalendarDays },
    { label: t('nav.guild_war'), href: '/guild-war', icon: Swords },
    { label: t('nav.roster'), href: '/roster', icon: Users },
  ];

  const moreItems = [
    { label: t('nav.tools'), href: '/tools', icon: Hammer },
    { label: t('nav.wiki'), href: '/wiki', icon: BookOpen },
    { label: 'Gallery', href: '/gallery', icon: ImageIcon },
  ];

  const adminItems = [
    { label: t('nav.admin'), href: '/admin', icon: ShieldAlert },
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
                    : { duration: 0.25, delay: Math.min(index * 0.03, 0.12), ease: [0.22, 1, 0.36, 1] }
                }
                whileTap={prefersReducedMotion ? undefined : { scale: 0.96 }}
              >
                <ButtonBase
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
                    transition: 'all 0.2s',
                    borderRadius: 2,
                    '&:active': {
                      bgcolor: 'action.hover'
                    }
                  }}
                >
                  <Box sx={{
                      p: { xs: 0.75, sm: 1 },
                      borderRadius: 3,
                      bgcolor: active ? 'action.selected' : 'transparent',
                      mb: { xs: 0.25, sm: 0.5 }
                  }}>
                      <item.icon size={isSmallMobile ? 18 : 20} />
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
            transition={prefersReducedMotion ? undefined : { duration: 0.25, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            whileTap={prefersReducedMotion ? undefined : { scale: 0.96 }}
          >
            <ButtonBase
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
                '&:active': {
                  bgcolor: 'action.hover'
                }
              }}
            >
              <Box sx={{
                  p: { xs: 0.75, sm: 1 },
                  borderRadius: 3,
                  bgcolor: moreOpen ? 'action.selected' : 'transparent',
                  mb: { xs: 0.25, sm: 0.5 }
              }}>
                  <MoreHorizontal size={isSmallMobile ? 18 : 20} />
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
                  <X size={isSmallMobile ? 18 : 20} />
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
                    transition={prefersReducedMotion ? undefined : { duration: 0.22, delay: Math.min(index * 0.035, 0.14), ease: [0.22, 1, 0.36, 1] }}
                    whileHover={prefersReducedMotion ? undefined : { y: -2 }}
                    whileTap={prefersReducedMotion ? undefined : { scale: 0.97 }}
                  >
                    <ButtonBase
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
                           transition: 'all 0.2s',
                           '&:hover': {
                               borderColor: 'primary.main',
                               bgcolor: 'action.selected',
                               boxShadow: theme.custom?.glow
                           },
                           '&:active': {
                               transform: 'scale(0.95)'
                           }
                       }}
                    >
                       <item.icon size={isSmallMobile ? 24 : 28} style={{ color: theme.palette.text.secondary }} />
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
                      Command & Control
                  </Typography>
                  <Stack spacing={1}>
                      {adminItems.map(item => (
                         <ButtonBase 
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
                                '&:hover': {
                                    bgcolor: theme.palette.error.main + '25'
                                }
                            }}
                         >
                            <item.icon size={18} />
                            <Typography variant="caption" sx={{ fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{item.label}</Typography>
                         </ButtonBase>
                      ))}
                  </Stack>
               </Box>
            )}
            
            <Divider sx={{ my: 2 }} />

            <Stack spacing={1}>
                <ButtonBase component={Link} to="/profile" onClick={() => setMoreOpen(false)} sx={{ width: '100%', justifyContent: 'flex-start', gap: 2, p: 2, borderRadius: 3, '&:hover': { bgcolor: 'action.hover' } }}>
                    <UserCog size={20} style={{ color: theme.palette.text.secondary }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{t('nav.profile')}</Typography>
                </ButtonBase>
                <ButtonBase component={Link} to="/settings" onClick={() => setMoreOpen(false)} sx={{ width: '100%', justifyContent: 'flex-start', gap: 2, p: 2, borderRadius: 3, '&:hover': { bgcolor: 'action.hover' } }}>
                    <Settings size={20} style={{ color: theme.palette.text.secondary }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{t('nav.settings')}</Typography>
                </ButtonBase>
            </Stack>
         </Box>
      </Drawer>
    </>
  );
}
