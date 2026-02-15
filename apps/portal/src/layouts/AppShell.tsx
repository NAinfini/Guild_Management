
import React from 'react';
import { Outlet, useLocation, useNavigate } from '@tanstack/react-router';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useAuthStore, useUIStore } from '@/store';
import { useAuth } from '@/hooks';
import { useTranslation } from 'react-i18next';
import { useReducedMotion } from '@/hooks/useReducedMotion';
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
} from '@/ui-bridge/icons-material';
import { 
  Box, 
  Drawer, 
  AppBar, 
  Toolbar, 
  Typography,
  IconButton, 
  Stack, 
  List, 
  useTheme,
  useMediaQuery,
  alpha,
  Tooltip,
} from '@/ui-bridge/material';
import { Palette, ColorLens, Translate } from '@/ui-bridge/icons-material';
import { Avatar as PrimitiveAvatar, Badge as PrimitiveBadge, Button as PrimitiveButton } from '@/components/primitives';
import { BottomNavigation } from '@/components/navigation/BottomNavigation';
import { OfflineBanner } from '@/components/feedback/OfflineBanner';
import { ThemeAmbientEffects } from '@/components/layout/ThemeAmbientEffects';
import { PageTransition } from '@/components/layout/PageTransition';
import { useMobileOptimizations } from '@/hooks';
import { Role } from '@/types';
import { useMotionTokens } from '@/theme/useMotionTokens';
import { ThemeFXLayer } from '@/theme/fx/ThemeFXLayer';
import {
  useThemeController,
  NEXUS_THEME_OPTIONS,
  NEXUS_COLOR_OPTIONS,
  getThemeModeIcon,
} from '@/theme/ThemeController';

const DRAWER_WIDTH = 260;
const DRAWER_COLLAPSED_WIDTH = 84;

export function AppShell() {
  const { user, logout } = useAuth();
  // Subscribe to narrow slices so AppShell avoids rerendering for unrelated store updates.
  const viewRole = useAuthStore((state) => state.viewRole);
  const setViewRole = useAuthStore((state) => state.setViewRole);
  const sidebarOpen = useUIStore((state) => state.sidebarOpen);
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);
  const closeSidebar = useUIStore((state) => state.closeSidebar);
  const sidebarCollapsed = useUIStore((state) => state.sidebarCollapsed);
  const toggleSidebarCollapsed = useUIStore((state) => state.toggleSidebarCollapsed);
  const pageTitle = useUIStore((state) => state.pageTitle);
  const theme = useTheme();
  const mobile = useMobileOptimizations();
  const isLgDown = useMediaQuery(theme.breakpoints.down('lg'));
  const isMobile = mobile.isMobile || isLgDown;
  
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const routeSurface = React.useMemo(() => {
    const trimmed = location.pathname.replace(/^\/+|\/+$/g, '');
    if (!trimmed) return 'dashboard';
    return trimmed.replace(/[^a-z0-9-]/gi, '-').toLowerCase();
  }, [location.pathname]);
  const themeController = useThemeController();
  const prefersReducedMotion = useReducedMotion() || themeController.reducedMotion;
  const motionTokens = useMotionTokens();

  const motionFastMs = Math.max(0, Math.round(motionTokens.fastMs));
  const motionMediumMs = Math.max(0, Math.round(motionTokens.mediumMs));

  const effectiveRole = getEffectiveRole(user?.role, viewRole);
  const canSeeAdmin = canAccessAdminArea(effectiveRole);
  const hasPrivileges = canAccessAdminArea(user?.role);
  // Notification center contract is pending; keep a visible badge slot for topbar parity.
  const notificationCount = 0;

  const handleLogout = () => {
    logout();
    navigate({ to: '/' }); 
  };

  const handleLanguageChange = (lng: 'en' | 'zh') => {
    i18n.changeLanguage(lng);
    localStorage.setItem('i18nextLng', lng);
  };

  const isNavItemActive = React.useCallback(
    (href: string) => location.pathname === href || (href !== '/' && location.pathname.startsWith(href)),
    [location.pathname],
  );

  const menuContentStyle = React.useMemo<React.CSSProperties>(
    () => ({
      minWidth: 240,
      padding: 8,
      borderRadius: 12,
      border: theme.custom?.border ?? `1px solid ${theme.palette.divider}`,
      background: theme.palette.background.paper,
      color: theme.palette.text.primary,
      boxShadow: `0 12px 30px ${alpha(theme.palette.common.black, 0.32)}`,
      zIndex: theme.zIndex.modal + 2,
    }),
    [theme],
  );

  const menuSubContentStyle = React.useMemo<React.CSSProperties>(
    () => ({
      minWidth: 260,
      padding: 8,
      borderRadius: 12,
      border: theme.custom?.border ?? `1px solid ${theme.palette.divider}`,
      background: theme.palette.background.paper,
      color: theme.palette.text.primary,
      boxShadow: `0 12px 30px ${alpha(theme.palette.common.black, 0.28)}`,
      zIndex: theme.zIndex.modal + 2,
    }),
    [theme],
  );

  const menuItemStyle = React.useMemo<React.CSSProperties>(
    () => ({
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      width: '100%',
      minHeight: 36,
      padding: '8px 10px',
      borderRadius: 8,
      border: 'none',
      background: 'transparent',
      color: 'inherit',
      textAlign: 'left',
      cursor: 'pointer',
      fontWeight: 600,
      fontSize: '0.875rem',
    }),
    [],
  );


  const navItems = React.useMemo(() => {
    const items = [
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
      items.push({ label: t('nav.admin'), href: '/admin', icon: ReportProblem });
    }

    return items;
  }, [canSeeAdmin, t, i18n.language]);

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
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {navItems.map((item) => (
            <Tooltip
              key={item.href}
              title={sidebarCollapsed && !isMobile ? item.label : ''}
              placement="right"
              disableHoverListener={!sidebarCollapsed || isMobile}
            >
              <PrimitiveButton
                data-ui="nav-button"
                aria-label={item.label}
                aria-current={isNavItemActive(item.href) ? 'page' : undefined}
                variant={isNavItemActive(item.href) ? 'secondary' : 'ghost'}
                className="control"
                onClick={() => {
                  navigate({ to: item.href as any });
                  closeSidebar();
                }}
                style={{
                  width: '100%',
                  marginBottom: 4,
                  display: 'flex',
                  justifyContent: sidebarCollapsed && !isMobile ? 'center' : 'flex-start',
                  gap: 10,
                  paddingInline: sidebarCollapsed && !isMobile ? 10 : 14,
                  borderRadius: 'var(--radiusBtn)',
                  borderLeft: isNavItemActive(item.href) ? '3px solid var(--accent1)' : undefined,
                  borderRight: isNavItemActive(item.href) ? 'var(--stroke) solid var(--accent1)' : undefined,
                  boxShadow: isNavItemActive(item.href) ? 'var(--glow)' : undefined,
                  transition: `all ${motionMediumMs}ms ${motionTokens.ease}`,
                }}
              >
                <item.icon style={{ fontSize: 18 }} />
                {(!sidebarCollapsed || isMobile) && (
                  <span
                    style={{
                      fontWeight: 700,
                      textTransform: 'var(--cmp-nav-label-transform, uppercase)',
                      letterSpacing: 'var(--cmp-nav-label-letter-spacing, 0.1em)',
                      fontSize: '0.7rem',
                    }}
                  >
                    {item.label}
                  </span>
                )}
              </PrimitiveButton>
            </Tooltip>
          ))}
        </Box>
      </List>

      <Box sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}`, bgcolor: 'background.default' }}>
        {hasPrivileges && (!sidebarCollapsed || isMobile) && (
            <Box sx={{ p: 1.5, mb: 2, border: `1px solid ${theme.palette.divider}`, borderRadius: 2, bgcolor: 'background.paper' }}>
               <Stack direction="row" alignItems="center" gap={1} mb={1}>
                  <Visibility sx={{ fontSize: 12, color: "text.secondary" }} />
                  <Typography variant="caption" sx={{ fontWeight: 900, textTransform: 'uppercase', color: 'text.secondary' }}>{t('common.view_mode')}</Typography>
               </Stack>
               <Stack direction="row" spacing={0.5}>
                  {(['admin', 'moderator', 'member', 'external'] as const).map((r) => {
                     const isActive = (viewRole || user?.role) === r;
                     return (
                        <PrimitiveButton
                          key={r}
                          data-ui="button"
                          size="sm"
                          variant={isActive ? 'primary' : 'ghost'}
                          onClick={() => setViewRole(r === user?.role ? null : r as Role)}
                          style={{
                            flex: 1,
                            minHeight: 24,
                            paddingInline: 6,
                            fontSize: '0.6rem',
                            fontWeight: 900,
                            borderColor: roleColors[r] || theme.palette.primary.main,
                            backgroundColor: isActive ? roleColors[r] || theme.palette.primary.main : 'transparent',
                            color: isActive
                              ? theme.palette.getContrastText(roleColors[r] || theme.palette.primary.main)
                              : theme.palette.text.primary,
                          }}
                        >
                          {r.slice(0,3)}
                        </PrimitiveButton>
                     );
                  })}
               </Stack>
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
    <Box
      className="app-shell"
      data-route={routeSurface}
      sx={{ display: 'flex', height: '100vh', overflow: 'visible', position: 'relative', zIndex: 1 }}
    >
      <ThemeAmbientEffects
        theme={themeController.currentTheme}
        reducedMotion={themeController.reducedMotion}
        motionIntensity={themeController.motionIntensity ?? 1}
      />
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
          className="app-shell-sidebar"
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
        <AppBar
          className="app-shell-topbar"
          position="sticky"
          elevation={0}
          color="transparent"
          sx={{
            background: 'var(--sys-surface-panel)',
            borderBottom: '1px solid var(--sys-border-default)',
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
              <Typography
                key={pageTitle}
                variant={isMobile ? "subtitle1" : "h6"}
                noWrap
                component="div"
                sx={{
                  fontWeight: 900,
                  textTransform: 'uppercase',
                  letterSpacing: { xs: '0.05em', sm: '0.1em' },
                  fontSize: { xs: '0.9rem', sm: '1rem', md: '1.25rem' },
                  transition: prefersReducedMotion
                    ? 'none'
                    : `color ${motionFastMs}ms ${motionTokens.ease}, opacity ${motionFastMs}ms ${motionTokens.ease}`,
                }}
              >
                {pageTitle}
              </Typography>
            </Box>

            <Stack direction="row" alignItems="center" spacing={{ xs: 0.5, sm: 1, md: 2 }}>
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <PrimitiveButton
                    data-ui="button"
                    variant="ghost"
                    size="sm"
                    style={{
                      borderRadius: 10,
                      minWidth: 'auto',
                      paddingInline: isMobile ? 8 : 12,
                      gap: 10,
                    }}
                  >
                    <Box sx={{ textAlign: 'right', display: { xs: 'none', md: 'block' } }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, lineHeight: 1 }}>
                        {user?.username || t('common.guest')}
                      </Typography>
                      {user?.role && (
                        <PrimitiveBadge size="sm" variant="info" style={{ marginTop: 4 }}>
                          {String(user.role).toUpperCase()}
                        </PrimitiveBadge>
                      )}
                    </Box>
                    <PrimitiveBadge size="sm" variant="warning" style={{ minWidth: 20, justifyContent: 'center' }}>
                      {notificationCount}
                    </PrimitiveBadge>
                    <PrimitiveAvatar
                      src={user?.avatar_url ?? undefined}
                      alt={user?.username || t('common.guest')}
                      name={user?.username || t('common.guest')}
                      size={isMobile ? 'sm' : 'md'}
                    />
                  </PrimitiveButton>
                </DropdownMenu.Trigger>
                <DropdownMenu.Portal>
                  <DropdownMenu.Content align="end" sideOffset={8} style={menuContentStyle}>
                    {user && (
                      <div style={{ padding: '4px 10px', marginBottom: 4, fontWeight: 900, opacity: 0.7, fontSize: '0.72rem' }}>
                        {t('nav.account')}
                      </div>
                    )}

                    {user && (
                      <DropdownMenu.Item onSelect={() => navigate({ to: '/profile' })} style={menuItemStyle}>
                        <ManageAccounts style={{ fontSize: 16 }} />
                        {t('nav.profile')}
                      </DropdownMenu.Item>
                    )}

                    <DropdownMenu.Sub>
                      <DropdownMenu.SubTrigger style={{ ...menuItemStyle, justifyContent: 'space-between' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
                          <Palette style={{ fontSize: 16 }} />
                          {t('settings.interface_theme', { defaultValue: t('settings.visual_theme') })}
                        </span>
                        <ChevronRight style={{ fontSize: 16, opacity: 0.7 }} />
                      </DropdownMenu.SubTrigger>
                      <DropdownMenu.Portal>
                        <DropdownMenu.SubContent sideOffset={8} alignOffset={-4} style={menuSubContentStyle}>
                          {NEXUS_THEME_OPTIONS.map((opt: any) => {
                            const ThemeIcon = getThemeModeIcon(opt.id);
                            const isSelected = themeController.currentTheme === opt.id;

                            return (
                              <DropdownMenu.Item
                                key={`submenu-theme-opt-${opt.id}`}
                                onSelect={() => themeController.setTheme(opt.id)}
                                style={{ ...menuItemStyle, fontWeight: isSelected ? 800 : 600 }}
                              >
                                <ThemeIcon style={{ fontSize: 16 }} />
                                {t(`theme_menu.themes.${opt.id}.label`, { defaultValue: opt.label })}
                              </DropdownMenu.Item>
                            );
                          })}
                        </DropdownMenu.SubContent>
                      </DropdownMenu.Portal>
                    </DropdownMenu.Sub>

                    <DropdownMenu.Sub>
                      <DropdownMenu.SubTrigger style={{ ...menuItemStyle, justifyContent: 'space-between' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
                          <ColorLens style={{ fontSize: 16 }} />
                          {t('settings.color_palette')}
                        </span>
                        <ChevronRight style={{ fontSize: 16, opacity: 0.7 }} />
                      </DropdownMenu.SubTrigger>
                      <DropdownMenu.Portal>
                        <DropdownMenu.SubContent sideOffset={8} alignOffset={-4} style={menuSubContentStyle}>
                          {NEXUS_COLOR_OPTIONS.map((opt: any) => (
                            <DropdownMenu.Item
                              key={`submenu-color-opt-${opt.id}`}
                              onSelect={() => themeController.setColor(opt.id)}
                              style={{
                                ...menuItemStyle,
                                fontWeight: themeController.currentColor === opt.id ? 800 : 600,
                              }}
                            >
                              {t(`theme_menu.colors.${opt.id}.label`, { defaultValue: opt.label })}
                            </DropdownMenu.Item>
                          ))}
                        </DropdownMenu.SubContent>
                      </DropdownMenu.Portal>
                    </DropdownMenu.Sub>

                    <DropdownMenu.Sub>
                      <DropdownMenu.SubTrigger style={{ ...menuItemStyle, justifyContent: 'space-between' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
                          <Translate style={{ fontSize: 16 }} />
                          {t('settings.language')}
                        </span>
                        <ChevronRight style={{ fontSize: 16, opacity: 0.7 }} />
                      </DropdownMenu.SubTrigger>
                      <DropdownMenu.Portal>
                        <DropdownMenu.SubContent sideOffset={8} alignOffset={-4} style={menuSubContentStyle}>
                          <DropdownMenu.Item
                            onSelect={() => handleLanguageChange('en')}
                            style={{ ...menuItemStyle, fontWeight: !i18n.language.startsWith('zh') ? 800 : 600 }}
                          >
                            {t('settings.language_english')}
                          </DropdownMenu.Item>
                          <DropdownMenu.Item
                            onSelect={() => handleLanguageChange('zh')}
                            style={{ ...menuItemStyle, fontWeight: i18n.language.startsWith('zh') ? 800 : 600 }}
                          >
                            {t('settings.language_chinese')}
                          </DropdownMenu.Item>
                        </DropdownMenu.SubContent>
                      </DropdownMenu.Portal>
                    </DropdownMenu.Sub>

                    <DropdownMenu.Separator
                      style={{
                        height: 1,
                        margin: '6px 2px',
                        background: alpha(theme.palette.divider, 0.8),
                      }}
                    />

                    <DropdownMenu.Item onSelect={() => navigate({ to: '/settings' })} style={menuItemStyle}>
                      <Settings style={{ fontSize: 16 }} />
                      {t('nav.settings')}
                    </DropdownMenu.Item>

                    {!user && (
                      <DropdownMenu.Item onSelect={() => navigate({ to: '/login' })} style={menuItemStyle}>
                        <Login style={{ fontSize: 16 }} />
                        {t('auth.login_title')}
                      </DropdownMenu.Item>
                    )}

                    {user && (
                      <DropdownMenu.Item
                        onSelect={handleLogout}
                        style={{ ...menuItemStyle, color: theme.palette.error.main, fontWeight: 700 }}
                      >
                        <Logout style={{ fontSize: 16 }} />
                        {t('account.logout')}
                      </DropdownMenu.Item>
                    )}
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>
            </Stack>
          </Toolbar>
        </AppBar>

        <OfflineBanner />

        <Box
          id="main-content"
          className="app-page-surface custom-scrollbar"
          data-route={routeSurface}
          sx={{
             flexGrow: 1,
             p: { xs: mobile.spacing.page, md: 0.75, lg: 1 },
             pb: { xs: 'calc(96px + env(safe-area-inset-bottom))', lg: 1 },
             overflowY: 'auto',
             overflowX: 'visible',
             bgcolor: 'transparent',
             WebkitOverflowScrolling: 'touch',
             position: 'relative',
             isolation: 'isolate',
             width: '100%',
             maxWidth: '100%',
          }}
        >
          <PageTransition className="app-route-frame" data-route={routeSurface} transitionKey={location.pathname}>
            <Outlet />
          </PageTransition>
        </Box>

        <Box sx={{ display: { lg: 'none' } }}>
           <BottomNavigation />
        </Box>
      </Box>
    </Box>
    </>
  );
}
