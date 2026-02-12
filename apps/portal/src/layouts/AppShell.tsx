
import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from '@tanstack/react-router';
import { useAuthStore, useUIStore } from '@/store';
import { useAuth } from '@/hooks';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { canAccessAdminArea, getEffectiveRole } from '@/lib/permissions';
import { 
  Dashboard, 
  CalendarToday, 
  Groups, 
  Security, 
  ReportProblem, 
  Logout, 
  Menu as MenuIcon,
  Close as X,
  Build,
  Book,
  Settings,
  ManageAccounts,
  ChevronLeft,
  ChevronRight,
  Login,
  Campaign,
  Visibility,
  Image as ImageIcon,
} from '@mui/icons-material';
import { 
  Box, 
  Drawer, 
  AppBar, 
  Toolbar, 
  Typography,
  IconButton, 
  Button, 
  Menu, 
  MenuItem, 
  Avatar, 
  Stack, 
  Divider, 
  List, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText,
  useTheme,
  useMediaQuery,
  ButtonGroup,
  alpha,
  Tooltip,
} from '@mui/material';
import { Palette, ColorLens, Translate } from '@mui/icons-material';
import { BottomNavigation } from '@/components/navigation/BottomNavigation';
import { OfflineBanner } from '@/components/feedback/OfflineBanner';
import { useMobileOptimizations } from '@/hooks';
import { Role } from '@/types';
import { useMotionTokens } from '@/theme/useMotionTokens';
import { ThemeFXLayer } from '@/theme/fx/ThemeFXLayer';
import {
  useThemeController,
  NEXUS_THEME_OPTIONS,
  NEXUS_COLOR_OPTIONS,
} from '@/theme/ThemeController';

const DRAWER_WIDTH = 260;
const DRAWER_COLLAPSED_WIDTH = 84;

export function AppShell() {
  const { user, logout } = useAuth();
  const { viewRole, setViewRole } = useAuthStore();
  const {
    sidebarOpen,
    toggleSidebar,
    closeSidebar,
    sidebarCollapsed,
    toggleSidebarCollapsed,
    pageTitle,
  } = useUIStore();
  const theme = useTheme();
  const mobile = useMobileOptimizations();
  const isMobile = mobile.isMobile || useMediaQuery(theme.breakpoints.down('lg'));
  
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const prefersReducedMotion = useReducedMotion();
  const motionTokens = useMotionTokens();
  const themeController = useThemeController();
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);
  const [submenuAnchor, setSubmenuAnchor] = useState<null | HTMLElement>(null);
  const [submenuType, setSubmenuType] = useState<'theme' | 'color' | 'language' | null>(null);

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

  const effectiveRole = getEffectiveRole(user?.role, viewRole);
  const canSeeAdmin = canAccessAdminArea(effectiveRole);
  const hasPrivileges = canAccessAdminArea(user?.role);

  const handleLogout = () => {
    logout();
    navigate({ to: '/' }); 
  };

  const handleCloseUserMenu = () => {
    setUserMenuAnchor(null);
    setSubmenuAnchor(null);
    setSubmenuType(null);
  };

  const handleOpenSubmenu = (
    type: 'theme' | 'color' | 'language',
    target: EventTarget & HTMLElement,
  ) => {
    setSubmenuType(type);
    setSubmenuAnchor(target);
  };

  const handleCloseSubmenu = () => {
    setSubmenuAnchor(null);
    setSubmenuType(null);
  };

  const handleLanguageChange = (lng: 'en' | 'zh') => {
    i18n.changeLanguage(lng);
    localStorage.setItem('i18nextLng', lng);
  };


  const navItems = [
    { label: t('nav.dashboard'), href: '/', icon: Dashboard },
    { label: t('nav.announcements'), href: '/announcements', icon: Campaign },
    { label: t('nav.events'), href: '/events', icon: CalendarToday },
    { label: t('nav.roster'), href: '/roster', icon: Groups },
    { label: t('nav.guild_war'), href: '/guild-war', icon: Security },
    { label: t('nav.wiki'), href: '/wiki', icon: Book },
    { label: t('nav.tools'), href: '/tools', icon: Build },
    { label: t('nav.gallery'), href: '/gallery', icon: ImageIcon },
  ];

  if (canSeeAdmin) {
    navItems.push({ label: t('nav.admin'), href: '/admin', icon: ReportProblem });
  }

  const roleColors: Record<string, string> = theme.custom?.roleColors || {
    admin: theme.palette.error.main,
    moderator: theme.palette.warning.main,
    member: theme.palette.primary.main,
    external: theme.palette.text.secondary,
  };

  const desktopDrawerWidth = sidebarCollapsed ? DRAWER_COLLAPSED_WIDTH : DRAWER_WIDTH;

  const SidebarContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: 'background.paper', borderRight: `1px solid ${theme.palette.divider}`, overflowX: 'hidden' }}>
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: `1px solid ${theme.palette.divider}`,
          position: 'relative',
          overflowX: 'hidden',
          '&:hover .sidebar-expand-overlay': {
            opacity: 1,
            transform: 'translate(-50%, -4px)',
            pointerEvents: 'auto',
          },
        }}
      >
         <Box sx={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
           <Typography variant="h6" sx={{
              fontWeight: 950, 
              background: `var(--logo-bg)`,
              color: `var(--logo-text)`,
              padding: '2px 8px',
              fontStyle: 'italic',
              textTransform: 'uppercase',
              letterSpacing: '-0.02em',
              display: 'inline-block',
              borderRadius: 'var(--radiusInput)',
              boxShadow: 'var(--shadow1)'
           }}>
              {isMobile || !sidebarCollapsed ? t('common.app_name') : 'BY'}
           </Typography>
           {!isMobile && sidebarCollapsed && (
             <Tooltip title={t('common.expand_sidebar')} placement="right">
               <IconButton
                 className="sidebar-expand-overlay"
                 onClick={toggleSidebarCollapsed}
                 size="medium"
                 aria-label={t('common.expand_sidebar')}
                 sx={{
                   position: 'absolute',
                   left: '50%',
                   top: 8,
                   transform: 'translate(-50%, 0px)',
                   opacity: 0,
                   pointerEvents: 'none',
                   transition: `opacity ${motionFastMs}ms ${motionTokens.ease}, transform ${motionFastMs}ms ${motionTokens.ease}`,
                   bgcolor: theme.palette.primary.main,
                   color: theme.palette.primary.contrastText,
                   border: `2px solid ${theme.palette.primary.light}`,
                   boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.4)}`,
                   '&:hover': { 
                     bgcolor: theme.palette.primary.dark,
                     boxShadow: `0 6px 16px ${alpha(theme.palette.primary.main, 0.6)}`,
                     transform: 'translate(-50%, -2px)',
                   },
                 }}
               >
                 <ChevronRight sx={{ fontSize: 22 }} />
               </IconButton>
             </Tooltip>
           )}
         </Box>
         <Stack direction="row" spacing={0.5}>
           {!isMobile && !sidebarCollapsed && (
             <Tooltip title={t('common.collapse_sidebar')} placement="right">
               <IconButton onClick={toggleSidebarCollapsed} size="small" aria-label={t('common.collapse_sidebar')}>
                 <ChevronLeft sx={{ fontSize: 18 }} />
               </IconButton>
             </Tooltip>
           )}
           {isMobile && (
             <IconButton onClick={closeSidebar} size="small" aria-label="Close sidebar">
               <X sx={{ fontSize: 20 }} />
             </IconButton>
           )}
         </Stack>
      </Box>

      <List sx={{ flex: 1, px: sidebarCollapsed && !isMobile ? 1 : 2, py: 1, overflowX: 'hidden' }} className="custom-scrollbar">
        {navItems.map((item, index) => (
          <motion.div
            key={item.href}
            initial={prefersReducedMotion ? false : { opacity: 0, x: -14 }}
            animate={prefersReducedMotion ? undefined : { opacity: 1, x: 0 }}
            transition={
              prefersReducedMotion
                ? undefined
                : {
                    duration: motionMediumSec,
                    delay: Math.min(index * navDelayStepSec, navDelayCapSec),
                    ease: motionEase,
                  }
            }
          >
            <Tooltip
              title={sidebarCollapsed && !isMobile ? item.label : ''}
              placement="right"
              disableHoverListener={!sidebarCollapsed || isMobile}
            >
              <ListItemButton
                component={Link}
                to={item.href}
                onClick={closeSidebar}
                aria-label={item.label}
                activeOptions={{ exact: false }}
                sx={{
                  mb: 0.5,
                  borderRadius: 'var(--radiusBtn)',
                  border: '1px solid transparent',
                  justifyContent: sidebarCollapsed && !isMobile ? 'center' : 'flex-start',
                  px: sidebarCollapsed && !isMobile ? 1 : 2,
                  '&.active': {
                    background: `var(--nav-active-bg)`,
                    opacity: 1,
                    color: 'var(--text0)',
                    borderRight: 'var(--stroke) solid var(--accent1)',
                  },
                  '&:hover': {
                    backgroundColor: 'var(--surface2)',
                    borderColor: 'var(--accent0)',
                    boxShadow: 'var(--glow)',
                    transform: 'translateX(4px)',
                  },
                  '&:focus-visible': {
                    outline: 'var(--interaction-focus-ring-width, 2px) solid var(--interaction-focus-ring-color, var(--sys-interactive-focus-ring))',
                    outlineOffset: 2,
                    boxShadow: 'var(--interaction-focus-ring-glow, none)',
                  },
                  transition: `all ${motionMediumMs}ms ${motionTokens.ease}`,
                }}
              >
                <ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}>
                  <item.icon sx={{ fontSize: 18 }} />
                </ListItemIcon>
                {(!sidebarCollapsed || isMobile) && (
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      variant: 'body2',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      fontSize: '0.7rem'
                    }}
                  />
                )}
              </ListItemButton>
            </Tooltip>
          </motion.div>
        ))}
      </List>

      <Box sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}`, bgcolor: 'background.default' }}>
        {hasPrivileges && (!sidebarCollapsed || isMobile) && (
            <Box sx={{ p: 1.5, mb: 2, border: `1px solid ${theme.palette.divider}`, borderRadius: 2, bgcolor: 'background.paper' }}>
               <Stack direction="row" alignItems="center" gap={1} mb={1}>
                  <Visibility sx={{ fontSize: 12, color: "text.secondary" }} />
                  <Typography variant="caption" sx={{ fontWeight: 900, textTransform: 'uppercase', color: 'text.secondary' }}>{t('common.view_mode')}</Typography>
               </Stack>
               <ButtonGroup size="small" fullWidth variant="outlined">
                  {(['admin', 'moderator', 'member', 'external'] as const).map((r) => {
                     const isActive = (viewRole || user?.role) === r;
                     return (
                        <Button
                          key={r}
                          data-ui="button"
                          onClick={() => setViewRole(r === user?.role ? null : r as Role)}
                          sx={{ 
                             flex: 1, 
                             py: 0.5, 
                             fontSize: '0.6rem',
                             fontWeight: 900,
                             bgcolor: isActive ? (roleColors[r] || theme.palette.primary.main) : 'transparent',
                             color: isActive
                               ? theme.palette.getContrastText(roleColors[r] || theme.palette.primary.main)
                               : (roleColors[r] || theme.palette.primary.main),
                             borderColor: roleColors[r] || theme.palette.primary.main,
                             '&:hover': {
                                bgcolor: isActive
                                  ? (roleColors[r] || theme.palette.primary.main)
                                  : alpha(roleColors[r] || theme.palette.primary.main, 0.15),
                                borderColor: roleColors[r] || theme.palette.primary.main
                             }
                          }}
                        >
                          {r.slice(0,3)}
                        </Button>
                     );
                  })}
               </ButtonGroup>
            </Box>
        )}
        {(!sidebarCollapsed || isMobile) ? (
          <Typography variant="caption" display="block" align="center" sx={{ opacity: 0.4, fontWeight: 900, letterSpacing: '0.2em' }}>
              {t('common.system_version')}
          </Typography>
        ) : (
          <Typography variant="caption" display="block" align="center" sx={{ opacity: 0.4, fontWeight: 900 }}>
            v4.2
          </Typography>
        )}
      </Box>
    </Box>
  );

  return (
    <>
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'visible', position: 'relative', zIndex: 1 }}>
      <ThemeFXLayer />
      {/* Mobile Sidebar (Drawer) */}
      {isMobile && (
        <Drawer
          variant="temporary"
          open={sidebarOpen}
          onClose={closeSidebar}
          aria-label="Navigation menu"
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', lg: 'none' },
            '& .MuiDrawer-paper': { 
               boxSizing: 'border-box', 
               width: DRAWER_WIDTH, 
               borderRight: theme.custom?.border,
               background: theme.palette.background.paper
            },
          }}
        >
          {SidebarContent}
        </Drawer>
      )}

      {/* Desktop Sidebar (Box in flow) */}
      {!isMobile && (
        <Box
          component="aside"
          sx={{
            width: desktopDrawerWidth,
            flexShrink: 0,
            borderRight: theme.custom?.border,
            bgcolor: 'background.paper',
            height: '100vh',
            position: 'sticky',
            top: 0,
            overflowY: 'auto',
            overflowX: 'hidden',
            transition: `width ${motionMediumMs}ms ${motionTokens.ease}`,
          }}
        >
          {SidebarContent}
        </Box>
      )}

      <Box component="main" sx={{ flexGrow: 1, height: '100vh', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <AppBar position="sticky" elevation={0} color="transparent" sx={{ 
            borderBottom: theme.custom?.border, 
            background: theme.palette.mode === 'dark' 
              ? `linear-gradient(to bottom, rgba(0,0,0,0.9), rgba(0,0,0,0.7))`
              : 'rgba(255,255,255,0.8)',
            backdropFilter: 'blur(16px)',
            zIndex: theme.zIndex.drawer + 1,
            transition: `all ${motionMediumMs}ms ${motionTokens.ease}`,
        }}>
          <Toolbar sx={{ minHeight: { xs: 56, sm: 64, lg: 80 }, px: { xs: 1, sm: 2, md: 3 }, pb: 0 }}>
            {isMobile && (
              <IconButton
                edge="start"
                onClick={toggleSidebar}
                sx={{
                  mr: { xs: 1, sm: 2 },
                  p: { xs: 1, sm: 1.5 }
                }}
                aria-label="Open sidebar"
              >
                <MenuIcon sx={{ fontSize: 24 }} />
              </IconButton>
            )}

            <Box sx={{ flexGrow: 1, minWidth: 0, overflow: 'hidden' }}>
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={pageTitle}
                  initial={prefersReducedMotion ? false : { opacity: 0, y: 8, filter: 'blur(4px)' }}
                  animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={prefersReducedMotion ? undefined : { opacity: 0, y: -6, filter: 'blur(3px)' }}
                  transition={prefersReducedMotion ? undefined : { duration: motionFastSec, ease: motionEase }}
                >
                  <Typography
                    variant={isMobile ? "subtitle1" : "h6"}
                    noWrap
                    component="div"
                    sx={{
                      fontWeight: 900,
                      textTransform: 'uppercase',
                      letterSpacing: { xs: '0.05em', sm: '0.1em' },
                      fontSize: { xs: '0.9rem', sm: '1rem', md: '1.25rem' }
                    }}
                  >
                    {pageTitle}
                  </Typography>
                </motion.div>
              </AnimatePresence>
            </Box>

            <Stack direction="row" alignItems="center" spacing={{ xs: 0.5, sm: 1, md: 2 }}>
                   <Button
                      data-ui="button"
                      onClick={(e) => setUserMenuAnchor(e.currentTarget)}
                      endIcon={
                        <Avatar
                          src={user?.avatar_url}
                          alt={user?.username || t('common.guest')}
                          sx={{
                             width: { xs: 28, sm: 32 },
                             height: { xs: 28, sm: 32 },
                             borderRadius: 1,
                             border: `1px solid ${theme.palette.primary.main}`,
                             bgcolor: user ? 'transparent' : alpha(theme.palette.primary.main, 0.1)
                          }}
                        >
                           {!user && <ManageAccounts sx={{ fontSize: 18 }} />}
                        </Avatar>
                      }
                      sx={{
                        textTransform: 'none',
                        color: 'text.primary',
                        borderRadius: 2,
                        minWidth: 'auto',
                        px: { xs: 1, sm: 2 },
                        gap: 1.5,
                        '&:hover': { bgcolor: 'action.hover' }
                      }}
                   >
                     <Box sx={{ textAlign: 'right', display: { xs: 'none', md: 'block' } }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, lineHeight: 1 }}>
                          {user?.username || t('common.guest')}
                        </Typography>
                     </Box>
                   </Button>
                   <Menu
                      anchorEl={userMenuAnchor}
                      open={Boolean(userMenuAnchor)}
                      onClose={handleCloseUserMenu}
                      slotProps={{ paper: { sx: { width: 220, borderRadius: 2, border: theme.custom?.border } } }}
                   >
                      {user ? (
                         [
                            <Box key="header" sx={{ px: 2, py: 1 }}>
                              <Typography variant="overline" sx={{ fontWeight: 900, color: 'text.disabled' }}>{t('nav.account')}</Typography>
                            </Box>,
                            <MenuItem key="profile" component={Link} to="/profile" onClick={handleCloseUserMenu}>
                               <ListItemIcon><ManageAccounts sx={{ fontSize: 16 }} /></ListItemIcon>
                               <ListItemText primary={t('nav.profile')} primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }} />
                            </MenuItem>,
                            <MenuItem key="theme-toggle" onClick={(e) => handleOpenSubmenu('theme', e.currentTarget)}>
                               <ListItemIcon><Palette sx={{ fontSize: 16 }} /></ListItemIcon>
                               <ListItemText
                                 primary={t('settings.interface_theme', { defaultValue: t('settings.visual_theme') })}
                                 primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
                               />
                               <ChevronRight sx={{ fontSize: 16, color: 'text.secondary' }} />
                            </MenuItem>,
                            <MenuItem key="color-toggle" onClick={(e) => handleOpenSubmenu('color', e.currentTarget)}>
                               <ListItemIcon><ColorLens sx={{ fontSize: 16 }} /></ListItemIcon>
                               <ListItemText
                                 primary={t('settings.color_palette')}
                                 primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
                               />
                               <ChevronRight sx={{ fontSize: 16, color: 'text.secondary' }} />
                            </MenuItem>,
                            <MenuItem key="language-toggle" onClick={(e) => handleOpenSubmenu('language', e.currentTarget)}>
                               <ListItemIcon><Translate sx={{ fontSize: 16 }} /></ListItemIcon>
                               <ListItemText
                                 primary={t('settings.language')}
                                 primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
                               />
                               <ChevronRight sx={{ fontSize: 16, color: 'text.secondary' }} />
                            </MenuItem>,
                            <MenuItem key="settings" component={Link} to="/settings" onClick={handleCloseUserMenu}>
                               <ListItemIcon><Settings sx={{ fontSize: 16 }} /></ListItemIcon>
                               <ListItemText primary={t('nav.settings')} primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }} />
                            </MenuItem>
                         ]
                      ) : (
                         [
                           <MenuItem key="guest-theme-toggle" onClick={(e) => handleOpenSubmenu('theme', e.currentTarget)}>
                             <ListItemIcon><Palette sx={{ fontSize: 16 }} /></ListItemIcon>
                             <ListItemText
                               primary={t('settings.interface_theme', { defaultValue: t('settings.visual_theme') })}
                               primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
                             />
                             <ChevronRight sx={{ fontSize: 16, color: 'text.secondary' }} />
                           </MenuItem>,
                           <MenuItem key="guest-color-toggle" onClick={(e) => handleOpenSubmenu('color', e.currentTarget)}>
                             <ListItemIcon><ColorLens sx={{ fontSize: 16 }} /></ListItemIcon>
                             <ListItemText
                               primary={t('settings.color_palette')}
                               primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
                             />
                             <ChevronRight sx={{ fontSize: 16, color: 'text.secondary' }} />
                           </MenuItem>,
                           <MenuItem key="guest-language-toggle" onClick={(e) => handleOpenSubmenu('language', e.currentTarget)}>
                             <ListItemIcon><Translate sx={{ fontSize: 16 }} /></ListItemIcon>
                             <ListItemText
                               primary={t('settings.language')}
                               primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
                             />
                             <ChevronRight sx={{ fontSize: 16, color: 'text.secondary' }} />
                           </MenuItem>,
                           <MenuItem key="guest-settings" component={Link} to="/settings" onClick={handleCloseUserMenu}>
                             <ListItemIcon><Settings sx={{ fontSize: 16 }} /></ListItemIcon>
                             <ListItemText primary={t('nav.settings')} primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }} />
                           </MenuItem>,
                           <Divider key="guest-login-div" sx={{ my: 1 }} />,
                           <MenuItem key="guest-login" component={Link} to="/login" onClick={handleCloseUserMenu}>
                             <ListItemIcon><Login sx={{ fontSize: 16 }} /></ListItemIcon>
                             <ListItemText primary={t('auth.login_title')} primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }} />
                           </MenuItem>,
                         ]
                      )}
                      
                      {user && [
                           <Divider key="logout-div" sx={{ my: 1 }} />,
                           <MenuItem key="logout" onClick={handleLogout} sx={{ color: 'error.main' }}>
                              <ListItemIcon><Logout sx={{ fontSize: 16, color: 'inherit' }} /></ListItemIcon>
                              <ListItemText primary={t('account.logout')} primaryTypographyProps={{ variant: 'body2', fontWeight: 700 }} />
                           </MenuItem>
                      ]}
                    </Menu>
                    <Menu
                      anchorEl={submenuAnchor}
                      open={Boolean(submenuAnchor && submenuType)}
                      onClose={handleCloseSubmenu}
                      anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
                      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                      slotProps={{
                        paper: {
                          sx: {
                            minWidth: 260,
                            borderRadius: 2,
                            border: theme.custom?.border,
                            mr: 0.5,
                          },
                        },
                      }}
                    >
                      {submenuType === 'theme' && NEXUS_THEME_OPTIONS.map((opt: any) => (
                        <MenuItem
                          key={`submenu-theme-opt-${opt.id}`}
                          onClick={() => {
                            themeController.setTheme(opt.id);
                            handleCloseSubmenu();
                          }}
                          selected={themeController.currentTheme === opt.id}
                        >
                          <ListItemText
                            primary={t(`theme_menu.themes.${opt.id}.label`, { defaultValue: opt.label })}
                            secondary={t(`theme_menu.themes.${opt.id}.description`, { defaultValue: opt.description })}
                            primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
                            secondaryTypographyProps={{ variant: 'caption' }}
                          />
                        </MenuItem>
                      ))}
                      {submenuType === 'color' && NEXUS_COLOR_OPTIONS.map((opt: any) => (
                        <MenuItem
                          key={`submenu-color-opt-${opt.id}`}
                          onClick={() => {
                            themeController.setColor(opt.id);
                            handleCloseSubmenu();
                          }}
                          selected={themeController.currentColor === opt.id}
                        >
                          <ListItemText
                            primary={t(`theme_menu.colors.${opt.id}.label`, { defaultValue: opt.label })}
                            secondary={t(`theme_menu.colors.${opt.id}.description`, { defaultValue: opt.description })}
                            primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
                            secondaryTypographyProps={{ variant: 'caption' }}
                          />
                        </MenuItem>
                      ))}
                      {submenuType === 'language' && [
                        <MenuItem
                          key="submenu-language-en"
                          onClick={() => {
                            handleLanguageChange('en');
                            handleCloseSubmenu();
                          }}
                          selected={!i18n.language.startsWith('zh')}
                        >
                          <ListItemText primary={t('settings.language_english')} primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }} />
                        </MenuItem>,
                        <MenuItem
                          key="submenu-language-zh"
                          onClick={() => {
                            handleLanguageChange('zh');
                            handleCloseSubmenu();
                          }}
                          selected={i18n.language.startsWith('zh')}
                        >
                          <ListItemText primary={t('settings.language_chinese')} primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }} />
                        </MenuItem>,
                      ]}
                    </Menu>
            </Stack>
          </Toolbar>
        </AppBar>

        <OfflineBanner />

        <Box
          id="main-content"
          sx={{
             flexGrow: 1,
             p: { xs: mobile.spacing.page, md: 3, lg: 4 },
             pb: { xs: 'calc(96px + env(safe-area-inset-bottom))', lg: 4 },
             overflowY: 'auto',
             overflowX: 'visible',
             bgcolor: 'transparent',
             WebkitOverflowScrolling: 'touch',
             position: 'relative',
             isolation: 'isolate',
          }}
          className="custom-scrollbar"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={location.pathname}
              initial={prefersReducedMotion ? false : { opacity: 0, y: 14, filter: 'blur(5px)' }}
              animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={prefersReducedMotion ? undefined : { opacity: 0, y: -8, filter: 'blur(4px)' }}
              transition={prefersReducedMotion ? undefined : { duration: motionMediumSec, ease: motionEase }}
              style={{ minHeight: '100%' }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </Box>

        <Box sx={{ display: { lg: 'none' } }}>
           <BottomNavigation />
        </Box>
      </Box>
    </Box>
    </>
  );
}
