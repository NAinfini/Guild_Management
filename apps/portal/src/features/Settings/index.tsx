import React, { useEffect } from 'react';
import {
  FormGroup,
  Box,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Grid,
  Stack,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  useTheme,
  alpha,
  Divider,
  Switch as MuiSwitch,
} from '@mui/material';
import { Translate, FormatSize, Animation, AccessibilityNew } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useUIStore } from '../../store';
import { Button, Slider } from '@/components';
import { ThemeSection, ColorSection, useThemeController } from '@/theme/ThemeController';

const languageOptions = [
  { key: 'en', label: 'settings.language_english' },
  { key: 'zh', label: 'settings.language_chinese' },
];

const FONT_SIZE_OPTIONS = [
  { value: 0.92, label: 'settings.font_size_small', caption: '92%' },
  { value: 1, label: 'settings.font_size_default', caption: '100%' },
  { value: 1.12, label: 'settings.font_size_large', caption: '112%' },
];

const COLOR_BLIND_MODE_OPTIONS = [
  { value: 'off', label: 'settings.color_blind_mode_off' },
  { value: 'protanopia', label: 'settings.color_blind_mode_protanopia' },
  { value: 'deuteranopia', label: 'settings.color_blind_mode_deuteranopia' },
  { value: 'tritanopia', label: 'settings.color_blind_mode_tritanopia' },
] as const;

export function Settings() {
  const { t, i18n } = useTranslation();
  const { setPageTitle } = useUIStore();
  const {
    currentTheme,
    fontScale,
    motionIntensity,
    highContrast,
    dyslexiaFriendly,
    colorBlindMode,
    setFontScale,
    setMotionIntensity,
    setHighContrast,
    setDyslexiaFriendly,
    setColorBlindMode,
  } = useThemeController();
  const theme = useTheme();
  const isChibiTheme = currentTheme === 'chibi';
  const settingsCardRadius = isChibiTheme ? '12px' : 4;
  const settingsOptionRadius = isChibiTheme ? '10px' : 3;
  const selectedLanguage = i18n.language.startsWith('zh') ? 'zh' : 'en';
  const [motionIntensityDraft, setMotionIntensityDraft] = React.useState(motionIntensity);

  useEffect(() => {
    setPageTitle(t('nav.settings'));
  }, [setPageTitle, t]);

  useEffect(() => {
    setMotionIntensityDraft(motionIntensity);
  }, [motionIntensity]);

  const handleLanguageChange = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('i18nextLng', lng);
  };

  const handleFontSizeChange = (value: number) => {
    setFontScale(value);
  };

  const handleMotionIntensityPreview = (_: Event | React.SyntheticEvent, value: number | number[]) => {
    const next = Array.isArray(value) ? value[0] : value;
    setMotionIntensityDraft(Number(next.toFixed(2)));
  };

  const handleMotionIntensityCommit = (_: Event | React.SyntheticEvent, value: number | number[]) => {
    const next = Array.isArray(value) ? value[0] : value;
    const normalized = Number(next.toFixed(2));
    setMotionIntensityDraft(normalized);
    setMotionIntensity(normalized);
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', pb: 8, px: { xs: 2, sm: 4 }, position: 'relative', zIndex: 2 }}>
      <Stack spacing={{ xs: 3, sm: 4 }}>
        <Typography variant="h4" fontWeight={900} letterSpacing="0.02em">
          {t('settings.title')}
        </Typography>
        <Grid container spacing={{ xs: 3, md: 4 }}>
          {/* Visual Theme Section - Independent from Color */}
          <Grid size={{ xs: 12, md: 6 }}>
            <ThemeSection
              title={t('settings.visual_theme')}
              subtitle={t('settings.visual_theme_subtitle')}
            />
          </Grid>

          {/* Color Palette Section - Independent from Theme */}
          <Grid size={{ xs: 12, md: 6 }}>
            <ColorSection
              title={t('settings.color_palette')}
              subtitle={t('settings.color_palette_subtitle')}
            />
          </Grid>

          {/* Language Section - Separate Card */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card
              variant="outlined"
              sx={{
                borderRadius: settingsCardRadius,
                borderColor: alpha(theme.palette.secondary.main, 0.2),
                overflow: 'visible',
              }}
            >
              <CardHeader
                avatar={<Translate sx={{ fontSize: 20, color: theme.palette.secondary.main }} />}
                title={
                  <Typography variant="h6" fontWeight={900}>
                    {t('settings.language')}
                  </Typography>
                }
                subheader={
                  <Typography variant="body2" color="text.secondary">
                    {t('settings.language_subtitle')}
                  </Typography>
                }
              />
              <CardContent sx={{ pt: 0 }}>
                <RadioGroup
                  value={selectedLanguage}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                >
                  <Stack spacing={1.25}>
                    {languageOptions.map((opt) => (
                      <Box
                        key={opt.key}
                        sx={{
                          border: `1px solid ${selectedLanguage === opt.key ? theme.palette.secondary.main : theme.palette.divider}`,
                          borderRadius: settingsOptionRadius,
                          p: 1.25,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          transition: 'all 0.2s',
                        }}
                      >
                        <FormControlLabel
                          value={opt.key}
                          control={<Radio color="secondary" />}
                          label={
                            <Stack spacing={0.25}>
                              <Typography variant="subtitle1" fontWeight={800}>
                                {t(opt.label)}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {opt.key === 'en' ? t('settings.language_native_english') : t('settings.language_native_chinese')}
                              </Typography>
                            </Stack>
                          }
                          sx={{ flex: 1, m: 0 }}
                        />
                        {selectedLanguage === opt.key && (
                          <Chip size="small" color="secondary" label={t('settings.active')} sx={{ fontWeight: 800 }} />
                        )}
                      </Box>
                    ))}
                  </Stack>
                </RadioGroup>
                <Button
                  variant="ghost"
                  size="sm"
                  sx={{ mt: 2, fontWeight: 800, letterSpacing: '0.05em' }}
                  onClick={() => handleLanguageChange(i18n.resolvedLanguage || 'en')}
                >
                  {t('settings.apply')}
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* Accessibility & Motion */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card
              variant="outlined"
              sx={{
                borderRadius: settingsCardRadius,
                borderColor: alpha(theme.palette.primary.main, 0.2),
                overflow: 'visible',
              }}
            >
              <CardHeader
                avatar={<FormatSize sx={{ fontSize: 20, color: theme.palette.primary.main }} />}
                title={
                  <Typography variant="h6" fontWeight={900}>
                    {t('settings.font_size')}
                  </Typography>
                }
                subheader={
                  <Typography variant="body2" color="text.secondary">
                    {t('settings.font_size_subtitle')}
                  </Typography>
                }
              />
              <CardContent sx={{ pt: 0 }}>
                <RadioGroup
                  value={String(fontScale)}
                  onChange={(e) => handleFontSizeChange(Number(e.target.value))}
                >
                  <Stack spacing={1.25}>
                    {FONT_SIZE_OPTIONS.map((opt) => {
                      const selected = Math.abs(fontScale - opt.value) < 0.001;
                      return (
                        <Box
                          key={opt.value}
                          sx={{
                            border: `1px solid ${selected ? theme.palette.primary.main : theme.palette.divider}`,
                            borderRadius: settingsOptionRadius,
                            p: 1.25,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            transition: 'all 0.2s',
                          }}
                        >
                          <FormControlLabel
                            value={String(opt.value)}
                            control={<Radio color="primary" />}
                            label={
                              <Stack spacing={0.25}>
                                <Typography variant="subtitle1" fontWeight={800}>
                                  {t(opt.label)}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {opt.caption}
                                </Typography>
                              </Stack>
                            }
                            sx={{ flex: 1, m: 0 }}
                          />
                          {selected && (
                            <Chip size="small" color="primary" label={t('settings.active')} sx={{ fontWeight: 800 }} />
                          )}
                        </Box>
                      );
                    })}
                  </Stack>
                </RadioGroup>

                <Divider sx={{ my: 2.5 }} />

                <Stack spacing={1.5}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Animation sx={{ fontSize: 20, color: theme.palette.secondary.main }} />
                    <Typography variant="subtitle1" fontWeight={800}>
                      {t('settings.motion_intensity')}
                    </Typography>
                  </Stack>
                  <Typography variant="caption" color="text.secondary">
                    {t('settings.motion_intensity_single_control_subtitle', {
                      defaultValue: 'One control for all animation strength across controls and backgrounds.',
                    })}
                  </Typography>
                  <Slider
                    value={motionIntensityDraft}
                    min={0}
                    max={1.5}
                    step={0.05}
                    marks={[
                      { value: 0, label: t('settings.motion_off') },
                      { value: 0.6, label: t('settings.motion_low') },
                      { value: 1, label: t('settings.motion_normal') },
                      { value: 1.35, label: t('settings.motion_high') },
                    ]}
                    valueLabelDisplay="auto"
                    valueLabelFormat={(value) => `${Math.round(value * 100)}%`}
                    onChange={handleMotionIntensityPreview}
                    onChangeCommitted={handleMotionIntensityCommit}
                    sx={{ pt: 2 }}
                  />
                </Stack>

                <Divider sx={{ my: 2.5 }} />

                <Stack spacing={1.5}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <AccessibilityNew sx={{ fontSize: 20, color: theme.palette.primary.main }} />
                    <Typography variant="subtitle1" fontWeight={800}>
                      {t('settings.accessibility_plus')}
                    </Typography>
                  </Stack>
                  <Typography variant="caption" color="text.secondary">
                    {t('settings.accessibility_plus_subtitle')}
                  </Typography>
                  <FormGroup>
                    <FormControlLabel
                      control={(
                        <MuiSwitch
                          data-testid="high-contrast-toggle"
                          checked={highContrast}
                          onChange={(_, checked) => setHighContrast(checked)}
                        />
                      )}
                      label={t('settings.high_contrast_mode')}
                    />
                    <FormControlLabel
                      control={(
                        <MuiSwitch
                          data-testid="dyslexia-toggle"
                          checked={dyslexiaFriendly}
                          onChange={(_, checked) => setDyslexiaFriendly(checked)}
                        />
                      )}
                      label={t('settings.dyslexia_friendly_font')}
                    />
                  </FormGroup>
                  <Stack spacing={0.5}>
                    <Typography variant="caption" color="text.secondary">
                      {t('settings.color_blind_mode')}
                    </Typography>
                    <Box
                      component="select"
                      data-testid="color-blind-mode-select"
                      value={colorBlindMode}
                      onChange={(event: React.ChangeEvent<HTMLSelectElement>) =>
                        setColorBlindMode(event.target.value as typeof colorBlindMode)}
                      sx={{
                        border: `1px solid ${theme.palette.divider}`,
                        borderRadius: 1.5,
                        px: 1.5,
                        py: 1,
                        backgroundColor: alpha(theme.palette.background.paper, 0.9),
                        color: theme.palette.text.primary,
                        fontSize: 14,
                        outline: 'none',
                      }}
                    >
                      {COLOR_BLIND_MODE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {t(option.label)}
                        </option>
                      ))}
                    </Box>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Stack>
    </Box>
  );
}

