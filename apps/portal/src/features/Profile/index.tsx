
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  Button, 
  Chip, 
  Typography, 
  Box, 
  Stack, 
  IconButton, 
  TextField, 
  ToggleButton, 
  ToggleButtonGroup, 
  Grid,
  useTheme,
  alpha,
  Alert,
  Avatar,
  Tab,
  Tabs
} from '@mui/material';
import { 
  User as UserIcon, 
  Clock, 
  Zap, 
  Key, 
  Shield, 
  LogOut, 
  Check, 
  X, 
  Plus, 
  Trash2, 
  Image as ImageIcon, 
  Video, 
  Save,
  ShieldCheck,
  AlertTriangle,
  Camera,
  Upload,
  Music,
  Minus,
  ChevronLeft
} from 'lucide-react';
import { cn, getClassColor, formatClassDisplayName, formatPower, sanitizeHtml, getOptimizedMediaUrl } from '../../lib/utils';
import { PageHeaderSkeleton } from '../../components/SkeletonLoaders';
import { PROGRESSION_CATEGORIES, clampLevel } from '../../lib/progression';
import { useAuthStore, useUIStore } from '../../store';
import { useAuth } from '../../features/Auth/hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { useUpdateMember } from '../../hooks/useServerState';
import { authAPI, mediaAPI, membersAPI } from '../../lib/api';
import { User, DayAvailability, ProgressionData, ClassType } from '../../types';
import { useForm, Controller } from 'react-hook-form';
import { convertToOpus } from '../../lib/media-conversion';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

const CLASS_GROUPS_CONFIG = [
  {
    id: 'mingjin',
    labelKey: 'class_group.mingjin',
    color: '#60a5fa',
    borderColor: 'rgba(96, 165, 250, 0.3)',
    bgColor: 'rgba(96, 165, 250, 0.1)',
    options: [
      { id: 'mingjin_hong', labelKey: 'class.mingjin_hong' }, 
      { id: 'mingjin_ying', labelKey: 'class.mingjin_ying' }
    ]
  },
  {
    id: 'qiansi',
    labelKey: 'class_group.qiansi',
    color: '#4ade80',
    borderColor: 'rgba(74, 222, 128, 0.3)',
    bgColor: 'rgba(74, 222, 128, 0.1)',
    options: [
      { id: 'qiansi_yu', labelKey: 'class.qiansi_yu' },
      { id: 'qiansi_lin', labelKey: 'class.qiansi_lin' }
    ]
  },
  {
    id: 'pozhu',
    labelKey: 'class_group.pozhu',
    color: '#a855f7',
    borderColor: 'rgba(168, 85, 247, 0.3)',
    bgColor: 'rgba(168, 85, 247, 0.1)',
    options: [
      { id: 'pozhu_feng', labelKey: 'class.pozhu_feng' },
      { id: 'pozhu_chen', labelKey: 'class.pozhu_chen' },
      { id: 'pozhu_yuan', labelKey: 'class.pozhu_yuan' }
    ]
  },
  {
    id: 'lieshi',
    labelKey: 'class_group.lieshi',
    color: '#f87171',
    borderColor: 'rgba(248, 113, 113, 0.3)',
    bgColor: 'rgba(248, 113, 113, 0.1)',
    options: [
      { id: 'lieshi_wei', labelKey: 'class.lieshi_wei' },
      { id: 'lieshi_jun', labelKey: 'class.lieshi_jun' }
    ]
  }
];

const translateClassGroup = (labelKey: string, t: any) => {
  const keys = [`common.${labelKey}`, labelKey];
  for (const key of keys) {
    const value = t(key);
    if (value !== key) return value;
  }
  return labelKey;
};

const getClassMeta = (classId: string, t: any) => {
  for (const group of CLASS_GROUPS_CONFIG) {
    const opt = group.options.find(o => o.id === classId);
    if (opt) {
      return {
        fullLabel: formatClassDisplayName(classId),
        groupLabel: translateClassGroup(group.labelKey, t),
        color: group.color,
        borderColor: group.borderColor,
        bgColor: group.bgColor
      };
    }
  }
  return { fullLabel: formatClassDisplayName(classId), groupLabel: '?', color: '#94a3b8', borderColor: 'rgba(148, 163, 184, 0.3)', bgColor: 'rgba(148, 163, 184, 0.1)' };
};

export function Profile() {
  const { user, logout, isLoading } = useAuth();
  const setAuthUser = useAuthStore(state => state.setUser);

  // ✅ TanStack Query: Mutations for profile updates
  const updateMemberMutation = useUpdateMember();
  const updateMember = async (id: string, data: any) => {
    const updated = await updateMemberMutation.mutateAsync({ id, data });
    if (updated && user?.id === id) {
      setAuthUser({ ...(user as any), ...(updated as any) });
    }
  };
  const changePassword = async (_userId: string, current: string, next: string) => {
    await authAPI.changePassword({ currentPassword: current, newPassword: next });
    return true;
  };

  const { setPageTitle } = useUIStore();
  const { t } = useTranslation();
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState<'profile' | 'availability' | 'media' | 'progression' | 'account'>('profile');

  useEffect(() => {
    setPageTitle(t('profile.title'));
  }, [setPageTitle, t]);

  if (isLoading || !user) return <PageHeaderSkeleton />;

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto', pb: 10, px: { xs: 2, sm: 4 } }}>
      <Box sx={{ mb: 6, display: 'flex', justifyContent: 'flex-end' }}>
        <Tabs 
            value={activeTab} 
            onChange={(_, v) => setActiveTab(v)}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            sx={{ 
                bgcolor: 'action.hover', 
                borderRadius: 3, 
                p: 0.5,
                '& .MuiTab-root': { 
                    minHeight: 40, 
                    borderRadius: 2, 
                    fontSize: '0.65rem', 
                    fontWeight: 900, 
                    letterSpacing: '0.1em' 
                },
                '& .Mui-selected': {
                    bgcolor: 'background.paper',
                    color: 'primary.main',
                    boxShadow: 2
                },
                '& .MuiTabs-indicator': { display: 'none' }
            }}
        >
          {['profile', 'availability', 'media', 'progression', 'account'].map((tab) => (
             <Tab key={tab} label={t(`profile.tab_${tab}`)} value={tab} />
          ))}
        </Tabs>
      </Box>

      <Grid container spacing={4}>
         {/* Left Column: Preview */}
         <Grid size={{ xs: 12, lg: 4 }}>
            <Stack spacing={3}>
               <ProfilePreview user={user} onUpdate={updateMember} />
               <CompletionStatus user={user} />
            </Stack>
         </Grid>

         {/* Right Column: Editor */}
         <Grid size={{ xs: 12, lg: 8 }}>
            {activeTab === 'profile' && <ProfileEditor user={user} onUpdate={updateMember} />}
            {activeTab === 'availability' && <AvailabilityEditor user={user} onUpdate={updateMember} />}
            {activeTab === 'media' && <MediaEditor user={user} onUpdate={updateMember} />}
            {activeTab === 'progression' && <ProgressionEditor user={user} onUpdate={updateMember} />}
            {activeTab === 'account' && <AccountSettings user={user} onUpdate={updateMember} onChangePassword={changePassword} onLogout={logout} />}
         </Grid>
      </Grid>
    </Box>
  );
}

function ProfilePreview({ user, onUpdate }: { user: User, onUpdate: (id: string, updates: Partial<User>) => void }) {
  const { t } = useTranslation();
  const theme = useTheme();

  const handleAvatarClick = () => {
    const url = prompt(t('profile.prompt_avatar'), user.avatar_url || '');
    if (url !== null && url !== user.avatar_url) onUpdate(user.id, { avatar_url: url });
  };

  return (
    <Card sx={{ borderRadius: 4, overflow: 'hidden', position: 'relative', border: `1px solid ${theme.palette.divider}` }}>
       <Box sx={{ position: 'relative', aspectRatio: '1/1', bgcolor: 'action.hover' }}>
          <Box 
             component="img"
             src={getOptimizedMediaUrl(user.avatar_url || `https://ui-avatars.com/api/?name=${user.username}&background=random`, 'image')} 
             alt={user.username}
             sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <Box 
             onClick={handleAvatarClick}
             sx={{ 
                 position: 'absolute', inset: 0, bgcolor: 'rgba(0,0,0,0.6)', opacity: 0, 
                 display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1,
                 cursor: 'pointer', transition: 'opacity 0.2s', '&:hover': { opacity: 1 }
             }}
          >
             <Camera size={32} color="white" />
             <Typography variant="caption" color="white" fontWeight={900} textTransform="uppercase" letterSpacing="0.1em">{t('profile.update_identity')}</Typography>
          </Box>
       </Box>
       
       <CardContent sx={{ p: 2 }}>
          <Stack direction="row" alignItems="center" spacing={1} mb={2}>
             <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, px: 1, py: 0.5, borderRadius: 10, bgcolor: 'background.default', border: '1px solid', borderColor: 'divider' }}>
                <ImageIcon size={12} className="text-muted-foreground" />
                <Typography variant="caption" fontWeight={700} lineHeight={1}>{user.media_counts?.images || 0}</Typography>
             </Box>
             <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, px: 1, py: 0.5, borderRadius: 10, bgcolor: 'background.default', border: '1px solid', borderColor: 'divider' }}>
                <Video size={12} className="text-muted-foreground" />
                <Typography variant="caption" fontWeight={700} lineHeight={1}>{user.media_counts?.videos || 0}</Typography>
             </Box>
             <Box flex={1} />
             <Chip 
                label={user.active_status === 'active' ? t('common.active') : t('common.inactive')} 
                size="small" 
                color={user.active_status === 'active' ? 'success' : 'default'}
                variant="outlined"
                sx={{ height: 20, fontSize: '0.6rem', fontWeight: 900, textTransform: 'uppercase' }}
             />
          </Stack>
          
          <Typography variant="h5" fontWeight={900} gutterBottom>{user.username}</Typography>
          <Typography variant="subtitle2" color="primary" fontWeight={700} noWrap dangerouslySetInnerHTML={sanitizeHtml(user.title_html || t('profile.operative_title'))} />
       </CardContent>
    </Card>
  );
}

function CompletionStatus({ user }: { user: User }) {
  const { t } = useTranslation();
  const theme = useTheme();
  
  const missing = useMemo(() => {
    const list = [];
    if (!user.bio) list.push(t('profile.missing_bio'));
    if (!user.availability || user.availability.length === 0) list.push(t('profile.missing_availability'));
    if (!user.media_counts?.audio) list.push(t('profile.missing_audio'));
    if (user.classes?.length < 2) list.push(t('profile.missing_spec'));
    return list;
  }, [user, t]);

  if (missing.length === 0) return (
     <Alert 
        severity="success" 
        icon={<ShieldCheck size={20} />}
        sx={{ borderRadius: 3, '& .MuiAlert-message': { width: '100%' } }}
     >
        <Typography variant="subtitle2" fontWeight={900} textTransform="uppercase" color="success.main">{t('completion.complete')}</Typography>
        <Typography variant="caption" fontWeight={700} color="success.main" sx={{ opacity: 0.8 }}>{t('completion.complete_desc')}</Typography>
     </Alert>
  );

  return (
    <Card sx={{ bgcolor: alpha(theme.palette.warning.main, 0.1), borderColor: alpha(theme.palette.warning.main, 0.2), borderRadius: 3 }}>
       <CardContent sx={{ p: 2 }}>
          <Stack direction="row" spacing={2} alignItems="center" mb={2}>
             <Avatar alt="" sx={{ bgcolor: 'warning.main', color: 'warning.contrastText' }} variant="rounded">
                <AlertTriangle size={20} />
             </Avatar>
             <Box>
                <Typography variant="subtitle2" fontWeight={900} textTransform="uppercase" color="warning.main">{t('completion.incomplete')}</Typography>
                <Typography variant="caption" fontWeight={700} color="warning.main" sx={{ opacity: 0.8 }}>{missing.length} {t('completion.missing_entries')}</Typography>
             </Box>
          </Stack>
          <Stack direction="row" flexWrap="wrap" gap={0.5}>
             {missing.map(m => (
               <Chip key={m} label={m} size="small" variant="outlined" color="warning" sx={{ height: 20, fontSize: '0.6rem', fontWeight: 900, textTransform: 'uppercase' }} />
             ))}
          </Stack>
       </CardContent>
    </Card>
  );
}

function MediaEditor({ user, onUpdate }: { user: User, onUpdate: (id: string, updates: Partial<User>) => void }) {
  const { t } = useTranslation();
  const setAuthUser = useAuthStore(state => state.setUser);
  const [mediaList, setMediaList] = useState(user.media || []);
  const [audioUrl, setAudioUrl] = useState(
    (user.media || []).find((item) => item.type === 'audio')?.url || user.audio_url || ''
  );
  const [audioUploading, setAudioUploading] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const audioInputRef = React.useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) { e.preventDefault(); e.returnValue = ''; }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  useEffect(() => {
    setMediaList(user.media || []);
    setAudioUrl((user.media || []).find((item) => item.type === 'audio')?.url || user.audio_url || '');
  }, [user]);

  const handleAddMedia = () => {
    const url = prompt(t('profile.prompt_media_url'));
    if (!url) return;
    const type = (url.includes('.mp4') ? 'video' : 'image') as 'video' | 'image';
    const newItem = { id: crypto.randomUUID(), url, type, hash: 'new' };
    setMediaList([...mediaList, newItem]); 
    setIsDirty(true);
  };

  const handleDeleteMedia = (id: string) => {
    if(!confirm(t('profile.confirm_remove_media'))) return;
    setMediaList(mediaList.filter(m => m.id !== id));
    setIsDirty(true);
  };

  const handleSave = async () => {
    const counts = {
       images: mediaList.filter(m => m.type === 'image').length,
       videos: mediaList.filter(m => m.type === 'video').length,
       audio: audioUrl ? 1 : 0
    };
    await onUpdate(user.id, { media: mediaList, audio_url: audioUrl, media_counts: counts });
    setIsDirty(false);
  };

  const refreshMemberMedia = async () => {
    const refreshed = await membersAPI.get(user.id);
    setMediaList(refreshed.media || []);
    const nextAudio = (refreshed.media || []).find((item) => item.type === 'audio')?.url || refreshed.audio_url || '';
    setAudioUrl(nextAudio);
    const current = useAuthStore.getState().user;
    if (current?.id === user.id) {
      setAuthUser({ ...(current as any), ...(refreshed as any) });
    }
  };

  const handleAudioSelected = async (file: File) => {
    setAudioUploading(true);
    try {
      let uploadFile = file;
      try {
        uploadFile = await convertToOpus(file);
      } catch {
        uploadFile = file;
      }
      await mediaAPI.uploadAudio(uploadFile);
      await refreshMemberMedia();
      setIsDirty(false);
    } finally {
      setAudioUploading(false);
    }
  };

  return (
      <Card sx={{ borderRadius: 4 }}>
        <CardHeader 
            title={<Typography variant="h6" fontWeight={900} fontStyle="italic" textTransform="uppercase">{t('profile.archive_title')}</Typography>}
            subheader={<Typography variant="caption" fontWeight={900} textTransform="uppercase" letterSpacing="0.1em" color="text.secondary">{t('profile.tab_media')} & {t('profile.audio_identity')}</Typography>}
            action={isDirty && (
                <Button variant="contained" onClick={handleSave} startIcon={<Save size={16} />} sx={{ fontWeight: 900, fontSize: '0.7rem' }}>
                    {t('profile.save_assets')}
                </Button>
            )}
            sx={{ borderBottom: 1, borderColor: 'divider', p: 3 }}
        />
        <CardContent sx={{ p: 4, display: 'flex', flexDirection: 'column', gap: 4 }}>
           <Grid container spacing={2}>
               <Grid size={{ xs: 6, sm: 4, md: 3 }}>
                  <Box 
                     onClick={handleAddMedia}
                     sx={{ 
                         aspectRatio: '1/1', borderRadius: 3, border: '2px dashed', borderColor: 'divider', 
                         display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1,
                         cursor: 'pointer', transition: 'all 0.2s', '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover' }
                     }}
                  >
                     <Avatar alt="" sx={{ bgcolor: 'action.selected' }}><Upload size={20} /></Avatar>
                     <Typography variant="caption" fontWeight={900} textTransform="uppercase" color="text.secondary">{t('profile.add_media')}</Typography>
                  </Box>
               </Grid>
               {mediaList.map((m: any) => (
                  <Grid size={{ xs: 6, sm: 4, md: 3 }} key={m.id}>
                     <Box sx={{ position: 'relative', aspectRatio: '1/1', borderRadius: 3, overflow: 'hidden', bgcolor: 'black' }}>
                        {m.type === 'image' ? (
                           <img src={getOptimizedMediaUrl(m.url, 'image')} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                        ) : (
                           <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Video size={32} color="white" style={{ opacity: 0.6 }} />
                           </Box>
                        )}
                        <Box sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(0,0,0,0.6)', opacity: 0, transition: 'opacity 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', '&:hover': { opacity: 1 } }}>
                            <IconButton color="error" onClick={() => handleDeleteMedia(m.id)}><Trash2 size={16} /></IconButton>
                        </Box>
                     </Box>
                  </Grid>
               ))}
           </Grid>
           
           <Box sx={{ pt: 2, borderTop: 1, borderColor: 'divider' }}>
               <Typography variant="overline" color="text.secondary" fontWeight={900} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Music size={14} /> {t('profile.audio_identity')}
               </Typography>
               <input
                 ref={audioInputRef}
                 type="file"
                 accept="audio/*"
                 hidden
                 onChange={(e) => {
                   const file = e.target.files?.[0];
                   if (file) {
                     void handleAudioSelected(file);
                   }
                 }}
               />
               <Stack spacing={1.5}>
                 <Button
                   variant="outlined"
                   startIcon={<Upload size={16} />}
                   onClick={() => audioInputRef.current?.click()}
                   disabled={audioUploading}
                   sx={{ alignSelf: 'flex-start', fontWeight: 800 }}
                 >
                   {audioUploading ? t('common.loading') : t('media.choose_file')}
                 </Button>
                 {audioUrl && (
                   <Box
                     component="audio"
                     controls
                     src={getOptimizedMediaUrl(audioUrl, 'audio')}
                     sx={{ width: '100%' }}
                   />
                 )}
               </Stack>
           </Box>
        </CardContent>
      </Card>
  );
}

function ProfileEditor({ user, onUpdate }: { user: User, onUpdate: (id: string, updates: Partial<User>) => void }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { register, handleSubmit, control, watch, formState: { isDirty } } = useForm({
    defaultValues: {
      username: user.username,
      power: user.power,
      classes: user.classes || [],
      title_html: user.title_html || '',
      bio: user.bio || '',
      wechat_name: user.wechat_name || '',
    }
  });

  const [saving, setSaving] = useState(false);
  const titleHtml = watch('title_html');

  const onSubmit = async (data: any) => {
    setSaving(true);
    await onUpdate(user.id, data);
    setSaving(false);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card sx={{ borderRadius: 4 }}>
        <CardHeader 
            action={isDirty && (
                <Button type="submit" variant="contained" startIcon={<Save size={16} />} sx={{ fontWeight: 900, fontSize: '0.7rem' }}>
                    {t('profile.save_intel')}
                </Button>
            )}
            sx={{ borderBottom: 1, borderColor: 'divider', p: 3, minHeight: 80 }}
        />
        <CardContent sx={{ p: 4, display: 'flex', flexDirection: 'column', gap: 4 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
             <TextField maxRows={1} label={t('profile.label_username')} fullWidth {...register('username')} />
             <TextField maxRows={1} label={t('profile.label_power')} type="number" fullWidth {...register('power', { valueAsNumber: true })} />
          </Stack>

          <TextField maxRows={1} label={t('profile.label_wechat')} fullWidth {...register('wechat_name')} placeholder={t('profile.placeholder_wechat')} />

          <Box>
             <Typography variant="h6" color="warning.main" fontWeight={900} gutterBottom>{t('profile.label_spec')}</Typography>
             <Controller
                name="classes"
                control={control}
                render={({ field }: { field: any }) => {
                  const selectedClasses = field.value || [];
                  return (
                    <Stack spacing={2}>
                      <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'action.hover', border: '1px solid', borderColor: 'divider', minHeight: 60 }}>
                         <Typography variant="caption" color="text.secondary" fontWeight={900} textTransform="uppercase" display="block" mb={1}>{t('profile.spec_selected')}</Typography>
                         <Stack direction="row" spacing={1} flexWrap="wrap">
                            {selectedClasses.length === 0 && <Typography variant="caption" fontStyle="italic" color="text.disabled">{t('profile.spec_none')}</Typography>}
                            {selectedClasses.map((clsId: string, idx: number) => {
                               const meta = getClassMeta(clsId, t);
                               return (
                                 <Chip 
                                    key={clsId}
                                    label={meta.fullLabel}
                                    onDelete={() => field.onChange(selectedClasses.filter((c: string) => c !== clsId))}
                                    avatar={idx === 0 ? <Avatar alt="Main" sx={{ bgcolor: 'white !important', color: 'black !important', fontSize: '0.6rem !important' }}>M</Avatar> : undefined}
                                    sx={{ 
                                        color: meta.color, 
                                        bgcolor: meta.bgColor, 
                                        borderColor: meta.borderColor, 
                                        border: '1px solid', 
                                        fontWeight: 800 
                                    }}
                                 />
                               )
                            })}
                         </Stack>
                      </Box>
                      
                      <Box sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                         <Grid container spacing={2}>
                            {CLASS_GROUPS_CONFIG.map(group => (
                               <Grid size={{ xs: 6, md: 3 }} key={group.id}>
                                  <Typography variant="caption" color="text.secondary" fontWeight={900} textTransform="uppercase" display="block" mb={1}>{translateClassGroup(group.labelKey, t)}</Typography>
                                  <Stack spacing={1}>
                                     {group.options.map(opt => {
                                        const isSelected = selectedClasses.includes(opt.id as ClassType);
                                        return (
                                           <Button
                                              key={opt.id}
                                              size="small"
                                              variant="outlined"
                                              onClick={() => {
                                                  if (isSelected) {
                                                    field.onChange(selectedClasses.filter((c: string) => c !== opt.id));
                                                  } else {
                                                    field.onChange([...selectedClasses, opt.id as ClassType]);
                                                  }
                                              }}
                                              sx={{ 
                                                  justifyContent: 'flex-start', 
                                                  fontSize: '0.7rem', 
                                                  color: group.color,
                                                  borderColor: group.borderColor,
                                                  '&:hover': { bgcolor: group.bgColor }
                                              }}
                                           >
                                              {formatClassDisplayName(opt.id)}
                                           </Button>
                                        )
                                     })}
                                  </Stack>
                               </Grid>
                            ))}
                         </Grid>
                      </Box>
                    </Stack>
                  )
                }}
             />
          </Box>

          <Box>
             <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="overline" color="text.secondary" fontWeight={900}>{t('profile.label_title')}</Typography>
             </Stack>
             <TextField 
                fullWidth 
                {...register('title_html')} 
                placeholder={t('profile.placeholder_title_html')} 
                helperText={<span dangerouslySetInnerHTML={sanitizeHtml(titleHtml || t('profile.preview_title_placeholder'))} />}
             />
          </Box>

          <TextField 
            label={t('profile.label_bio')}
            multiline
            minRows={4}
            fullWidth
            {...register('bio')}
            placeholder={t('profile.placeholder_bio')}
          />
        </CardContent>
      </Card>
    </form>
  );
}

function AvailabilityEditor({ user, onUpdate }: { user: User, onUpdate: any }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const [grid, setGrid] = useState<Record<string, Set<number>>>({});
  const [vacationStart, setVacationStart] = useState(user.vacation_start || '');
  const [vacationEnd, setVacationEnd] = useState(user.vacation_end || '');
  const [isDirty, setIsDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragState, setDragState] = useState<boolean | null>(null);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) { e.preventDefault(); e.returnValue = ''; }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  useEffect(() => {
    const newGrid: Record<string, Set<number>> = {};
    DAYS.forEach(d => newGrid[d] = new Set());
    if (user.availability) {
      user.availability.forEach(dayAvail => {
        if (newGrid[dayAvail.day]) {
          dayAvail.blocks.forEach(block => {
            const start = parseInt(block.start.split(':')[0]);
            const end = parseInt(block.end.split(':')[0]);
            for (let h = start; h < end; h++) newGrid[dayAvail.day].add(h);
          });
        }
      });
    }
    setGrid(newGrid);
  }, [user]);

  const toggleCell = (day: string, hour: number, forceState?: boolean) => {
    const newGrid = { ...grid };
    const currentSet = new Set(newGrid[day]);
    const isSelected = currentSet.has(hour);
    const shouldSelect = forceState !== undefined ? forceState : !isSelected;

    if (shouldSelect) currentSet.add(hour); else currentSet.delete(hour);
    
    newGrid[day] = currentSet;
    setGrid(newGrid);
    setIsDirty(true);
  };

  const handleMouseDown = (day: string, hour: number) => {
    setIsDragging(true);
    const isSelected = grid[day].has(hour);
    setDragState(!isSelected);
    toggleCell(day, hour, !isSelected);
  };

  const handleMouseEnter = (day: string, hour: number) => {
    if (isDragging && dragState !== null) toggleCell(day, hour, dragState);
  };

  const handleMouseUp = () => { setIsDragging(false); setDragState(null); };

  useEffect(() => {
    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const availability: DayAvailability[] = DAYS.map(day => {
      const hours = Array.from(grid[day] || []).sort((a, b) => a - b);
      const blocks: { start: string, end: string }[] = [];
      if (hours.length > 0) {
        let rangeStart = hours[0];
        let prev = hours[0];
        for (let i = 1; i < hours.length; i++) {
          if (hours[i] !== prev + 1) {
            blocks.push({ start: `${rangeStart.toString().padStart(2, '0')}:00`, end: `${(prev + 1).toString().padStart(2, '0')}:00` });
            rangeStart = hours[i];
          }
          prev = hours[i];
        }
        blocks.push({ start: `${rangeStart.toString().padStart(2, '0')}:00`, end: `${(prev + 1).toString().padStart(2, '0')}:00` });
      }
      return { day, blocks };
    });

    await onUpdate(user.id, { availability, vacation_start: vacationStart, vacation_end: vacationEnd });
    setIsDirty(false);
    setSaving(false);
  };

  return (
    <Card sx={{ borderRadius: 4 }}>
      <CardHeader 
         title={<Typography variant="h6" fontWeight={900} fontStyle="italic" textTransform="uppercase">{t('availability.title')}</Typography>}
         subheader={<Typography variant="caption" fontWeight={900} textTransform="uppercase" letterSpacing="0.1em" color="text.secondary">{t('availability.subtitle')}</Typography>}
         action={isDirty && (
            <Button variant="contained" onClick={handleSave} startIcon={<Save size={16} />} sx={{ fontWeight: 900, fontSize: '0.7rem' }}>
                {t('availability.update_schedule')}
            </Button>
         )}
         sx={{ borderBottom: 1, borderColor: 'divider', p: 3 }}
      />
      <CardContent sx={{ p: 4, display: 'flex', flexDirection: 'column', gap: 4 }}>
         <Box sx={{ overflowX: 'auto', pb: 2 }}>
            <Box sx={{ minWidth: 600 }}>
               <Stack direction="row" spacing={0.5} ml={12} mb={1}>
                  {HOURS.map(h => (
                     <Typography key={h} variant="caption" color="text.secondary" sx={{ flex: 1, textAlign: 'center', fontSize: '0.6rem' }}>{h}</Typography>
                  ))}
               </Stack>
               
               <Stack spacing={1}>
                  {DAYS.map(day => (
                     <Stack direction="row" spacing={2} alignItems="center" key={day}>
                        <Typography variant="caption" fontWeight={900} textTransform="uppercase" color="text.secondary" sx={{ width: 80, textAlign: 'right' }}>{t(`common.day_${day}`)}</Typography>
                        <Stack direction="row" spacing={0.5} flex={1} height={32}>
                           {HOURS.map(hour => {
                              const isSelected = grid[day]?.has(hour);
                              return (
                                 <Box 
                                    key={hour}
                                    onMouseDown={() => handleMouseDown(day, hour)}
                                    onMouseEnter={() => handleMouseEnter(day, hour)}
                                    sx={{ 
                                        flex: 1, borderRadius: 0.5, cursor: 'pointer', border: '1px solid', borderColor: 'divider',
                                        bgcolor: isSelected ? 'primary.main' : 'action.hover',
                                        '&:hover': { opacity: 0.8 }
                                    }}
                                 />
                              )
                           })}
                        </Stack>
                     </Stack>
                  ))}
               </Stack>
            </Box>
         </Box>

         <Box sx={{ pt: 2, borderTop: 1, borderColor: 'divider' }}>
             <Typography variant="overline" fontWeight={900} color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Shield size={14} /> {t('availability.leave_range')}
             </Typography>
             <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
                <TextField 
                    type="date" 
                    label={t('availability.leave_start')} 
                    value={vacationStart} 
                    onChange={(e) => { setVacationStart(e.target.value); setIsDirty(true); }} 
                    fullWidth 
                    InputLabelProps={{ shrink: true }} 
                />
                <TextField 
                    type="date" 
                    label={t('availability.leave_end')} 
                    value={vacationEnd} 
                    onChange={(e) => { setVacationEnd(e.target.value); setIsDirty(true); }} 
                    fullWidth 
                    InputLabelProps={{ shrink: true }} 
                />
             </Stack>
         </Box>
         
         <Alert severity="info" icon={<Clock size={16} />} sx={{ borderRadius: 2 }}>
            <Typography variant="caption" fontWeight={800} textTransform="uppercase">{t('availability.utc_warning')}</Typography>
         </Alert>
      </CardContent>
    </Card>
  );
}

function ProgressionEditor({ user, onUpdate }: { user: User, onUpdate: any }) {
  const { t } = useTranslation();
  const [category, setCategory] = useState<'qishu' | 'wuxue' | 'xinfa'>('qishu');
  const [progression, setProgression] = useState<ProgressionData>(user.progression || { qishu: {}, wuxue: {}, xinfa: {} });
  const [isDirty, setIsDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  const categories = useMemo(
    () =>
      PROGRESSION_CATEGORIES.map((c) => ({
        id: c.id,
        label: `${t(c.titleKey)} (${c.id.toUpperCase()})`,
        groups: c.groups,
      })),
    [t],
  );

  const updateLevel = (cat: 'qishu' | 'wuxue' | 'xinfa', key: string, delta: number) => {
    const next = { ...progression };
    const current = next[cat][key] || 0;
    const val = clampLevel(current + delta);
    next[cat][key] = val;
    setProgression(next);
    setIsDirty(true);
  };

  const handleSave = async () => {
    setSaving(true);
    await onUpdate(user.id, { progression });
    setIsDirty(false);
    setSaving(false);
  };

  const activeCategory = useMemo(
    () => categories.find((c) => c.id === category),
    [categories, category],
  );

  return (
    <Card sx={{ borderRadius: 4 }}>
        <CardHeader 
            title={<Typography variant="h6" fontWeight={900} fontStyle="italic" textTransform="uppercase">{t('profile.progression_title')}</Typography>}
            subheader={<Typography variant="caption" fontWeight={900} textTransform="uppercase" letterSpacing="0.1em" color="text.secondary">{t('profile.progression_subtitle')}</Typography>}
            action={isDirty && (
                <Button variant="contained" onClick={handleSave} startIcon={<Save size={16} />} sx={{ fontWeight: 900, fontSize: '0.7rem' }}>
                    {t('profile.finalize_mastery')}
                </Button>
            )}
            sx={{ borderBottom: 1, borderColor: 'divider', p: 3 }}
        />
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
            <ToggleButtonGroup fullWidth exclusive value={category} onChange={(_, v) => v && setCategory(v)}>
                {categories.map(c => (
                    <ToggleButton key={c.id} value={c.id} sx={{ fontWeight: 800 }}>{c.label}</ToggleButton>
                ))}
            </ToggleButtonGroup>
        </Box>
        <CardContent sx={{ p: 4, display: 'flex', flexDirection: 'column', gap: 3 }}>
          {activeCategory?.groups.map((group) => (
            <Box key={group.key}>
              <Typography variant="subtitle2" fontWeight={900} textTransform="uppercase" color="text.secondary" mb={1}>
                {t(group.titleKey)}
              </Typography>
              <Grid container spacing={2}>
                {group.items.map((item) => {
                  const level = (progression[category] as any)[item.key] || 0;
                  return (
                    <Grid size={{ xs: 6, md: 4, lg: 3 }} key={item.key}>
                      <Box sx={{ p: 2, borderRadius: 3, bgcolor: 'action.hover', border: '1px solid', borderColor: 'divider', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ position: 'relative' }}>
                          <Avatar
                            variant="rounded"
                            src={item.icon}
                            alt={item.key}
                            sx={{ width: 80, height: 80, borderRadius: 3, bgcolor: 'background.paper' }}
                          >
                            <Zap size={32} />
                          </Avatar>
                          <Box sx={{ position: 'absolute', bottom: -8, right: -8, width: 32, height: 32, borderRadius: '50%', bgcolor: 'background.default', border: '2px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 900 }}>
                            {level}
                          </Box>
                        </Box>
                        <Typography variant="caption" fontWeight={800} textAlign="center" lineHeight={1.2}>
                          {t(item.nameKey)}
                        </Typography>
                        <Stack direction="row" spacing={1}>
                          <IconButton size="small" onClick={() => updateLevel(category, item.key, -1)} sx={{ bgcolor: 'background.paper' }}>
                            <Minus size={14} />
                          </IconButton>
                          <IconButton size="small" onClick={() => updateLevel(category, item.key, 1)} sx={{ bgcolor: 'background.paper' }}>
                            <Plus size={14} />
                          </IconButton>
                        </Stack>
                      </Box>
                    </Grid>
                  );
                })}
              </Grid>
            </Box>
          ))}
        </CardContent>
    </Card>
  );
}

function AccountSettings({ user, onChangePassword, onUpdate, onLogout }: { user: User, onUpdate: any, onChangePassword: any, onLogout: any }) {
  const { t } = useTranslation();
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [changing, setChanging] = useState(false);
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPass !== confirmPass) {
       setMessage({ text: t('account.pass_mismatch'), type: 'error' });
       return;
    }
    setChanging(true);
    const success = await onChangePassword(user.id, currentPass, newPass);
    setChanging(false);
    if (success) {
      setMessage({ text: t('account.pass_success'), type: 'success' });
      setCurrentPass(''); setNewPass(''); setConfirmPass('');
    } else {
      setMessage({ text: t('account.pass_fail'), type: 'error' });
    }
  };

  return (
      <Card sx={{ borderRadius: 4 }}>
        <CardHeader 
            title={<Typography variant="h6" fontWeight={900} fontStyle="italic" textTransform="uppercase">{t('account.title')}</Typography>}
            subheader={<Typography variant="caption" fontWeight={900} textTransform="uppercase" letterSpacing="0.1em" color="text.secondary">{t('account.subtitle')}</Typography>}
            sx={{ borderBottom: 1, borderColor: 'divider', p: 3 }}
        />
        <CardContent sx={{ p: 4, display: 'flex', flexDirection: 'column', gap: 4 }}>
           <form onSubmit={handlePasswordChange}>
              <Stack spacing={3}>
                 <TextField type="password" label={t('account.current_password')} value={currentPass} onChange={(e) => setCurrentPass(e.target.value)} fullWidth required />
                 <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
                    <TextField type="password" label={t('account.new_password')} value={newPass} onChange={(e) => setNewPass(e.target.value)} fullWidth required />
                    <TextField type="password" label={t('account.confirm_password')} value={confirmPass} onChange={(e) => setConfirmPass(e.target.value)} fullWidth required />
                 </Stack>

                 {message && (
                   <Alert severity={message.type} sx={{ borderRadius: 2 }}>{message.text}</Alert>
                 )}

                 <Button type="submit" variant="contained" disabled={changing} size="large" sx={{ fontWeight: 900 }} startIcon={<Key size={16} />}>
                    {t('account.update_password')}
                 </Button>
              </Stack>
           </form>

           <Box sx={{ pt: 2, borderTop: 1, borderColor: 'divider' }}>
               <Typography variant="overline" color="error" fontWeight={900} display="block" mb={2}>{t('account.danger_zone')}</Typography>
               <Button onClick={onLogout} variant="outlined" color="error" size="large" sx={{ fontWeight: 900 }} startIcon={<LogOut size={16} />}>
                   {t('account.logout')}
               </Button>
           </Box>
        </CardContent>
      </Card>
  );
}
