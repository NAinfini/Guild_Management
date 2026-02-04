
import React, { useState } from 'react';
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
  InputAdornment, 
  Grid,
  useTheme,
  alpha,
  Avatar,
  AvatarGroup
} from '@mui/material';
import { 
  BookOpen, 
  Search, 
  Clock, 
  ChevronRight, 
  Info,
  ExternalLink,
  BookMarked,
  Layout,
  Cpu,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '../lib/utils';
import { useUIStore } from '../store';
import { useEffect } from 'react';

export function Wiki() {
  const { t } = useTranslation();
  const { setPageTitle } = useUIStore();
  const theme = useTheme();
  const [activeArticle, setActiveArticle] = useState('launch');
  const [search, setSearch] = useState('');

  useEffect(() => {
    setPageTitle(t('nav.wiki'));
  }, [setPageTitle, t]);

  const articles = [
    {
      id: 'launch',
      title: t('wiki.launch_title'),
      category: 'System',
      date: t('wiki.launch_date'),
      icon: Cpu,
      color: 'info.main',
      bgColor: 'info.lighter'
    },
    {
       id: 'coming-soon-1',
       title: 'Guild Event Guide',
       category: 'Strategy',
       date: 'Upcoming',
       icon: Zap,
       color: 'warning.main',
       bgColor: 'warning.lighter',
       isDummy: true
    },
    {
       id: 'coming-soon-2',
       title: 'Guild Code of Conduct',
       category: 'Policy',
       date: 'Upcoming',
       icon: ShieldCheck,
       color: 'success.main',
       bgColor: 'success.lighter',
       isDummy: true
    }
  ];

  const filteredArticles = articles.filter(a => 
    a.title.toLowerCase().includes(search.toLowerCase()) || 
    a.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', pb: 10, px: { xs: 2, sm: 4 } }}>

      <Grid container spacing={4}>
         {/* Navigation Sidebar */}
         <Grid size={{ xs: 12, lg: 4 }}>
            <Stack spacing={3}>
               <TextField 
                  placeholder={t('wiki.search_placeholder')}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  fullWidth
                  InputProps={{
                     startAdornment: <InputAdornment position="start"><Search size={16} /></InputAdornment>,
                     sx: { borderRadius: 3 }
                  }}
               />

               <Box>
                  <Typography variant="caption" fontWeight={900} textTransform="uppercase" color="text.secondary" display="block" mb={2} px={1}>
                     {t('wiki.article_latest')}
                  </Typography>
                  <Stack spacing={2}>
                     {filteredArticles.map(article => (
                        <Card 
                           key={article.id}
                           onClick={() => !article.isDummy && setActiveArticle(article.id)}
                           sx={{ 
                              p: 2, borderRadius: 3, display: 'flex', alignItems: 'center', gap: 2, cursor: article.isDummy ? 'not-allowed' : 'pointer',
                              border: `1px solid ${activeArticle === article.id ? theme.palette.primary.main : theme.palette.divider}`,
                              bgcolor: activeArticle === article.id ? alpha(theme.palette.primary.main, 0.05) : 'background.paper',
                              opacity: article.isDummy ? 0.6 : 1,
                              transition: 'all 0.2s',
                              '&:hover': { transform: !article.isDummy ? 'translateX(4px)' : 'none', boxShadow: !article.isDummy ? 2 : 0 }
                           }}
                        >
                           <Avatar sx={{ bgcolor: alpha(theme.palette.getContrastText(theme.palette.background.paper), 0.05), color: article.color, borderRadius: 2 }}>
                              <article.icon size={20} />
                           </Avatar>
                           <Box flex={1}>
                              <Stack direction="row" justifyContent="space-between" mb={0.5}>
                                 <Chip label={article.category} size="small" variant="outlined" sx={{ height: 16, fontSize: '0.55rem', fontWeight: 900, textTransform: 'uppercase' }} />
                                 <Typography variant="caption" fontFamily="monospace" color="text.secondary" fontSize="0.6rem">{article.date}</Typography>
                              </Stack>
                              <Typography variant="subtitle2" fontWeight={800} noWrap>{article.title}</Typography>
                           </Box>
                           {!article.isDummy && <ChevronRight size={16} color={activeArticle === article.id ? theme.palette.primary.main : theme.palette.text.disabled} />}
                        </Card>
                     ))}
                  </Stack>
               </Box>
            </Stack>
         </Grid>

         {/* Article Viewer */}
         <Grid size={{ xs: 12, lg: 8 }}>
            {activeArticle === 'launch' ? (
               <Card sx={{ borderRadius: 5, minHeight: 600, display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ p: 5, borderBottom: 1, borderColor: 'divider' }}>
                     <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                        <Chip label="ARTICLE" size="small" color="primary" sx={{ borderRadius: 1, fontWeight: 900, fontSize: '0.6rem', height: 20 }} />
                        <Stack direction="row" spacing={1} alignItems="center">
                            <Clock size={12} color={theme.palette.text.secondary} />
                            <Typography variant="caption" fontFamily="monospace" color="text.secondary">{t('wiki.launch_date')} 19:30</Typography>
                        </Stack>
                     </Stack>
                     
                     <Typography variant="h3" fontWeight={900} textTransform="uppercase" fontStyle="italic" lineHeight={1} mb={3}>{t('wiki.launch_title')}</Typography>
                     
                     <Stack direction="row" spacing={3} alignItems="center" divider={<Box sx={{ height: 16, width: 1, bgcolor: 'divider' }} />}>
                        <Stack direction="row" spacing={1} alignItems="center">
                           <Avatar sx={{ width: 24, height: 24, bgcolor: 'primary.light', color: 'primary.contrastText', borderRadius: 1 }}><Cpu size={14} /></Avatar>
                           <Typography variant="caption" fontWeight={900} textTransform="uppercase" color="text.secondary">{t('common.active')}</Typography>
                        </Stack>
                        <Stack direction="row" spacing={1} alignItems="center">
                           <BookMarked size={14} color={theme.palette.text.secondary} />
                           <Typography variant="caption" fontWeight={900} textTransform="uppercase" color="text.secondary">Site Migration</Typography>
                        </Stack>
                     </Stack>
                  </Box>

                  <CardContent sx={{ p: 6, flex: 1, display: 'flex', flexDirection: 'column' }}>
                     <Box sx={{ flex: 1 }}>
                        <Box sx={{ p: 4, bgcolor: alpha(theme.palette.primary.main, 0.05), borderLeft: `4px solid ${theme.palette.primary.main}`, borderRadius: '0 16px 16px 0', mb: 5 }}>
                               <Info size={14} /> Latest Update
                           <Typography variant="h6" fontStyle="italic" fontWeight={500} color="text.primary">
                             {t('wiki.launch_content')}
                           </Typography>
                        </Box>

                        <Grid container spacing={4} mb={5}>
                           <Grid size={{ xs: 12, md: 6 }}>
                              <Card variant="outlined" sx={{ p: 3, height: '100%', borderRadius: 4, transition: 'all 0.2s', '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover' } }}>
                                 <Layout size={32} color={theme.palette.info.main} style={{ marginBottom: 16 }} />
                                 <Typography variant="subtitle2" fontWeight={900} textTransform="uppercase" gutterBottom>Hybrid Architecture</Typography>
                                 <Typography variant="caption" color="text.secondary" lineHeight={1.6}>Integration of modern frameworks for better user experience.</Typography>
                              </Card>
                           </Grid>
                           <Grid size={{ xs: 12, md: 6 }}>
                              <Card variant="outlined" sx={{ p: 3, height: '100%', borderRadius: 4, transition: 'all 0.2s', '&:hover': { borderColor: 'success.main', bgcolor: 'action.hover' } }}>
                                 <ShieldCheck size={32} color={theme.palette.success.main} style={{ marginBottom: 16 }} />
                                 <Typography variant="subtitle2" fontWeight={900} textTransform="uppercase" gutterBottom>Security Verified</Typography>
                                 <Typography variant="caption" color="text.secondary" lineHeight={1.6}>Advanced security measures ensure your data is safe and protected.</Typography>
                              </Card>
                           </Grid>
                        </Grid>

                        <Typography variant="body2" color="text.secondary" lineHeight={1.8}>
                           Members are reminded that the Wiki is the official source for guild rules. All activity is logged for security purposes.
                        </Typography>
                     </Box>

                     <Box sx={{ mt: 6, pt: 3, borderTop: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                         <AvatarGroup max={5} sx={{ '& .MuiAvatar-root': { width: 32, height: 32, fontSize: '0.7rem' } }}>
                            {[1,2,3,4,5].map(i => <Avatar key={i} />)}
                         </AvatarGroup>
                         <Button size="small" endIcon={<ExternalLink size={14} />} sx={{ fontWeight: 900, letterSpacing: '0.1em' }}>
                            Share Intel
                         </Button>
                     </Box>
                  </CardContent>
               </Card>
            ) : (
               <Box sx={{ height: '100%', minHeight: 400, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.3 }}>
                  <BookOpen size={64} style={{ marginBottom: 16 }} />
                  <Typography variant="overline" fontWeight={900} letterSpacing="0.2em">Select Intelligence...</Typography>
               </Box>
            )}
         </Grid>
      </Grid>
    </Box>
  );
}
