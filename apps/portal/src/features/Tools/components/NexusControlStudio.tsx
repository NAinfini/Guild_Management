import React, { useMemo, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Chip,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import { DashboardCustomize } from '@mui/icons-material';
import {
  NEXUS_COLOR_OPTIONS,
  NEXUS_THEME_OPTIONS,
  useThemeController,
} from '@/theme/ThemeController';
import { useTranslation } from 'react-i18next';
import {
  ButtonsShowcase,
  ChoiceControlsShowcase,
  DropdownSelectShowcase,
  FeedbackShowcase,
  NavigationShowcase,
  RangeControlsShowcase,
  TextInputShowcase,
  AdvancedShowcase,
  DateTimeShowcase,
  DisclosureShowcase,
  DragGestureShowcase,
  FileMediaShowcase,
  FormFlowShowcase,
  GlobalSystemShowcase,
  LayoutViewShowcase,
  AccessibilityShowcase,
  SearchFilterShowcase,
} from '@/components/system';

interface ShowcaseComponentProps {
  className?: string;
}

type ShowcaseComponent = React.ComponentType<ShowcaseComponentProps>;

interface NexusCategory {
  id: string;
  labelKey: string;
  component: ShowcaseComponent;
}

export const NEXUS_CONTROL_CATEGORIES: NexusCategory[] = [
  { id: 'buttons', labelKey: 'tools.nexus_studio.categories.buttons', component: ButtonsShowcase },
  { id: 'text-input', labelKey: 'tools.nexus_studio.categories.text_input', component: TextInputShowcase },
  { id: 'choice-controls', labelKey: 'tools.nexus_studio.categories.choice_controls', component: ChoiceControlsShowcase },
  { id: 'dropdown-select', labelKey: 'tools.nexus_studio.categories.dropdown_select', component: DropdownSelectShowcase },
  { id: 'range-controls', labelKey: 'tools.nexus_studio.categories.range_controls', component: RangeControlsShowcase },
  { id: 'date-time', labelKey: 'tools.nexus_studio.categories.date_time', component: DateTimeShowcase },
  { id: 'navigation', labelKey: 'tools.nexus_studio.categories.navigation', component: NavigationShowcase },
  { id: 'disclosure', labelKey: 'tools.nexus_studio.categories.disclosure', component: DisclosureShowcase },
  { id: 'feedback', labelKey: 'tools.nexus_studio.categories.feedback', component: FeedbackShowcase },
  { id: 'search-filter', labelKey: 'tools.nexus_studio.categories.search_filter', component: SearchFilterShowcase },
  { id: 'file-media', labelKey: 'tools.nexus_studio.categories.file_media', component: FileMediaShowcase },
  { id: 'drag-gesture', labelKey: 'tools.nexus_studio.categories.drag_gesture', component: DragGestureShowcase },
  { id: 'layout-view', labelKey: 'tools.nexus_studio.categories.layout_view', component: LayoutViewShowcase },
  { id: 'form-flow', labelKey: 'tools.nexus_studio.categories.form_flow', component: FormFlowShowcase },
  { id: 'global-system', labelKey: 'tools.nexus_studio.categories.global_system', component: GlobalSystemShowcase },
  { id: 'accessibility', labelKey: 'tools.nexus_studio.categories.accessibility', component: AccessibilityShowcase },
  { id: 'advanced', labelKey: 'tools.nexus_studio.categories.advanced', component: AdvancedShowcase },
];

export function NexusControlStudio() {
  const { t } = useTranslation();
  const theme = useTheme();
  const themeController = useThemeController();
  const [categoryId, setCategoryId] = useState<string>('all');

  const visibleCategories = useMemo(() => {
    if (categoryId === 'all') return NEXUS_CONTROL_CATEGORIES;
    return NEXUS_CONTROL_CATEGORIES.filter((category) => category.id === categoryId);
  }, [categoryId]);

  const handleThemeChange = (event: SelectChangeEvent<string>) => {
    themeController.setTheme(event.target.value as any);
  };

  const handleColorChange = (event: SelectChangeEvent<string>) => {
    themeController.setColor(event.target.value as any);
  };

  return (
    <Stack spacing={4}>
      <Card
        variant="outlined"
        sx={{
          borderRadius: 4,
          borderColor: alpha(theme.palette.primary.main, 0.25),
          overflow: 'hidden',
        }}
      >
        <CardContent sx={{ p: { xs: 2, md: 3 } }}>
          <Stack spacing={2.5}>
            <Stack
              direction={{ xs: 'column', lg: 'row' }}
              spacing={2}
              justifyContent="space-between"
              alignItems={{ xs: 'flex-start', lg: 'center' }}
            >
              <Stack spacing={1}>
                <Stack direction="row" spacing={1.2} alignItems="center">
                  <DashboardCustomize color="primary" fontSize="small" />
                  <Typography variant="h6" fontWeight={900}>
                    {t('tools.nexus_studio.title')}
                  </Typography>
                </Stack>
                <Typography variant="body2" color="text.secondary">
                  {t('tools.nexus_studio.subtitle')}
                </Typography>
              </Stack>

              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1.5}
                sx={{ width: { xs: '100%', lg: 'auto' }, minWidth: { lg: 460 } }}
              >
                <FormControl size="small" fullWidth>
                  <InputLabel id="nexus-theme-select-label">
                    {t('settings.visual_theme')}
                  </InputLabel>
                  <Select
                    labelId="nexus-theme-select-label"
                    value={themeController.currentTheme}
                    label={t('settings.visual_theme')}
                    onChange={handleThemeChange}
                    inputProps={{ 'data-testid': 'nexus-theme-select' }}
                  >
                    {NEXUS_THEME_OPTIONS.map((option) => (
                      <MenuItem key={option.id} value={option.id}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Box
                            sx={{
                              width: 14,
                              height: 14,
                              borderRadius: 0.75,
                              bgcolor: (option as any).swatch || theme.palette.primary.main,
                              boxShadow: `0 0 0 1px ${alpha(theme.palette.common.white, 0.15)}`,
                            }}
                          />
                          <Typography variant="body2">
                            {t(`theme_menu.themes.${option.id}.label`, {
                              defaultValue: option.label,
                            })}
                          </Typography>
                        </Stack>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl size="small" fullWidth>
                  <InputLabel id="nexus-color-select-label">
                    {t('settings.color_palette')}
                  </InputLabel>
                  <Select
                    labelId="nexus-color-select-label"
                    value={themeController.currentColor}
                    label={t('settings.color_palette')}
                    onChange={handleColorChange}
                    inputProps={{ 'data-testid': 'nexus-color-select' }}
                  >
                    {NEXUS_COLOR_OPTIONS.map((option) => (
                      <MenuItem key={option.id} value={option.id}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Box
                            sx={{
                              width: 20,
                              height: 12,
                              borderRadius: 0.75,
                              background: option.swatch,
                              boxShadow: `0 0 0 1px ${alpha(theme.palette.common.white, 0.15)}`,
                            }}
                          />
                          <Typography variant="body2">
                            {t(`theme_menu.colors.${option.id}.label`, {
                              defaultValue: option.label,
                            })}
                          </Typography>
                        </Stack>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Stack>
            </Stack>

            <Stack direction="row" useFlexGap flexWrap="wrap" gap={1}>
              <Chip
                label={t('common.all')}
                size="small"
                color={categoryId === 'all' ? 'primary' : 'default'}
                onClick={() => setCategoryId('all')}
              />
              {NEXUS_CONTROL_CATEGORIES.map((category) => (
                <Chip
                  key={category.id}
                  label={t(category.labelKey)}
                  size="small"
                  color={categoryId === category.id ? 'primary' : 'default'}
                  onClick={() => setCategoryId(category.id)}
                />
              ))}
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      <Box
        className="nexus-control-scope"
        sx={{
          '& .control': {
            transition: 'all var(--theme-duration) var(--theme-easing)',
            fontFamily: 'var(--theme-font-body)',
          },
          '& .control:focus-visible': {
            outline: `2px solid ${alpha(theme.palette.primary.main, 0.8)}`,
            outlineOffset: '2px',
          },
          '& a': {
            color: 'var(--color-text-link)',
          },
        }}
      >
        <Grid container spacing={3} data-testid="nexus-showcase-grid">
          {visibleCategories.map((category) => {
            const CategoryComponent = category.component;
            return (
              <Grid
                key={category.id}
                size={{ xs: 12, md: categoryId === 'all' ? 6 : 12 }}
                data-testid="nexus-showcase-grid-item"
              >
                <Card
                  variant="outlined"
                  sx={{
                    borderRadius: 3,
                    borderColor: alpha(theme.palette.divider, 0.9),
                    bgcolor: alpha(theme.palette.background.paper, 0.85),
                    backdropFilter: 'blur(10px)',
                    height: '100%',
                  }}
                >
                  <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                    <CategoryComponent />
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Box>
    </Stack>
  );
}

export default NexusControlStudio;
