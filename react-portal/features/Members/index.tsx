
import React, { useState, useMemo, useRef, useCallback } from 'react';
import {
  Card,
  CardContent,
  Button,
  Chip,
  Typography,
  Box,
  Stack,
  IconButton,
  Dialog,
  TextField,
  Slider,
  Grid,
  InputAdornment,
  ToggleButton,
  ToggleButtonGroup,
  useTheme,
  useMediaQuery,
  alpha,
  Paper,
  Badge
} from '@mui/material';
import { 
  Search, 
  Volume2, 
  VolumeX, 
  Image as ImageIcon, 
  X, 
  Zap, 
  ChevronLeft, 
  ChevronRight, 
  Play,
  ChevronDown,
  ChevronUp,
  Users,
  Filter
} from 'lucide-react';
import { useGuildStore, useUIStore, useAuthStore } from '../../store';
import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';
import { User } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';
import { cn, getClassColor, formatPower, sanitizeHtml, getOptimizedMediaUrl } from '../../lib/utils';
import { formatDistanceToNow, isWithinInterval, parse } from 'date-fns';
import { Skeleton } from '@mui/material';
import { RosterFilterPanel } from './components/RosterFilterPanel';
import type { RosterFilterState } from '../../hooks/useFilterPresets';

// Helper to determine active status based on availability
// Helper to determine active status based on availability
function getAvailabilityStatus(member: User): 'active' | 'inactive' | 'unknown' {
  // 1. Check vacation status
  if (member.vacation_start && member.vacation_end) {
    const now = new Date();
    try {
      const start = new Date(member.vacation_start);
      const end = new Date(member.vacation_end);
      if (isWithinInterval(now, { start, end })) {
        return 'inactive'; // Or 'vacation' if we supported that status explicitly
      }
    } catch (e) {
      console.warn('Invalid vacation dates for member', member.id);
    }
  }

  // 2. Check scheduled availability if present
  if (member.availability && member.availability.length > 0) {
    const now = new Date();
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' }); // e.g., 'Monday'
    const currentTime = now.getHours() * 60 + now.getMinutes(); // Minutes from midnight

    const todaySchedule = member.availability.find(d => d.day === currentDay);
    if (todaySchedule?.blocks) {
      const isAvailable = todaySchedule.blocks.some(block => {
        try {
          const [startH, startM] = block.start.split(':').map(Number);
          const [endH, endM] = block.end.split(':').map(Number);
          const startTotal = startH * 60 + startM;
          const endTotal = endH * 60 + endM;
          
          // Handle overflow (e.g. 23:00 to 02:00) - complex, assuming same day for simple MVP
          // For cross-midnight, simple check:
          if (endTotal < startTotal) {
             return currentTime >= startTotal || currentTime <= endTotal;
          }
          return currentTime >= startTotal && currentTime <= endTotal;
        } catch { return false; }
      });
      return isAvailable ? 'active' : 'inactive';
    }
    // If availability is defined but not for today, they are likely inactive right now
    return 'inactive';
  }

  // 3. Fallback to global active status if no specific availability data
  return member.active_status === 'active' ? 'unknown' : 'inactive';
}

function useGlobalAudio() {
  const { audioSettings } = useUIStore();
  const playerRef = useRef<HTMLAudioElement | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const hoverTimeoutRef = useRef<number | null>(null);

  const stop = useCallback(() => {
    if (hoverTimeoutRef.current) window.clearTimeout(hoverTimeoutRef.current);
    if (playerRef.current) {
      playerRef.current.pause();
      playerRef.current.currentTime = 0;
    }
    setActiveId(null);
  }, []);

  const play = useCallback((url: string, id: string) => {
    if (audioSettings.mute || !url) return;
    
    stop(); // Ensure previous is stopped

    if (!playerRef.current) {
      playerRef.current = new Audio();
    }

    if (playerRef.current.src !== url) {
      playerRef.current.src = url;
    }

    playerRef.current.volume = audioSettings.volume / 100;
    playerRef.current.play().catch(e => console.debug('Autoplay blocked:', e));
    setActiveId(id);
  }, [audioSettings, stop]);

  const playOnHover = useCallback((url: string, id: string) => {
    if (!url) return;
    // Debounce hover play
    hoverTimeoutRef.current = window.setTimeout(() => {
       play(url, id);
    }, 100); 
  }, [play]);

  return { play, stop, activeId, playOnHover };
}

export function Roster() {
  const { members, isLoading } = useGuildStore();
  const { audioSettings, setAudioSettings, setPageTitle } = useUIStore();
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const audioController = useGlobalAudio();

  useEffect(() => {
    setPageTitle(t('nav.roster'));
  }, [setPageTitle, t]);

  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<'power' | 'name' | 'class'>('power');
  const [selectedMember, setSelectedMember] = useState<User | null>(null);
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  
  // Advanced filter state
  const [filters, setFilters] = useState<RosterFilterState>({
    roles: [],
    classes: [],
    powerRange: [0, 999999999],
    status: 'all',
    hasMedia: false,
  });

  // Extract available roles and classes from members
  const { availableRoles, availableClasses } = useMemo(() => {
    if (!members) return { availableRoles: [], availableClasses: [] };
    
    const roles = Array.from(new Set(members.map(m => m.role)));
    const classes = Array.from(new Set(members.flatMap(m => m.classes || [])));
    
    return {
      availableRoles: roles,
      availableClasses: classes,
    };
  }, [members]);

  const filteredMembers = useMemo(() => {
    if (!members) return [];
    const list = [...members].filter(m => 
      m.username.toLowerCase().includes(search.toLowerCase()) ||
      m.wechat_name?.toLowerCase().includes(search.toLowerCase())
    );

    if (sort === 'power') list.sort((a, b) => (b.power || 0) - (a.power || 0));
    if (sort === 'name') list.sort((a, b) => a.username.localeCompare(b.username));
    if (sort === 'class') list.sort((a, b) => (a.classes?.[0] || '').localeCompare(b.classes?.[0] || ''));

    return list;
  }, [members, search, sort]);

  const renderSkeletons = () => (
    <Grid container spacing={2} sx={{ mt: 2 }}>
      {[1,2,3,4].map(i => (
        <Grid key={i} item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Skeleton variant="text" width="40%" />
              <Skeleton variant="text" width="60%" />
              <Skeleton variant="rectangular" height={80} sx={{ mt: 2, borderRadius: 2 }} />
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  if (isLoading && (!members || members.length === 0)) {
    return (
      <Box sx={{ p: { xs: 1.5, sm: 2, md: 3 } }}>
        {renderSkeletons()}
      </Box>
    );
  }

  if (!isLoading && (!members || members.length === 0)) {
    return (
      <Box sx={{ p: { xs: 2, sm: 3 }, textAlign: 'center' }}>
        <Typography variant="h6" fontWeight={900} gutterBottom>
          {t('roster.empty_title', { defaultValue: 'No members yet' })}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t('roster.empty_hint', { defaultValue: 'Invite members or import roster data to get started.' })}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{
      p: { xs: 0, sm: 1, md: 2, lg: 4 },
      height: { xs: 'auto', md: 'calc(100vh - 80px)' },
      pb: { xs: 2, md: 0 }
    }}>
      <Paper sx={{
        height: { xs: 'auto', md: '100%' },
        display: 'flex',
        flexDirection: 'column',
        borderRadius: { xs: 0, sm: 2, md: 4 },
        overflow: 'hidden',
        border: { xs: 0, sm: 1 },
        borderColor: 'divider'
      }}>

        {/* Header Toolbar */}
        <Box sx={{
            p: { xs: 2, sm: 2.5, md: 3 },
            borderBottom: 1,
            borderColor: 'divider',
            bgcolor: 'background.paper',
            display: 'flex',
            flexDirection: { xs: 'column', lg: 'row' },
            gap: { xs: 1.5, sm: 2 },
            alignItems: { xs: 'stretch', lg: 'center' },
            justifyContent: 'space-between'
        }}>
            {/* Search & Sort Group */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 1.5, sm: 2 }} alignItems="stretch" sx={{ flex: { xs: 1, lg: 'unset' } }}>
                <TextField
                    placeholder={t('roster.search_placeholder')}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    size="small"
                    fullWidth={isSmallMobile}
                    InputProps={{
                        startAdornment: <InputAdornment position="start"><Search size={isSmallMobile ? 14 : 16} /></InputAdornment>,
                        sx: {
                          borderRadius: 2,
                          fontSize: { xs: '0.75rem', sm: '0.8rem' },
                          fontWeight: 600,
                          width: { xs: '100%', sm: 260 }
                        }
                    }}
                    sx={{ width: { xs: '100%', sm: 'auto' } }}
                />

                <ToggleButtonGroup
                    value={sort}
                    exclusive
                    onChange={(_, v) => v && setSort(v)}
                    size="small"
                    fullWidth={isSmallMobile}
                    sx={{
                      width: { xs: '100%', sm: 'auto' },
                      '& .MuiToggleButton-root': {
                         px: { xs: 1.5, sm: 2 },
                         py: { xs: 0.6, sm: 0.8 },
                         border: 0,
                         borderRadius: 2,
                         fontSize: { xs: '0.65rem', sm: '0.7rem' },
                         fontWeight: 800,
                         color: 'text.secondary',
                         flex: isSmallMobile ? 1 : 'unset',
                         '&.Mui-selected': {
                            bgcolor: 'action.selected',
                            color: 'primary.main'
                         },
                         '&:first-of-type': { borderRadius: 2 },
                         '&:last-of-type': { borderRadius: 2 },
                         mx: { xs: 0.25, sm: 0.5 }
                      }
                    }}
                >
                    {(['power', 'name', 'class'] as const).map(s => (
                        <ToggleButton key={s} value={s}>
                            {isSmallMobile ? t(`roster.sort_${s}`).substring(0, 4) : t(`roster.sort_${s}`)}
                        </ToggleButton>
                    ))}
                </ToggleButtonGroup>
                
                {/* Filter Button */}
                <Button
                  variant={(
                    filters.roles.length > 0 ||
                    filters.classes.length > 0 ||
                    filters.status !== 'all' ||
                    filters.hasMedia ||
                    filters.powerRange[0] > 0 ||
                    filters.powerRange[1] < 999999999
                  ) ? 'contained' : 'outlined'}
                  startIcon={<Filter size={16} />}
                  onClick={() => setFilterPanelOpen(true)}
                  size="small"
                  sx={{ 
                    borderRadius: 2,
                    fontWeight: 700,
                    fontSize: { xs: '0.7rem', sm: '0.75rem' },
                    px: { xs: 1.5, sm: 2 },
                    py: { xs: 0.75, sm: 0.8 },
                  }}
                >
                  {isMobile ? '' : 'Filters'}
                  {(
                    filters.roles.length +
                    filters.classes.length +
                    (filters.status !== 'all' ? 1 : 0) +
                    (filters.hasMedia ? 1 : 0) +
                    (filters.powerRange[0] > 0 || filters.powerRange[1] < 999999999 ? 1 : 0)
                  ) > 0 && (
                    <Chip
                      label={
                        filters.roles.length +
                        filters.classes.length +
                        (filters.status !== 'all' ? 1 : 0) +
                        (filters.hasMedia ? 1 : 0) +
                        (filters.powerRange[0] > 0 || filters.powerRange[1] < 999999999 ? 1 : 0)
                      }
                      size="small"
                      sx={{
                        ml: 0.5,
                        height: 18,
                        fontSize: '0.65rem',
                        fontWeight: 900,
                        '& .MuiChip-label': { px: 0.75 }
                      }}
                    />
                  )}
                </Button>
            </Stack>

            {/* Audio Controls */}
            <Paper elevation={0} sx={{
               display: { xs: 'flex', sm: 'flex' },
               alignItems: 'center',
               gap: { xs: 1.5, sm: 2 },
               px: { xs: 1.5, sm: 2 },
               py: { xs: 0.75, sm: 1 },
               borderRadius: { xs: 2, sm: 3 },
               border: 1,
               borderColor: 'divider',
               bgcolor: 'background.default'
            }}>
                <IconButton
                    size="small"
                    onClick={() => setAudioSettings({ mute: !audioSettings.mute })}
                    color={audioSettings.mute ? "error" : "primary"}
                    sx={{ p: { xs: 0.75, sm: 1 } }}
                >
                    {audioSettings.mute ? <VolumeX size={isSmallMobile ? 16 : 18} /> : <Volume2 size={isSmallMobile ? 16 : 18} />}
                </IconButton>
                <Slider
                    size="small"
                    value={audioSettings.volume}
                    onChange={(_, v) => setAudioSettings({ volume: v as number })}
                    sx={{ width: { xs: 60, sm: 80 } }}
                />
            </Paper>
        </Box>

        {/* Scrollable Content Area */}
        <Box sx={{
          flex: 1,
          overflow: 'auto',
          p: { xs: 1.5, sm: 2, md: 3 },
          bgcolor: 'background.default',
          WebkitOverflowScrolling: 'touch'
        }}>
           <Grid container spacing={{ xs: 1.5, sm: 2 }}>
             {filteredMembers.map(member => (
               <Grid size={{ xs: 6, sm: 4, md: 3, lg: 2.4, xl: 2 }} key={member.id}>
                  <RosterCard 
                     member={member} 
                     onClick={() => setSelectedMember(member)}
                     audio={audioController}
                  />
               </Grid>
             ))}
           </Grid>
           {filteredMembers.length === 0 && (
              <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.5, gap: 2 }}>
                 <Users size={48} strokeWidth={1} />
                 <Typography variant="h6" fontWeight={700}>No members found</Typography>
              </Box>
           )}
        </Box>
      </Paper>

      <AnimatePresence>
        {selectedMember && (
          <ProfileModal 
            member={selectedMember} 
            onClose={() => {
              setSelectedMember(null);
              audioController.stop();
            }} 
            audio={audioController}
          />
        )}
      </AnimatePresence>
    </Box>
  );
}

function RosterCard({ member, onClick, audio }: { member: User, onClick: () => void, audio: ReturnType<typeof useGlobalAudio> }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const isPlaying = audio.activeId === member.id;
  
  return (
    <Card 
      onClick={onClick}
      onMouseEnter={() => {
         if (member.audio_url) audio.playOnHover(getOptimizedMediaUrl(member.audio_url, 'audio'), member.id);
      }}
      onMouseLeave={() => audio.stop()}
      sx={{
          borderRadius: 2,
          position: 'relative',
          cursor: 'pointer',
          transition: 'box-shadow 0.2s, border-color 0.2s',
          border: '1px solid',
          borderColor: (() => {
              const c = member.classes?.[0] || '';
              if (c.includes('qiansilin')) return alpha(theme.palette.success.main, 0.2);
              if (c.includes('lieshiwei')) return alpha(theme.palette.warning.main, 0.2);
              if (c.includes('tianwei')) return alpha(theme.palette.warning.dark, 0.2);
              return alpha(theme.palette.info.main, 0.2);
          })(),
          overflow: 'hidden',
          bgcolor: (() => {
              const c = member.classes?.[0] || '';
              if (c.includes('qiansilin')) return alpha(theme.palette.success.main, 0.05);
              if (c.includes('lieshiwei')) return alpha(theme.palette.warning.main, 0.05);
              if (c.includes('tianwei')) return alpha(theme.palette.warning.dark, 0.05);
              return alpha(theme.palette.info.main, 0.05);
          })(),
          '&:hover': {
              boxShadow: theme.shadows[4],
              borderColor: 'primary.main',
          }
      }}
    >
      {/* Active Audio Glow Background */}
      {isPlaying && (
          <Box sx={{ position: 'absolute', inset: 0, bgcolor: alpha(theme.palette.primary.main, 0.1), animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite', zIndex: 0 }} />
      )}

      <CardContent sx={{ p: 1 }}>
          {/* Image Section - Smaller */}
          <Box sx={{ position: 'relative', aspectRatio: '1/1', borderRadius: 1.5, overflow: 'hidden', mb: 1, bgcolor: 'action.hover' }}>
             <Box 
                component="img"
                src={getOptimizedMediaUrl(member.avatar_url || `https://ui-avatars.com/api/?name=${member.username}&background=random`, 'image')} 
                alt={member.username}                 sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
          </Box>

          {/* Badges Row - Very compact */}
          <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 1, position: 'relative', zIndex: 1 }}>
                     <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, px: 0.75, py: 0.25, borderRadius: 5, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
                        <ImageIcon size={10} className="text-blue-500" />
                        <Typography variant="caption" fontWeight={700} fontSize="0.7rem" lineHeight={1} color="primary.main">{member.media_counts?.images || 0}</Typography>
                     </Box>
                     <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, px: 0.75, py: 0.25, borderRadius: 5, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
                        <Play size={10} className="text-red-500" />
                        <Typography variant="caption" fontWeight={700} fontSize="0.7rem" lineHeight={1} color="error.main">{member.media_counts?.videos || 0}</Typography>
                     </Box>

                     <Box sx={{ flexGrow: 1 }} />

                     {/* Active Status / Last Seen */}
                     {(() => {
                        // Use last_seen if available
                        if (member.last_seen) {
                             const date = new Date(member.last_seen);
                             const timeAgo = formatDistanceToNow(date, { addSuffix: true });
                             const isOnline = new Date().getTime() - date.getTime() < 5 * 60 * 1000; // 5 mins

                             return (
                                <Box sx={{
                                   px: 1, py: 0.25, borderRadius: 4,
                                   bgcolor: isOnline ? alpha(theme.palette.success.main, 0.1) : alpha(theme.palette.text.secondary, 0.1),
                                   color: isOnline ? theme.palette.success.main : theme.palette.text.secondary,
                                   border: 1, borderColor: isOnline ? alpha(theme.palette.success.main, 0.2) : alpha(theme.palette.text.secondary, 0.2),
                                   fontSize: '0.6rem', fontWeight: 900, letterSpacing: '0.05em'
                                }}>
                                   {isOnline ? 'ONLINE' : timeAgo.toUpperCase()}
                                </Box>
                             );
                        }

                        // Fallback logic
                        const status = getAvailabilityStatus(member);
                        let label = 'UNKNOWN';
                        let bgcolor = theme.custom?.status.unknown.bg;
                        let textColor = theme.custom?.status.unknown.text;
                        let borderColor = theme.custom?.status.unknown.main;

                        if (status === 'active') {
                           label = 'ACTIVE';
                           bgcolor = theme.custom?.status.active.bg;
                           textColor = theme.custom?.status.active.text;
                           borderColor = theme.custom?.status.active.main;
                        } else if (status === 'inactive') {
                           label = 'INACTIVE';
                           bgcolor = theme.custom?.status.inactive.bg;
                           textColor = theme.custom?.status.inactive.text;
                           borderColor = theme.custom?.status.inactive.main;
                        }

                        return (
                           <Box sx={{
                               px: 1, py: 0.25, borderRadius: 4,
                               bgcolor, color: textColor,
                               border: 1, borderColor: alpha(borderColor as string, 0.2),
                               fontSize: '0.6rem', fontWeight: 900, letterSpacing: '0.05em'
                           }}>
                               {label.toUpperCase()}
                           </Box>
                        );
                     })()}
                  </Stack>

                  {/* Text Info */}
                  <Box sx={{ position: 'relative', zIndex: 1 }}>
                     <Stack direction="row" alignItems="center" justifyContent="space-between" mb={0.5} spacing={0.5}>
                        <Typography variant="subtitle2" fontWeight={900} noWrap fontSize="0.9rem">{member.username}</Typography>
                     </Stack>

             <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" noWrap fontSize="0.75rem" sx={{ mb: 0.25 }} dangerouslySetInnerHTML={sanitizeHtml(member.title_html || t('roster.operative_title'))} />

             {/* Bio hidden in mini version to save height */}
          </Box>
      </CardContent>
    </Card>
  );
}

function ProfileModal({ member, onClose, audio }: { member: User, onClose: () => void, audio: any }) {
   const [activeIndex, setActiveIndex] = useState(0);
   const [showThumbnails, setShowThumbnails] = useState(true);
   const { t } = useTranslation();
   const theme = useTheme();

   const mediaList = useMemo(() => {
      if (member.media && member.media.length > 0) return member.media;
      return [] as any[];
   }, [member]);

   const activeItem = mediaList[activeIndex];

   const handleNext = (e?: React.MouseEvent) => {
      e?.stopPropagation();
      if (mediaList.length === 0) return;
      setActiveIndex((prev) => (prev + 1) % mediaList.length);
   };

   const handlePrev = (e?: React.MouseEvent) => {
      e?.stopPropagation();
      if (mediaList.length === 0) return;
      setActiveIndex((prev) => (prev - 1 + mediaList.length) % mediaList.length);
   };

   // Don't render if no media or activeItem is invalid
   if (mediaList.length === 0 || !activeItem) {
      return null;
   }

   return (
      <Dialog 
        open 
        onClose={onClose} 
        fullScreen 
        PaperProps={{ 
            sx: { bgcolor: 'transparent', backgroundImage: 'none' } 
        }}
        TransitionComponent={undefined} // Use default fade manually if needed, or rely on Dialog default
      >
         <Box 
            onClick={onClose}
            sx={{ 
                position: 'fixed', inset: 0, bgcolor: 'rgba(0,0,0,0.95)', backdropFilter: 'blur(10px)', 
                display: 'flex', alignItems: 'center', justifyContent: 'center' 
            }}
         >
            <Box
               onClick={e => e.stopPropagation()}
               sx={{
                   width: '100%', height: '100%', maxWidth: { md: '95vw' }, maxHeight: { md: '90vh' },
                   bgcolor: '#1a1a1a', borderRadius: { md: 6 }, overflow: 'hidden',
                   display: 'flex', flexDirection: 'column', position: 'relative',
                   border: `1px solid ${alpha(theme.palette.common.white, 0.1)}`
               }}
            >
               {/* Header Overlay */}
               <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, p: 4, zIndex: 30, background: 'linear-gradient(to bottom, rgba(0,0,0,0.9), transparent)', pointerEvents: 'none' }}>
                  <Stack direction="row" spacing={3} alignItems="flex-start" sx={{ pointerEvents: 'auto' }}>
                      <Box sx={{ width: 80, height: 80, borderRadius: 3, overflow: 'hidden', border: '2px solid rgba(255,255,255,0.1)', boxShadow: 10 }}>
                          <img src={getOptimizedMediaUrl(member.avatar_url || `https://ui-avatars.com/api/?name=${member.username}&background=random`, 'image')} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                      </Box>
                      
                      <Box flex={1}>
                          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                              <Box>
                                  <Typography variant="h3" color="white" fontWeight={900} lineHeight={1}>{member.username}</Typography>
                                  <Typography variant="body2" color="#60a5fa" fontWeight={700} sx={{ mt: 0.5 }} dangerouslySetInnerHTML={sanitizeHtml(member.title_html || t('roster.operative_title'))} />
                              </Box>
                              
                              <Stack direction="row" spacing={1.5} alignItems="center">

                                  <Box sx={{ px: 1.5, py: 0.5, borderRadius: 10, bgcolor: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                      <Zap size={12} color="#eab308" />
                                      <Typography variant="caption" color="white" fontWeight={900} fontFamily="monospace">{formatPower(member.power)}</Typography>
                                  </Box>
                                  <Chip
                                    label={t(`common.${member.active_status}`)}
                                    size="small"
                                    sx={{
                                      bgcolor: member.active_status === 'active' ? theme.custom?.status.active.bg : theme.custom?.status.inactive.bg,
                                      color: member.active_status === 'active' ? theme.custom?.status.active.text : theme.custom?.status.inactive.text,
                                      fontSize: '0.6rem',
                                      fontWeight: 900
                                    }}
                                  />
                                  <IconButton size="small" onClick={onClose} sx={{ bgcolor: 'rgba(255,255,255,0.05)', color: 'white' }}><X size={16} /></IconButton>
                              </Stack>
                          </Stack>
                          
                          <Typography variant="caption" color="rgba(255,255,255,0.6)" sx={{ display: 'block', mt: 2, maxWidth: 600 }}>
                              {member.bio || t('roster.no_bio')}
                          </Typography>
                      </Box>
                  </Stack>
               </Box>

               {/* Gallery */}
               <Box sx={{ flex: 1, position: 'relative', bgcolor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                   <IconButton onClick={handlePrev} sx={{ position: 'absolute', left: 20, zIndex: 20, color: 'white', bgcolor: 'rgba(0,0,0,0.3)' }}><ChevronLeft /></IconButton>
                   
                   <motion.div
                     key={activeIndex}
                     initial={{ opacity: 0, scale: 0.98 }}
                     animate={{ opacity: 1, scale: 1 }}
                     transition={{ duration: 0.4 }}
                     style={{ maxWidth: '100%', maxHeight: '100%', position: 'relative', display: 'flex', justifyContent: 'center' }}
                   >
                     <img 
                        src={getOptimizedMediaUrl(activeItem.url || activeItem.thumbnail, activeItem.type)} 
                        style={{ maxWidth: '100%', maxHeight: '65vh', objectFit: 'contain', borderRadius: 8, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }} 
                        alt="" 
                     />
                     {activeItem.type === 'video' && (
                        <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                           <Box sx={{ width: 80, height: 80, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.3)', cursor: 'pointer' }}>
                              <Play size={32} fill="white" color="white" style={{ marginLeft: 4 }} />
                           </Box>
                        </Box>
                     )}
                   </motion.div>

                   <IconButton onClick={handleNext} sx={{ position: 'absolute', right: 20, zIndex: 20, color: 'white', bgcolor: 'rgba(0,0,0,0.3)' }}><ChevronRight /></IconButton>
                   
                   <Button 
                      onClick={() => setShowThumbnails(!showThumbnails)}
                      startIcon={showThumbnails ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                      sx={{ position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)', borderRadius: 10, bgcolor: 'rgba(0,0,0,0.6)', color: 'white', fontSize: '0.65rem', fontWeight: 900, backdropFilter: 'blur(4px)', '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' } }}
                   >
                      {activeIndex + 1} / {mediaList.length}
                   </Button>
               </Box>

               {/* Thumbnails */}
               <AnimatePresence>
                   {showThumbnails && (
                       <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: '7rem', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                           style={{ backgroundColor: '#121212', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}
                       >
                          <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', py: 2, px: 4, width: '100%', justifyContent: 'center' }}>
                              {mediaList.map((item: any, i: number) => (
                                  <Box 
                                    key={i}
                                    onClick={() => setActiveIndex(i)}
                                    sx={{ 
                                        width: 96, height: 64, borderRadius: 2, overflow: 'hidden', cursor: 'pointer', flexShrink: 0, position: 'relative',
                                        border: '2px solid', borderColor: i === activeIndex ? 'primary.main' : 'transparent', opacity: i === activeIndex ? 1 : 0.4, 
                                        transition: 'all 0.2s', '&:hover': { opacity: 1, borderColor: 'rgba(255,255,255,0.3)' }
                                    }}
                                  >
                                      <img src={getOptimizedMediaUrl(item.thumbnail || item.url, 'image')} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                                      {item.type === 'video' && (
                                         <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'rgba(0,0,0,0.4)' }}>
                                            <Play size={12} fill="white" color="white" />
                                         </Box>
                                      )}
                                  </Box>
                              ))}
                          </Box>
                       </motion.div>
                   )}
               </AnimatePresence>

            </Box>
         </Box>
      </Dialog>
   )
}

function getBadgeStyle(classType: string, theme: any) {
    let color = theme.palette.text.secondary;
    let bgcolor = theme.palette.action.hover;
    
    if (classType.includes('mingjin')) { color = '#f87171'; bgcolor = 'rgba(248, 113, 113, 0.1)'; }
    if (classType.includes('qiansi')) { color = '#60a5fa'; bgcolor = 'rgba(96, 165, 250, 0.1)'; }
    if (classType.includes('pozhu')) { color = '#fbbf24'; bgcolor = 'rgba(251, 191, 36, 0.1)'; }
    if (classType.includes('lieshi')) { color = '#a78bfa'; bgcolor = 'rgba(167, 139, 250, 0.1)'; }
    
    return { color, bgcolor, borderColor: alpha(color, 0.2) };
}
