
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Card, 
  CardContent, 
  Button, 
  Chip, 
  Typography, 
  Box, 
  Stack, 
  IconButton, 
  TextField, 
  InputAdornment, 
  Dialog, 
  DialogContent, 
  DialogTitle,
  DialogActions,
  useTheme,
  alpha,
  Avatar,
  Badge,
  Grid,
  ToggleButton,
  ToggleButtonGroup
} from '@mui/material';
import { 
  Megaphone, 
  Pin, 
  Archive, 
  Plus, 
  Search, 
  X,
  Clock,
  Edit,
  Trash2,
  Calendar,
  Image as ImageIcon,
  MoreVertical,
  CheckCircle2,
  Play,
  Paperclip
} from 'lucide-react';
import { formatDateTime, cn, sanitizeHtml, getOptimizedMediaUrl } from '../../lib/utils';
import { useAuthStore, useUIStore } from '../../store';
import { useTranslation } from 'react-i18next';
import { Announcement } from '../../types';
import { isAfter } from 'date-fns';
import { Skeleton } from '@mui/material';
import { useOnline } from '../../hooks/useOnline';
import { TiptapEditor } from '../../components/TiptapEditor';
import {
  useAnnouncements,
  useCreateAnnouncement,
  useUpdateAnnouncement,
  useDeleteAnnouncement,
  useTogglePinAnnouncement,
  useArchiveAnnouncement
} from '../../hooks/useServerState';

type FilterType = 'all' | 'pinned' | 'archived';

export function Announcements() {
  const { user, viewRole } = useAuthStore();

  // ✅ TanStack Query: Server state with automatic caching
  const { data: announcements = [], isLoading } = useAnnouncements();

  // ✅ TanStack Query: Mutations with automatic cache invalidation
  const createAnnouncementMutation = useCreateAnnouncement();
  const updateAnnouncementMutation = useUpdateAnnouncement();
  const deleteAnnouncementMutation = useDeleteAnnouncement();
  const togglePinMutation = useTogglePinAnnouncement();
  const archiveAnnouncementMutation = useArchiveAnnouncement();

  // Wrapper functions to match existing API
  const createAnnouncement = async (data: any) => {
    await createAnnouncementMutation.mutateAsync(data);
  };
  const updateAnnouncement = async (id: string, data: any) => {
    await updateAnnouncementMutation.mutateAsync({ id, data });
  };
  const deleteAnnouncement = async (id: string) => {
    await deleteAnnouncementMutation.mutateAsync(id);
  };
  const togglePinAnnouncement = async (id: string) => {
    await togglePinMutation.mutateAsync(id);
  };
  const archiveAnnouncement = async (id: string, isArchived: boolean) => {
    await archiveAnnouncementMutation.mutateAsync({ id, isArchived });
  };

  const { timezoneOffset, setPageTitle } = useUIStore();
  const { t } = useTranslation();
  const theme = useTheme();
  const online = useOnline();

  const [filter, setFilter] = useState<FilterType>('all');
  const [search, setSearch] = useState('');
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Announcement | null>(null);
  const [isMarkingAllAsRead, setIsMarkingAllAsRead] = useState(false);

  const effectiveRole = viewRole || user?.role;
  const isAdmin = effectiveRole === 'admin' || effectiveRole === 'moderator';
  const lastSeenKey = 'last_seen_announcements_at';
  const lastSeen = localStorage.getItem(lastSeenKey) || new Date(0).toISOString();

  useEffect(() => {
    setPageTitle(t('nav.announcements'));
  }, [setPageTitle, t]);

  const filteredAnnouncements = useMemo(() => {
    let result = announcements;
    if (filter === 'pinned') result = result.filter(a => a.is_pinned && !a.is_archived);
    else if (filter === 'archived') result = result.filter(a => a.is_archived);
    else result = result.filter(a => !a.is_archived);

    if (search) {
        const lowerSearch = search.toLowerCase();
        result = result.filter(a =>
            a.title.toLowerCase().includes(lowerSearch) ||
            a.content_html.toLowerCase().includes(lowerSearch)
        );
    }

    return result.sort((a, b) => {
        if (a.is_pinned !== b.is_pinned && filter !== 'archived') return a.is_pinned ? -1 : 1;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [announcements, filter, search]);

  useEffect(() => {
    return () => localStorage.setItem(lastSeenKey, new Date().toISOString());
  }, []);

  const handleMarkAllAsRead = () => {
    setIsMarkingAllAsRead(true);
    localStorage.setItem('last_seen_announcements_at', new Date().toISOString());
    setTimeout(() => setIsMarkingAllAsRead(false), 500);
  };

  if (isLoading && announcements.length === 0) {
    return (
      <Box sx={{ maxWidth: 1200, mx: 'auto', pb: 10, px: { xs: 2, sm: 4 } }}>
        {renderSkeletons()}
      </Box>
    );
  }

  function renderSkeletons() {
    return (
      <Stack spacing={2} sx={{ mt: 2 }}>
        {[1,2,3].map(i => (
          <Card key={i}>
            <CardContent>
              <Skeleton variant="text" width="50%" />
              <Skeleton variant="text" width="30%" />
              <Skeleton variant="rectangular" height={60} sx={{ mt: 2, borderRadius: 2 }} />
            </CardContent>
          </Card>
        ))}
      </Stack>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', pb: 10, px: { xs: 2, sm: 4 } }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
         <Button
            size="small"
            startIcon={<CheckCircle2 size={16} />}
            onClick={handleMarkAllAsRead}
            disabled={isMarkingAllAsRead}
            sx={{ fontWeight: 900, borderRadius: 2, letterSpacing: '0.05em' }}
         >
            {isMarkingAllAsRead ? t('common.loading') : t('common.mark_all_read')}
         </Button>

         {isAdmin && (
            <Button
                variant="contained"
                startIcon={<Plus size={18} />}
                onClick={() => { setEditTarget(null); setIsEditorOpen(true); }}
                disabled={!online}
                sx={{ fontWeight: 900, borderRadius: 3, px: 3 }}
            >
               {t('announcements.new_broadcast')}
            </Button>
         )}
      </Box>

      {/* Filter Bar & Search */}
      <Box sx={{ 
          position: 'sticky', top: 10, zIndex: 10, 
          bgcolor: 'background.paper',
          p: 2, borderRadius: 2, border: 1, borderColor: 'divider',
          display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: 'center', gap: 2, mb: 4,
          boxShadow: 1
      }}>
         <Box sx={{ display: 'flex' }}>
            <Box sx={{ bgcolor: 'action.hover', p: 0.5, borderRadius: 2 }}>
               <ToggleButtonGroup
                  value={filter}
                  exclusive
                  onChange={(_, v) => v && setFilter(v)}
                  size="small"
                  aria-label="announcement filter"
                  sx={{ 
                      '& .MuiToggleButton-root': { 
                          border: 0, 
                          borderRadius: '8px !important', 
                          fontSize: '0.7rem', 
                          fontWeight: 800, 
                          px: 2,
                          py: 0.75,
                          textTransform: 'uppercase',
                          color: 'text.secondary',
                          '&.Mui-selected': {
                              bgcolor: 'background.paper',
                              color: 'primary.main',
                              boxShadow: 1
                          }
                      }
                  }}
               >
                   <ToggleButton value="all" aria-label="all announcements">
                       <Stack direction="row" spacing={1} alignItems="center">
                          <Megaphone size={14} />
                          <span>{t('announcements.filter_all')}</span>
                       </Stack>
                   </ToggleButton>
                   <ToggleButton value="pinned" aria-label="pinned announcements">
                       <Stack direction="row" spacing={1} alignItems="center">
                          <Pin size={14} />
                          <span>{t('announcements.filter_pinned')}</span>
                       </Stack>
                   </ToggleButton>
                   <ToggleButton value="archived" aria-label="archived announcements">
                       <Stack direction="row" spacing={1} alignItems="center">
                          <Archive size={14} />
                          <span>{t('announcements.filter_archived')}</span>
                       </Stack>
                   </ToggleButton>
               </ToggleButtonGroup>
            </Box>
         </Box>

         <TextField 
            placeholder={t('announcements.search_placeholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size="small"
            InputProps={{
               startAdornment: <InputAdornment position="start"><Search size={16} /></InputAdornment>,
               sx: { borderRadius: 2, bgcolor: 'background.default', fontSize: '0.8rem', fontWeight: 600 }
            }}
            sx={{ width: { xs: '100%', sm: 300 } }}
         />
      </Box>

      {/* Feed List */}
      <Stack spacing={2}>
        {filteredAnnouncements.map((ann) => {
          const isNew = isAfter(new Date(ann.created_at), new Date(lastSeen));
          return (
            <Card 
              key={ann.id}
              elevation={1}
              onClick={() => setSelectedAnnouncement(ann)}
              sx={{ 
                  borderRadius: 2, 
                  border: 1, 
                  borderColor: ann.is_pinned ? 'primary.main' : 'divider',
                  overflow: 'hidden',
                  transition: 'transform 0.2s',
                  cursor: 'pointer',
                  '&:hover': { borderColor: 'primary.main' }
              }}
            >
              <CardContent sx={{ p: 3 }}>
                  <Stack direction="row" spacing={2} alignItems="flex-start">
                      {ann.is_pinned && <Pin size={18} className="text-primary" />}
                      <Box flex={1}>
                          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Typography variant="h6" fontWeight={800}>{ann.title}</Typography>
                                  {isNew && <Chip label={t('common.label_new')} size="small" color="error" sx={{ height: 16, fontSize: '0.6rem' }} />}
                              </Box>
                              <Typography variant="caption" color="text.secondary">
                                  {formatDateTime(ann.created_at, 0, true)}
                              </Typography>
                          </Stack>
                          <Typography 
                              variant="body2" 
                              color="text.secondary"
                              sx={{ 
                                  display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden'
                              }}
                              dangerouslySetInnerHTML={sanitizeHtml(ann.content_html.replace(/<[^>]+>/g, ' ') || '')}
                          />
                          {/* Media Counters */}
                          {ann.media_urls && ann.media_urls.length > 0 && (
                             <Stack direction="row" spacing={1} mt={2}>
                                {(() => {
                                   const images = ann.media_urls.filter(u => u.match(/\.(jpg|jpeg|png|gif|webp)$/i)).length;
                                   const videos = ann.media_urls.filter(u => u.match(/\.(mp4|webm|mov)$/i)).length;
                                   const others = ann.media_urls.length - images - videos;

                                   return (
                                     <>
                                         {images > 0 && (
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                                                <ImageIcon size={14} />
                                                <Typography variant="caption" fontWeight={900}>{images}</Typography>
                                            </Box>
                                         )}
                                         {videos > 0 && (
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                                                <Play size={14} />
                                                <Typography variant="caption" fontWeight={900}>{videos}</Typography>
                                            </Box>
                                         )}
                                         {others > 0 && (
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                                                <Paperclip size={14} />
                                                <Typography variant="caption" fontWeight={900}>{others}</Typography>
                                            </Box>
                                         )}
                                     </>
                                   );
                                })()}
                             </Stack>
                          )}
                      </Box>
                  </Stack>
              </CardContent>
            </Card>
          );
        })}

        {filteredAnnouncements.length === 0 && (
            <Box sx={{ py: 10, textAlign: 'center', opacity: 0.5, border: `2px dashed ${theme.palette.divider}`, borderRadius: 5 }}>
               <Megaphone size={48} color={theme.palette.text.secondary} style={{ margin: '0 auto', marginBottom: 16 }} />
               <Typography variant="caption" fontWeight={900} textTransform="uppercase" letterSpacing="0.2em" color="text.secondary">NO ANNOUNCEMENTS FOUND</Typography>
            </Box>
        )}
      </Stack>

      {/* View Modal */}
      {selectedAnnouncement && (
         <Dialog 
            open 
            onClose={() => setSelectedAnnouncement(null)} 
            maxWidth="md" 
            fullWidth
            PaperProps={{ sx: { bgcolor: 'background.paper', borderRadius: 5, overflow: 'hidden' } }}
         >
            <Box sx={{ p: 4, bgcolor: 'background.default', borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
               <Box>
                  <Stack direction="row" spacing={1} mb={2}>
                     {selectedAnnouncement.is_pinned && <Chip label={t('announcements.status_priority')} size="small" color="primary" sx={{ fontWeight: 900, height: 20, fontSize: '0.6rem' }} />}
                     {selectedAnnouncement.is_archived && <Chip label={t('announcements.status_archived')} size="small" sx={{ fontWeight: 900, height: 20, fontSize: '0.6rem' }} />}
                  </Stack>
                  <Typography variant="h4" fontWeight={900} fontStyle="italic" textTransform="uppercase" lineHeight={1}>{selectedAnnouncement.title}</Typography>
                  <Stack direction="row" spacing={2} mt={2} alignItems="center">
                      <Stack direction="row" spacing={0.5} alignItems="center">
                          <Clock size={12} color={theme.palette.text.secondary} />
                          <Typography variant="caption" fontWeight={900} textTransform="uppercase" color="text.secondary">{formatDateTime(selectedAnnouncement.created_at, timezoneOffset)}</Typography>
                      </Stack>
                      <Typography variant="caption" fontWeight={900} textTransform="uppercase" color="text.secondary">POSTED BY: {selectedAnnouncement.author_id}</Typography>
                  </Stack>
               </Box>
               <IconButton onClick={() => setSelectedAnnouncement(null)}><X /></IconButton>
            </Box>

            <DialogContent sx={{ p: 5 }}>
               <Typography 
                  variant="body1" 
                  color="text.secondary" 
                  sx={{ '& p': { mb: 2, lineHeight: 1.8 } }} 
                  dangerouslySetInnerHTML={sanitizeHtml(selectedAnnouncement.content_html)} 
               />

               {selectedAnnouncement.media_urls && selectedAnnouncement.media_urls.length > 0 && (
                  <Box mt={4}>
                     <Typography variant="caption" fontWeight={900} textTransform="uppercase" color="text.disabled" display="block" mb={2} letterSpacing="0.1em">{t('announcements.intel_attached')}</Typography>
                     <Grid container spacing={2}>
                        {selectedAnnouncement.media_urls.map((url, i) => (
                           <Grid size={{ xs: 12, sm: 6 }} key={i}>
                              <Box sx={{ aspectRatio: '16/9', borderRadius: 3, overflow: 'hidden', bgcolor: 'black' }}>
                                 <img src={getOptimizedMediaUrl(url, 'image')} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              </Box>
                           </Grid>
                        ))}
                     </Grid>
                  </Box>
               )}
            </DialogContent>

            {isAdmin && (
                <DialogActions sx={{ p: 3, bgcolor: 'background.default', borderTop: 1, borderColor: 'divider' }}>
                   <Button startIcon={<Edit size={16} />} onClick={() => { setEditTarget(selectedAnnouncement); setIsEditorOpen(true); setSelectedAnnouncement(null); }} sx={{ fontWeight: 900 }} disabled={!online}>{t('announcements.edit')}</Button>
                   <Button startIcon={<Pin size={16} />} onClick={() => { togglePinAnnouncement(selectedAnnouncement.id); setSelectedAnnouncement(null); }} sx={{ fontWeight: 900 }} disabled={!online}>{selectedAnnouncement.is_pinned ? t('announcements.unpin') : t('announcements.pin')}</Button>
                   <Button startIcon={<Archive size={16} />} onClick={() => { archiveAnnouncement(selectedAnnouncement.id, !selectedAnnouncement.is_archived); setSelectedAnnouncement(null); }} sx={{ fontWeight: 900 }} disabled={!online}>{selectedAnnouncement.is_archived ? t('announcements.restore') : t('announcements.archive')}</Button>
                   <Button startIcon={<Trash2 size={16} />} color="error" onClick={() => { if(confirm(t('common.delete_confirm'))) deleteAnnouncement(selectedAnnouncement.id); setSelectedAnnouncement(null); }} sx={{ fontWeight: 900 }} disabled={!online}>{t('announcements.delete')}</Button>
                </DialogActions>
             )}
         </Dialog>
      )}

      {/* Editor Modal */}
      {isEditorOpen && (
         <EditorModal 
            isOpen={isEditorOpen} 
            onClose={() => setIsEditorOpen(false)} 
            initialData={editTarget}
            onSubmit={(data: any) => {
               if (editTarget) updateAnnouncement(editTarget.id, data);
               else createAnnouncement({ ...data, author_id: user?.username || 'CORE' });
               setIsEditorOpen(false);
            }}
         />
      )}
    </Box>
  );
}

function EditorModal({ isOpen, onClose, initialData, onSubmit }: any) {
    const { t } = useTranslation();
    const [title, setTitle] = useState(initialData?.title || '');
    const [content, setContent] = useState(initialData?.content_html || '');
    const [showPreview, setShowPreview] = useState(false);
    // Media from existing announcement
    const existingMedia = initialData?.media_urls || [];

    // Handle image upload for Tiptap paste
    const handleImageUpload = async (file: File): Promise<string> => {
        try {
            // Create FormData for file upload
            const formData = new FormData();
            formData.append('file', file);
            formData.append('context', 'announcement');

            // Upload to media API
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/media`, {
                method: 'POST',
                body: formData,
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error('Upload failed');
            }

            const data = await response.json();
            return data.url;
        } catch (error) {
            console.error('Image upload failed:', error);
            throw error;
        }
    };

    return (
        <Dialog 
            open={isOpen} 
            onClose={onClose} 
            maxWidth="md" 
            fullWidth
            PaperProps={{ sx: { borderRadius: 4 } }}
        >
            <DialogTitle sx={{ p: 4, pb: 2 }}>
                <Typography variant="h5" fontWeight={900} fontStyle="italic" textTransform="uppercase">{initialData ? t('announcements.edit_signal') : t('announcements.broadcast_signal')}</Typography>
                <Typography variant="caption" fontWeight={900} textTransform="uppercase" color="text.secondary" letterSpacing="0.1em">{t('announcements.modify_params')}</Typography>
            </DialogTitle>
            <DialogContent sx={{ p: 4 }}>
                <Stack spacing={3}>
                    <TextField 
                        label={t('announcements.subject_line')} 
                        fullWidth 
                        value={title} 
                        onChange={e => setTitle(e.target.value)}
                        autoFocus
                    />
                    
                    {/* Preview/Edit Tabs */}
                    <Box>
                        <Stack direction="row" spacing={1} mb={2}>
                            <Button
                                size="small"
                                variant={!showPreview ? 'contained' : 'outlined'}
                                onClick={() => setShowPreview(false)}
                                sx={{ fontWeight: 700, fontSize: '0.7rem' }}
                            >
                                Edit
                            </Button>
                            <Button
                                size="small"
                                variant={showPreview ? 'contained' : 'outlined'}
                                onClick={() => setShowPreview(true)}
                                sx={{ fontWeight: 700, fontSize: '0.7rem' }}
                            >
                                Preview
                            </Button>
                        </Stack>

                        {showPreview ? (
                            <Box 
                                sx={{ 
                                    minHeight: 200, 
                                    p: 3, 
                                    border: 1, 
                                    borderColor: 'divider', 
                                    borderRadius: 2,
                                    '& p': { mb: 1 },
                                    '& h1, & h2, & h3': { mt: 2, mb: 1, fontWeight: 700 },
                                    '& img': { maxWidth: '100%', borderRadius: 1, my: 1 },
                                }}
                                dangerouslySetInnerHTML={sanitizeHtml(content)}
                            />
                        ) : (
                            <TiptapEditor
                                content={content}
                                onChange={setContent}
                                placeholder={t('announcements.tx_body')}
                                onImageUpload={handleImageUpload}
                                minHeight={250}
                            />
                        )}
                    </Box>
                    
                    <Box>
                         <Typography variant="caption" fontWeight={900} textTransform="uppercase" color="text.secondary" mb={2} display="block">{t('announcements.attached_media')}</Typography>
                         <Grid container spacing={2}>
                             {existingMedia.map((url: string, i: number) => (
                                 <Grid size={3} key={i}>
                                     <Box sx={{ aspectRatio: '1/1', borderRadius: 2, overflow: 'hidden', position: 'relative' }}>
                                         <img src={getOptimizedMediaUrl(url, 'image')} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                                         <IconButton size="small" sx={{ position: 'absolute', top: 4, right: 4, bgcolor: 'rgba(0,0,0,0.5)', color: 'error.main' }}><Trash2 size={14} /></IconButton>
                                     </Box>
                                 </Grid>
                             ))}
                             <Grid size={3}>
                                 <Box sx={{ aspectRatio: '1/1', borderRadius: 2, border: '2px dashed', borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover' } }}>
                                     <Plus size={24} color="gray" />
                                 </Box>
                             </Grid>
                         </Grid>
                    </Box>
                </Stack>
            </DialogContent>
            <DialogActions sx={{ p: 4, pt: 0 }}>
                <Button onClick={onClose} sx={{ fontWeight: 900 }}>{t('common.cancel')}</Button>
                <Button variant="contained" onClick={() => onSubmit({ title, content_html: content })} disabled={!title || !content} sx={{ fontWeight: 900, px: 4 }}>{t('announcements.transmit')}</Button>
            </DialogActions>
        </Dialog>
    )
}
