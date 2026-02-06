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
  alpha
} from '@mui/material';
import { Palette, Languages } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useUIStore } from '../../store';
import { useThemeController, ThemeMode } from '../../theme/ThemeController';

const themeOptions: { key: ThemeMode; label: string; descKey: string; swatch: string }[] = [
  { key: 'default', label: 'settings.theme_default', descKey: 'settings.theme_default_desc', swatch: '#4f46e5' },
  { key: 'chineseInk', label: 'settings.theme_chinese_ink', descKey: 'settings.theme_chinese_ink_desc', swatch: '#0f172a' },
  { key: 'darkGold', label: 'settings.theme_dark_gold', descKey: 'settings.theme_dark_gold_desc', swatch: '#d97706' },
  { key: 'neonSpectral', label: 'settings.theme_neon', descKey: 'settings.theme_neon_desc', swatch: '#0ea5e9' },
];

const languageOptions = [
  { key: 'en', label: 'settings.language_english' },
  { key: 'zh', label: 'settings.language_chinese' },
];

export function Settings() {
  const { t, i18n } = useTranslation();
  const { setPageTitle } = useUIStore();
  const { currentTheme, setTheme } = useThemeController();
  const theme = useTheme();

  useEffect(() => {
    setPageTitle(t('nav.settings'));
  }, [setPageTitle, t]);

  const handleThemeChange = (value: ThemeMode) => {
    setTheme(value);
  };

  const handleLanguageChange = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('i18nextLng', lng);
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', pb: 8, px: { xs: 2, sm: 4 } }}>
      <Stack spacing={{ xs: 3, sm: 4 }}>
        <Typography variant="h4" fontWeight={900} letterSpacing="0.02em">
          {t('settings.title')}
        </Typography>
        <Grid container spacing={{ xs: 3, md: 4 }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card variant="outlined" sx={{ borderRadius: 4, borderColor: alpha(theme.palette.primary.main, 0.2) }}>
              <CardHeader
                avatar={<Palette size={20} color={theme.palette.primary.main} />}
                title={
                  <Typography variant="h6" fontWeight={900}>
                    {t('settings.appearance')}
                  </Typography>
                }
                subheader={
                  <Typography variant="body2" color="text.secondary">
                    {t('settings.appearance_subtitle')}
                  </Typography>
                }
              />
              <CardContent sx={{ pt: 0 }}>
                <RadioGroup
                  value={currentTheme}
                  onChange={(e) => handleThemeChange(e.target.value as ThemeMode)}
                >
                  <Stack spacing={1.5}>
                    {themeOptions.map((opt) => (
                      <Box
                        key={opt.key}
                        sx={{
                          border: `1px solid ${opt.key === currentTheme ? theme.palette.primary.main : theme.palette.divider}`,
                          borderRadius: 3,
                          p: 1.25,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          boxShadow: opt.key === currentTheme ? `0 10px 20px ${alpha(theme.palette.primary.main, 0.12)}` : 'none',
                          transition: 'all 0.2s',
                        }}
                      >
                        <FormControlLabel
                          value={opt.key}
                          control={<Radio color="primary" />}
                          label={
                            <Stack spacing={0.3}>
                              <Stack direction="row" spacing={1} alignItems="center">
                                <Box
                                  sx={{
                                    width: 16,
                                    height: 16,
                                    borderRadius: 1,
                                    background: opt.swatch,
                                    boxShadow: `0 0 0 2px ${alpha(opt.swatch, 0.2)}`,
                                  }}
                                />
                                <Typography variant="subtitle1" fontWeight={800}>
                                  {t(opt.label)}
                                </Typography>
                              </Stack>
                              <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.4 }}>
                                {t(opt.descKey)}
                              </Typography>
                            </Stack>
                          }
                          sx={{ flex: 1, m: 0 }}
                        />
                        {opt.key === currentTheme && (
                          <Chip size="small" color="primary" label={t('settings.active')} sx={{ fontWeight: 800 }} />
                        )}
                      </Box>
                    ))}
                  </Stack>
                </RadioGroup>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Card variant="outlined" sx={{ borderRadius: 4, borderColor: alpha(theme.palette.secondary.main, 0.2) }}>
              <CardHeader
                avatar={<Languages size={20} color={theme.palette.secondary.main} />}
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
                  value={i18n.language.startsWith('zh') ? 'zh' : 'en'}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                >
                  <Stack spacing={1.25}>
                    {languageOptions.map((opt) => (
                      <Box
                        key={opt.key}
                        sx={{
                          border: `1px solid ${ (i18n.language.startsWith('zh') ? 'zh' : 'en') === opt.key ? theme.palette.secondary.main : theme.palette.divider}`,
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
                                {opt.key === 'en' ? 'English' : '中文'}
                              </Typography>
                            </Stack>
                          }
                          sx={{ flex: 1, m: 0 }}
                        />
                        {(i18n.language.startsWith('zh') ? 'zh' : 'en') === opt.key && (
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
        </Grid>
      </Stack>
    </Box>
  );
}
