
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Link } from '@tanstack/react-router';
import { 
  Person, 
  AccessTime, 
  VpnKey, 
  Security, 
  Logout, 
  Check, 
  Close, 
  Add, 
  Delete, 
  Image, 
  Videocam, 
  Save,
  VerifiedUser,
  Warning,
  PhotoCamera,
  CloudUpload,
  MusicNote,
  Remove,
  ChevronLeft
} from '@/ui-bridge/icons-material';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';

import { cn, formatClassDisplayName, sanitizeHtml } from '../../lib/utils';
import { getOptimizedMediaUrl } from '../../lib/media-conversion';
import { PageHeaderSkeleton } from '@/components/feedback/Skeleton';
import { PROGRESSION_CATEGORIES, clampLevel } from '../../lib/progression';
import { useAuthStore, useUIStore } from '../../store';
import { useAuth } from '../../features/Auth/hooks/useAuth';
import { useUpdateMember } from '../../hooks/useServerState';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { authAPI, mediaAPI, membersAPI } from '../../lib/api';
import { User, DayAvailability, ProgressionData, ClassType } from '../../types';
import { convertToOpus } from '../../lib/media-conversion';
import { GAME_CLASS_COLORS } from '@/theme/tokens';
import { alpha } from '@/ui-bridge/material/styles';

// Nexus Primitives
// Nexus Primitives
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  Button,
  Badge,
  Input,
  Tabs, 
  TabsList, 
  TabsTrigger,
  Alert, 
  AlertTitle, 
  AlertDescription,
  ToggleGroup, 
  ToggleGroupItem,
  Label,
  Separator,
  PrimitiveInput
} from '@/components';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

const CLASS_GROUPS_CONFIG = [
  {
    id: 'mingjin',
    labelKey: 'class_group.mingjin',
    options: [
      { id: 'mingjin_hong', labelKey: 'class.mingjin_hong' }, 
      { id: 'mingjin_ying', labelKey: 'class.mingjin_ying' }
    ]
  },
  {
    id: 'qiansi',
    labelKey: 'class_group.qiansi',
    options: [
      { id: 'qiansi_yu', labelKey: 'class.qiansi_yu' },
      { id: 'qiansi_lin', labelKey: 'class.qiansi_lin' }
    ]
  },
  {
    id: 'pozhu',
    labelKey: 'class_group.pozhu',
    options: [
      { id: 'pozhu_feng', labelKey: 'class.pozhu_feng' },
      { id: 'pozhu_chen', labelKey: 'class.pozhu_chen' },
      { id: 'pozhu_yuan', labelKey: 'class.pozhu_yuan' }
    ]
  },
  {
    id: 'lieshi',
    labelKey: 'class_group.lieshi',
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

const translateClassLabel = (labelKey: string, classId: string, t: any) => {
  const keys = [`common.${labelKey}`, labelKey];
  for (const key of keys) {
    const value = t(key);
    if (value !== key) return value;
  }
  return formatClassDisplayName(classId);
};

const getClassMeta = (classId: string, t: any) => {
  for (const group of CLASS_GROUPS_CONFIG) {
    const opt = group.options.find(o => o.id === classId);
    if (opt) {
      const colors = GAME_CLASS_COLORS[group.id as keyof typeof GAME_CLASS_COLORS] || GAME_CLASS_COLORS.mingjin;
      return {
        fullLabel: translateClassLabel(opt.labelKey, classId, t),
        groupLabel: translateClassGroup(group.labelKey, t),
        ...group,
        colors
      };
    }
  }
  return { 
      fullLabel: formatClassDisplayName(classId), 
      groupLabel: '?', 
      colors: { main: '#94a3b8', bg: 'rgba(148, 163, 184, 0.1)', text: '#94a3b8' }
  };
};

const getPrimaryAvailabilitySummary = (availability: DayAvailability[] | undefined, t: any): string | null => {
  if (!availability || availability.length === 0) return null;

  for (const day of DAYS) {
    const dayAvailability = availability.find((entry) => entry.day === day);
    const firstBlock = dayAvailability?.blocks?.[0];
    if (!firstBlock) continue;
    const dayLabel = t(`common.day_${day}`);
    const localizedDay = dayLabel !== `common.day_${day}` ? dayLabel : day;
    return `${localizedDay} ${firstBlock.start}-${firstBlock.end} UTC`;
  }

  return null;
};

function ProfileGuestState() {
  const { t } = useTranslation();

  return (
    <div className="max-w-[920px] mx-auto pb-10 px-4 sm:px-8">
      <Card
        className="overflow-hidden border"
        style={{
          borderColor: 'color-mix(in srgb, var(--sys-interactive-accent) 35%, var(--cmp-card-border))',
          background:
            'linear-gradient(145deg, color-mix(in srgb, var(--sys-surface-panel) 96%, transparent), color-mix(in srgb, var(--sys-surface-elevated) 92%, transparent))',
        }}
      >
        <CardHeader className="space-y-2 border-b">
          <CardTitle className="text-2xl font-black uppercase tracking-tight">{t('profile.title')}</CardTitle>
          <CardDescription className="font-semibold text-muted-foreground">{t('login.subtitle')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5 py-8">
          <Alert className="border" variant="default">
            <Security className="h-4 w-4" />
            <AlertTitle className="text-sm font-black uppercase">{t('login.title')}</AlertTitle>
            <AlertDescription className="text-sm leading-relaxed text-muted-foreground">
              {t('common.placeholder_msg')}
            </AlertDescription>
          </Alert>
          {/* Action cluster uses 8px-grid spacing so auth CTAs align with the rework rhythm. */}
          <div className="flex flex-wrap gap-4">
            <Link to="/login">
              <Button className="font-black uppercase tracking-wide">
                {t('login.action_login')}
              </Button>
            </Link>
            <Link to="/settings">
              <Button variant="outline" className="font-black uppercase tracking-wide">
                {t('nav.settings')}
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function Profile() {
  const { user, logout, isLoading } = useAuth();
  const setAuthUser = useAuthStore(state => state.setUser);
  
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
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    setPageTitle(t('profile.title'));
  }, [setPageTitle, t]);

  if (isLoading) return <PageHeaderSkeleton />;
  if (!user) return <ProfileGuestState />;

  return (
    <div data-testid="profile-page" className="max-w-[1400px] mx-auto pb-10 px-4 sm:px-8">
      <div className="mb-6 flex justify-end">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
             <TabsList className="w-full md:w-auto overflow-x-auto justify-start rounded-full p-1 gap-1">
               {['profile', 'availability', 'media', 'progression', 'account'].map((tab) => (
                  <TabsTrigger
                    key={tab}
                    value={tab}
                    className="!rounded-full whitespace-nowrap text-[0.7rem] font-black tracking-wide uppercase min-w-[7.5rem] px-4"
                  >
                      {t(`profile.tab_${tab}`)}
                  </TabsTrigger>
               ))}
             </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         {/* Left Column: Preview */}
         <div className="lg:col-span-4 flex flex-col gap-6">
            <ProfilePreview user={user} onUpdate={updateMember} />
            <CompletionStatus user={user} />
         </div>

         {/* Right Column: Editor */}
         <div className="lg:col-span-8">
            {activeTab === 'profile' && <ProfileEditor user={user} onUpdate={updateMember} />}
            {activeTab === 'availability' && <AvailabilityEditor user={user} onUpdate={updateMember} />}
            {activeTab === 'media' && <MediaEditor user={user} onUpdate={updateMember} />}
            {activeTab === 'progression' && <ProgressionEditor user={user} onUpdate={updateMember} />}
            {activeTab === 'account' && <AccountSettings user={user} onUpdate={updateMember} onChangePassword={changePassword} onLogout={logout} />}
         </div>
      </div>
    </div>
  );
}

export function ProfilePreview({
  user,
  onUpdate,
}: {
  user: User;
  onUpdate: (id: string, updates: Partial<User>) => Promise<void> | void;
}) {
  const { t } = useTranslation();
  const prefersReducedMotion = useReducedMotion();
  const avatarInitial = (user.username || '?').trim().charAt(0).toUpperCase() || '?';
  const availabilitySummary = getPrimaryAvailabilitySummary(user.availability, t);
  const avatarInputRef = useRef<HTMLInputElement | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);

  const handleAvatarClick = () => {
    avatarInputRef.current?.click();
  };

  const handleAvatarFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setAvatarUploading(true);
    try {
      // Avatar upload is normalized to backend media key and persisted to the profile avatar_url field.
      const uploaded = await mediaAPI.uploadImage(file, 'avatar');
      await onUpdate(user.id, {
        avatar_url: `/api/media/${encodeURIComponent(uploaded.r2Key)}`,
      });
    } finally {
      setAvatarUploading(false);
      event.target.value = '';
    }
  };

  return (
    <Card className="overflow-hidden border-border bg-card">
       <div className="relative aspect-square bg-muted group">
          {user.avatar_url ? (
            <img
               src={getOptimizedMediaUrl(user.avatar_url, 'image')}
               alt={user.username}
               width={512}
               height={512}
               loading="eager"
               decoding="async"
               fetchPriority="high"
               className="w-full h-full object-cover"
            />
          ) : (
           <div 
              className="w-full h-full flex items-center justify-center"
              style={{
                background:
                  'linear-gradient(135deg, color-mix(in srgb, var(--sys-accent-primary) 24%, var(--sys-surface-raised)) 0%, color-mix(in srgb, var(--sys-accent-secondary) 20%, var(--sys-surface-raised)) 100%)',
                color: 'var(--sys-text-primary)',
              }}
            >
              <span className="text-7xl font-black select-none" aria-hidden="true">
                {avatarInitial}
              </span>
            </div>
          )}
          <div 
             onClick={handleAvatarClick}
             data-testid="profile-avatar-upload-button"
             className="absolute inset-0 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-2 cursor-pointer transition-opacity duration-200"
             style={{
               backgroundColor: 'color-mix(in srgb, var(--sys-surface-sunken) 72%, transparent)',
               // Respect reduced-motion preference for hover overlays to avoid unnecessary opacity animation.
               transitionDuration: prefersReducedMotion ? '0ms' : '150ms',
               transitionTimingFunction: 'ease',
             }}
          >
             <PhotoCamera className="w-8 h-8 text-[color:var(--sys-text-inverse)]" />
              <span className="text-xs text-[color:var(--sys-text-inverse)] font-black uppercase tracking-widest">
                {avatarUploading ? t('common.loading') : t('profile.update_identity')}
              </span>
           </div>
           {/* Live region mirrors avatar upload state so loading/progress text is announced outside hover-only UI. */}
           <span
             data-testid="profile-avatar-upload-status"
             role="status"
             aria-live="polite"
             aria-atomic="true"
             className="sr-only"
           >
             {avatarUploading ? t('common.loading') : t('profile.update_identity')}
           </span>
           <input
             ref={avatarInputRef}
             data-testid="profile-avatar-upload-input"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarFileChange}
          />
       </div>
       
       <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
             <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-background border text-muted-foreground">
                <Image className="w-3 h-3" />
                <span className="text-xs font-bold leading-none">{user.media_counts?.images || 0}</span>
             </div>
             <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-background border text-muted-foreground">
                <Videocam className="w-3 h-3" />
                <span className="text-xs font-bold leading-none">{user.media_counts?.videos || 0}</span>
             </div>
             {availabilitySummary && (
                <div
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full border"
                  style={{
                    color: 'var(--sys-text-primary)',
                    backgroundColor: 'color-mix(in srgb, var(--sys-surface-raised) 92%, transparent)',
                    borderColor: 'var(--cmp-input-border)',
                  }}
                >
                   <AccessTime className="w-3 h-3" />
                   <span className="text-[0.65rem] font-black leading-none">{availabilitySummary}</span>
                </div>
             )}
             <div className="flex-1" />
             <Badge 
                variant={user.active_status === 'active' ? 'default' : 'secondary'}
                className={cn(
                    "h-5 text-[0.6rem] font-black uppercase",
                    user.active_status === 'active' ? "hover:opacity-95" : ""
                )}
                style={
                  user.active_status === 'active'
                    ? {
                        backgroundColor: 'var(--color-status-success)',
                        color: 'var(--color-status-success-fg)',
                      }
                    : undefined
                }
             >
                {user.active_status === 'active' ? t('common.active') : t('common.inactive')}
             </Badge>
          </div>
          
          <h2 className="text-2xl font-black mb-1">{user.username}</h2>
          <div className="text-sm font-bold text-primary truncate" dangerouslySetInnerHTML={sanitizeHtml(user.title_html || t('profile.operative_title'))} />
       </CardContent>
    </Card>
  );
}

function CompletionStatus({ user }: { user: User }) {
  const { t } = useTranslation();
  
  const missing = useMemo(() => {
    const list = [];
    if (!user.bio) list.push(t('profile.missing_bio'));
    if (!user.availability || user.availability.length === 0) list.push(t('profile.missing_availability'));
    if (!user.media_counts?.audio) list.push(t('profile.missing_audio'));
    if (!user.classes?.length || user.classes.length < 2) list.push(t('profile.missing_spec'));
    return list;
  }, [user, t]);

  if (missing.length === 0) return (
     <Alert
       className="border"
       style={{
         borderColor: 'color-mix(in srgb, var(--color-status-success) 45%, transparent)',
         backgroundColor: 'color-mix(in srgb, var(--color-status-success-bg) 84%, transparent)',
         color: 'var(--color-status-success-fg)',
       }}
     >
        <VerifiedUser className="h-4 w-4" />
        <AlertDescription className="text-[color:var(--color-status-success-fg)]">
            <span className="block text-xs font-black uppercase mb-1">{t('completion.complete')}</span>
            <span className="text-xs font-bold opacity-80">{t('completion.complete_desc')}</span>
        </AlertDescription>
     </Alert>
  );

  return (
    <Card
      className="border"
      style={{
        backgroundColor: 'color-mix(in srgb, var(--color-status-warning-bg) 88%, transparent)',
        borderColor: 'color-mix(in srgb, var(--color-status-warning) 40%, transparent)',
      }}
    >
       <CardContent className="p-4">
          <div className="flex items-center gap-4 mb-4">
             <div
               className="w-8 h-8 rounded-lg flex items-center justify-center"
               style={{
                 backgroundColor: 'var(--color-status-warning)',
                 color: 'var(--color-status-warning-fg)',
               }}
             >
                <Warning className="w-4 h-4" />
             </div>
             <div>
                <h4 className="text-sm font-black uppercase" style={{ color: 'var(--color-status-warning-fg)' }}>{t('completion.incomplete')}</h4>
                <p className="text-xs font-bold" style={{ color: 'color-mix(in srgb, var(--color-status-warning-fg) 82%, transparent)' }}>{missing.length} {t('completion.missing_entries')}</p>
             </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
             {missing.map(m => (
               <Badge
                 key={m}
                 variant="outline"
                 className="text-[0.55rem] font-black uppercase h-5"
                 style={{
                   color: 'var(--color-status-warning-fg)',
                   borderColor: 'color-mix(in srgb, var(--color-status-warning) 52%, transparent)',
                   backgroundColor: 'color-mix(in srgb, var(--color-status-warning-bg) 78%, transparent)',
                 }}
               >
                   {m}
               </Badge>
             ))}
          </div>
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
  const audioInputRef = useRef<HTMLInputElement | null>(null);

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
      <Card>
        <div className="flex items-center justify-between p-6 pb-4 border-b border-border">
            <div>
                <h3 className="text-lg font-black italic uppercase">{t('profile.archive_title')}</h3>
                <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">{t('profile.tab_media')} & {t('profile.audio_identity')}</p>
            </div>
            {isDirty && (
                <Button onClick={handleSave} size="sm" className="font-black text-xs">
                    <Save className="w-4 h-4 mr-2" /> {t('profile.save_assets')}
                </Button>
            )}
        </div>
        <CardContent className="p-6 flex flex-col gap-6">
           <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
               <div 
                  onClick={handleAddMedia}
                  className="aspect-square rounded-xl border-2 border-dashed border-border hover:border-primary hover:bg-muted/50 cursor-pointer flex flex-col items-center justify-center gap-2 transition-all p-4 text-center group"
               >
                  <div className="w-10 h-10 rounded-full bg-muted group-hover:bg-primary/20 flex items-center justify-center transition-colors">
                     <CloudUpload className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
                  </div>
                  <span className="text-xs font-black uppercase text-muted-foreground group-hover:text-primary">{t('profile.add_media')}</span>
               </div>
               
               {mediaList.map((m: any) => (
                  <div key={m.id} className="relative aspect-square rounded-xl overflow-hidden bg-[color:var(--sys-surface-sunken)] group">
                     {m.type === 'image' ? (
                        <img
                          src={getOptimizedMediaUrl(m.url, 'image')}
                          className="w-full h-full object-cover"
                          alt=""
                          width={320}
                          height={320}
                          loading="lazy"
                          decoding="async"
                        />
                     ) : (
                        <div className="w-full h-full flex items-center justify-center">
                           <Videocam className="w-8 h-8" style={{ color: 'color-mix(in srgb, var(--sys-text-inverse) 60%, transparent)' }} />
                        </div>
                     )}
                     <div
                       className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                       style={{ backgroundColor: 'color-mix(in srgb, var(--sys-surface-sunken) 72%, transparent)' }}
                     >
                         <Button
                           variant="destructive"
                           size="icon"
                           className="h-8 w-8"
                           onClick={() => handleDeleteMedia(m.id)}
                           aria-label={t('common.delete')}
                         >
                             {/* Icon-only destructive action exposes an explicit name for assistive tech. */}
                             <Delete className="w-4 h-4" />
                         </Button>
                     </div>
                  </div>
               ))}
           </div>
           
           <div className="pt-6 border-t border-border">
               <h4 className="text-xs font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2 mb-4">
                  <MusicNote className="w-3.5 h-3.5" /> {t('profile.audio_identity')}
               </h4>
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
               <div className="flex flex-col gap-4">
                 <Button
                   variant="outline"
                   onClick={() => audioInputRef.current?.click()}
                   disabled={audioUploading}
                   className="w-fit font-extrabold"
                 >
                   <CloudUpload className="w-4 h-4 mr-2" />
                   <span
                     data-testid="profile-audio-upload-status"
                     role="status"
                     aria-live="polite"
                     aria-atomic="true"
                   >
                     {audioUploading ? t('common.loading') : t('media.choose_file')}
                   </span>
                 </Button>
                 {audioUrl && (
                   <audio
                     controls
                     src={getOptimizedMediaUrl(audioUrl, 'audio')}
                     className="w-full"
                   />
                 )}
               </div>
           </div>
        </CardContent>
      </Card>
  );
}

function ProfileEditor({ user, onUpdate }: { user: User, onUpdate: (id: string, updates: Partial<User>) => Promise<void> | void }) {
  const { t } = useTranslation();
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
      <Card>
        <div className="flex items-center justify-between p-6 pb-4 border-b border-border min-h-[80px]">
            {isDirty && (
                <Button type="submit" size="sm" className="font-black text-xs ml-auto">
                    <Save className="w-4 h-4 mr-2" /> {t('profile.save_intel')}
                </Button>
            )}
        </div>
        <CardContent className="p-6 flex flex-col gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
             <div className="space-y-2">
                 <Label>{t('profile.label_username')}</Label>
                 <Input {...register('username')} />
             </div>
             <div className="space-y-2">
                 <Label>{t('profile.label_power')}</Label>
                 <Input type="number" {...register('power', { valueAsNumber: true })} />
             </div>
          </div>

          <div className="space-y-2">
             <Label>{t('profile.label_wechat')}</Label>
             <Input {...register('wechat_name')} placeholder={t('profile.placeholder_wechat')} />
          </div>

          <div>
             <h4 className="text-sm font-black uppercase mb-4" style={{ color: 'var(--color-status-warning)' }}>{t('profile.label_spec')}</h4>
             <Controller
                name="classes"
                control={control}
                render={({ field }) => {
                  const selectedClasses = field.value || [];
                  return (
                    <div className="flex flex-col gap-4">
                      <div className="p-4 rounded-xl bg-muted/50 border border-border min-h-[60px]">
                         <span className="text-[0.6rem] font-black text-muted-foreground uppercase block mb-2">{t('profile.spec_selected')}</span>
                         <div className="flex flex-wrap gap-2">
                            {selectedClasses.length === 0 && <span className="text-xs italic text-muted-foreground">{t('profile.spec_none')}</span>}
                            {selectedClasses.map((clsId: string, idx: number) => {
                               const meta = getClassMeta(clsId, t);
                               return (
                                 <Badge
                                    key={clsId}
                                    className="h-6 pl-1 pr-2 gap-1.5 text-xs font-bold border cursor-pointer hover:opacity-80 transition-colors"
                                    style={{
                                        backgroundColor: meta.colors.bg,
                                        borderColor: alpha(meta.colors.main, 0.3),
                                        color: meta.colors.main
                                    }}
                                    onClick={() => field.onChange(selectedClasses.filter((c: string) => c !== clsId))}
                                 >
                                    {idx === 0 && (
                                        <span className="w-4 h-4 rounded-full bg-foreground text-background flex items-center justify-center text-[0.5rem] font-black">M</span>
                                    )}
                                    {meta.fullLabel} <Close className="w-3 h-3 opacity-50" />
                                 </Badge>
                               )
                            })}
                         </div>
                      </div>
                      
                      <div className="p-4 rounded-xl border border-border">
                         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {CLASS_GROUPS_CONFIG.map(group => (
                               <div key={group.id}>
                                  <span className="text-[0.6rem] font-black text-muted-foreground uppercase block mb-2">{translateClassGroup(group.labelKey, t)}</span>
                                   <div className="flex flex-col gap-1.5">
                                     {group.options.map(opt => {
                                        const isSelected = selectedClasses.includes(opt.id as ClassType);
                                        const colors = GAME_CLASS_COLORS[group.id as keyof typeof GAME_CLASS_COLORS] || GAME_CLASS_COLORS.mingjin;
                                        return (
                                           <Button
                                              key={opt.id}
                                              size="sm"
                                              variant="outline"
                                              className="justify-start h-7 text-xs font-bold hover:bg-accent transition-colors"
                                              style={{
                                                  color: isSelected ? undefined : colors.main,
                                                  borderColor: isSelected ? undefined : alpha(colors.main, 0.3),
                                                  backgroundColor: isSelected ? colors.main : undefined,
                                              }}
                                              sx={{
                                                  ...(isSelected && {
                                                      color: '#fff !important',
                                                      backgroundColor: `${colors.main} !important`,
                                                      '&:hover': {
                                                          backgroundColor: `${alpha(colors.main, 0.9)} !important`
                                                      }
                                                  })
                                              }}
                                              onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                                                  e.preventDefault();
                                                  if (isSelected) {
                                                    field.onChange(selectedClasses.filter((c: string) => c !== opt.id));
                                                  } else {
                                                    field.onChange([...selectedClasses, opt.id as ClassType]);
                                                  }
                                              }}
                                           >
                                              {translateClassLabel(opt.labelKey, opt.id, t)}
                                           </Button>
                                        )
                                     })}
                                  </div>
                               </div>
                            ))}
                         </div>
                      </div>
                    </div>
                  )
                }}
             />
          </div>

          <div className="space-y-2">
             <div className="flex justify-between items-center">
                <Label>{t('profile.label_title')}</Label>
             </div>
             <Input 
                {...register('title_html')} 
                placeholder={t('profile.placeholder_title_html')} 
             />
             <div className="text-xs text-muted-foreground mt-1">
                 <span dangerouslySetInnerHTML={sanitizeHtml(titleHtml || t('profile.preview_title_placeholder'))} />
             </div>
          </div>

          <div className="space-y-2">
            <Label>{t('profile.label_bio')}</Label>
            {/* Using a textarea with Tailwind classes since we don't have a Textarea primitive yet, or just basic textarea */}
            <textarea 
                className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                rows={4}
                {...register('bio')}
                placeholder={t('profile.placeholder_bio')}
            />
          </div>
        </CardContent>
      </Card>
    </form>
  );
}

function AvailabilityEditor({ user, onUpdate }: { user: User, onUpdate: any }) {
  const { t } = useTranslation();
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
    <Card>
      <div className="flex items-center justify-between p-6 pb-4 border-b border-border">
          <div>
              <h3 className="text-lg font-black italic uppercase">{t('availability.title')}</h3>
              <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">{t('availability.subtitle')}</p>
          </div>
          {isDirty && (
              <Button onClick={handleSave} size="sm" className="font-black text-xs">
                  <Save className="w-4 h-4 mr-2" /> {t('availability.update_schedule')}
              </Button>
          )}
      </div>
      <CardContent className="p-6 flex flex-col gap-6">
         <div className="overflow-x-auto pb-4">
            <div className="min-w-[600px]">
               <div className="flex ml-[80px] mb-1 gap-1">
                  {HOURS.map(h => (
                     <span key={h} className="flex-1 text-center text-[0.6rem] text-muted-foreground select-none">{h}</span>
                  ))}
               </div>
               
               <div className="flex flex-col gap-1.5">
                  {DAYS.map(day => (
                     <div className="flex items-center gap-2" key={day}>
                        <span className="w-20 text-right text-[0.65rem] font-black uppercase text-muted-foreground select-none">{t(`common.day_${day}`)}</span>
                        <div className="flex flex-1 gap-[2px] h-8 select-none">
                           {HOURS.map(hour => {
                               const isSelected = grid[day]?.has(hour);
                               return (
                                  <div 
                                     key={hour}
                                     onMouseDown={() => handleMouseDown(day, hour)}
                                     onMouseEnter={() => handleMouseEnter(day, hour)}
                                     className={cn(
                                         "flex-1 rounded-[1px] cursor-pointer border border-border/50 hover:opacity-80 transition-colors",
                                         isSelected ? "bg-primary border-primary" : "bg-muted/50"
                                     )}
                                  />
                               )
                           })}
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         </div>

         <div className="pt-6 border-t border-border space-y-4">
             <h4 className="flex items-center gap-2 text-xs font-black text-muted-foreground uppercase tracking-widest">
                  <Security className="w-3.5 h-3.5" /> {t('availability.leave_range')}
             </h4>
             <div className="flex flex-col sm:flex-row gap-6">
                <div className="space-y-2 flex-1">
                    <Label>{t('availability.leave_start')}</Label>
                    <Input 
                        type="date" 
                        value={vacationStart} 
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setVacationStart(e.target.value); setIsDirty(true); }} 
                    />
                </div>
                <div className="space-y-2 flex-1">
                    <Label>{t('availability.leave_end')}</Label>
                    <Input 
                        type="date" 
                        value={vacationEnd} 
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setVacationEnd(e.target.value); setIsDirty(true); }} 
                    />
                </div>
             </div>
         </div>
         
         <Alert
           className="border !grid !grid-cols-[auto_1fr] !items-center gap-x-2 [&>svg]:!translate-y-0 [&>svg]:!self-center"
           style={{
             borderColor: 'color-mix(in srgb, var(--color-status-warning) 45%, transparent)',
             backgroundColor: 'color-mix(in srgb, var(--color-status-warning-bg) 84%, transparent)',
             color: 'var(--color-status-warning-fg)',
           }}
         >
            <AccessTime className="w-4 h-4" style={{ color: 'var(--color-status-warning-fg)' }} />
            <AlertDescription
              className="text-xs font-extrabold uppercase tracking-wide leading-none"
              style={{ color: 'var(--color-status-warning-fg)' }}
            >
                {t('availability.utc_warning')}
            </AlertDescription>
         </Alert>
      </CardContent>
    </Card>
  );
}

function ProgressionEditor({ user, onUpdate }: { user: User, onUpdate: any }) {
  const { t, i18n } = useTranslation();
  const [category, setCategory] = useState<'qishu' | 'wuxue' | 'xinfa'>('qishu');
  const [progression, setProgression] = useState<ProgressionData>(user.progression || { qishu: {}, wuxue: {}, xinfa: {} });
  const [isDirty, setIsDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const isChineseLocale = i18n.resolvedLanguage?.toLowerCase().startsWith('zh') ?? false;

  const categories = useMemo(
    () =>
      PROGRESSION_CATEGORIES.map((c) => ({
        id: c.id,
        label: isChineseLocale ? t(c.titleKey) : `${t(c.titleKey)} (${c.id.toUpperCase()})`,
        groups: c.groups,
      })),
    [isChineseLocale, t],
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
    <Card>
        <div className="flex items-center justify-between p-6 pb-4 border-b border-border">
            <div>
                <h3 className="text-lg font-black italic uppercase">{t('profile.progression_title')}</h3>
                <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">{t('profile.progression_subtitle')}</p>
            </div>
            {isDirty && (
                <Button onClick={handleSave} size="sm" className="font-black text-xs">
                    <Save className="w-4 h-4 mr-2" /> {t('profile.finalize_mastery')}
                </Button>
            )}
        </div>
        <div className="p-4 border-b border-border bg-muted/20">
            <ToggleGroup type="single" value={category} onChange={(val: any) => val && setCategory(val)} className="w-full justify-start">
                {categories.map(c => (
                    <ToggleGroupItem key={c.id} value={c.id} className="flex-1 font-extrabold uppercase tracking-wide">
                        {c.label}
                    </ToggleGroupItem>
                ))}
            </ToggleGroup>
        </div>
        <CardContent className="p-6 flex flex-col gap-6">
          {activeCategory?.groups.map((group) => (
            <div key={group.key}>
              <h4 className="text-sm font-black text-muted-foreground uppercase mb-4 px-1">
                {t(group.titleKey)}
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {group.items.map((item) => {
                  const level = (progression[category] as any)[item.key] || 0;
                  // Progression tile spacing follows the same 8px rhythm as other profile cards.
                  return (
                    <div key={item.key} className="p-4 rounded-xl bg-card border border-border flex flex-col items-center gap-4 transition-colors hover:border-primary/50">
                        <div className="relative">
                          <div className="w-24 h-24 rounded-xl bg-muted border border-border overflow-hidden">
                            {item.icon ? (
                              <img
                                src={item.icon}
                                alt={t(item.nameKey)}
                                className="w-full h-full object-cover"
                                width={96}
                                height={96}
                                loading="lazy"
                                decoding="async"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-2xl font-black text-muted-foreground/60">
                                {t(item.nameKey).trim().charAt(0)}
                              </div>
                            )}
                          </div>
                          <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-background border-2 border-border flex items-center justify-center text-sm font-black shadow-sm">
                            {level}
                          </div>
                        </div>
                        <span className="text-xs font-extrabold text-center leading-tight min-h-[2.5em] flex items-center justify-center px-2">
                          {t(item.nameKey)}
                        </span>
                        <div className="flex items-center gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7"
                            onClick={() => updateLevel(category, item.key, -1)}
                            aria-label={`${t(item.nameKey)} -`}
                          >
                            <Remove className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7"
                            onClick={() => updateLevel(category, item.key, 1)}
                            aria-label={`${t(item.nameKey)} +`}
                          >
                            <Add className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </CardContent>
    </Card>
  );
}

export function AccountSettings({ user, onChangePassword, onUpdate, onLogout }: { user: User, onUpdate: any, onChangePassword: any, onLogout: any }) {
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
      <Card>
        <div className="p-6 pb-4 border-b border-border">
            <h3 className="text-lg font-black italic uppercase">{t('account.title')}</h3>
            <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">{t('account.subtitle')}</p>
        </div>
        <CardContent className="p-6 flex flex-col gap-8">
           <form onSubmit={handlePasswordChange} className="space-y-6" data-testid="profile-password-form">
              <div className="space-y-2">
                  <Label>{t('account.current_password')}</Label>
                  {/* Password fields use primitive input so validation tests can target native input semantics reliably. */}
                  <PrimitiveInput
                    data-testid="account-current-password"
                    type="password"
                    value={currentPass}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCurrentPass(e.target.value)}
                    required
                  />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <Label>{t('account.new_password')}</Label>
                    <PrimitiveInput
                      data-testid="account-new-password"
                      type="password"
                      value={newPass}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPass(e.target.value)}
                      required
                    />
                 </div>
                 <div className="space-y-2">
                    <Label>{t('account.confirm_password')}</Label>
                    <PrimitiveInput
                      data-testid="account-confirm-password"
                      type="password"
                      value={confirmPass}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPass(e.target.value)}
                      required
                    />
                 </div>
              </div>

              {message && (
                // Password change feedback is exposed as live regions so screen readers announce success/error immediately.
                <Alert
                data-testid="profile-password-feedback"
                role={message.type === 'error' ? 'alert' : 'status'}
                aria-live={message.type === 'error' ? 'assertive' : 'polite'}
                aria-atomic="true"
                className={cn(
                    "border-l-4"
                )}
                style={
                  message.type === 'success'
                    ? {
                        borderColor: 'var(--color-status-success)',
                        backgroundColor: 'color-mix(in srgb, var(--color-status-success-bg) 84%, transparent)',
                        color: 'var(--color-status-success-fg)',
                      }
                    : {
                        borderColor: 'var(--color-status-error)',
                        backgroundColor: 'color-mix(in srgb, var(--color-status-error-bg) 84%, transparent)',
                        color: 'var(--color-status-error-fg)',
                      }
                }>
                   <AlertDescription className="font-bold">{message.text}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" disabled={changing} size="lg" className="w-full sm:w-auto font-black" data-testid="profile-password-submit">
                <VpnKey className="w-4 h-4 mr-2" /> {t('account.update_password')}
              </Button>
           </form>

           <div className="pt-6 border-t border-border">
               <h4 className="text-xs font-black uppercase tracking-widest mb-4" style={{ color: 'var(--color-status-error)' }}>{t('account.danger_zone')}</h4>
                <Button onClick={onLogout} variant="destructive" size="lg" className="w-full sm:w-auto font-black">
                   <Logout className="w-4 h-4 mr-2" /> {t('account.logout')}
               </Button>
           </div>
        </CardContent>
      </Card>
  );
}
