import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks';
import { useNavigate, Link, useSearch } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import PersonIcon from '@mui/icons-material/Person';
import LockIcon from '@mui/icons-material/Lock';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ErrorIcon from '@mui/icons-material/Error';
import CheckIcon from '@mui/icons-material/Check';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import LoginIcon from '@mui/icons-material/Login';
import GppMaybeIcon from '@mui/icons-material/GppMaybe';
import { cn } from '../../lib/utils';
import {
  Input,
  Label,
  Button,
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  Checkbox,
  Alert,
  AlertDescription
} from '@/components';

export function Login() {
  const { t } = useTranslation();
  const { login, isAuthenticated, isLoading, error: authError } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const search = useSearch({ from: '/login' });

  useEffect(() => {
    if (isAuthenticated) {
      const redirect = (search as any).redirect || '/';
      navigate({ to: redirect });
    }
  }, [isAuthenticated, navigate, search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    
    try {
      await login({ username, password });
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-background relative overflow-hidden">
      <div className="w-full max-w-md z-10">
        <div className="mb-8 text-center">
            <Link to="/">
                <Button 
                    variant="ghost" 
                    className="text-muted-foreground hover:text-foreground pl-0 gap-2"
                >
                    <ArrowBackIcon sx={{ fontSize: 16 }} />
                    {t('login.back_dashboard')}
                </Button>
            </Link>
        </div>

        <Card className="border-2 shadow-2xl bg-card/50 backdrop-blur-xl">
          <CardHeader className="space-y-1 pb-8 text-center border-b">
            <div className="flex justify-center mb-4">
              <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                <VerifiedUserIcon sx={{ fontSize: 32 }} />
              </div>
            </div>
            <h1 className="text-3xl font-black tracking-tighter uppercase whitespace-nowrap">
              {t('login.title')}
            </h1>
            <p className="text-sm text-muted-foreground font-medium">
              {t('login.subtitle')}
            </p>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4 pt-8">
              {authError && (
                <Alert variant="destructive" className="bg-destructive/10 border-destructive/20 animate-in fade-in zoom-in duration-300">
                  <ErrorIcon sx={{ fontSize: 16 }} className="mr-2" />
                  <AlertDescription className="text-xs font-bold uppercase tracking-wider">
                    {authError}
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="username" className="text-xs font-black uppercase tracking-widest ml-1">
                  {t('login.username')}
                </Label>
                <div className="relative group">
                  <PersonIcon sx={{ fontSize: 20 }} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
                  <Input
                    id="username"
                    placeholder={t('login.placeholder_username')}
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-10 bg-background/50 border-2 transition-all focus:border-primary uppercase font-bold tracking-wider"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between ml-1">
                  <Label htmlFor="password" className="text-xs font-black uppercase tracking-widest">
                    {t('login.password')}
                  </Label>
                  <Button variant="link" className="text-[10px] font-black uppercase tracking-widest h-auto p-0 opacity-50 hover:opacity-100">
                    {t('login.forgot_password')}
                  </Button>
                </div>
                <div className="relative group">
                  <LockIcon sx={{ fontSize: 20 }} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
                  <Input
                    id="password"
                    placeholder={t('login.placeholder_password')}
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 bg-background/50 border-2 transition-all focus:border-primary font-mono"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? (
                      <VisibilityOffIcon sx={{ fontSize: 18 }} />
                    ) : (
                      <VisibilityIcon sx={{ fontSize: 18 }} />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-2 ml-1">
                <Checkbox 
                  id="remember" 
                  checked={rememberMe}
                  onChange={(_, checked) => setRememberMe(checked)}
                />
                <Label 
                  htmlFor="remember" 
                  className="text-[11px] font-black uppercase tracking-widest cursor-pointer select-none"
                >
                  {t('login.remember_me')}
                </Label>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-4 pb-8 pt-4">
              <Button 
                type="submit" 
                className="w-full h-12 text-sm font-black tracking-widest uppercase relative group overflow-hidden" 
                disabled={isLoading}
              >
                <div className="relative z-10 flex items-center justify-center gap-2">
                   {isLoading ? (
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin" />
                            <span>{t('login.status_authenticating')}</span>
                        </div>
                     ) : (
                        <div className="flex items-center gap-2">
                            <LoginIcon sx={{ fontSize: 20 }} className="group-hover:scale-110 transition-transform" />
                            {t('login.action_login')}
                        </div>
                     )}
                </div>
                <div className="absolute inset-0 bg-primary-foreground/10 translate-y-12 group-hover:translate-y-0 transition-transform duration-300" />
              </Button>

              <div className="flex items-center gap-4 py-2">
                <div className="h-px flex-1 bg-border" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                  {t('login.secure_access')}
                </span>
                <div className="h-px flex-1 bg-border" />
              </div>

              <div className="flex items-center justify-center gap-2 text-primary opacity-80">
                <GppMaybeIcon sx={{ fontSize: 16 }} />
                <span className="text-[10px] font-black uppercase tracking-widest">
                  {t('login.protection_enabled')}
                </span>
              </div>
            </CardFooter>
          </form>
        </Card>

        <p className="mt-8 text-center text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
          {t('login.no_account')}{' '}
          <Link to="/settings" className="text-primary hover:underline underline-offset-4">
            {t('login.contact_admin')}
          </Link>
        </p>
      </div>
    </div>
  );
}

