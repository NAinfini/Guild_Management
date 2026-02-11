
import React, { useState, useRef, useEffect } from 'react';
import { convertToWebP } from '../../lib/media-conversion';
import { 
  Card, 
  CardContent, 
  Button, 
  Chip, 
  Typography, 
  Box, 
  Stack, 
  IconButton, 
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  useTheme,
  alpha,
  Pagination
} from '@mui/material';
import {
  Photo as ImageIcon,
  Add as PlusIcon,
  Delete as TrashIcon,
  CloudUpload as UploadIcon,
  Close as CloseIcon,
  ZoomIn as ZoomInIcon,
} from '@mui/icons-material';
import { CardGridSkeleton } from '@/components';
import { PageFilterBar } from '@/components';
import { useTranslation } from 'react-i18next';
import { useAuthStore, useUIStore } from '../../store';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { galleryAPI, type GalleryImage } from '../../lib/api/gallery';
import { mediaAPI } from '../../lib/api/media';
import {
  canDeleteGalleryMedia,
  canUploadGalleryMedia,
  getEffectiveRole,
} from '../../lib/permissions';

export function Gallery() {
  const { t, i18n } = useTranslation();
  const { setPageTitle } = useUIStore();
  const theme = useTheme();
  const { user, viewRole } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const effectiveRole = getEffectiveRole(user?.role, viewRole);
  const canUpload = canUploadGalleryMedia(effectiveRole);
  const canDelete = canDeleteGalleryMedia(effectiveRole);

  useEffect(() => {
    setPageTitle(t('nav.gallery'));
  }, [setPageTitle, t]);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const LIMIT = 24;
  const [isDragOver, setIsDragOver] = useState(false);
  const localeTag = i18n.language.startsWith('zh') ? 'zh-CN' : 'en-US';

  // Fetch gallery images
  const { data: galleryData, isLoading } = useQuery({
    queryKey: ['gallery', page, search, startDate, endDate],
    queryFn: () => galleryAPI.list({ 
      page, 
      limit: LIMIT,
      search: search || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    }),
  });

  const images = galleryData?.images || [];
  const totalItems = galleryData?.pagination?.total || 0;
  const totalPages = galleryData?.pagination?.pages || 1;


  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [search, startDate, endDate]);


  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => galleryAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gallery'] });
    },
  });

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      // First upload the image to R2
      const uploadResult = await mediaAPI.uploadImage(file, 'gallery');
      
      // Then create gallery entry
      return galleryAPI.create({
        media_id: uploadResult.mediaId,
        title: file.name.replace(/\.[^/.]+$/, ''),
        category: 'other',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gallery'] });
      setUploadDialogOpen(false);
    },
  });

  const [deleteDialog, setDeleteDialog] = useState<string | null>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<GalleryImage | null>(null);

  const handleDelete = (id: string) => {
    if (!canDelete) return;
    deleteMutation.mutate(id);
    setDeleteDialog(null);
  };

  const handleFiles = (files: File[]) => {
    if (!canUpload) return;
    if (files.length > 0) {
      files.forEach(file => {
        uploadMutation.mutate(file);
      });
    }
  };

  const processAndUploadFiles = async (files: File[]) => {
      if (!canUpload) return;
      const newFiles: File[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        try {
            const processed = file.type.startsWith('image/') ? await convertToWebP(file) : file;
            newFiles.push(processed);
        } catch (err) {
            console.error(err);
            newFiles.push(file);
        }
      }
      handleFiles(newFiles);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      processAndUploadFiles(Array.from(files));
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
          processAndUploadFiles(Array.from(e.dataTransfer.files));
      }
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', pb: 10, px: { xs: 2, sm: 4 } }}>
      <PageFilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder={t('gallery.search_placeholder')}
        startDate={startDate}
        onStartDateChange={setStartDate}
        endDate={endDate}
        onEndDateChange={setEndDate}
        resultsCount={totalItems}
        isLoading={isLoading}
        extraActions={canUpload && (
          <Button
            variant="contained"
            size="small"
            startIcon={<UploadIcon sx={{ fontSize: 18 }} />}
            onClick={() => setUploadDialogOpen(true)}
            disabled={uploadMutation.isPending}
            sx={{ fontWeight: 900, borderRadius: 3, px: 3 }}
          >
            {uploadMutation.isPending ? t('common.uploading') : t('gallery.upload')}
          </Button>
        )}
      />

      {isLoading ? (
        <CardGridSkeleton count={8} aspectRatio="4/3" />
      ) : (<>
        <Grid container spacing={3}>
          {images.map(img => {
            const imageUrl = img.r2_key ? `/api/media/${encodeURIComponent(img.r2_key)}` : '';
            
            return (
              <Grid key={img.gallery_id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <Card 
                  sx={{ 
                    borderRadius: 4, 
                    overflow: 'hidden', 
                    position: 'relative', 
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    border: `1px solid ${theme.palette.divider}`,
                    '&:hover': { 
                      transform: 'translateY(-4px)', 
                      boxShadow: theme.shadows[8],
                      borderColor: 'primary.main',
                      '& .overlay': { opacity: 1 },
                      '& img': { transform: 'scale(1.1)' },
                      '& .delete-btn': { opacity: 1 }
                    }
                  }}
                >
                  {canDelete && (
                    <IconButton
                      className="delete-btn"
                      size="small"
                      onClick={(e) => { e.stopPropagation(); setDeleteDialog(img.gallery_id); }}
                      disabled={deleteMutation.isPending}
                      sx={{ 
                        position: 'absolute', 
                        top: 8, 
                        right: 8, 
                        zIndex: 10,
                        bgcolor: 'error.main',
                        color: 'error.contrastText',
                        opacity: 0,
                        transition: 'opacity 0.2s',
                        '&:hover': { bgcolor: 'error.dark' }
                      }}
                    >
                      <TrashIcon sx={{ fontSize: 14 }} />
                    </IconButton>
                  )}
                  
                  <Box sx={{ aspectRatio: '4/3', position: 'relative', overflow: 'hidden' }}>
                    <Box 
                      component="img" 
                      src={imageUrl} 
                      alt={img.title || t('gallery.alt_image')} 
                      sx={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s' }} 
                      onContextMenu={(e) => e.preventDefault()}
                    />
                    <Box 
                      className="overlay"
                      sx={{ 
                        position: 'absolute', inset: 0, 
                        bgcolor: 'rgba(0,0,0,0.3)',
                        opacity: 0, 
                        transition: 'opacity 0.3s', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}
                    >
                      <IconButton 
                        onClick={(e) => { e.stopPropagation(); setPreviewImage(img); }}
                        sx={{ 
                          bgcolor: 'background.paper', 
                          transform: 'scale(0.8)',
                          transition: 'transform 0.2s',
                          '&:hover': { bgcolor: 'primary.main', color: 'primary.contrastText', transform: 'scale(1)' } 
                        }}
                      >
                        <ZoomInIcon sx={{ fontSize: 24 }} />
                      </IconButton>
                    </Box>
                  </Box>
                  <CardContent sx={{ p: 2 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={1}>
                      <Typography variant="caption" fontWeight={900} textTransform="uppercase" noWrap sx={{ maxWidth: '75%' }}>
                        {img.title || t('gallery.untitled')}
                      </Typography>
                      <Chip label={t('common.label_img')} size="small" variant="outlined" sx={{ height: 16, fontSize: '0.55rem', fontWeight: 900 }} />
                    </Stack>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="caption" fontFamily="monospace" color="text.secondary" fontSize="0.6rem">
                        {img.uploader_username || t('gallery.unknown_uploader')}
                      </Typography>
                      <Typography variant="caption" fontFamily="monospace" color="text.secondary" fontSize="0.6rem">
                        {img.created_at_utc ? new Date(img.created_at_utc).toLocaleDateString(localeTag) : ''}
                      </Typography>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
          
          {images.length === 0 && (
            <Grid size={{ xs: 12 }}>
              <Box sx={{ py: 8, textAlign: 'center', border: '2px dashed', borderColor: 'divider', borderRadius: 4, bgcolor: 'action.hover' }}>
                <ImageIcon sx={{ fontSize: 48, opacity: 0.3, mb: 2 }} />
                <Typography variant="overline" display="block" color="text.secondary" fontWeight={900} letterSpacing="0.2em">
                  {t('gallery.empty')}
                </Typography>
              </Box>
            </Grid>
          )}
        </Grid>
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
          <Pagination 
            count={totalPages} 
            page={page} 
            onChange={(_, p) => setPage(p)} 
            color="primary" 
            size="large"
            showFirstButton 
            showLastButton
          />
        </Box>
      </>)}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog !== null}
        onClose={() => setDeleteDialog(null)}
        PaperProps={{ sx: { borderRadius: 4, border: `1px solid ${theme.palette.divider}` } }}
      >
        <DialogTitle>
          <Typography variant="overline" fontWeight={900} letterSpacing="0.1em">
            {t('gallery.delete_title')}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t('gallery.delete_confirm')}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteDialog(null)} color="inherit">
            {t('common.cancel')}
          </Button>
          <Button onClick={() => deleteDialog !== null && handleDelete(deleteDialog)} variant="contained" color="error">
            {t('common.delete')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Upload Dialog */}
      <Dialog
        open={uploadDialogOpen}
        onClose={() => setUploadDialogOpen(false)}
        PaperProps={{ sx: { borderRadius: 4, border: `1px solid ${theme.palette.divider}` } }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="overline" fontWeight={900} letterSpacing="0.1em">
            {t('gallery.upload_title')}
          </Typography>
          <IconButton size="small" onClick={() => setUploadDialogOpen(false)}>
            <CloseIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box
            sx={{
              p: 4,
              border: '2px dashed',
              borderColor: isDragOver ? 'primary.main' : 'divider',
              borderRadius: 3,
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s',
              bgcolor: isDragOver ? 'action.hover' : 'transparent',
              '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover' }
            }}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <UploadIcon sx={{ fontSize: 48, opacity: 0.5, mb: 2, color: isDragOver ? theme.palette.primary.main : 'inherit' }} />
            <Typography variant="body2" fontWeight={700} mb={1}>
              {t('gallery.drop_files')}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {t('gallery.file_types')}
            </Typography>
          </Box>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            style={{ display: 'none' }}
            onChange={handleFileSelect}
          />
        </DialogContent>
      </Dialog>

      {/* Preview Modal */}
      <Dialog
        open={!!previewImage}
        onClose={() => setPreviewImage(null)}
        maxWidth="xl"
        PaperProps={{
          sx: {
            bgcolor: 'transparent',
            boxShadow: 'none',
            overflow: 'visible',
            backgroundImage: 'none'
          }
        }}
        slotProps={{
           backdrop: {
              sx: { backdropFilter: 'blur(5px)', bgcolor: 'rgba(0,0,0,0.8)' }
           }
        }}
      >
        <Box sx={{ position: 'relative', outline: 'none' }}>
           <IconButton 
              onClick={() => setPreviewImage(null)}
              sx={{ 
                 position: 'absolute', top: -40, right: 0, 
                 color: 'white', bgcolor: 'rgba(255,255,255,0.1)',
                 '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
              }}
           >
              <CloseIcon sx={{ fontSize: 24 }} />
           </IconButton>
           {previewImage && (
              <Box sx={{ position: 'relative' }}>
                <img 
                   src={previewImage.r2_key ? `/api/media/${encodeURIComponent(previewImage.r2_key)}` : ''}
                   alt={previewImage.title || t('gallery.alt_image')}
                   style={{ 
                      maxWidth: '90vw', 
                      maxHeight: '90vh', 
                      borderRadius: 8,
                      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                   }} 
                   onContextMenu={(e) => e.preventDefault()}
                />
                <Box sx={{ position: 'absolute', bottom: -40, left: 0, right: 0, textAlign: 'center' }}>
                    <Typography variant="subtitle1" fontWeight={700} color="white">
                        {previewImage?.title || t('gallery.untitled')}
                    </Typography>
                </Box>
              </Box>
           )}
        </Box>
      </Dialog>
    </Box>
  );
}
