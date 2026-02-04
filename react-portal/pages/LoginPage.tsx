/**
 * Login Page
 * Authentication UI with username/password form
 */

import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Container,
} from '@mui/material';
import { useAuth } from '../hooks';
import { useTranslation } from 'react-i18next';

export function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login, isLoading, error } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!username || !password) {
      setLocalError(t('auth.invalid_credentials'));
      return;
    }

    const result = await login({ username, password });

    if (result.success) {
      navigate({ to: '/' });
    } else {
      setLocalError(result.error || t('auth.login_failed'));
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <Container maxWidth="sm">
        <Card
          sx={{
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            backdropFilter: 'blur(10px)',
            background: 'rgba(255, 255, 255, 0.95)',
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Typography
              variant="h4"
              component="h1"
              gutterBottom
              align="center"
              sx={{ fontWeight: 700, mb: 3 }}
            >
              {t('auth.login_title')}
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              align="center"
              sx={{ mb: 4 }}
            >
              {t('nav.dashboard')}
            </Typography>

            {(error || localError) && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {localError || error}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label={t('auth.username')}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
                autoComplete="username"
                autoFocus
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                type="password"
                label={t('auth.password')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                autoComplete="current-password"
                sx={{ mb: 3 }}
              />

              <Button
                fullWidth
                type="submit"
                variant="contained"
                size="large"
                disabled={isLoading}
                sx={{
                  py: 1.5,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)',
                  },
                }}
              >
                {isLoading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  t('auth.login_button')
                )}
              </Button>
            </form>

            <Typography
              variant="caption"
              color="text.secondary"
              align="center"
              display="block"
              sx={{ mt: 3 }}
            >
              Where Winds Meet - BaiYe Alliance
            </Typography>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
