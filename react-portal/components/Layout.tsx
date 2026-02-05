
import React, { useState, useRef, useEffect } from 'react';
import { Link, Outlet, useNavigate } from '@tanstack/react-router';
import { useAuthStore, useUIStore } from '../store';
import { useAuth } from '../hooks';
import { useThemeController } from '../theme/ThemeController';
import { useTranslation } from 'react-i18next';
import { 
  LayoutDashboard, 
  CalendarDays, 
  Users, 
  Swords, 
  ShieldAlert, 
  LogOut, 
  Menu as MenuIcon,
  X,
  Hammer,
  BookOpen,
  Settings,
  UserCog,
  ChevronDown,
  LogIn,
  Megaphone,
  Palette,
  Languages,
  Eye,
  Image as ImageIcon
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Role } from '../types';
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
  alpha
} from '@mui/material';
import { BottomNavigation } from './BottomNavigation';
import { OfflineBanner } from './OfflineBanner';
import { useMobileOptimizations } from '../hooks';

const DRAWER_WIDTH = 260;

export function Layout() {
  const { user, logout, isAdmin } = useAuth();
  const { viewRole, setViewRole } = useAuthStore();
  const { sidebarOpen, toggleSidebar, closeSidebar, pageTitle } = useUIStore();
  const { currentTheme, setTheme } = useThemeController();
  const theme = useTheme();
  const mobile = useMobileOptimizations();
  const isMobile = mobile.isMobile || useMediaQuery(theme.breakpoints.down('lg'));
  const isSmallMobile = mobile.isSmallMobile;
  
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);
  const [themeMenuAnchor, setThemeMenuAnchor] = useState<null | HTMLElement>(null);
  const [langMenuAnchor, setLangMenuAnchor] = useState<null | HTMLElement>(null);

  const effectiveRole = viewRole || user?.role;
  const canSeeAdmin = effectiveRole === 'admin' || effectiveRole === 'moderator';
  const hasPrivileges = user?.role === 'admin' || user?.role === 'moderator';

  const handleLogout = () => {
    logout();
    navigate({ to: '/' }); 
  };


  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    setLangMenuAnchor(null);
  };

  const navItems = [
    { label: t('nav.dashboard'), href: '/', icon: LayoutDashboard },
    { label: t('nav.announcements'), href: '/announcements', icon: Megaphone },
    { label: t('nav.events'), href: '/events', icon: CalendarDays },
    { label: t('nav.roster'), href: '/roster', icon: Users },
    { label: t('nav.guild_war'), href: '/guild-war', icon: Swords },
    { label: t('nav.wiki'), href: '/wiki', icon: BookOpen },
    { label: t('nav.tools'), href: '/tools', icon: Hammer },
    { label: t('nav.gallery'), href: '/gallery', icon: ImageIcon },
  ];

  if (canSeeAdmin) {
    navItems.push({ label: t('nav.admin'), href: '/admin', icon: ShieldAlert });
  }

  const roleColors: Record<string, string> = theme.custom?.roleColors || {
    admin: theme.palette.error.main,
    moderator: theme.palette.warning.main,
    member: theme.palette.primary.main,
    external: theme.custom?.mutedText || theme.palette.text.secondary,
  };

  const SidebarContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: 'background.paper', borderRight: `1px solid ${theme.palette.divider}` }}>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${theme.palette.divider}` }}>
         <Typography variant="h6" sx={{ 
            fontWeight: 900, 
            background: `linear-gradient(45deg, ${alpha(theme.palette.primary.main, 0.8)} 30%, ${alpha(theme.palette.secondary.main, 0.8)} 90%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontStyle: 'italic',
            textTransform: 'uppercase',
            letterSpacing: '-0.05em'
         }}>
            BaiYe Portal
         </Typography>
         {isMobile && (
           <IconButton onClick={closeSidebar} size="small" aria-label="Close sidebar">
             <X size={20} />
           </IconButton>
         )}
      </Box>

      <List sx={{ flex: 1, px: 2, py: 1 }} className="custom-scrollbar">
        {navItems.map((item) => (
          <ListItemButton
            key={item.href}
            component={Link}
            to={item.href}
            onClick={closeSidebar}
            aria-label={item.label}
            activeOptions={{ exact: false }}
            activeProps={{ 
              'aria-current': 'page',
              style: { 
                background: `linear-gradient(90deg, ${alpha(theme.palette.primary.main, 0.15)} 0%, transparent 100%)`,
                borderRight: `3px solid ${theme.palette.primary.main}`,
                color: theme.palette.primary.main
              } 
            }}
            sx={{
              mb: 0.5,
              borderRadius: 2,
              border: '1px solid transparent',
              '&:hover': {
                backgroundColor: theme.palette.action.hover,
                borderColor: alpha(theme.palette.primary.main, 0.2),
                boxShadow: theme.custom?.glow,
                transform: 'translateX(4px)',
              },
              '&:focus-visible': {
                outline: `2px solid ${theme.palette.primary.main}`,
                outlineOffset: 2,
              },
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            <ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}>
              <item.icon size={18} />
            </ListItemIcon>
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
          </ListItemButton>
        ))}
      </List>

      <Box sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}`, bgcolor: 'background.default' }}>
        {hasPrivileges && (
            <Box sx={{ p: 1.5, mb: 2, border: `1px solid ${theme.palette.divider}`, borderRadius: 2, bgcolor: 'background.paper' }}>
               <Stack direction="row" alignItems="center" gap={1} mb={1}>
                  <Eye size={12} className="text-muted-foreground" />
                  <Typography variant="caption" sx={{ fontWeight: 900, textTransform: 'uppercase', color: 'text.secondary' }}>{t('common.view_mode')}</Typography>
               </Stack>
               <ButtonGroup size="small" fullWidth variant="outlined">
                  {(['admin', 'moderator', 'member', 'external'] as const).map((r) => {
                     const isActive = (viewRole || user?.role) === r;
                     return (
                        <Button
                          key={r}
                          onClick={() => setViewRole(r === user?.role ? null : r as Role)}
                          sx={{ 
                             flex: 1, 
                             py: 0.5, 
                             fontSize: '0.6rem',
                             fontWeight: 900,
                             bgcolor: isActive ? roleColors[r] : 'transparent',
                             color: isActive ? '#fff' : roleColors[r],
                             borderColor: roleColors[r],
                             '&:hover': {
                                bgcolor: isActive ? roleColors[r] : alpha(roleColors[r], 0.1),
                                borderColor: roleColors[r]
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
        <Typography variant="caption" display="block" align="center" sx={{ opacity: 0.4, fontWeight: 900, letterSpacing: '0.2em' }}>
            System v4.2.0-PRD
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
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
            width: DRAWER_WIDTH,
            flexShrink: 0,
            borderRight: theme.custom?.border,
            bgcolor: 'background.paper',
            height: '100vh',
            position: 'sticky',
            top: 0,
            overflowY: 'auto'
          }}
        >
          {SidebarContent}
        </Box>
      )}

      <Box component="main" sx={{ flexGrow: 1, height: '100vh', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <AppBar position="sticky" elevation={0} color="transparent" sx={{ 
            borderBottom: theme.custom?.border, 
            background: theme.palette.mode === 'dark' 
              ? `linear-gradient(to bottom, ${alpha(theme.palette.background.default, 0.9)}, ${alpha(theme.palette.background.default, 0.7)})`
              : alpha(theme.palette.background.default, 0.8),
            backdropFilter: 'blur(16px)',
            zIndex: theme.zIndex.drawer + 1,
            transition: 'all 0.3s ease'
        }}>
          <Toolbar sx={{ minHeight: { xs: 56, sm: 64, lg: 80 }, px: { xs: 1, sm: 2, md: 3 }, pb: `calc(${mobile.safeArea.top} + 0px)` }}>
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
                <MenuIcon size={isSmallMobile ? 20 : 24} />
              </IconButton>
            )}

            <Typography
              variant={isSmallMobile ? "subtitle1" : "h6"}
              noWrap
              component="div"
              sx={{
                flexGrow: 1,
                fontWeight: 900,
                textTransform: 'uppercase',
                letterSpacing: { xs: '0.05em', sm: '0.1em' },
                fontSize: { xs: '0.9rem', sm: '1rem', md: '1.25rem' }
              }}
            >
              {pageTitle}
            </Typography>

            <Stack direction="row" alignItems="center" spacing={{ xs: 0.5, sm: 1, md: 2 }}>
                  <>
                   <Button
                      onClick={(e) => setUserMenuAnchor(e.currentTarget)}
                      startIcon={
                        <Avatar
                          src={user?.avatar_url}
                          alt={user?.username || 'Guest'}
                          sx={{
                             width: { xs: 28, sm: 32 },
                             height: { xs: 28, sm: 32 },
                             borderRadius: 1,
                             border: `1px solid ${theme.palette.primary.main}`,
                             bgcolor: user ? 'transparent' : alpha(theme.palette.primary.main, 0.1)
                          }}
                        >
                           {!user && <UserCog size={isSmallMobile ? 14 : 18} />}
                        </Avatar>
                      }
                      endIcon={!isSmallMobile && <ChevronDown size={14} />}
                      sx={{
                        textTransform: 'none',
                        color: 'text.primary',
                        borderRadius: 2,
                        minWidth: { xs: 'auto', sm: 'auto' },
                        px: { xs: 1, sm: 2 },
                        '&:hover': { bgcolor: 'action.hover' }
                      }}
                   >
                     <Box sx={{ textAlign: 'right', mr: { xs: 0, sm: 1 }, display: { xs: 'none', md: 'block' } }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, lineHeight: 1, fontSize: { sm: '0.8rem', md: '0.875rem' } }}>{user?.username || 'Guest'}</Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, fontSize: { sm: '0.55rem', md: '0.6rem' } }}>{effectiveRole?.toUpperCase() || 'UNAUTHORIZED'}</Typography>
                     </Box>
                   </Button>
                   <Menu
                      anchorEl={userMenuAnchor}
                      open={Boolean(userMenuAnchor)}
                      onClose={() => setUserMenuAnchor(null)}
                      aria-label={t('nav.profile')}
                      slotProps={{ paper: { sx: { width: 220, borderRadius: 2, border: theme.custom?.border, boxShadow: theme.custom?.customShadow } } }}
                   >
                      {user ? (
                         <>
                            <Box sx={{ px: 2, py: 1 }}>
                              <Typography variant="overline" sx={{ fontWeight: 900, color: 'text.disabled' }}>{t('nav.operative_account')}</Typography>
                            </Box>
                            <MenuItem component={Link} to="/profile" onClick={() => setUserMenuAnchor(null)}>
                               <ListItemIcon><UserCog size={16} /></ListItemIcon>
                               <ListItemText primary={t('nav.identity_dossier')} primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }} />
                            </MenuItem>
                            <MenuItem component={Link} to="/settings" onClick={() => setUserMenuAnchor(null)}>
                               <ListItemIcon><Settings size={16} /></ListItemIcon>
                               <ListItemText primary={t('nav.terminal_config')} primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }} />
                            </MenuItem>
                         </>
                      ) : (
                         <MenuItem component={Link} to="/login" onClick={() => setUserMenuAnchor(null)}>
                            <ListItemIcon><LogIn size={16} /></ListItemIcon>
                            <ListItemText primary={t('auth.login_title')} primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }} />
                         </MenuItem>
                      )}
                      
                      <Divider sx={{ my: 1 }} />
                      
                      {/* Theme Submenu Trigger */}
                      <MenuItem onClick={(e) => { e.stopPropagation(); setThemeMenuAnchor(e.currentTarget); }}>
                         <ListItemIcon><Palette size={16} /></ListItemIcon>
                         <ListItemText primary={t('nav.interface_theme')} primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }} />
                         <ChevronDown size={14} />
                      </MenuItem>

                      {/* Language Submenu Trigger */}
                      <MenuItem onClick={(e) => { e.stopPropagation(); setLangMenuAnchor(e.currentTarget); }}>
                          <ListItemIcon><Languages size={16} /></ListItemIcon>
                          <ListItemText primary={`${t('settings.language')} / 语言`} primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }} />
                          <ChevronDown size={14} />
                      </MenuItem>

                      {user && (
                         <>
                           <Divider sx={{ my: 1 }} />
                           <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                              <ListItemIcon><LogOut size={16} color="var(--mui-palette-error-main)"/></ListItemIcon>
                              <ListItemText primary={t('nav.sever_connection')} primaryTypographyProps={{ variant: 'body2', fontWeight: 700 }} />
                           </MenuItem>
                         </>
                      )}
                   </Menu>

                   {/* Independent Menus for Theme and Language to keep it simple without nested menu complexities of MUI */}
                   <Menu
                      anchorEl={themeMenuAnchor}
                      open={Boolean(themeMenuAnchor)}
                      onClose={() => setThemeMenuAnchor(null)}
                      anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
                      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                   >
                      <MenuItem onClick={() => { setTheme('default'); setThemeMenuAnchor(null); }}>{t('themes.default')}</MenuItem>
                      <MenuItem onClick={() => { setTheme('chineseInk'); setThemeMenuAnchor(null); }}>{t('themes.chinese_ink')}</MenuItem>
                      <MenuItem onClick={() => { setTheme('darkGold'); setThemeMenuAnchor(null); }}>{t('themes.dark_gold')}</MenuItem>
                      <MenuItem onClick={() => { setTheme('neonSpectral'); setThemeMenuAnchor(null); }}>{t('themes.neon_spectral')}</MenuItem>
                   </Menu>

                   <Menu
                      anchorEl={langMenuAnchor}
                      open={Boolean(langMenuAnchor)}
                      onClose={() => setLangMenuAnchor(null)}
                      anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
                      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                   >
                      <MenuItem selected={i18n.language === 'en'} onClick={() => changeLanguage('en')}>English</MenuItem>
                      <MenuItem selected={i18n.language === 'zh'} onClick={() => changeLanguage('zh')}>简体中文</MenuItem>
                   </Menu>
                  </>
            </Stack>
          </Toolbar>
        </AppBar>

        <OfflineBanner />

        <Box
          sx={{
             flexGrow: 1,
             p: { xs: mobile.spacing.page, sm: mobile.spacing.page, md: 3, lg: 4 },
             pb: { xs: 'calc(96px + env(safe-area-inset-bottom))', lg: 4 },
             overflowY: 'auto',
             bgcolor: 'background.default',
             backgroundImage: 'radial-gradient(ellipse at top, rgba(255,255,255,0.05), transparent)',
             WebkitOverflowScrolling: 'touch'
          }}
          className="custom-scrollbar"
        >
           <Outlet />
        </Box>

        <Box sx={{ display: { lg: 'none' } }}>
           <BottomNavigation />
        </Box>
      </Box>
    </Box>
  );
}
