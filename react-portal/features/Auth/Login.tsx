
import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  Button, 
  TextField, 
  Typography, 
  Box, 
  Stack, 
  Checkbox, 
  FormControlLabel, 
  InputAdornment, 
  IconButton,
  Alert,
  useTheme,
  CircularProgress
} from '@mui/material';
import { useAuth } from '../../hooks';
import { useNavigate, Link, useSearch } from '@tanstack/react-router';
import { Eye, EyeOff, AlertCircle, ArrowLeft, Lock, User, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function Login() {
  const { login, isLoading, error } = useAuth();
  const navigate = useNavigate();
  const search = useSearch({ from: '/login' });
  const theme = useTheme();
  const { t } = useTranslation();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isCapsLockOn, setIsCapsLockOn] = useState(false);
  const [stayLoggedIn, setStayLoggedIn] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const returnTo = (search as any).returnTo || '/';

  // Basic inline validation
  const usernameError = submitted && !username;
  const passwordError = submitted && !password;

  // Detect Caps Lock
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.getModifierState('CapsLock')) {
      setIsCapsLockOn(true);
    } else {
      setIsCapsLockOn(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setLocalError(null);

    if (!username || !password) {
        return;
    }

    const result = await login({ username, password, rememberMe: stayLoggedIn });
    if (result.success) {
      // Force a full page reload to ensure cookie is properly set
      window.location.href = returnTo || '/';
    } else {
      // Map server error code to translation key if possible
      const errorKey = result.error;
      const translatedError = errorKey ? t(`errors.${errorKey}`, { defaultValue: errorKey }) : t('login.error_fail');
      setLocalError(translatedError);
    }
  };

  return (
    <Box sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        background: `radial-gradient(ellipse at top, ${theme.palette.primary.main}1A, ${theme.palette.background.default}, ${theme.palette.background.default})`,
        p: 2 
    }}>
       <Box sx={{ width: '100%', maxWidth: 450 }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <Button 
                startIcon={<ArrowLeft size={16} />} 
                sx={{ mb: 2, color: 'text.secondary', '&:hover': { color: 'text.primary' } }}
            >
                {t('login.back_dashboard')}
            </Button>
          </Link>

          <Card sx={{ 
              backgroundColor: 'rgba(255,255,255,0.02)', 
              backdropFilter: 'blur(20px)',
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 4
          }}>
            <CardHeader 
                sx={{ textAlign: 'center', pb: 0, pt: 4 }}
                title={
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ 
                            width: 56, height: 56, borderRadius: 3, 
                            background: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: `0 8px 32px ${theme.palette.primary.main}40`
                        }}>
                             <Lock className="text-white h-7 w-7" />
                        </Box>
                        <Typography variant="h4" sx={{ 
                            fontWeight: 900, 
                            letterSpacing: '-0.02em',
                            background: `linear-gradient(to right, ${theme.palette.primary.light}, ${theme.palette.primary.main})`,
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            color: 'transparent'
                        }}>
                           BaiYe Portal
                        </Typography>
                    </Box>
                }
                subheader={
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontWeight: 500 }}>
                        {t('login.title')}
                    </Typography>
                }
            />
            
            <CardContent sx={{ p: 4, pt: 4 }}>
               {(error || localError) && (
                 <Alert severity="error" icon={<AlertCircle size={18} />} sx={{ mb: 3, borderRadius: 2 }}>
                    {localError || (error ? t(`errors.${error}`, { defaultValue: error }) : '')}
                 </Alert>
               )}

               <form onSubmit={handleSubmit} onKeyDown={handleKeyDown}>
                  <Stack spacing={3}>
                     <TextField
                        fullWidth
                        label={t('login.label_username')}
                        placeholder={t('login.placeholder_username')}
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        disabled={isLoading}
                        error={usernameError}
                        helperText={usernameError ? t('login.error_username_required') : ''}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <User size={18} opacity={0.5} />
                                </InputAdornment>
                            ),
                        }}
                        sx={{
                            '& .MuiOutlinedInput-root': { borderRadius: 3 }
                        }}
                     />

                     <Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                             <Typography variant="caption" sx={{ fontWeight: 800, letterSpacing: '0.1em', color: 'text.secondary' }}>
                                 {t('login.label_password')}
                             </Typography>
                             {isCapsLockOn && (
                                 <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'warning.main', fontSize: '0.7rem', fontWeight: 800 }}>
                                     <AlertCircle size={12} /> {t('login.caps_lock')}
                                 </Box>
                             )}
                          </Box>
                          <TextField
                             fullWidth
                             type={showPassword ? "text" : "password"}
                             placeholder={t('login.placeholder_password')}
                             value={password}
                             onChange={(e) => setPassword(e.target.value)}
                              disabled={isLoading}
                             error={passwordError}
                             helperText={passwordError ? t('login.error_password_required') : ''}
                             InputProps={{
                                 startAdornment: (
                                     <InputAdornment position="start">
                                         <Lock size={18} opacity={0.5} />
                                     </InputAdornment>
                                 ),
                                 endAdornment: (
                                     <InputAdornment position="end">
                                         <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                                             {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                         </IconButton>
                                     </InputAdornment>
                                 )
                             }}
                             sx={{
                                 '& .MuiOutlinedInput-root': { borderRadius: 3 }
                             }}
                          />
                     </Box>

                     <FormControlLabel
                        control={
                            <Checkbox 
                                checked={stayLoggedIn}
                                onChange={(e) => setStayLoggedIn(e.target.checked)}
                                sx={{ '& .MuiSvgIcon-root': { borderRadius: 1 } }}
                            />
                        }
                        label={<Typography variant="body2" color="text.secondary">{t('login.remember_me')}</Typography>}
                     />

                     <Button 
                        type="submit" 
                        variant="contained" 
                        fullWidth 
                        size="large"
                        disabled={isLoading}
                        sx={{ 
                            height: 48, 
                            borderRadius: 3, 
                            fontSize: '0.9rem', 
                            fontWeight: 900, 
                            letterSpacing: '0.1em' 
                        }}
                     >
                        {isLoading ? (
                            <Stack direction="row" spacing={1} alignItems="center">
                                <CircularProgress size={20} color="inherit" />
                                <span>{t('login.validating')}</span>
                            </Stack>
                        ) : t('login.action_login')}
                     </Button>
                  </Stack>
               </form>
            </CardContent>
          </Card>

       </Box>
    </Box>
  );
}