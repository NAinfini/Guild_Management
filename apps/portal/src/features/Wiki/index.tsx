
import React, { useState, useEffect } from 'react';
import { 
  MenuBook, 
  Search, 
  AccessTime, 
  ChevronRight, 
  Info,
  OpenInNew,
  Bookmarks,
  Dashboard as DashboardIcon,
  Memory,
  VerifiedUser,
  ElectricBolt
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { cn } from '../../lib/utils';
import { useUIStore } from '../../store';

// Nexus Configuration
import { 
  Card, 
  CardContent,
  Button,
  Badge,
  Input,
  Avatar,
  AvatarFallback,
  AvatarImage,
  ScrollArea
} from '@/components';

export function Wiki() {
  const { t } = useTranslation();
  const { setPageTitle } = useUIStore();
  const [activeArticle, setActiveArticle] = useState('launch');
  const [search, setSearch] = useState('');

  useEffect(() => {
    setPageTitle(t('nav.wiki'));
  }, [setPageTitle, t]);

  interface Article {
    id: string;
    title: string;
    category: string;
    date: string;
    icon: React.ElementType<{ className?: string }>;
    colorClass: string;
    bgClass: string;
    isDummy?: boolean;
  }

  const articles: Article[] = [
    {
      id: 'launch',
      title: t('wiki.launch_title'),
      category: 'system',
      date: t('wiki.launch_date'),
      icon: Memory,
      colorClass: 'text-primary',
      bgClass: 'bg-primary/10'
    },
    /* Coming Soon articles removed for production release */
  ];

  const filteredArticles = articles.filter(a => 
    a.title.toLowerCase().includes(search.toLowerCase()) || 
    a.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-[1200px] mx-auto pb-10 px-4 sm:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         {/* Navigation Sidebar */}
         <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="relative">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
               <Input 
                  placeholder={t('wiki.search_placeholder')}
                  value={search}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
                  className="pl-9 rounded-xl"
               />
            </div>

            <div>
               <h3 className="text-xs font-black uppercase text-muted-foreground mb-4 px-1">
                  {t('wiki.article_latest')}
               </h3>
               <div className="flex flex-col gap-4">
                  {filteredArticles.map(article => (
                     <Card 
                        key={article.id}
                        onClick={() => !article.isDummy && setActiveArticle(article.id)}
                        className={cn(
                            "p-4 rounded-xl flex flex-row items-center gap-4 border cursor-pointer transition-all hover:translate-x-1 hover:shadow-sm",
                            activeArticle === article.id ? "border-primary bg-primary/5" : "bg-card",
                            article.isDummy && "opacity-60 cursor-not-allowed hover:bg-transparent hover:translate-x-0"
                        )}
                     >
                        <Avatar className={cn("bg-background/50 rounded-lg h-10 w-10", article.colorClass)}>
                           <div className="flex items-center justify-center w-full h-full">
                               <article.icon className="w-5 h-5" />
                           </div>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                           <div className="flex flex-row justify-between items-center mb-1">
                              <Badge variant="outline" className="h-4 text-[0.55rem] font-black uppercase px-1.5">
                                  {t(`wiki.category_${article.category}`)}
                              </Badge>
                              <span className="text-[0.6rem] font-mono text-muted-foreground">{article.date}</span>
                           </div>
                           <h4 className="text-sm font-extrabold truncate">{article.title}</h4>
                        </div>
                        {!article.isDummy && (
                            <ChevronRight className={cn(
                                "w-4 h-4", 
                                activeArticle === article.id ? "text-primary" : "text-muted-foreground/50"
                            )} />
                        )}
                     </Card>
                  ))}
               </div>
            </div>
         </div>

         {/* Article Viewer */}
         <div className="lg:col-span-8">
            {activeArticle === 'launch' ? (
               <Card className="rounded-[1.25rem] min-h-[600px] flex flex-col overflow-hidden border-border/50 shadow-sm">
                  <div className="p-8 border-b border-border/50 bg-card/50">
                     <div className="flex items-center gap-4 mb-4">
                        <Badge className="h-5 text-[0.6rem] font-black uppercase rounded bg-primary text-primary-foreground hover:bg-primary/90">
                            {t('wiki.label_article')}
                        </Badge>
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <AccessTime className="w-3 h-3" />
                            <span className="text-caption font-mono uppercase">{t('wiki.launch_date')} 19:30</span>
                        </div>
                     </div>

                     <h1 className="text-3xl md:text-4xl font-black uppercase italic leading-none mb-6">
                        {t('wiki.launch_title')}
                     </h1>

                     <div className="flex items-center gap-x-6 gap-y-2 flex-wrap text-muted-foreground">
                        <div className="flex items-center gap-2">
                           <div className="w-6 h-6 rounded bg-primary/20 text-primary flex items-center justify-center">
                               <Memory className="w-3.5 h-3.5" />
                           </div>
                           <span className="text-xs font-black uppercase">{t('common.active')}</span>
                        </div>
                        <div className="h-4 w-[1px] bg-border" />
                        <div className="flex items-center gap-2">
                             <Bookmarks className="w-3.5 h-3.5" />
                           <span className="text-xs font-black uppercase">{t('wiki.tag_migration')}</span>
                        </div>
                     </div>
                  </div>

                  <CardContent className="p-8 flex-1 flex flex-col">
                     <div className="flex-1">
                        <div className="p-6 bg-primary/5 border-l-4 border-primary rounded-r-2xl mb-8">
                           <div className="flex items-center gap-2 text-primary font-bold mb-2 text-sm uppercase tracking-wide">
                               <Info className="w-4 h-4" /> {t('wiki.latest_update')}
                           </div>
                           <p className="text-lg font-medium italic text-foreground">
                             {t('wiki.launch_content')}
                           </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                           <Card className="p-6 h-full rounded-2xl border transition-all hover:border-[color:var(--sys-interactive-accent)] hover:bg-[color:var(--sys-interactive-hover)] group">
                                 <DashboardIcon className="w-8 h-8 text-primary mb-4 group-hover:scale-110 transition-transform" />
                                 <h4 className="text-sm font-black uppercase mb-2">{t('wiki.card_hybrid_title')}</h4>
                                 <p className="text-xs text-muted-foreground leading-relaxed">{t('wiki.card_hybrid_desc')}</p>
                           </Card>
                           <Card className="p-6 h-full rounded-2xl border transition-all hover:border-[color:var(--color-status-success)] hover:bg-[color:var(--color-status-success-bg)] group">
                                 <VerifiedUser className="w-8 h-8 mb-4 group-hover:scale-110 transition-transform" style={{ color: 'var(--color-status-success)' }} />
                                 <h4 className="text-sm font-black uppercase mb-2">{t('wiki.card_security_title')}</h4>
                                 <p className="text-xs text-muted-foreground leading-relaxed">{t('wiki.card_security_desc')}</p>
                           </Card>
                        </div>

                        <p className="text-sm text-muted-foreground leading-loose">
                           {t('wiki.footer_disclaimer')}
                        </p>
                     </div>

                     <div className="mt-8 pt-6 border-t border-border flex justify-between items-center">
                         {/* Avatar Group Mock - replacing MUI AvatarGroup with simpler manual layout or staying with MUI if no primitive */}
                         {/* Since we don't have AvatarGroup primitive, using a flex container with negative margins */}
                         <div className="flex pl-2">
                            {[1,2,3,4,5].map(i => (
                                <Avatar key={i} className="w-8 h-8 border-2 border-background -ml-2 first:ml-0 bg-muted">
                                    <AvatarFallback>{i}</AvatarFallback>
                                </Avatar>
                            ))}
                         </div>
                          <Button size="sm" variant="ghost" className="font-black tracking-widest uppercase">
                            {t('wiki.share_intel')} <OpenInNew className="w-3.5 h-3.5 ml-2" />
                          </Button>
                     </div>
                  </CardContent>
               </Card>
            ) : (
               <div className="h-full min-h-[400px] flex flex-col items-center justify-center opacity-30 select-none">
                    <MenuBook className="w-16 h-16 mb-4" />
                  <span className="text-sm font-black tracking-[0.2em] uppercase">{t('wiki.select_intel')}</span>
               </div>
            )}
         </div>
      </div>
    </div>
  );
}
