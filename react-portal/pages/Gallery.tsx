
import React, { useState, useRef, useEffect } from 'react';
import { convertToWebP } from '../lib/media-conversion';
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
  CircularProgress
} from '@mui/material';
import { Image, ExternalLink, Download, Plus, Trash2, Upload, X, ZoomIn } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuthStore, useUIStore } from '../store';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { galleryAPI, type GalleryImage } from '../lib/api/gallery';
import { api } from '../lib/api-client';

export function Gallery() {
  const { t } = useTranslation();
  const { setPageTitle } = useUIStore();
  const theme = useTheme();
  const { user, viewRole } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const effectiveRole = viewRole || user?.role;
  const isAdmin = effectiveRole === 'admin' || effectiveRole === 'moderator';

  useEffect(() => {
    setPageTitle(t('nav.gallery'));
  }, [setPageTitle, t]);

  // Fetch gallery images
  const { data: galleryData, isLoading } = useQuery({
    queryKey: ['gallery'],
    queryFn: () => galleryAPI.list({ page: 1, limit: 100 }),
  });

  const images = galleryData?.images || [];

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
      const formData = new FormData();
      formData.append('file', file);
      formData.append('kind', 'image');
      
      const uploadResult = await api.post<{ media_id: string; url: string }>('/upload/image', formData);
      
      // Then create gallery entry
      return galleryAPI.create({
        media_id: uploadResult.media_id,
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
    deleteMutation.mutate(id);
    setDeleteDialog(null);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      // Upload each file
      Array.from(files).forEach(file => {
        uploadMutation.mutate(file);
      });
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', pb: 10, px: { xs: 2, sm: 4 } }}>
      {isAdmin && (
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            startIcon={<Upload size={18} />}
            onClick={() => setUploadDialogOpen(true)}
            disabled={uploadMutation.isPending}
            sx={{ fontWeight: 900, borderRadius: 3, px: 3 }}
          >
            {uploadMutation.isPending ? t('common.uploading') : t('gallery.upload')}
          </Button>
        </Box>
      )}

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {images.map(img => {
            // Construct image URL from R2 key
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
                  {/* Admin Delete Button */}
                  {isAdmin && (
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
                      <Trash2 size={14} />
                    </IconButton>
                  )}
                  
                  <Box sx={{ aspectRatio: '4/3', position: 'relative', overflow: 'hidden' }}>
                    <Box 
                      component="img" 
                      src={imageUrl} 
                      alt={img.title || 'Gallery image'} 
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
                        <ZoomIn size={24} />
                      </IconButton>
                    </Box>
                  </Box>
                  <CardContent sx={{ p: 2 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={1}>
                      <Typography variant="caption" fontWeight={900} textTransform="uppercase" noWrap sx={{ maxWidth: '75%' }}>
                        {img.title || 'Untitled'}
                      </Typography>
                      <Chip label="IMG" size="small" variant="outlined" sx={{ height: 16, fontSize: '0.55rem', fontWeight: 900 }} />
                    </Stack>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="caption" fontFamily="monospace" color="text.secondary" fontSize="0.6rem">
                        {img.uploader_username || 'Unknown'}
                      </Typography>
                      <Typography variant="caption" fontFamily="monospace" color="text.secondary" fontSize="0.6rem">
                        {img.created_at_utc ? new Date(img.created_at_utc).toLocaleDateString() : ''}
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
                <Image size={48} style={{ opacity: 0.3, marginBottom: 16 }} />
                <Typography variant="overline" display="block" color="text.secondary" fontWeight={900} letterSpacing="0.2em">
                  {t('gallery.empty')}
                </Typography>
              </Box>
            </Grid>
          )}
        </Grid>
      )}

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
            <X size={18} />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box
            sx={{
              p: 4,
              border: '2px dashed',
              borderColor: 'divider',
              borderRadius: 3,
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s',
              '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover' }
            }}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload size={48} style={{ opacity: 0.5, marginBottom: 16 }} />
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


// ... inside component ...
            onChange={async (e) => {
              if (e.target.files && e.target.files.length > 0) {
                 const newFiles: File[] = [];
                 for (let i = 0; i < e.target.files.length; i++) {
                    const file = e.target.files[i];
                    try {
                       const processed = file.type.startsWith('image/') ? await convertToWebP(file) : file;
                       newFiles.push(processed);
                    } catch (err) {
                       console.error(err);
                       newFiles.push(file);
                    }
                 }
                 handleFileSelect(newFiles); 
              }
            }}
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
              <X size={24} />
           </IconButton>
           {previewImage && (
              <img 
                 src={previewImage.r2_key ? `/api/media/${encodeURIComponent(previewImage.r2_key)}` : ''}
                 alt={previewImage.title || 'Gallery image'}
                 style={{ 
                    maxWidth: '90vw', 
                    maxHeight: '90vh', 
                    borderRadius: 8,
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                 }} 
                 onContextMenu={(e) => e.preventDefault()}
              />
           )}
           <Box sx={{ position: 'absolute', bottom: -40, left: 0, right: 0, textAlign: 'center' }}>
               <Typography variant="subtitle1" fontWeight={700} color="white">
                   {previewImage?.title || 'Untitled'}
               </Typography>
           </Box>
        </Box>
      </Dialog>
    </Box>
  );
}
