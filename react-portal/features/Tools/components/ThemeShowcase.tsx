import React from 'react';
import {
  Box,
  Button,
  IconButton,
  Card,
  CardContent,
  Paper,
  Chip,
  TextField,
  Tabs,
  Tab,
  Switch,
  ToggleButton,
  ToggleButtonGroup,
  Checkbox,
  Radio,
  RadioGroup,
  FormControlLabel,
  Slider,
  LinearProgress,
  Tooltip,
  Typography,
  Stack,
  Divider,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  alpha,
  ThemeProvider,
  createTheme,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Menu,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Badge,
  Avatar,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Snackbar,
  Alert,
  Backdrop,
  CircularProgress,
} from '@mui/material';
import {
  Send,
  Settings,
  User,
  Bell,
  Check,
  X,
  Search,
  LayoutDashboard,
  Star,
  Heart,
  Bookmark,
  MoreVertical,
  ChevronDown,
  Zap,
  Mail,
  AlertTriangle,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ThemeMode } from '../../../theme/ThemeController';
import { neonSpectralTheme } from '../../../theme/themes/neonSpectral';
import { chineseInkTheme } from '../../../theme/themes/chineseInk';
import { darkGoldTheme } from '../../../theme/themes/darkGold';
import { redGoldTheme } from '../../../theme/themes/redGold';
import { softPinkTheme } from '../../../theme/themes/softPink';

export function ThemeShowcase() {
  const { t } = useTranslation();
  const [labTheme, setLabTheme] = React.useState<ThemeMode>('neonSpectral');
  const [tabValue, setTabValue] = React.useState(0);
  const [toggleValue, setToggleValue] = React.useState('web');
  const [selectValue, setSelectValue] = React.useState('option1');
  const [menuAnchor, setMenuAnchor] = React.useState<null | HTMLElement>(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [snackbarOpen, setSnackbarOpen] = React.useState(false);
  const [backdropOpen, setBackdropOpen] = React.useState(false);

  const themes: Array<{ id: ThemeMode; label: string }> = [
    { id: 'neonSpectral', label: t('themes.neon_spectral') },
    { id: 'chineseInk', label: t('themes.chinese_ink') },
    { id: 'darkGold', label: t('themes.dark_gold') },
    { id: 'redGold', label: t('themes.red_gold') },
    { id: 'softPink', label: t('themes.soft_pink') },
  ];

  const themeOptions = React.useMemo(() => {
    switch (labTheme) {
      case 'chineseInk': return chineseInkTheme;
      case 'darkGold': return darkGoldTheme;
      case 'redGold': return redGoldTheme;
      case 'softPink': return softPinkTheme;
      default: return neonSpectralTheme;
    }
  }, [labTheme]);

  const currentThemeObj = React.useMemo(() => createTheme(themeOptions), [themeOptions]);

  return (
    <ThemeProvider theme={currentThemeObj}>
      <Box
        className="theme-scope"
        data-theme={labTheme}
        sx={{
          p: 4,
          minHeight: '100vh',
          position: 'relative',
          bgcolor: 'background.default',
        }}
      >
        {/* Atmosphere Layer (matching global theme atmosphere) */}
        <Box
          className="app-atmosphere"
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            zIndex: -1,
            pointerEvents: 'none',
            overflow: 'hidden',
          }}
        >
          <Box className="atmo-layer-base" />
          <Box className="atmo-layer-texture" />
          <Box className="atmo-layer-fx" />
        </Box>

        {/* Theme Selector */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="overline" sx={{ fontWeight: 900, letterSpacing: '0.2em', color: 'primary.main', opacity: 0.8 }}>
              {t('themeLab.active_theme')}
            </Typography>
            <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap sx={{ mt: 2 }}>
              {themes.map((t) => (
                <Button
                  key={t.id}
                  variant={labTheme === t.id ? 'contained' : 'outlined'}
                  onClick={() => setLabTheme(t.id)}
                  size="small"
                >
                  {t.label}
                </Button>
              ))}
            </Stack>
          </CardContent>
        </Card>

        <Grid container spacing={4}>
        {/* Buttons Section */}
        <Grid size={{ xs: 12, md: 6 }}>
          <SectionTitle title={t('themeLab.control_geometry')} />
          <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap sx={{ mb: 3 }}>
            <Button variant="contained">{t('themeLab.primary_action')}</Button>
            <Button variant="outlined">{t('themeLab.secondary')}</Button>
            <Button variant="text">{t('themeLab.plain_text')}</Button>
            <IconButton color="primary">
               <Settings size={20} />
            </IconButton>
          </Stack>
          <Stack direction="row" spacing={2} alignItems="center">
            <ToggleButtonGroup
              value={toggleValue}
              exclusive
              onChange={(_, v) => v && setToggleValue(v)}
              size="small"
            >
              <ToggleButton value="web">WEB</ToggleButton>
              <ToggleButton value="android">APP</ToggleButton>
              <ToggleButton value="ios">IOS</ToggleButton>
            </ToggleButtonGroup>
            <FormControlLabel control={<Checkbox defaultChecked />} label={t('themeLab.active')} />
            <RadioGroup row defaultValue="a">
              <FormControlLabel value="a" control={<Radio />} label="A" />
              <FormControlLabel value="b" control={<Radio />} label="B" />
            </RadioGroup>
          </Stack>
        </Grid>

        {/* Inputs Section */}
        <Grid size={{ xs: 12, md: 6 }}>
          <SectionTitle title={t('themeLab.input_material')} />
          <Stack spacing={3}>
            <TextField
              fullWidth
              label={t('themeLab.standard_input')}
              placeholder={t('themeLab.type_something')}
              variant="outlined"
            />
            <TextField
              fullWidth
              label={t('themeLab.focused_error')}
              defaultValue={t('themeLab.invalid_entry')}
              error
              variant="outlined"
            />
            <Stack direction="row" spacing={2} alignItems="center">
              <Switch defaultChecked />
              <Typography variant="body2">{t('themeLab.system_toggle')}</Typography>
            </Stack>
          </Stack>
        </Grid>

        {/* Surfaces Section */}
        <Grid size={{ xs: 12, md: 6 }}>
          <SectionTitle title={t('themeLab.surface_material')} />
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight={800}>{t('themeLab.material_card')}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('themeLab.material_card_desc')}
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <LinearProgress variant="determinate" value={70} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Paper sx={{ p: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
                <Typography variant="subtitle2" fontWeight={700}>{t('themeLab.standard_paper')}</Typography>
                <Chip label={t('themeLab.new_system')} size="small" variant="filled" color="primary" />
                <Chip label={t('themeLab.stable')} size="small" variant="outlined" />
              </Paper>
            </Grid>
          </Grid>
        </Grid>

        {/* Specialized Section */}
        <Grid size={{ xs: 12, md: 6 }}>
          <SectionTitle title={t('themeLab.signature_flourish')} />
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
              <Tab label={t('themeLab.tactical')} />
              <Tab label={t('themeLab.logistics')} />
              <Tab label={t('themeLab.archive')} />
            </Tabs>
          </Box>
          <Box sx={{ pt: 2 }}>
            <SectionSubTitle title={t('themeLab.data_grid_physics')} />
            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 1 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>{t('themeLab.operative')}</TableCell>
                    <TableCell align="right">{t('themeLab.status')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>{t('themeLab.ghost_prime')}</TableCell>
                    <TableCell align="right"><Chip label={t('themeLab.active')} size="small" color="success" /></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>{t('themeLab.shadow_one')}</TableCell>
                    <TableCell align="right"><Chip label="STANDBY" size="small" /></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
          <Box sx={{ mt: 3 }}>
             <Typography variant="body2" gutterBottom>{t('themeLab.resource_load')}</Typography>
             <Slider defaultValue={50} />
          </Box>
        </Grid>

        {/* Additional Controls Section */}
        <Grid size={{ xs: 12 }}>
          <SectionTitle title={t('themeLab.extended_controls')} />
          <Grid container spacing={3}>
            {/* Selects & Menus */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle2" fontWeight={700} gutterBottom>{t('themeLab.select_menu')}</Typography>
                  <Stack spacing={2}>
                    <FormControl fullWidth>
                      <InputLabel>{t('themeLab.theme_select')}</InputLabel>
                      <Select value={selectValue} label={t('themeLab.theme_select')} onChange={(e) => setSelectValue(e.target.value)}>
                        <MenuItem value="option1">{t('themes.neon_spectral')}</MenuItem>
                        <MenuItem value="option2">{t('themes.chinese_ink')}</MenuItem>
                        <MenuItem value="option3">{t('themes.dark_gold')}</MenuItem>
                      </Select>
                    </FormControl>
                    <Button variant="outlined" onClick={(e) => setMenuAnchor(e.currentTarget)}>
                      <MoreVertical size={16} style={{ marginRight: 8 }} />
                      {t('themeLab.open_menu')}
                    </Button>
                    <Menu
                      anchorEl={menuAnchor}
                      open={Boolean(menuAnchor)}
                      onClose={() => setMenuAnchor(null)}
                    >
                      <MenuItem onClick={() => setMenuAnchor(null)}><Star size={16} style={{ marginRight: 8 }} /> {t('themeLab.favorites')}</MenuItem>
                      <MenuItem onClick={() => setMenuAnchor(null)}><Bookmark size={16} style={{ marginRight: 8 }} /> {t('themeLab.bookmarks')}</MenuItem>
                      <MenuItem onClick={() => setMenuAnchor(null)}><Settings size={16} style={{ marginRight: 8 }} /> {t('themeLab.settings')}</MenuItem>
                    </Menu>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            {/* Badges & Avatars */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle2" fontWeight={700} gutterBottom>{t('themeLab.badges_avatars')}</Typography>
                  <Stack spacing={2} alignItems="center">
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Badge badgeContent={4} color="primary">
                        <Bell />
                      </Badge>
                      <Badge badgeContent={99} color="secondary">
                        <Mail />
                      </Badge>
                      <Badge badgeContent="!" color="error">
                        <AlertTriangle />
                      </Badge>
                    </Stack>
                    <Stack direction="row" spacing={2}>
                      <Avatar alt="User demo"><User /></Avatar>
                      <Avatar alt="Settings demo" variant="rounded"><Settings /></Avatar>
                      <Avatar alt="Star demo" sx={{ bgcolor: 'secondary.main' }}><Star /></Avatar>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            {/* Feedback Components */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle2" fontWeight={700} gutterBottom>{t('themeLab.feedback_loading')}</Typography>
                  <Stack spacing={2}>
                    <Stack direction="row" spacing={2}>
                      <Button size="small" onClick={() => setSnackbarOpen(true)}>{t('themeLab.show_snackbar')}</Button>
                      <Button size="small" onClick={() => setBackdropOpen(true)}>{t('themeLab.show_backdrop')}</Button>
                    </Stack>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <CircularProgress size={24} />
                      <CircularProgress size={32} />
                      <CircularProgress variant="determinate" value={75} />
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        {/* Dialogs & Alerts */}
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" fontWeight={700} gutterBottom>{t('themeLab.dialogs_alerts')}</Typography>
              <Stack direction="row" spacing={2} flexWrap="wrap">
                <Button variant="contained" onClick={() => setDialogOpen(true)}>
                  {t('themeLab.open_dialog')}
                </Button>
                <Button variant="outlined" onClick={() => setSnackbarOpen(true)}>
                  {t('themeLab.show_success')}
                </Button>
                <Button variant="outlined" onClick={() => setSnackbarOpen(true)}>
                  {t('themeLab.show_error')}
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* List Components */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" fontWeight={700} gutterBottom>{t('themeLab.styled_lists')}</Typography>
              <List>
                <ListItem disablePadding>
                  <ListItemButton>
                    <ListItemIcon><User /></ListItemIcon>
                    <ListItemText primary={t('themeLab.profile_settings')} secondary={t('themeLab.manage_account')} />
                    <ChevronDown />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton>
                    <ListItemIcon><Bell /></ListItemIcon>
                    <ListItemText primary={t('themeLab.notifications')} secondary={t('themeLab.new_alerts')} />
                    <Badge badgeContent={12} color="primary" />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton>
                    <ListItemIcon><Heart /></ListItemIcon>
                    <ListItemText primary={t('themeLab.favorites_list')} secondary={t('themeLab.saved_items')} />
                  </ListItemButton>
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Dialog Component */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t('themeLab.theme_dialog_title')}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            {t('themeLab.theme_dialog_desc')}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>{t('common.cancel')}</Button>
          <Button variant="contained" onClick={() => setDialogOpen(false)}>{t('common.confirm')}</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity="success" sx={{ width: '100%' }}>
          {t('themeLab.theme_applied_success')}
        </Alert>
      </Snackbar>

      {/* Backdrop */}
      <Backdrop open={backdropOpen} onClick={() => setBackdropOpen(false)} sx={{ zIndex: 9999 }}>
        <CircularProgress color="inherit" />
      </Backdrop>
      </Box>
    </ThemeProvider>
  );
}

function SectionTitle({ title }: { title: string }) {
  return (
    <Typography 
      variant="overline" 
      sx={{ 
        display: 'block', 
        mb: 2, 
        fontWeight: 900, 
        letterSpacing: '0.2em', 
        color: 'primary.main',
        opacity: 0.8 
      }}
    >
      {title}
    </Typography>
  );
}

function SectionSubTitle({ title }: { title: string }) {
  return (
    <Typography 
      variant="caption" 
      sx={{ 
        display: 'block', 
        mb: 1, 
        fontWeight: 800, 
        textTransform: 'uppercase',
        color: 'text.secondary'
      }}
    >
      {title}
    </Typography>
  );
}
