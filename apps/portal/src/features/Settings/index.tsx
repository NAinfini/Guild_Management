import React, { useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Grid,
  Stack,
  Typography,
  Button,
  RadioGroup,
  FormControlLabel,
  Radio,
  useTheme,
  alpha,
  Slider,
  Divider,
} from '@mui/material';
import { Translate, FormatSize, Animation } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useUIStore } from '../../store';
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

export function Settings() {
  const { t, i18n } = useTranslation();
  const { setPageTitle } = useUIStore();
  const { fontScale, motionIntensity, setFontScale, setMotionIntensity } = useThemeController();
  const theme = useTheme();
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

  const handleMotionIntensityPreview = (_: Event, value: number | number[]) => {
    const next = Array.isArray(value) ? value[0] : value;
    setMotionIntensityDraft(Number(next.toFixed(2)));
  };

  const handleMotionIntensityCommit = (_: Event, value: number | number[]) => {
    const next = Array.isArray(value) ? value[0] : value;
    const normalized = Number(next.toFixed(2));
    setMotionIntensityDraft(normalized);
    setMotionIntensity(normalized);
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', pb: 8, px: { xs: 2, sm: 4 } }}>
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
            <Card variant="outlined" sx={{ borderRadius: 4, borderColor: alpha(theme.palette.secondary.main, 0.2) }}>
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
                          borderRadius: 3,
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
                  variant="text"
                  size="small"
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
            <Card variant="outlined" sx={{ borderRadius: 4, borderColor: alpha(theme.palette.primary.main, 0.2) }}>
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
                            borderRadius: 3,
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
                    {t('settings.motion_intensity_subtitle')}
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
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Stack>
    </Box>
  );
}

