import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useTheme,
  useMediaQuery,
  alpha,
  Tooltip,
  Avatar,
  Grid,
  Skeleton,
  Box,
  Stack,
  Typography,
  Paper,
  Card,
  CardContent,
  CardHeader,
  Button,
  Badge,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  Chip,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Select,
  MenuItem,
  Input,
  InputAdornment,
  TextField,
  IconButton,
  ImageList,
  ImageListItem
} from '@mui/material';
import { 
  Label,
  Separator,
  CardGridSkeleton, 
  TableSkeleton 
} from '@/components';
import { 
  AdminPanelSettings as ShieldAlert, 
  ManageAccounts as UserCog, 
  Insights as Activity, 
  Search, 
  FilterList as Filter, 
  CheckCircle as CheckCircle2, 
  Warning as AlertTriangle, 
  Person as UserIcon,
  Image as ImageIcon,
  Block as Ban,
  FileUpload as Upload,
  Refresh as RefreshCw,
  History,
  Shield,
  Bolt as Zap,
  Favorite as Heart,
  CalendarMonth as Calendar,
  Close as X,
  EmojiEvents as Swords,
  Save,
  Videocam as Video,
  MusicNote as Music,
  Delete as Trash2,
  Lock,
  VpnKey as KeyRound,
  Terminal,
  Storage as Database,
  Cloud,
  Dns as Server,
  Language as Globe,
  Add as Plus,
  Remove as Minus
} from '@mui/icons-material';
import { useAuthStore, useUIStore } from '../../store';
import { useAuth } from '../../hooks';
import { Navigate } from '@tanstack/react-router';
import { useMembers, useAuditLogs, useUpdateMember } from '../../hooks/useServerState';
import { cn, formatDateTime, getClassColor, formatPower, sanitizeHtml, formatClassDisplayName } from '../../lib/utils';
import { getOptimizedMediaUrl } from '@/lib/media-conversion';
import { PROGRESSION_CATEGORIES, clampLevel } from '../../lib/progression';
import { convertToWebP } from '../../lib/media-conversion';
import { warsAPI, membersAPI, mediaAPI } from '../../lib/api';
import { type User, type Role, type ClassType, type ProgressionData, type AuditLogEntry } from '../../types';
import { useForm, Controller } from 'react-hook-form';
import { AuditLogs } from './components/AuditLogs';
import { HealthStatus } from '@/components';
import { ProtectedRoute } from '../Auth/components/ProtectedRoute';
import { 
  canAccessAdminArea, 
  canManageMemberActivation, 
  canManageMemberRoles,
  getEffectiveRole 
} from '../../lib/permissions';

type AdminTab = 'members' | 'audit' | 'status';

// Configuration for the Class Picker UI - now using theme colors
const getClassGroups = (theme: any) => [
  {
    id: 'mingjin',
    label: '鸣金',
    mainColor: theme.custom?.classes?.mingjin?.main || theme.palette.primary.main,
    color: theme.custom?.classes?.mingjin?.text || theme.palette.text.primary,
    borderColor: alpha(theme.custom?.classes?.mingjin?.main || theme.palette.primary.main, 0.35),
    bgColor: theme.custom?.classes?.mingjin?.bg || alpha(theme.custom?.classes?.mingjin?.main || theme.palette.primary.main, 0.14),
    options: [
      { id: 'mingjin_hong', label: '鸣金虹' },
      { id: 'mingjin_ying', label: '鸣金影' }
    ]
  },
  {
    id: 'qiansi',
    label: '牵丝',
    mainColor: theme.custom?.classes?.qiansi?.main || theme.palette.primary.main,
    color: theme.custom?.classes?.qiansi?.text || theme.palette.text.primary,
    borderColor: alpha(theme.custom?.classes?.qiansi?.main || theme.palette.primary.main, 0.35),
    bgColor: theme.custom?.classes?.qiansi?.bg || alpha(theme.custom?.classes?.qiansi?.main || theme.palette.primary.main, 0.14),
    options: [
      { id: 'qiansi_yu', label: '牵丝玉' },
      { id: 'qiansi_lin', label: '牵丝霖' }
    ]
  },
  {
    id: 'pozhu',
    label: '破竹',
    mainColor: theme.custom?.classes?.pozhu?.main || theme.palette.primary.main,
    color: theme.custom?.classes?.pozhu?.text || theme.palette.text.primary,
    borderColor: alpha(theme.custom?.classes?.pozhu?.main || theme.palette.primary.main, 0.35),
    bgColor: theme.custom?.classes?.pozhu?.bg || alpha(theme.custom?.classes?.pozhu?.main || theme.palette.primary.main, 0.14),
    options: [
      { id: 'pozhu_feng', label: '破竹风' },
      { id: 'pozhu_chen', label: '破竹尘' },
      { id: 'pozhu_yuan', label: '破竹鸢' }
    ]
  },
  {
    id: 'lieshi',
    label: '裂石',
    mainColor: theme.custom?.classes?.lieshi?.main || theme.palette.primary.main,
    color: theme.custom?.classes?.lieshi?.text || theme.palette.text.primary,
    borderColor: alpha(theme.custom?.classes?.lieshi?.main || theme.palette.primary.main, 0.35),
    bgColor: theme.custom?.classes?.lieshi?.bg || alpha(theme.custom?.classes?.lieshi?.main || theme.palette.primary.main, 0.14),
    options: [
      { id: 'lieshi_wei', label: '裂石威' },
      { id: 'lieshi_jun', label: '裂石钧' }
    ]
  }
];

export function Admin() {
  const { user } = useAuth();
  const { viewRole } = useAuthStore();

  // 鉁?TanStack Query: Server state
  const { data: members = [], isLoading: isLoadingMembers, isError: isMembersError } = useMembers();
  const { data: auditLogs = [], isLoading: isLoadingAudits } = useAuditLogs();
  const isLoading = isLoadingMembers || isLoadingAudits;

  const { setPageTitle, timezoneOffset } = useUIStore();
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [activeTab, setActiveTab] = useState<AdminTab>('members');
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const cardToken = theme.custom?.components?.card;
  const inputToken = theme.custom?.components?.input;
  const tableToken = theme.custom?.components?.table;
  const buttonToken = theme.custom?.components?.button;
  const segmentedToken = theme.custom?.components?.segmentedControl;



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

  if (!isLoading && !isMembersError && members.length === 0) {
    return (
      <Box sx={{ p: { xs: 2, sm: 3 }, textAlign: 'center' }}>
        <Typography variant="h6" fontWeight={900}>{t('admin.empty_title')}</Typography>
        <Typography variant="body2" color="text.secondary">{t('admin.empty_hint')}</Typography>
      </Box>
    );
  }

  const effectiveRole = getEffectiveRole(user?.role, viewRole);
  const isAdmin = canAccessAdminArea(effectiveRole);

  if (!user || !isAdmin) {
    return <Navigate to="/" />;
  }

  return (
    <Box
      sx={{
        maxWidth: 1400,
        mx: 'auto',
        pb: 10,
        px: { xs: 2, sm: 4 },
        '& .MuiCard-root': {
          bgcolor: cardToken?.bg || 'background.paper',
          border: '1px solid',
          borderColor: cardToken?.border || 'divider',
          boxShadow: cardToken?.shadow || 'none',
        },
        '& .MuiOutlinedInput-root': {
          bgcolor: inputToken?.bg || 'background.paper',
          color: inputToken?.text || 'text.primary',
          '& fieldset': {
            borderColor: inputToken?.border || 'divider',
          },
          '&:hover fieldset': {
            borderColor: inputToken?.focusBorder || 'primary.main',
          },
          '&.Mui-focused fieldset': {
            borderColor: inputToken?.focusBorder || 'primary.main',
          },
        },
        '& .MuiTableHead-root': {
          bgcolor: tableToken?.headerBg || 'action.hover',
        },
        '& .MuiTableBody-root .MuiTableRow-root': {
          bgcolor: tableToken?.rowBg || 'transparent',
          '&:hover': {
            bgcolor: tableToken?.rowHoverBg || 'action.hover',
          },
        },
        '& .MuiButton-contained': {
          bgcolor: buttonToken?.bg || 'primary.main',
          color: buttonToken?.text || 'primary.contrastText',
          borderColor: buttonToken?.border || 'transparent',
          '&:hover': {
            bgcolor: buttonToken?.hoverBg || 'primary.dark',
          },
        },
        '& .MuiButton-outlined': {
          borderColor: buttonToken?.border || 'divider',
          color: buttonToken?.text || 'text.primary',
          '&:hover': {
            bgcolor: buttonToken?.hoverBg || 'action.hover',
            borderColor: buttonToken?.border || 'divider',
          },
        },
      }}
    >
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'flex-end' }}>
        <Box
          sx={{
            bgcolor: segmentedToken?.bg || 'action.hover',
            p: 0.5,
            borderRadius: 3,
            border: '1px solid',
            borderColor: segmentedToken?.border || 'divider',
          }}
        >
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
                       px: 2,
                       color: segmentedToken?.text || 'text.secondary',
                       transition: 'all 160ms ease',
                   },
                   '& .Mui-selected': {
                     bgcolor: segmentedToken?.selectedBg || 'background.paper',
                     color: segmentedToken?.selectedText || 'primary.main',
                     boxShadow: 1,
                   },
                   '& .MuiTabs-indicator': { display: 'none' }
               }}
            >
               <Tab label={t('admin.tab_members')} value="members" icon={<UserCog sx={{ fontSize: 14 }} />} iconPosition="start" />
               <Tab label={t('admin.tab_audit')} value="audit" icon={<History sx={{ fontSize: 14 }} />} iconPosition="start" />
               <Tab label={t('admin.tab_status')} value="status" icon={<Activity sx={{ fontSize: 14 }} />} iconPosition="start" />
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
    <ProtectedRoute allowedRoles={['admin', 'moderator']} permissionControl="access_admin_area">
      <Admin />
    </ProtectedRoute>
  );
}

function MemberManagement() {
   // 鉁?TanStack Query: Server state and mutations
   const {
     data: members = [],
     isError: isMembersError,
     error: membersError,
     refetch: refetchMembers,
   } = useMembers();
   const updateMemberMutation = useUpdateMember();
   const updateMember = async (id: string, data: any) => {
     await updateMemberMutation.mutateAsync({ id, data });
   };

   const { t } = useTranslation();
   const [search, setSearch] = useState('');
   const [selectedMember, setSelectedMember] = useState<User | null>(null);

   const theme = useTheme();
   const isMobile = useMediaQuery(theme.breakpoints.down('md'));
   const tableToken = theme.custom?.components?.table;

   const filteredMembers = useMemo(() => {
     return members.filter(m => {
        const matchesSearch = m.username.toLowerCase().includes(search.toLowerCase()) || m.wechat_name?.toLowerCase().includes(search.toLowerCase());
        return matchesSearch;
     });
   }, [members, search]);

   if (isMembersError && members.length === 0) {
     return (
       <Card variant="outlined" sx={{ borderRadius: 3 }}>
         <CardContent>
           <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between">
             <Box>
               <Typography variant="subtitle2" fontWeight={900}>
                 {t('admin.empty_title')}
               </Typography>
               <Typography variant="caption" color="text.secondary">
                 {membersError instanceof Error ? membersError.message : t('admin.empty_hint')}
               </Typography>
             </Box>
             <Button
               variant="outlined"
               size="small"
               startIcon={<RefreshCw sx={{ fontSize: 14 }} />}
               onClick={() => void refetchMembers()}
               sx={{ fontWeight: 800 }}
             >
               {t('admin.recheck')}
             </Button>
           </Stack>
         </CardContent>
       </Card>
     );
   }

   return (
      <Stack spacing={4}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <TextField
               placeholder={t('admin.search_placeholder')}
               value={search}
               onChange={(e) => setSearch(e.target.value)}
               size="small"
               InputProps={{
                  startAdornment: <InputAdornment position="start"><Search sx={{ fontSize: 16 }} /></InputAdornment>,
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
                        label={m.classes?.[0] ? formatClassDisplayName(m.classes[0]) : 'NONE'} 
                        size="small" 
                        variant="outlined" 
                        sx={{ fontWeight: 900, textTransform: 'uppercase', fontSize: '0.6rem', height: 20, ...getClassStyle(m.classes?.[0], theme) }}
                      />
                      <Typography variant="body2" fontFamily="monospace" fontWeight={700} color="primary.main">{formatPower(m.power)}</Typography>
                      <Stack direction="row" alignItems="center" spacing={0.5}>
                        {m.active_status === 'vacation' ? <AlertTriangle sx={{ fontSize: 14, color: theme.custom?.status.vacation.main }} /> : <CheckCircle2 sx={{ fontSize: 14, color: theme.custom?.status.active.main }} />}
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
          <TableContainer
            component={Paper}
            elevation={0}
            sx={{
              border: '1px solid',
              borderColor: tableToken?.border || 'divider',
              borderRadius: 4,
              overflow: 'hidden',
            }}
          >
             <Table>
                <TableHead sx={{ bgcolor: tableToken?.headerBg || 'action.hover' }}>
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
                               label={m.classes?.[0] ? formatClassDisplayName(m.classes[0]) : 'NONE'} 
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
                               {m.active_status === 'vacation' ? <AlertTriangle sx={{ fontSize: 14, color: theme.custom?.status.vacation.main }} /> : <CheckCircle2 sx={{ fontSize: 14, color: theme.custom?.status.active.main }} />}
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
    if (!classId) {
      return {
        borderColor: theme.custom?.components?.chip?.border || theme.palette.divider,
      };
    }
    return {
      borderColor: theme.custom?.components?.chip?.border || alpha(theme.palette.primary.main, 0.3),
      color: theme.custom?.components?.chip?.text || theme.palette.text.secondary,
    };
}

function MemberDetailModal({ member, onClose, onUpdate }: { member: User, onClose: () => void, onUpdate: (u: Partial<User>) => void }) {
   const { user: currentUser } = useAuthStore();
   const { t } = useTranslation();
   const theme = useTheme();
   const cardToken = theme.custom?.components?.card;
   const tableToken = theme.custom?.components?.table;
   const segmentedToken = theme.custom?.components?.segmentedControl;
   const iconButtonToken = theme.custom?.components?.iconButton;
   const dialogToken = theme.custom?.components?.dialog;
   const [tab, setTab] = useState<'overview' | 'profile' | 'progression' | 'media' | 'admin'>('overview');
   const canManageMemberAccount =
     canManageMemberRoles(currentUser?.role) || canManageMemberActivation(currentUser?.role);
   const detailTabs: Array<'overview' | 'profile' | 'progression' | 'media' | 'admin'> = canManageMemberAccount
     ? ['overview', 'profile', 'progression', 'media', 'admin']
     : ['overview', 'profile', 'progression', 'media'];
   const online = typeof navigator !== 'undefined' ? navigator.onLine : true;

   useEffect(() => {
      if (!canManageMemberAccount && tab === 'admin') {
         setTab('overview');
      }
   }, [canManageMemberAccount, tab]);
   
   return (
      <Dialog 
         open 
         onClose={onClose} 
         maxWidth="lg" 
         fullWidth
         PaperProps={{
           sx: {
             bgcolor: dialogToken?.bg || cardToken?.bg || 'background.paper',
             borderRadius: 'var(--cmp-dialog-radius, 16px)',
             border: '1px solid',
             borderColor: dialogToken?.border || cardToken?.border || 'divider',
             boxShadow: dialogToken?.shadow || cardToken?.shadow || 'none',
             overflow: 'hidden',
             height: '85vh',
             display: 'flex',
             flexDirection: 'column',
           }
         }}
      >
         <Box
           sx={{
             p: 3,
             borderBottom: 1,
             borderColor: tableToken?.border || 'divider',
             bgcolor: tableToken?.headerBg || 'background.default',
             display: 'flex',
             alignItems: 'flex-start',
             justifyContent: 'space-between'
           }}
         >
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
             <IconButton
               onClick={onClose}
               sx={{
                 bgcolor: iconButtonToken?.bg || 'action.hover',
                 color: iconButtonToken?.text || 'text.primary',
                 '&:hover': { bgcolor: iconButtonToken?.hoverBg || 'action.selected' },
               }}
             >
               <X sx={{ fontSize: 20 }} />
             </IconButton>
         </Box>

         <Box
           sx={{
             borderBottom: 1,
             borderColor: segmentedToken?.border || 'divider',
             px: 3,
             py: 1,
             bgcolor: segmentedToken?.bg || 'background.paper'
           }}
         >
             <Tabs
               value={tab}
               onChange={(_, v) => setTab(v)}
               variant="scrollable"
               scrollButtons="auto"
               sx={{
                 '& .MuiTab-root': {
                   minHeight: 40,
                   borderRadius: 2,
                   fontWeight: 800,
                   color: segmentedToken?.text || 'text.secondary',
                 },
                 '& .Mui-selected': {
                   bgcolor: segmentedToken?.selectedBg || 'background.paper',
                   color: segmentedToken?.selectedText || 'text.primary',
                 },
                 '& .MuiTabs-indicator': { display: 'none' },
               }}
             >
                {detailTabs.map(key => (
                   <Tab key={key} label={t(`admin.tab_${key}`)} value={key} sx={{ fontWeight: 900, minHeight: 60 }} />
                ))}
             </Tabs>
         </Box>

         <DialogContent sx={{ p: 4, overflowY: 'auto', bgcolor: theme.custom?.semantic?.surface?.sunken || 'background.default' }}>
            {tab === 'overview' && <MemberOverview member={member} onUpdate={onUpdate} />}
            {tab === 'profile' && <MemberProfileEditor member={member} onUpdate={onUpdate} canEdit={true} />}
            {tab === 'progression' && <MemberProgressionEditor member={member} onUpdate={onUpdate} />}
            {tab === 'media' && <MemberMediaManager member={member} onUpdate={onUpdate} />}
            {tab === 'admin' && canManageMemberAccount && (
              <MemberAdminActions member={member} onUpdate={onUpdate} currentUser={currentUser!} />
            )}
         </DialogContent>
      </Dialog>
   );
}

function MemberOverview({ member, onUpdate }: { member: User, onUpdate: (u: Partial<User>) => void }) {
   const { t } = useTranslation();
   const theme = useTheme();
   const tableToken = theme.custom?.components?.table;
   const iconButtonToken = theme.custom?.components?.iconButton;
   const segmentedToken = theme.custom?.components?.segmentedControl;
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
                                 sx={{
                                   position: 'absolute',
                                   bottom: -8,
                                   right: -8,
                                   bgcolor: iconButtonToken?.bg || 'primary.main',
                                   color: iconButtonToken?.text || 'primary.contrastText',
                                   '&:hover': { bgcolor: iconButtonToken?.hoverBg || 'primary.dark' }
                                 }}
                              >
                                 <Upload sx={{ fontSize: 14 }} />



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
                                icon={<AlertTriangle sx={{ fontSize: 14 }} />}
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
                                icon={<CheckCircle2 sx={{ fontSize: 14 }} />}
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
                                  <Box
                                    sx={{
                                      display: 'flex',
                                      flexWrap: 'wrap',
                                      gap: 1,
                                      p: 1.25,
                                      borderRadius: 2,
                                      border: '1px solid',
                                      borderColor: segmentedToken?.border || tableToken?.border || 'divider',
                                      bgcolor: segmentedToken?.bg || tableToken?.headerBg || 'action.hover',
                                    }}
                                  >
                                     {getClassGroups(theme).map((group: any) => group.options.map((opt: any) => {
                                        const isSelected = field.value?.includes(opt.id as ClassType);
                                        const selectedBg = group.mainColor || theme.palette.primary.main;
                                        const selectedText = theme.palette.getContrastText(selectedBg);

                                        return (
                                          <Chip
                                            key={opt.id}
                                            label={opt.label}
                                            onClick={() => {
                                              const current = field.value || [];
                                              const classId = opt.id as ClassType;
                                              if (current.includes(classId)) field.onChange(current.filter((c: ClassType) => c !== classId));
                                              else field.onChange([...current, classId]);
                                            }}
                                            variant={isSelected ? 'filled' : 'outlined'}
                                            size="small"
                                            sx={{
                                              fontWeight: 800,
                                              fontSize: '0.68rem',
                                              borderWidth: 1.5,
                                              borderColor: isSelected ? selectedBg : group.borderColor,
                                              bgcolor: isSelected ? selectedBg : 'transparent',
                                              color: isSelected ? selectedText : 'text.secondary',
                                              transition: 'all 160ms ease',
                                              cursor: 'pointer',
                                              '&:hover': {
                                                borderColor: selectedBg,
                                                bgcolor: isSelected ? selectedBg : group.bgColor,
                                                color: isSelected ? selectedText : (group.color || 'text.primary'),
                                              },
                                              '&.Mui-focusVisible': {
                                                outline: `2px solid ${alpha(selectedBg, 0.5)}`,
                                                outlineOffset: '1px',
                                              },
                                            }}
                                          />
                                        );
                                      }))}
                                   </Box>
                               )}
                            />
                        </Box>

                        {isDirty && (
                           <Button type="submit" variant="contained" fullWidth startIcon={<Save sx={{ fontSize: 16 }} />} sx={{ fontWeight: 900 }} disabled={!online}>{t('admin.save_roster')}</Button>
                        )}
                     </Stack>
                  </form>
               </CardContent>
            </Card>

            <Box sx={{ mt: 3, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
                {[
                    { icon: Zap, count: Object.keys(member.progression?.qishu || {}).length, label: t('progression.categories.qishu'), color: theme.palette.info.main },
                    { icon: Swords, count: Object.keys(member.progression?.wuxue || {}).length, label: t('progression.categories.wuxue'), color: theme.palette.error.main },
                    { icon: Heart, count: Object.keys(member.progression?.xinfa || {}).length, label: t('progression.categories.xinfa'), color: theme.palette.success.main }
                ].map((stat, i) => (
                    <Card key={i} sx={{ p: 2, textAlign: 'center', borderRadius: 3 }}>
                        <stat.icon sx={{ fontSize: 20, color: stat.color, margin: '0 auto', marginBottom: 1 }} />
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
                                <Box key={day.day} sx={{ display: 'flex', justifyContent: 'space-between', p: 1.5, bgcolor: tableToken?.rowBg || 'action.hover', borderRadius: 2 }}>
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
   const { t, i18n } = useTranslation();
   const theme = useTheme();
   const segmentedToken = theme.custom?.components?.segmentedControl;
   const cardToken = theme.custom?.components?.card;
   const buttonToken = theme.custom?.components?.button;
   const [category, setCategory] = useState<'qishu' | 'wuxue' | 'xinfa'>('qishu');
   const [progression, setProgression] = useState<ProgressionData>(member.progression || { qishu: {}, wuxue: {}, xinfa: {} });
   const [isDirty, setIsDirty] = useState(false);
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
             <Box
               sx={{
                 bgcolor: segmentedToken?.bg || 'action.hover',
                 p: 0.5,
                 borderRadius: 2,
                 border: '1px solid',
                 borderColor: segmentedToken?.border || 'divider',
               }}
             >
                 {categories.map(c => (
                     <Button 
                        key={c.id} 
                        size="small" 
                        variant="text"
                        onClick={() => setCategory(c.id as any)}
                        sx={{
                          fontWeight: 900,
                          minWidth: 100,
                          color: category === c.id ? (segmentedToken?.selectedText || 'text.primary') : (segmentedToken?.text || 'text.secondary'),
                          bgcolor: category === c.id ? (segmentedToken?.selectedBg || 'background.paper') : 'transparent',
                          borderRadius: 1.5,
                          '&:hover': {
                            bgcolor: category === c.id
                              ? (segmentedToken?.selectedBg || 'background.paper')
                              : alpha(theme.palette.primary.main, 0.08),
                          },
                        }}
                     >
                        {c.label}
                     </Button>
                 ))}
             </Box>
             {isDirty && (
               <Button variant="contained" startIcon={<Save sx={{ fontSize: 16 }} />} onClick={() => { onUpdate({ progression }); setIsDirty(false); }} disabled={!online}>
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
                      <Card
                        key={item.key}
                        variant="outlined"
                        sx={{
                          p: 1.5,
                          borderRadius: 3,
                          borderColor: cardToken?.border || 'divider',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: 1
                        }}
                      >
                        <Box sx={{ position: 'relative' }}>
                           <Avatar variant="rounded" src={item.icon} alt={item.key} sx={{ width: 48, height: 48, bgcolor: theme.custom?.semantic?.surface?.elevated || 'background.default' }}>
                            <Zap sx={{ fontSize: 18 }} />
                           </Avatar>
                           <Box
                             sx={{
                               position: 'absolute',
                               bottom: -6,
                               right: -6,
                               width: 22,
                               height: 22,
                               borderRadius: '50%',
                               bgcolor: buttonToken?.bg || 'primary.main',
                               color: buttonToken?.text || 'primary.contrastText',
                               display: 'flex',
                               alignItems: 'center',
                               justifyContent: 'center',
                               fontSize: '0.7rem',
                               fontWeight: 900
                             }}
                           >
                              {level}
                           </Box>
                        </Box>
                        <Typography variant="caption" fontWeight={900} textAlign="center" lineHeight={1.2}>{t(item.nameKey)}</Typography>
                        <Stack direction="row" spacing={1} mt={0.5}>
                           <IconButton
                             size="small"
                             onClick={() => updateLevel(category, item.key, -1)}
                             sx={{
                               border: '1px solid',
                               borderColor: buttonToken?.border || 'divider',
                               '&:hover': { bgcolor: buttonToken?.hoverBg || 'action.hover' },
                             }}
                           >
                             <Minus sx={{ fontSize: 12 }} />
                           </IconButton>
                           <IconButton
                             size="small"
                             onClick={() => updateLevel(category, item.key, 1)}
                             sx={{
                               border: '1px solid',
                               borderColor: buttonToken?.border || 'divider',
                               '&:hover': { bgcolor: buttonToken?.hoverBg || 'action.hover' },
                             }}
                           >
                             <Plus sx={{ fontSize: 12 }} />
                           </IconButton>
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
               <Button type="submit" variant="contained" startIcon={<Save sx={{ fontSize: 16 }} />} disabled={!online}>{t('admin.save_changes')}</Button>
            </Box>
         )}
      </form>
   )
}

function MemberMediaManager({ member, onUpdate }: { member: User, onUpdate: (u: Partial<User>) => void }) {
   const { t } = useTranslation();
   const theme = useTheme();
   const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
   const cardToken = theme.custom?.components?.card;
   const tableToken = theme.custom?.components?.table;
   const inputToken = theme.custom?.components?.input;
   const iconButtonToken = theme.custom?.components?.iconButton;
   const [media, setMedia] = useState(member.media || []);
   const [audioUrl, setAudioUrl] = useState((member.media || []).find((m) => m.type === 'audio')?.url || member.audio_url || '');
   const [uploadingAudio, setUploadingAudio] = useState(false);
   const mediaInputRef = React.useRef<HTMLInputElement | null>(null);
   const audioInputRef = React.useRef<HTMLInputElement | null>(null);

   useEffect(() => {
      setMedia(member.media || []);
      setAudioUrl((member.media || []).find((m) => m.type === 'audio')?.url || member.audio_url || '');
   }, [member]);

   const handleUpload = (files: File[]) => {
      const next = [...media];
      files.forEach(file => {
         const url = URL.createObjectURL(file);
         const type = (file.type.startsWith('video') ? 'video' : 'image') as any;
         next.push({ id: `temp-${Date.now()}`, hash: '', url, type });
      });
      setMedia(next);
      onUpdate({ media: next as any });
   };

   const handleDelete = (index: number) => {
      const next = media.filter((_, i) => i !== index);
      setMedia(next);
      onUpdate({ media: next as any });
   };

   const visualMedia = useMemo(
      () => media.filter((item: any) => item?.type === 'image' || item?.type === 'video'),
      [media],
   );

   const handleVisualDelete = (item: any) => {
      const idx = media.findIndex((m: any) => {
         if (m?.id && item?.id) return m.id === item.id;
         return m?.url === item?.url && m?.type === item?.type;
      });
      if (idx >= 0) handleDelete(idx);
   };

   const handleAudioUpload = async (file: File) => {
      setUploadingAudio(true);
      try {
         let uploadFile = file;
         try {
            const { convertToOpus } = await import('../../lib/media-conversion');
            uploadFile = await convertToOpus(file);
         } catch {
            uploadFile = file;
         }

         await mediaAPI.uploadMemberAudio(member.id, uploadFile);
         const refreshed = await membersAPI.get(member.id);
         const nextMedia = refreshed.media || [];
         const nextAudio = nextMedia.find((item) => item.type === 'audio')?.url || refreshed.audio_url || '';
         setMedia(nextMedia);
         setAudioUrl(nextAudio);
         onUpdate({
            media: nextMedia,
            media_counts: refreshed.media_counts,
            audio_url: nextAudio,
         });
      } finally {
         setUploadingAudio(false);
      }
   };

   return (
      <Stack spacing={4}>
         <input
            ref={mediaInputRef}
            type="file"
            accept="image/*,video/*"
            hidden
            multiple
            onChange={(e) => {
               const files = e.target.files ? Array.from(e.target.files) : [];
               if (files.length > 0) {
                  handleUpload(files);
                  e.currentTarget.value = '';
               }
            }}
         />
         <Box>
            <Typography variant="subtitle2" gutterBottom fontWeight="bold">
               {t('admin.tab_media')}
            </Typography>
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                bgcolor: cardToken?.bg || 'background.paper',
                borderColor: tableToken?.border || cardToken?.border || 'divider',
              }}
            >
               <ImageList sx={{ m: 0 }} cols={isMobile ? 2 : 4} gap={10}>
                  {visualMedia.map((item: any, index: number) => (
                     <ImageListItem key={item.id || `${item.url}-${index}`} sx={{ position: 'relative', borderRadius: 2, overflow: 'hidden' }}>
                        {item.type === 'video' ? (
                           <video
                              src={getOptimizedMediaUrl(item.url, 'video')}
                              controls
                              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                           />
                        ) : (
                           <img
                              src={getOptimizedMediaUrl(item.url, 'image')}
                              alt={`${t('admin.tab_media')} ${index + 1}`}
                              loading="lazy"
                              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                           />
                        )}
                        <Box
                           sx={{
                              position: 'absolute',
                              top: 6,
                              right: 6,
                              bgcolor: iconButtonToken?.overlayBg || 'var(--sys-surface-overlay)',
                              borderRadius: 1.5,
                           }}
                        >
                           <Tooltip title={t('common.delete')}>
                              <IconButton
                                size="small"
                                onClick={() => handleVisualDelete(item)}
                                sx={{
                                  color: iconButtonToken?.text || 'common.white',
                                  '&:hover': { bgcolor: iconButtonToken?.overlayHoverBg || 'var(--sys-surface-overlay-hover)' },
                                }}
                              >
                                 <Trash2 fontSize="small" />
                              </IconButton>
                           </Tooltip>
                        </Box>
                     </ImageListItem>
                  ))}
                  <ImageListItem
                     onClick={() => mediaInputRef.current?.click()}
                     sx={{
                        cursor: 'pointer',
                        borderRadius: 2,
                        border: '2px dashed',
                        borderColor: inputToken?.border || tableToken?.border || 'divider',
                        minHeight: 128,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: tableToken?.rowBg || 'action.hover',
                        transition: 'all 0.18s ease',
                        '&:hover': {
                           borderColor: inputToken?.focusBorder || 'primary.main',
                           bgcolor: tableToken?.rowHoverBg || 'action.selected',
                        },
                     }}
                  >
                     <Stack spacing={0.5} alignItems="center" textAlign="center" sx={{ px: 1 }}>
                        <Plus sx={{ fontSize: 24, color: 'text.secondary' }} />
                        <Typography variant="caption" fontWeight={800}>
                           {t('profile.add_media')}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                           {t('media.upload_formats')}
                        </Typography>
                     </Stack>
                  </ImageListItem>
               </ImageList>
            </Paper>
         </Box>
         <input
            ref={audioInputRef}
            type="file"
            accept="audio/*"
            hidden
            onChange={(e) => {
               const file = e.target.files?.[0];
               if (file) {
                  void handleAudioUpload(file);
               }
            }}
         />
         <Stack spacing={1.5}>
            <Typography variant="subtitle2" fontWeight="bold">
               {t('profile.audio_identity')}
            </Typography>
            <Button
               variant="outlined"
               startIcon={<Upload sx={{ fontSize: 16 }} />}
               onClick={() => audioInputRef.current?.click()}
               disabled={uploadingAudio}
               sx={{ alignSelf: 'flex-start', fontWeight: 800 }}
            >
               {uploadingAudio ? t('common.loading') : t('media.choose_file')}
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
      </Stack>
   )
}

function MemberAdminActions({ member, onUpdate, currentUser }: { member: User, onUpdate: (u: Partial<User>) => void, currentUser: User }) {
   const { t } = useTranslation();
   const theme = useTheme();
   const segmentedToken = theme.custom?.components?.segmentedControl;
   const dialogToken = theme.custom?.components?.dialog;
   const [password, setPassword] = useState('');
   const canManageRole = canManageMemberRoles(currentUser.role) && currentUser.id !== member.id;
   const canDeactivate = canManageMemberActivation(currentUser.role) && currentUser.id !== member.id;
   const [pendingRole, setPendingRole] = useState<Role | null>(null);
   const online = typeof navigator !== 'undefined' ? navigator.onLine : true;
   const isActive = member.active_status === 'active';
   const actionStatusToken = isActive ? theme.custom?.status?.inactive : theme.custom?.status?.active;
   const actionColor = actionStatusToken?.main || (isActive ? theme.palette.error.main : theme.palette.success.main);
   const actionHoverColor = alpha(actionColor, 0.88);
   const actionText = actionStatusToken?.text || theme.palette.getContrastText(actionColor);

   return (
      <Stack spacing={4}>
         <Card variant="outlined">
            <CardHeader title={<Typography variant="subtitle2" fontWeight={900}>{t('admin.authority_level')}</Typography>} />
            <CardContent>
               <Stack
                 direction="row"
                 spacing={1}
                 sx={{
                   p: 0.5,
                   borderRadius: 2,
                   border: '1px solid',
                   borderColor: segmentedToken?.border || 'divider',
                   bgcolor: segmentedToken?.bg || 'action.hover',
                   width: 'fit-content',
                 }}
               >
                  {(['admin', 'moderator', 'member'] as Role[]).map(r => (
                     <Button 
                        key={r} 
                        variant="text"
                        disabled={!canManageRole || !online} 
                        onClick={() => setPendingRole(r)}
                        sx={{
                          textTransform: 'uppercase',
                          fontWeight: 900,
                          color: member.role === r ? (segmentedToken?.selectedText || 'text.primary') : (segmentedToken?.text || 'text.secondary'),
                          bgcolor: member.role === r ? (segmentedToken?.selectedBg || 'background.paper') : 'transparent',
                          borderRadius: 1.5,
                          '&:hover': {
                            bgcolor: member.role === r ? (segmentedToken?.selectedBg || 'background.paper') : alpha(theme.palette.primary.main, 0.08),
                          }
                        }}
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
                  <CardHeader title={<Stack direction="row" gap={1}><KeyRound sx={{ fontSize: 16 }} /> <Typography variant="subtitle2" fontWeight={900}>{t('admin.reset_credentials')}</Typography></Stack>} />
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
                  <CardHeader title={<Stack direction="row" gap={1}><Ban sx={{ fontSize: 16 }} /> <Typography variant="subtitle2" fontWeight={900}>{t('admin.account_status')}</Typography></Stack>} />
                  <CardContent>
                     <Button 
                        fullWidth 
                        variant="contained"
                        disabled={!canDeactivate || !online}
                        onClick={() => onUpdate({ active_status: member.active_status === 'active' ? 'inactive' : 'active' })}
                        sx={{
                          bgcolor: actionColor,
                          color: actionText,
                          '&:hover': { bgcolor: actionHoverColor },
                        }}
                     >
                        {member.active_status === 'active' ? t('admin.deactivate') : t('admin.reactivate')}
                     </Button>
                  </CardContent>
               </Card>
            </Grid>
         </Grid>

         <Dialog
           open={!!pendingRole}
           onClose={() => setPendingRole(null)}
           PaperProps={{
             sx: {
               bgcolor: dialogToken?.bg || 'background.paper',
               border: '1px solid',
               borderColor: dialogToken?.border || 'divider',
               boxShadow: dialogToken?.shadow || 'none',
               borderRadius: 'var(--cmp-dialog-radius, 16px)',
             }
           }}
         >
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

