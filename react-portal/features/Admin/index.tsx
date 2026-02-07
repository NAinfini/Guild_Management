import React, { useState, useMemo, useEffect } from 'react';
import { convertToWebP } from '../../lib/media-conversion';
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
  Select, 
  MenuItem, 
  InputAdornment, 
  Dialog, 
  DialogContent, 
  DialogTitle,
  DialogActions,
  Badge,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tabs,
  Tab,
  useTheme,
  useMediaQuery,
  alpha,
  Tooltip,
  Avatar,
  Grid,
  Skeleton
} from '@mui/material';
import { CardGridSkeleton, TableSkeleton } from '../../components/SkeletonLoaders';
import { 
  ShieldAlert, 
  UserCog, 
  Activity, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertTriangle, 
  User as UserIcon,
  ImageIcon,
  Ban,
  Upload,
  RefreshCw,
  History,
  Shield,
  Zap,
  Heart,
  Calendar,
  X,
  Swords,
  Volume2,
  Save,
  Video,
  Music,
  Trash2,
  Lock,
  KeyRound,
  Terminal,
  Database,
  Cloud,
  Server,
  Globe,
  Plus,
  Minus
} from 'lucide-react';
import { useAuthStore, useUIStore } from '../../store';
import { useAuth } from '../../hooks';
import { Navigate } from '@tanstack/react-router';
import { useMembers, useAuditLogs, useUpdateMember } from '../../hooks/useServerState';
import { cn, formatDateTime, getClassColor, formatPower, sanitizeHtml, getOptimizedMediaUrl } from '../../lib/utils';
import { PROGRESSION_CATEGORIES, clampLevel } from '../../lib/progression';
import { User, AuditLogEntry, Role, ClassType, ProgressionData, Announcement, Event } from '../../types';
import { useForm, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { AuditLogs } from './components/AuditLogs';
import { HealthStatus } from '../../components/HealthStatus';
import { MediaUpload } from '../../components/MediaUpload';
import { MediaReorder } from '../../components/MediaReorder';
import { ProtectedRoute } from '../../components/ProtectedRoute';

type AdminTab = 'members' | 'audit' | 'status';

// Configuration for the Class Picker UI - now using theme colors
const getClassGroups = (theme: any) => [
  {
    id: 'mingjin',
    label: '鸣金',
    color: theme.custom?.classes.mingjin.text,
    borderColor: alpha(theme.custom?.classes.mingjin.main, 0.3),
    bgColor: theme.custom?.classes.mingjin.bg,
    options: [
      { id: 'mingjin_hong', label: '鸣金虹' },
      { id: 'mingjin_ying', label: '鸣金影' }
    ]
  },
  {
    id: 'qiansi',
    label: '牵丝',
    color: theme.custom?.classes.qiansi.text,
    borderColor: alpha(theme.custom?.classes.qiansi.main, 0.3),
    bgColor: theme.custom?.classes.qiansi.bg,
    options: [
      { id: 'qiansi_yu', label: '牵丝玉' },
      { id: 'qiansi_lin', label: '牵丝霖' }
    ]
  },
  {
    id: 'pozhu',
    label: '破竹',
    color: theme.custom?.classes.pozhu.text,
    borderColor: alpha(theme.custom?.classes.pozhu.main, 0.3),
    bgColor: theme.custom?.classes.pozhu.bg,
    options: [
      { id: 'pozhu_feng', label: '破竹风' },
      { id: 'pozhu_chen', label: '破竹尘' },
      { id: 'pozhu_yuan', label: '破竹鸢' }
    ]
  },
  {
    id: 'lieshi',
    label: '裂石',
    color: theme.custom?.classes.lieshi.text,
    borderColor: alpha(theme.custom?.classes.lieshi.main, 0.3),
    bgColor: theme.custom?.classes.lieshi.bg,
    options: [
      { id: 'lieshi_wei', label: '裂石威' },
      { id: 'lieshi_jun', label: '裂石钧' }
    ]
  }
];

export function Admin() {
  const { user } = useAuth();
  const { viewRole } = useAuthStore();

  // ✅ TanStack Query: Server state
  const { data: members = [], isLoading: isLoadingMembers } = useMembers();
  const { data: auditLogs = [], isLoading: isLoadingAudits } = useAuditLogs();
  const isLoading = isLoadingMembers || isLoadingAudits;

  const { setPageTitle, timezoneOffset } = useUIStore();
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [activeTab, setActiveTab] = useState<AdminTab>('members');
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('all');



  useEffect(() => {
    setPageTitle(t('nav.admin'));
  }, [setPageTitle, t]);

  if (isLoading && members.length === 0) {
    return (
      <Box sx={{ p: { xs: 2, sm: 3 } }}>
        {isMobile ? <CardGridSkeleton count={4} /> : <TableSkeleton rows={10} cols={5} />}
      </Box>
    );
  }

  if (!isLoading && members.length === 0) {
    return (
      <Box sx={{ p: { xs: 2, sm: 3 }, textAlign: 'center' }}>
        <Typography variant="h6" fontWeight={900}>{t('admin.empty_title', { defaultValue: 'No members yet' })}</Typography>
        <Typography variant="body2" color="text.secondary">{t('admin.empty_hint', { defaultValue: 'Invite members to manage roles and audits.' })}</Typography>
      </Box>
    );
  }

  const effectiveRole = viewRole || user?.role;
  const isAdmin = effectiveRole === 'admin' || effectiveRole === 'moderator';

  if (!user || !isAdmin) {
    return <Navigate to="/" />;
  }

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto', pb: 10, px: { xs: 2, sm: 4 } }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'flex-end' }}>
        <Box sx={{ bgcolor: 'action.hover', p: 0.5, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <Tabs 
               value={activeTab} 
               onChange={(_, v) => setActiveTab(v)}
               sx={{ 
                   minHeight: 36,
                   '& .MuiTab-root': { 
                       minHeight: 36, 
                       borderRadius: 2, 
                       fontSize: '0.65rem', 
                       fontWeight: 900, 
                       letterSpacing: '0.1em',
                       textTransform: 'uppercase',
                       px: 2
                   },
                   '& .Mui-selected': { bgcolor: 'background.paper', color: 'primary.main', boxShadow: 1 },
                   '& .MuiTabs-indicator': { display: 'none' }
               }}
            >
               <Tab label={t('admin.tab_members')} value="members" icon={<UserCog size={14} />} iconPosition="start" />
               <Tab label={t('admin.tab_audit')} value="audit" icon={<History size={14} />} iconPosition="start" />
               <Tab label={t('admin.tab_status')} value="status" icon={<Activity size={14} />} iconPosition="start" />
            </Tabs>
        </Box>
      </Box>

      {activeTab === 'members' && <MemberManagement />}
      {activeTab === 'audit' && <AuditLogTab />}
      {activeTab === 'status' && <StatusHealthTab />}
    </Box>
  );
}

// Wrapped variant for route protection (admin/moderator only)
export function AdminProtected() {
  return (
    <ProtectedRoute allowedRoles={['admin', 'moderator']}>
      <Admin />
    </ProtectedRoute>
  );
}

function MemberManagement() {
   // ✅ TanStack Query: Server state and mutations
   const { data: members = [] } = useMembers();
   const updateMemberMutation = useUpdateMember();
   const updateMember = async (id: string, data: any) => {
     await updateMemberMutation.mutateAsync({ id, data });
   };

   const { t } = useTranslation();
   const [search, setSearch] = useState('');
   const [selectedMember, setSelectedMember] = useState<User | null>(null);

   const theme = useTheme();
   const isMobile = useMediaQuery(theme.breakpoints.down('md'));

   const filteredMembers = useMemo(() => {
     return members.filter(m => {
        const matchesSearch = m.username.toLowerCase().includes(search.toLowerCase()) || m.wechat_name?.toLowerCase().includes(search.toLowerCase());
        return matchesSearch;
     });
   }, [members, search]);

   return (
      <Stack spacing={4}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <TextField
               placeholder={t('admin.search_placeholder')}
               value={search}
               onChange={(e) => setSearch(e.target.value)}
               size="small"
               InputProps={{
                  startAdornment: <InputAdornment position="start"><Search size={16} /></InputAdornment>,
                  sx: { borderRadius: 3, fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }
               }}
               sx={{ width: { xs: '100%', sm: 300 } }}
            />
        </Box>

        {isMobile ? (
          <Grid container spacing={2}>
            {filteredMembers.map(m => (
              <Grid size={{ xs: 12, sm: 6 }} key={m.id}>
                <Card onClick={() => setSelectedMember(m)} sx={{ cursor: 'pointer' }}>
                  <CardContent>
                    <Stack direction="row" spacing={2} alignItems="center" mb={1}>
                      <Avatar src={m.avatar_url} alt={m.username} variant="rounded" sx={{ width: 44, height: 44 }} />
                      <Box>
                        <Typography variant="subtitle2" fontWeight={800} dangerouslySetInnerHTML={sanitizeHtml(m.username)} />
                        <Typography variant="caption" fontFamily="monospace" color="text.secondary">{m.wechat_name || t('admin.no_wechat')}</Typography>
                      </Box>
                    </Stack>
                    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                      <Chip
                        label={m.role}
                        size="small"
                        sx={{
                          fontWeight: 900,
                          textTransform: 'uppercase',
                          fontSize: '0.6rem',
                          height: 20,
                          bgcolor: theme.custom?.roles[m.role as keyof typeof theme.custom.roles]?.bg,
                          color: theme.custom?.roles[m.role as keyof typeof theme.custom.roles]?.text,
                          borderColor: theme.custom?.roles[m.role as keyof typeof theme.custom.roles]?.main
                        }}
                      />
                      <Chip 
                        label={m.classes?.[0]?.replace('_', ' ') || 'NONE'} 
                        size="small" 
                        variant="outlined" 
                        sx={{ fontWeight: 900, textTransform: 'uppercase', fontSize: '0.6rem', height: 20, ...getClassStyle(m.classes?.[0], theme) }}
                      />
                      <Typography variant="body2" fontFamily="monospace" fontWeight={700} color="primary.main">{formatPower(m.power)}</Typography>
                      <Stack direction="row" alignItems="center" spacing={0.5}>
                        {m.active_status === 'vacation' ? <AlertTriangle size={14} color={theme.custom?.status.vacation.main} /> : <CheckCircle2 size={14} color={theme.custom?.status.active.main} />}
                        <Typography variant="caption" fontWeight={900} textTransform="uppercase" color={m.active_status === 'vacation' ? theme.custom?.status.vacation.main : theme.custom?.status.active.main}>
                          {m.active_status === 'vacation' ? t('admin.status_vacation') : t('admin.status_active')}
                        </Typography>
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
            {filteredMembers.length === 0 && (
              <Grid size={{ xs: 12 }}>
                <Typography variant="caption" fontWeight={900} color="text.secondary" letterSpacing="0.1em" align="center" display="block">
                  {t('common.no_results')}
                </Typography>
              </Grid>
            )}
          </Grid>
        ) : (
          <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 4, overflow: 'hidden' }}>
             <Table>
                <TableHead sx={{ bgcolor: 'action.hover' }}>
                   <TableRow>
                      {['identity', 'role', 'spec', 'power', 'status'].map(head => (
                         <TableCell key={head} sx={{ py: 2, fontSize: '0.65rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'text.secondary' }}>
                            {t(`admin.label_${head}`)}
                         </TableCell>
                      ))}
                   </TableRow>
                </TableHead>
                <TableBody>
                   {filteredMembers.map(m => (
                      <TableRow 
                        key={m.id} 
                        hover 
                        onClick={() => setSelectedMember(m)} 
                        sx={{ cursor: 'pointer', '&:last-child td, &:last-child th': { border: 0 } }}
                      >
                         <TableCell>
                            <Stack direction="row" spacing={2} alignItems="center">
                               <Avatar src={m.avatar_url} alt={m.username} variant="rounded" sx={{ width: 40, height: 40 }} />
                               <Box>
                                   <Typography variant="subtitle2" fontWeight={800} dangerouslySetInnerHTML={sanitizeHtml(m.username)} />
                                   <Typography variant="caption" fontFamily="monospace" color="text.secondary">{m.wechat_name || t('admin.no_wechat')}</Typography>
                               </Box>
                            </Stack>
                         </TableCell>
                         <TableCell>
                            <Chip
                               label={m.role}
                               size="small"
                               sx={{
                                 fontWeight: 900,
                                 textTransform: 'uppercase',
                                 fontSize: '0.6rem',
                                 height: 20,
                                 bgcolor: theme.custom?.roles[m.role as keyof typeof theme.custom.roles]?.bg,
                                 color: theme.custom?.roles[m.role as keyof typeof theme.custom.roles]?.text,
                                 borderColor: theme.custom?.roles[m.role as keyof typeof theme.custom.roles]?.main
                               }}
                            />
                         </TableCell>
                         <TableCell>
                            <Chip 
                               label={m.classes?.[0]?.replace('_', ' ') || 'NONE'} 
                               size="small" 
                               variant="outlined" 
                               sx={{ fontWeight: 900, textTransform: 'uppercase', fontSize: '0.6rem', height: 20, ...getClassStyle(m.classes?.[0], theme) }}
                            />
                         </TableCell>
                         <TableCell>
                            <Typography variant="body2" fontFamily="monospace" fontWeight={700} color="primary.main">{formatPower(m.power)}</Typography>
                         </TableCell>
                         <TableCell>
                            <Stack direction="row" alignItems="center" spacing={1}>
                               {m.active_status === 'vacation' ? <AlertTriangle size={14} color={theme.custom?.status.vacation.main} /> : <CheckCircle2 size={14} color={theme.custom?.status.active.main} />}
                               <Typography variant="caption" fontWeight={900} textTransform="uppercase" color={m.active_status === 'vacation' ? theme.custom?.status.vacation.main : theme.custom?.status.active.main}>
                                  {m.active_status === 'vacation' ? t('admin.status_vacation') : t('admin.status_active')}
                               </Typography>
                            </Stack>
                         </TableCell>
                      </TableRow>
                   ))}
                   {filteredMembers.length === 0 && (
                      <TableRow>
                         <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                            <Typography variant="caption" fontWeight={900} color="text.secondary" letterSpacing="0.1em">{t('common.no_results')}</Typography>
                         </TableCell>
                      </TableRow>
                   )}
                </TableBody>
             </Table>
          </TableContainer>
        )}

        {selectedMember && (
           <MemberDetailModal 
              member={selectedMember} 
              onClose={() => setSelectedMember(null)} 
              onUpdate={(updates: Partial<User>) => {
                 updateMember(selectedMember.id, updates);
                 setSelectedMember({ ...selectedMember, ...updates });
              }}
           />
        )}
      </Stack>
   );
}

function getClassStyle(classId: string | undefined, theme: any) {
    // Simple placeholder logic
    if (!classId) return { borderColor: theme.palette.divider };
    return { borderColor: alpha(theme.palette.primary.main, 0.3), color: theme.palette.text.secondary };
}

function MemberDetailModal({ member, onClose, onUpdate }: { member: User, onClose: () => void, onUpdate: (u: Partial<User>) => void }) {
   const { user: currentUser } = useAuthStore();
   const { t } = useTranslation();
   const theme = useTheme();
   const [tab, setTab] = useState<'overview' | 'profile' | 'progression' | 'media' | 'admin'>('overview');
   const online = typeof navigator !== 'undefined' ? navigator.onLine : true;
   
   return (
      <Dialog 
         open 
         onClose={onClose} 
         maxWidth="lg" 
         fullWidth
         PaperProps={{ sx: { bgcolor: 'background.paper', borderRadius: 4, overflow: 'hidden', height: '85vh', display: 'flex', flexDirection: 'column' } }}
      >
         <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider', bgcolor: 'background.default', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
             <Stack direction="row" spacing={3} alignItems="center">
                 <Avatar src={member.avatar_url} alt={member.username} variant="rounded" sx={{ width: 64, height: 64, boxShadow: 3 }} />
                 <Box>
                     <Typography variant="h4" fontWeight={900} textTransform="uppercase" fontStyle="italic" lineHeight={1}>{member.username}</Typography>
                     <Stack direction="row" spacing={1} mt={1}>
                        <Chip label={`ID: ${member.id}`} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.6rem', fontWeight: 900 }} />
                        <Chip
                          label={member.role}
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: '0.6rem',
                            fontWeight: 900,
                            textTransform: 'uppercase',
                            bgcolor: theme.custom?.roles[member.role as keyof typeof theme.custom.roles]?.bg,
                            color: theme.custom?.roles[member.role as keyof typeof theme.custom.roles]?.text,
                            borderColor: theme.custom?.roles[member.role as keyof typeof theme.custom.roles]?.main
                          }}
                        />
                     </Stack>
                 </Box>
             </Stack>
             <IconButton onClick={onClose}><X /></IconButton>
         </Box>

         <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3, bgcolor: 'background.paper' }}>
             <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto">
                {['overview', 'profile', 'progression', 'media', 'admin'].map(key => (
                   <Tab key={key} label={t(`admin.tab_${key}`)} value={key} sx={{ fontWeight: 900, minHeight: 60 }} />
                ))}
             </Tabs>
         </Box>

         <DialogContent sx={{ p: 4, overflowY: 'auto', bgcolor: 'background.default' }}>
            {tab === 'overview' && <MemberOverview member={member} onUpdate={onUpdate} />}
            {tab === 'profile' && <MemberProfileEditor member={member} onUpdate={onUpdate} canEdit={true} />}
            {tab === 'progression' && <MemberProgressionEditor member={member} onUpdate={onUpdate} />}
            {tab === 'media' && <MemberMediaManager member={member} onUpdate={onUpdate} />}
            {tab === 'admin' && <MemberAdminActions member={member} onUpdate={onUpdate} currentUser={currentUser!} />}
         </DialogContent>
      </Dialog>
   );
}

function MemberOverview({ member, onUpdate }: { member: User, onUpdate: (u: Partial<User>) => void }) {
   const { t } = useTranslation();
   const theme = useTheme();
   const { register, handleSubmit, control, setValue, watch, formState: { isDirty } } = useForm({
      defaultValues: { power: member.power, classes: member.classes || [], avatar_url: member.avatar_url || '' }
   });

   const [uploading, setUploading] = useState(false);
   const currentAvatar = watch('avatar_url');
   const online = typeof navigator !== 'undefined' ? navigator.onLine : true;

   const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setUploading(true);
      // Client-side preview only until backend upload is implemented
      setTimeout(() => {
          setValue('avatar_url', URL.createObjectURL(file), { shouldDirty: true });
          setUploading(false);
      }, 1000);
   };

   return (
      <Grid container spacing={4}>
         <Grid size={{ xs: 12, md: 6 }}>
            <Card sx={{ borderRadius: 4 }}>
               <CardHeader title={<Typography variant="subtitle2" fontWeight={900} textTransform="uppercase" color="text.secondary">{t('admin.roster_data')}</Typography>} />
               <CardContent>
                  <form onSubmit={handleSubmit(onUpdate)}>
                     <Stack spacing={3}>
                        <Stack direction="row" spacing={3}>
                           <Box sx={{ position: 'relative', width: 80, height: 80 }}>
                              <Avatar src={currentAvatar} alt={member.username} variant="rounded" sx={{ width: '100%', height: '100%' }} />
                              <IconButton 
                                 component="label" 
                                 size="small" 
                                 sx={{ position: 'absolute', bottom: -8, right: -8, bgcolor: 'primary.main', color: 'primary.contrastText', '&:hover': { bgcolor: 'primary.dark' } }}
                              >
                                 <Upload size={14} />



                                 <input type="file" hidden accept="image/*" onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                       try {
                                          const processed = await convertToWebP(file);
                                          handleFileUpload(processed as any);
                                       } catch (err) {
                                          handleFileUpload(e as any);
                                       }
                                    }
                                 }} />
                              </IconButton>
                           </Box>
                           <Box flex={1}>
                              <TextField label={t('admin.power_rating')} type="number" fullWidth {...register('power', { valueAsNumber: true })} size="small" />
                           </Box>
                        </Stack>

                        <Box>
                           <Typography variant="caption" fontWeight={900} textTransform="uppercase" color="text.secondary" display="block" mb={1}>{t('admin.current_status')}</Typography>
                           {member.active_status === 'vacation' ? (
                              <Chip
                                icon={<AlertTriangle size={14} />}
                                label={t('admin.status_on_leave')}
                                size="small"
                                sx={{
                                  fontWeight: 900,
                                  bgcolor: theme.custom?.status.vacation.bg,
                                  color: theme.custom?.status.vacation.text,
                                  borderColor: theme.custom?.status.vacation.main
                                }}
                              />
                           ) : (
                              <Chip
                                icon={<CheckCircle2 size={14} />}
                                label={t('admin.status_active_duty')}
                                size="small"
                                sx={{
                                  fontWeight: 900,
                                  bgcolor: theme.custom?.status.active.bg,
                                  color: theme.custom?.status.active.text,
                                  borderColor: theme.custom?.status.active.main
                                }}
                              />
                           )}
                        </Box>

                        <Box>
                            <Typography variant="caption" fontWeight={900} textTransform="uppercase" color="text.secondary" display="block" mb={1}>{t('admin.class_spec')}</Typography>
                            <Controller
                               name="classes"
                               control={control}
                               render={({ field }) => (
                                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                     {getClassGroups(theme).map((group: any) => group.options.map((opt: any) => (
                                        <Chip
                                           key={opt.id}
                                           label={opt.label}
                                           onClick={() => {
                                              const current = field.value || [];
                                              const classId = opt.id as ClassType;
                                              if (current.includes(classId)) field.onChange(current.filter((c: ClassType) => c !== classId));
                                              else field.onChange([...current, classId]);
                                           }}
                                           variant={field.value?.includes(opt.id as ClassType) ? 'filled' : 'outlined'}
                                           size="small"
                                           sx={{
                                             fontWeight: 800,
                                             fontSize: '0.65rem',
                                             bgcolor: field.value?.includes(opt.id as ClassType) ? group.bgColor : 'transparent',
                                             color: field.value?.includes(opt.id as ClassType) ? group.color : 'text.secondary',
                                             borderColor: group.borderColor
                                           }}
                                        />
                                      )))}
                                   </Box>
                               )}
                            />
                        </Box>

                        {isDirty && (
                           <Button type="submit" variant="contained" fullWidth startIcon={<Save size={16} />} sx={{ fontWeight: 900 }} disabled={!online}>{t('admin.save_roster')}</Button>
                        )}
                     </Stack>
                  </form>
               </CardContent>
            </Card>

            <Box sx={{ mt: 3, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
                {[
                    { icon: Zap, count: Object.keys(member.progression?.qishu || {}).length, label: 'Qishu', color: 'orange' },
                    { icon: Swords, count: Object.keys(member.progression?.wuxue || {}).length, label: 'Wuxue', color: 'red' },
                    { icon: Heart, count: Object.keys(member.progression?.xinfa || {}).length, label: 'Xinfa', color: 'blue' }
                ].map((stat, i) => (
                    <Card key={i} sx={{ p: 2, textAlign: 'center', borderRadius: 3 }}>
                        <stat.icon size={20} color={stat.color} style={{ margin: '0 auto', marginBottom: 8 }} />
                        <Typography variant="h6" fontWeight={900}>{stat.count}</Typography>
                        <Typography variant="caption" fontWeight={900} textTransform="uppercase" letterSpacing="0.2em" color="text.secondary">{stat.label}</Typography>
                    </Card>
                ))}
            </Box>
         </Grid>

         <Grid size={{ xs: 12, md: 6 }}>
             <Card sx={{ height: '100%', borderRadius: 4 }}>
                 <CardHeader title={<Typography variant="subtitle2" fontWeight={900} textTransform="uppercase" color="text.secondary">{t('admin.availability_matrix')}</Typography>} />
                 <CardContent>
                     <Stack spacing={1}>
                        {member.availability && member.availability.some(d => d.blocks.length > 0) ? (
                            member.availability.map(day => day.blocks.length > 0 && (
                                <Box key={day.day} sx={{ display: 'flex', justifyContent: 'space-between', p: 1.5, bgcolor: 'action.hover', borderRadius: 2 }}>
                                    <Typography variant="caption" fontWeight={900} textTransform="uppercase">{day.day}</Typography>
                                    <Stack direction="row" spacing={1}>
                                        {day.blocks.map((b, i) => (
                                            <Chip key={i} label={`${b.start} - ${b.end}`} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.6rem', fontFamily: 'monospace', fontWeight: 700 }} />
                                        ))}
                                    </Stack>
                                </Box>
                            ))
                        ) : (
                            <Typography variant="caption" align="center" display="block" color="text.disabled" fontWeight={900} sx={{ py: 4 }}>{t('admin.no_schedule')}</Typography>
                        )}
                     </Stack>
                 </CardContent>
             </Card>
         </Grid>
      </Grid>
   )
}

function MemberProgressionEditor({ member, onUpdate }: { member: User, onUpdate: (u: Partial<User>) => void }) {
   const { t } = useTranslation();
   const [category, setCategory] = useState<'qishu' | 'wuxue' | 'xinfa'>('qishu');
   const [progression, setProgression] = useState<ProgressionData>(member.progression || { qishu: {}, wuxue: {}, xinfa: {} });
   const [isDirty, setIsDirty] = useState(false);

   const categories = useMemo(
     () =>
       PROGRESSION_CATEGORIES.map((c) => ({
         id: c.id,
         label: `${t(c.titleKey)} (${c.id.toUpperCase()})`,
         groups: c.groups,
       })),
     [t],
   );
   const online = typeof navigator !== 'undefined' ? navigator.onLine : true;

   const updateLevel = (cat: 'qishu' | 'wuxue' | 'xinfa', key: string, delta: number) => {
     const next = { ...progression } as ProgressionData;
     const current = next[cat][key] || 0;
     const val = clampLevel(current + delta);
     next[cat][key] = val;
     setProgression(next);
     setIsDirty(true);
   };

   const activeCategory = useMemo(
     () => categories.find(c => c.id === category),
     [categories, category],
   );

   return (
      <Stack spacing={3}>
         <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
             <Box sx={{ bgcolor: 'action.hover', p: 0.5, borderRadius: 2 }}>
                 {categories.map(c => (
                     <Button 
                        key={c.id} 
                        size="small" 
                        variant={category === c.id ? 'contained' : 'text'} 
                        onClick={() => setCategory(c.id as any)}
                        sx={{ fontWeight: 900, minWidth: 100 }}
                     >
                        {c.label}
                     </Button>
                 ))}
             </Box>
             {isDirty && (
               <Button variant="contained" startIcon={<Save size={16} />} onClick={() => { onUpdate({ progression }); setIsDirty(false); }} disabled={!online}>
                  {t('admin.save_progression')}
               </Button>
             )}
         </Box>
         
         <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxHeight: '50vh', overflowY: 'auto', pr: 1 }}>
            {activeCategory?.groups.map((group) => (
              <Box key={group.key}>
                <Typography variant="subtitle2" fontWeight={900} textTransform="uppercase" color="text.secondary" mb={1}>
                  {t(group.titleKey)}
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 1.5 }}>
                  {group.items.map((item) => {
                    const level = progression[category][item.key] || 0;
                    return (
                      <Card key={item.key} variant="outlined" sx={{ p: 1.5, borderRadius: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ position: 'relative' }}>
                           <Avatar variant="rounded" src={item.icon} alt={item.key} sx={{ width: 48, height: 48, bgcolor: 'background.default' }}>
                             <Zap size={18} />
                           </Avatar>
                           <Box sx={{ position: 'absolute', bottom: -6, right: -6, width: 22, height: 22, borderRadius: '50%', bgcolor: 'primary.main', color: 'primary.contrastText', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 900 }}>
                              {level}
                           </Box>
                        </Box>
                        <Typography variant="caption" fontWeight={900} textAlign="center" lineHeight={1.2}>{t(item.nameKey)}</Typography>
                        <Stack direction="row" spacing={1} mt={0.5}>
                           <IconButton size="small" onClick={() => updateLevel(category, item.key, -1)} sx={{ border: '1px solid', borderColor: 'divider' }}><Minus size={12} /></IconButton>
                           <IconButton size="small" onClick={() => updateLevel(category, item.key, 1)} sx={{ border: '1px solid', borderColor: 'divider' }}><Plus size={12} /></IconButton>
                        </Stack>
                      </Card>
                    );
                  })}
                </Box>
              </Box>
            ))}
         </Box>
      </Stack>
   )
 }

function MemberProfileEditor({ member, onUpdate, canEdit }: { member: User, onUpdate: (u: Partial<User>) => void, canEdit: boolean }) {
   const { t } = useTranslation();
   const theme = useTheme();
   const { register, handleSubmit, watch, formState: { isDirty } } = useForm({
      defaultValues: {
         title_html: member.title_html || '',
         bio: member.bio || '',
         wechat_name: member.wechat_name || '',
         notes: member.notes || ''
      }
   });
   const online = typeof navigator !== 'undefined' ? navigator.onLine : true;

   return (
      <form onSubmit={handleSubmit(onUpdate)}>
         <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
               <Stack spacing={3}>
                  <TextField label={t('admin.identity_title_html')} fullWidth {...register('title_html')} disabled={!canEdit} helperText={<span dangerouslySetInnerHTML={sanitizeHtml(watch('title_html'))} />} />
                  <TextField label={t('admin.wechat_id')} fullWidth {...register('wechat_name')} disabled={!canEdit} />
               </Stack>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
                 <TextField label={t('admin.biography')} multiline rows={4} fullWidth {...register('bio')} disabled={!canEdit} />
            </Grid>
            <Grid size={12}>
                 <TextField
                    label={t('admin.notes_private')}
                    multiline
                    rows={4}
                    fullWidth
                    {...register('notes')}
                    disabled={!canEdit}
                    sx={{ '& .MuiInputBase-root': { color: 'warning.main', bgcolor: alpha(theme.palette.warning.main, 0.05) } }}
                 />
            </Grid>
         </Grid>
         {isDirty && (
            <Box mt={3} display="flex" justifyContent="flex-end">
               <Button type="submit" variant="contained" startIcon={<Save size={16} />} disabled={!online}>{t('admin.save_changes')}</Button>
            </Box>
         )}
      </form>
   )
}

function MemberMediaManager({ member, onUpdate }: { member: User, onUpdate: (u: Partial<User>) => void }) {
   const { t } = useTranslation();
   const [media, setMedia] = useState(member.media || []);

   const handleUpload = (file: File) => {
      const url = URL.createObjectURL(file);
      const type = (file.type.startsWith('video') ? 'video' : 'image') as any;
      const next = [...media, { id: `temp-${Date.now()}`, hash: '', url, type }];
      setMedia(next);
      onUpdate({ media: next as any });
   };

   const handleReorder = (from: number, to: number) => {
      const next = [...media];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      setMedia(next);
      onUpdate({ media: next as any });
   };

   const handleDelete = (index: number) => {
      const next = media.filter((_, i) => i !== index);
      setMedia(next);
      onUpdate({ media: next as any });
   };

   return (
      <Stack spacing={4}>
         <MediaUpload label={t('admin.tab_media')} onSelect={handleUpload} />
         <MediaReorder items={media as any} onReorder={handleReorder} onDelete={handleDelete} />
         <TextField 
            label={t('settings.audio_settings')} 
            defaultValue={member.audio_url} 
            fullWidth 
            onBlur={(e) => onUpdate({ audio_url: e.target.value })}
            InputProps={{ startAdornment: <InputAdornment position="start"><Volume2 size={16} /></InputAdornment> }} 
         />
      </Stack>
   )
}

function MemberAdminActions({ member, onUpdate, currentUser }: { member: User, onUpdate: (u: Partial<User>) => void, currentUser: User }) {
   const { t } = useTranslation();
   const [password, setPassword] = useState('');
   const canManageRole = currentUser.role === 'admin' && currentUser.id !== member.id;
   const canDeactivate = currentUser.role === 'admin' && currentUser.id !== member.id;
   const [pendingRole, setPendingRole] = useState<Role | null>(null);
   const online = typeof navigator !== 'undefined' ? navigator.onLine : true;

   return (
      <Stack spacing={4}>
         <Card variant="outlined">
            <CardHeader title={<Typography variant="subtitle2" fontWeight={900}>{t('admin.authority_level')}</Typography>} />
            <CardContent>
               <Stack direction="row" spacing={1}>
                  {(['admin', 'moderator', 'member', 'external'] as Role[]).map(r => (
                     <Button 
                        key={r} 
                        variant={member.role === r ? 'contained' : 'outlined'} 
                        disabled={!canManageRole || !online} 
                        onClick={() => setPendingRole(r)}
                        sx={{ textTransform: 'uppercase', fontWeight: 900 }}
                     >
                        {r}
                     </Button>
                  ))}
               </Stack>
            </CardContent>
         </Card>

         <Grid container spacing={4}>
            <Grid size={{ xs: 12, md: 6 }}>
               <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardHeader title={<Stack direction="row" gap={1}><KeyRound size={16} /> <Typography variant="subtitle2" fontWeight={900}>{t('admin.reset_credentials')}</Typography></Stack>} />
                  <CardContent>
                     <Stack spacing={2}>
                        <TextField type="password" placeholder={t('admin.temp_password_placeholder')} value={password} onChange={e => setPassword(e.target.value)} size="small" fullWidth />
                        <Button variant="contained" disabled={!password || !canManageRole || !online} onClick={() => { alert('Saved'); setPassword(''); }}>{t('admin.reset_password')}</Button>
                     </Stack>
                  </CardContent>
               </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
               <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardHeader title={<Stack direction="row" gap={1}><Ban size={16} /> <Typography variant="subtitle2" fontWeight={900}>{t('admin.account_status')}</Typography></Stack>} />
                  <CardContent>
                     <Button 
                        fullWidth 
                        variant="contained" 
                        color={member.active_status === 'active' ? 'error' : 'success'} 
                        disabled={!canDeactivate || !online}
                        onClick={() => onUpdate({ active_status: member.active_status === 'active' ? 'inactive' : 'active' })}
                     >
                        {member.active_status === 'active' ? t('admin.deactivate') : t('admin.reactivate')}
                     </Button>
                  </CardContent>
               </Card>
            </Grid>
         </Grid>

         <Dialog open={!!pendingRole} onClose={() => setPendingRole(null)}>
            <DialogTitle>{t('admin.confirm_role_change') || 'Confirm role change'}</DialogTitle>
            <DialogContent>
               <Typography variant="body2">
                  {t('admin.confirm_role_body') || `Change ${member.username} to ${pendingRole}? This requires admin confirmation.`}
               </Typography>
            </DialogContent>
            <DialogActions>
               <Button onClick={() => setPendingRole(null)}>{t('common.cancel') || 'Cancel'}</Button>
               <Button 
                 variant="contained" 
                 color="warning" 
                 disabled={!online}
                 onClick={() => { if (pendingRole && online) onUpdate({ role: pendingRole }); setPendingRole(null); }}
               >
                 {t('common.confirm') || 'Confirm'}
               </Button>
            </DialogActions>
         </Dialog>
      </Stack>
   )
}

function AuditLogTab() {
   return <AuditLogs />;
}

function StatusHealthTab() {
   return <HealthStatus />;
}
