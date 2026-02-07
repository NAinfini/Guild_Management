
import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Stack, 
  Grid,
  useTheme,
  alpha,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton
} from '@mui/material';
import { 
  Wrench, 
  Palette, 
  Calculator, 
  Swords, 
  Download,
  ArrowRight,
  X
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from '@tanstack/react-router';
import { StyleBuilder } from './components/StyleBuilder';
import { ThemeShowcase } from './components/ThemeShowcase';
import { useUIStore } from '../../store';

interface Tool {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
  type: 'modal' | 'route';
  path?: string;
}

export function Tools() {
  const { t } = useTranslation();
  const { setPageTitle } = useUIStore();
  const theme = useTheme();
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);

  useEffect(() => {
    setPageTitle(t('nav.tools'));
  }, [setPageTitle, t]);

  const tools: Tool[] = [
    {
      id: 'theme-lab',
      title: t('tools.theme_lab_title'),
      description: t('tools.theme_lab_subtitle'),
      icon: Palette,
      color: theme.palette.secondary.main,
      type: 'modal'
    },
    {
      id: 'style-builder',
      title: t('tools.builder_title'),
      description: t('tools.builder_subtitle'),
      icon: Wrench,
      color: theme.palette.primary.main,
      type: 'modal'
    }
  ];

  const navigate = useNavigate();

  const handleToolClick = (tool: Tool) => {
    if (tool.type === 'modal') {
      setSelectedTool(tool);
    } else if (tool.path) {
      navigate({ to: tool.path });
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', pb: 10, px: { xs: 2, sm: 4 } }}>

      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, 
        gap: 3 
      }}>
         {tools.map(tool => (
            <Card 
               key={tool.id}
               onClick={() => handleToolClick(tool)}
               sx={{ 
                  height: '100%',
                  cursor: 'pointer', 
                  borderRadius: 5, 
                  border: `1px solid ${theme.palette.divider}`,
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  padding: 0,
                  position: 'relative',
                  overflow: 'hidden',
                  '&:hover': {
                     transform: 'translateY(-8px)',
                     borderColor: tool.color,
                     boxShadow: `0 20px 40px ${alpha(tool.color, 0.15)}`,
                     '& .tool-icon': {
                        transform: 'scale(1.2) rotate(10deg)',
                        color: tool.color
                     },
                     '& .tool-arrow': {
                        transform: 'translateX(4px)',
                        opacity: 1
                     }
                  }
               }}
            >
               <CardContent sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Box 
                     className="tool-icon"
                     sx={{ 
                        width: 56, height: 56, borderRadius: 3, 
                        bgcolor: alpha(tool.color, 0.1), 
                        display: 'flex', alignItems: 'center', justifyContent: 'center', 
                        color: 'text.secondary', mb: 3,
                        transition: 'all 0.3s'
                     }}
                  >
                     <tool.icon size={28} />
                  </Box>
                  
                  <Typography variant="h5" fontWeight={900} textTransform="uppercase" gutterBottom>
                     {tool.title}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 4, flex: 1, lineHeight: 1.6 }}>
                     {tool.description}
                  </Typography>

                  <Stack direction="row" alignItems="center" spacing={1} sx={{ color: tool.color }}>
                     <Typography variant="caption" fontWeight={900} textTransform="uppercase" letterSpacing="0.1em">
                         {tool.type === 'modal' ? t('tools.open_tool') : t('tools.go_to_page')}
                     </Typography>
                     <ArrowRight className="tool-arrow" size={14} style={{ transition: 'all 0.3s', opacity: 0.5 }} />
                  </Stack>
               </CardContent>
            </Card>
         ))}
      </Box>

      {/* Tool Modal */}
      <Dialog 
        open={!!selectedTool} 
        onClose={() => setSelectedTool(null)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: { 
            borderRadius: 6, 
            bgcolor: 'background.paper',
            backgroundImage: 'none',
            overflow: 'hidden'
          }
        }}
      >
        <DialogTitle sx={{ p: 4, pb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
           <Typography variant="h4" component="span" fontWeight={900} textTransform="uppercase" fontStyle="italic">
              {selectedTool?.title}
           </Typography>
           <IconButton onClick={() => setSelectedTool(null)} sx={{ color: 'text.secondary' }}>
              <X size={24} />
           </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 4, pt: 2 }}>
           {selectedTool?.id === 'theme-lab' && <ThemeShowcase />}
           {selectedTool?.id === 'style-builder' && <StyleBuilder />}
           {selectedTool?.id !== 'style-builder' && selectedTool?.id !== 'theme-lab' && (
              <Box sx={{ py: 10, textAlign: 'center', opacity: 0.5 }}>
                 <Wrench size={48} style={{ margin: '0 auto', marginBottom: 16 }} />
                  <Typography variant="h6" fontWeight={800}>{t('tools.coming_soon')}</Typography>
                  <Typography variant="caption" textTransform="uppercase">{t('tools.under_development')}</Typography>
              </Box>
           )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}
