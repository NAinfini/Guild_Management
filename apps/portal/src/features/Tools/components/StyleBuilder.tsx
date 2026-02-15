import React, { useState, useMemo } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  Button, 
  Chip, 
  Typography, 
  Box, 
  Stack, 
  TextField, 
  Grid,
  useTheme,
  alpha
} from '@/ui-bridge/material';
import { 
  Refresh, 
  Palette, 
  TextFields, 
  AutoAwesome,
  Layers,
  ElectricBolt,
  Check,
  ContentCopy,
  Build
} from '@/ui-bridge/icons-material';
import { useTranslation } from 'react-i18next';
import { sanitizeHtml } from '../../../lib/utils';

export function StyleBuilder() {
  const { t } = useTranslation();
  const theme = useTheme();
  
  const [text, setText] = useState('');
  const [color, setColor] = useState('#3b82f6');
  const [isBold, setIsBold] = useState(true);
  const [isItalic, setIsItalic] = useState(false);
  const [hasGlow, setHasGlow] = useState(true);
  const [hasShadow, setHasShadow] = useState(false);
  const [hasGradient, setHasGradient] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const colors = [
    { name: 'Primary', hex: '#3b82f6' },
    { name: 'Success', hex: '#22c55e' },
    { name: 'Warning', hex: '#eab308' },
    { name: 'Destructive', hex: '#ef4444' },
    { name: 'Purple', hex: '#a855f7' },
    { name: 'Pink', hex: '#ec4899' },
    { name: 'Gold', hex: '#fbbf24' },
    { name: 'Silver', hex: '#94a3b8' },
  ];
  const cardRadius = 'var(--cmp-card-radius)';
  const surfaceRadius = 'var(--cmp-input-radius)';

  const generatedHtml = useMemo(() => {
    let styles = `color: ${color};`;
    if (isBold) styles += ' font-weight: 900;';
    if (isItalic) styles += ' font-style: italic;';
    
    let textShadow = '';
    if (hasGlow) textShadow += `0 0 10px ${color}80`;
    if (hasShadow) textShadow += `${textShadow ? ', ' : ''}2px 2px 4px rgba(0,0,0,0.5)`;
    if (textShadow) styles += ` text-shadow: ${textShadow};`;

    if (hasGradient) {
      return `<span style="background: linear-gradient(to right, ${color}, #ffffff); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 900; display: inline-block;">${text || 'Preview'}</span>`;
    }

    return `<span style="${styles}">${text || 'Preview'}</span>`;
  }, [text, color, isBold, isItalic, hasGlow, hasShadow, hasGradient]);

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedHtml);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const reset = () => {
    setText('');
    setColor('#3b82f6');
    setIsBold(true);
    setIsItalic(false);
    setHasGlow(true);
    setHasShadow(false);
    setHasGradient(false);
  };

  return (
    <Grid container spacing={4}>
         {/* Editor Side */}
         <Grid size={{ xs: 12, lg: 6 }}>
            <Card sx={{ borderRadius: cardRadius }}>
               <CardHeader 
                  title={<Typography variant="h6" fontWeight={900} fontStyle="italic" textTransform="uppercase">{t('tools.builder_title')}</Typography>}
                  subheader={<Typography variant="caption" fontWeight={900} textTransform="uppercase" letterSpacing="0.1em" color="text.secondary">{t('tools.builder_subtitle')}</Typography>}
                  action={
                     <Button size="small" variant="text" onClick={reset} startIcon={<Refresh sx={{ fontSize: 14 }} />} sx={{ fontWeight: 900 }}>
                        {t('common.reset')}
                     </Button>
                  }
                  sx={{ borderBottom: 1, borderColor: 'divider' }}
               />
               <CardContent sx={{ p: 4 }}>
                  <Stack spacing={4}>
                     <TextField 
                        label={t('tools.input_label')} 
                        placeholder={t('tools.input_placeholder')} 
                        value={text} 
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setText(e.target.value)} 
                        fullWidth 
                     />
                     
                     <Box>
                        <Typography variant="caption" fontWeight={900} textTransform="uppercase" color="text.secondary" display="block" mb={2} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                           <Palette sx={{ fontSize: 14 }} /> {t('tools.color_pick')}
                        </Typography>
                        <Grid container spacing={1}>
                           {colors.map(c => (
                              <Grid key={c.hex}>
                                 <Box 
                                    onClick={() => setColor(c.hex)}
                                    sx={{ 
                                       width: 36, height: 36, borderRadius: 1, bgcolor: c.hex, cursor: 'pointer',
                                       border: color === c.hex ? `2px solid ${theme.palette.text.primary}` : '2px solid transparent',
                                       transform: color === c.hex ? 'scale(1.1)' : 'scale(1)',
                                       transition: 'all 0.2s'
                                    }}
                                 />
                              </Grid>
                           ))}
                           <Grid>
                               <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, borderRadius: 1, border: `1px solid ${theme.palette.divider}`, px: 1, height: 36 }}>
                                   <input type="color" value={color} onChange={e => setColor(e.target.value)} style={{ width: 24, height: 24, padding: 0, border: 'none', background: 'none' }} />
                                   <Typography variant="caption" fontFamily="monospace" fontWeight={700}>{color}</Typography>
                               </Box>
                           </Grid>
                        </Grid>
                     </Box>

                     <Box>
                        <Typography variant="caption" fontWeight={900} textTransform="uppercase" color="text.secondary" display="block" mb={2} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                           <Layers sx={{ fontSize: 14 }} /> {t('tools.style_options')}
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                           <StyleChip icon={TextFields} label={t('tools.bold')} active={isBold} onClick={() => setIsBold(!isBold)} />
                           <StyleChip icon={TextFields} label={t('tools.italic')} active={isItalic} onClick={() => setIsItalic(!isItalic)} />
                           <StyleChip icon={AutoAwesome} label={t('tools.glow')} active={hasGlow} onClick={() => setHasGlow(!hasGlow)} />
                           <StyleChip icon={AutoAwesome} label={t('tools.shadow')} active={hasShadow} onClick={() => setHasShadow(!hasShadow)} />
                           <StyleChip icon={ElectricBolt} label={t('tools.gradient')} active={hasGradient} onClick={() => setHasGradient(!hasGradient)} />
                        </Box>
                     </Box>
                  </Stack>
               </CardContent>
            </Card>
         </Grid>

         {/* Preview Side */}
         <Grid size={{ xs: 12, lg: 6 }}>
             <Stack spacing={3}>
                <Card sx={{ borderRadius: cardRadius, overflow: 'hidden', position: 'relative' }}>
                    <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: alpha('#000', 0.8), p: 4, position: 'relative' }}>
                        <Box sx={{ position: 'absolute', top: 16, left: 16 }}>
                           <Chip label={t('tools.preview_label')} size="small" variant="outlined" sx={{ fontWeight: 900, fontSize: '0.6rem' }} />
                        </Box>
                        <Typography variant="h3" sx={{ wordBreak: 'break-word', textAlign: 'center' }}>
                            <span dangerouslySetInnerHTML={sanitizeHtml(generatedHtml)} />
                        </Typography>
                        <Build sx={{ position: 'absolute', bottom: -20, right: -20, width: 160, height: 160, opacity: 0.05, transform: 'rotate(-45deg)' }} />
                    </Box>
                </Card>

                <Card sx={{ borderRadius: cardRadius }}>
                   <CardHeader 
                      title={<Chip label={t('tools.output_label')} size="small" color="primary" sx={{ fontWeight: 900, borderRadius: 1 }} />}
                      action={
                         <Button 
                            variant="contained" 
                            color={isCopied ? 'success' : 'primary'} 
                            onClick={handleCopy} 
                            startIcon={isCopied ? <Check sx={{ fontSize: 16 }} /> : <ContentCopy sx={{ fontSize: 16 }} />}
                            sx={{ fontWeight: 900 }}
                         >
                            {isCopied ? t('common.copied') : t('tools.copy_cipher')}
                         </Button>
                      }
                      sx={{ borderBottom: 1, borderColor: 'divider', p: 3 }}
                   />
                   <CardContent sx={{ p: 3 }}>
                      <Box sx={{ p: 3, bgcolor: 'background.default', borderRadius: surfaceRadius, border: `1px solid ${theme.palette.divider}` }}>
                           <Typography variant="caption" fontFamily="monospace" sx={{ wordBreak: 'break-all', color: 'primary.light' }}>
                               {generatedHtml}
                           </Typography>
                      </Box>
                   </CardContent>
                </Card>
             </Stack>
         </Grid>
      </Grid>
  );
}

interface StyleChipProps {
  icon: React.ElementType;
  label: string;
  active: boolean;
  onClick: () => void;
}

function StyleChip({ icon: Icon, label, active, onClick }: StyleChipProps) {
    const theme = useTheme();
    return (
        <Chip 
            icon={<Icon sx={{ fontSize: 14, color: active ? theme.palette.primary.contrastText : theme.palette.text.secondary }} />} 
            label={label} 
            onClick={onClick} 
            variant={active ? 'filled' : 'outlined'} 
            color={active ? 'primary' : 'default'}
            sx={{ fontWeight: 900, textTransform: 'uppercase', fontSize: '0.65rem', height: 32, px: 1 }}
        />
    )
}
