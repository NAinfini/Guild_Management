import React, { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useUIStore } from '@/store';
import {
  MarkdownRenderer,
  PageContainer,
  PrimitiveBadge,
  PrimitiveCard,
  PrimitiveCardContent,
  PrimitiveHeading,
  PrimitiveText,
} from '@/components';
import { slugifyMarkdownHeading } from '@/components/data-display/MarkdownRenderer';
import styles from './Wiki.module.css';

interface TocItem {
  id: string;
  level: 2 | 3;
  title: string;
}

function extractToc(markdown: string): TocItem[] {
  const rows = markdown.split('\n');
  const items: TocItem[] = [];

  rows.forEach((row) => {
    const match = row.match(/^(#{2,3})\s+(.+)$/);
    if (!match) return;

    const level = match[1].length as 2 | 3;
    const title = match[2].trim();
    const id = slugifyMarkdownHeading(title);
    if (!id) return;

    items.push({ id, level, title });
  });

  return items;
}

export function Wiki() {
  const { t } = useTranslation();
  const { setPageTitle } = useUIStore();

  useEffect(() => {
    setPageTitle(t('nav.wiki'));
  }, [setPageTitle, t]);

  const markdown = useMemo(
    () => [
      `# ${t('wiki.launch_title')}`,
      '',
      `${t('wiki.launch_content')}`,
      '',
      `## ${t('wiki.latest_update')}`,
      '',
      `${t('wiki.launch_content')}`,
      '',
      `## ${t('wiki.card_hybrid_title')}`,
      '',
      `${t('wiki.card_hybrid_desc')}`,
      '',
      `## ${t('wiki.card_security_title')}`,
      '',
      `${t('wiki.card_security_desc')}`,
      '',
      `## ${t('wiki.tag_migration')}`,
      '',
      `${t('wiki.footer_disclaimer')}`,
    ].join('\n'),
    [t],
  );

  const tocItems = useMemo(() => extractToc(markdown), [markdown]);

  return (
    <PageContainer width="narrow" spacing="normal" data-testid="wiki-page">
      {/* Explicit h1/subtitle improves page-level hierarchy for assistive tech and visual rhythm. */}
      <header className={styles.pageHeader}>
        <PrimitiveHeading level={1} className={styles.pageTitle}>
          {t('wiki.title')}
        </PrimitiveHeading>
        <PrimitiveText as="p" size="sm" color="secondary" className={styles.pageSubtitle}>
          {t('wiki.subtitle')}
        </PrimitiveText>
      </header>

      <div className={styles.layout}>
        <aside className={styles.tocColumn}>
          <PrimitiveCard variant="outlined" className={styles.tocCard}>
            <PrimitiveCardContent>
              <PrimitiveHeading level={3} className={styles.tocTitle}>
                {t('wiki.article_latest')}
              </PrimitiveHeading>
              <nav data-testid="wiki-toc" aria-label={t('wiki.article_latest')}>
                <ol className={styles.tocList}>
                  {tocItems.map((item) => (
                    <li key={item.id} className={item.level === 3 ? styles.tocNestedItem : styles.tocItem}>
                      <a href={`#${item.id}`} className={styles.tocLink}>
                        {item.title}
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>
            </PrimitiveCardContent>
          </PrimitiveCard>
        </aside>

        <section data-testid="wiki-article" className={styles.articleColumn}>
          <PrimitiveCard variant="elevated">
            <PrimitiveCardContent className={styles.articleContent}>
              <div className={styles.articleHeader}>
                <PrimitiveBadge variant="info" size="sm">
                  {t('wiki.label_article')}
                </PrimitiveBadge>
                <PrimitiveText as="span" size="xs" color="tertiary">
                  {t('wiki.launch_date')}
                </PrimitiveText>
              </div>

              <div className={styles.markdownSurface}>
                <MarkdownRenderer>{markdown}</MarkdownRenderer>
              </div>
            </PrimitiveCardContent>
          </PrimitiveCard>
        </section>
      </div>
    </PageContainer>
  );
}
