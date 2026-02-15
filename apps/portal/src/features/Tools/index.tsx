import React, { Suspense, lazy, useEffect, useState } from 'react';
import { ArrowUpRight, Wrench, Workflow } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from '@tanstack/react-router';
import { useUIStore } from '@/store';
import {
  Grid,
  PageContainer,
  PrimitiveButton,
  PrimitiveCard,
  PrimitiveCardContent,
  PrimitiveHeading,
  PrimitiveText,
} from '@/components';
import styles from './Tools.module.css';

type ToolType = 'modal' | 'route';

interface ToolConfig {
  id: string;
  title: string;
  description: string;
  type: ToolType;
  path?: string;
}

const TOOL_ICON_MAP = {
  'nexus-controls': Workflow,
  'style-builder': Wrench,
} as const;

const ToolsDialog = lazy(() => import('./components/ToolsDialog'));

export function Tools() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setPageTitle } = useUIStore();
  const [activeTool, setActiveTool] = useState<ToolConfig | null>(null);

  useEffect(() => {
    setPageTitle(t('nav.tools'));
  }, [setPageTitle, t]);

  const tools: ToolConfig[] = [
    {
      id: 'nexus-controls',
      title: t('tools.nexus_controls_title'),
      description: t('tools.nexus_controls_subtitle'),
      type: 'modal',
    },
    {
      id: 'style-builder',
      title: t('tools.builder_title'),
      description: t('tools.builder_subtitle'),
      type: 'modal',
    },
  ];

  const handleToolAction = (tool: ToolConfig) => {
    if (tool.type === 'route' && tool.path) {
      navigate({ to: tool.path });
      return;
    }

    setActiveTool(tool);
  };

  return (
    <PageContainer width="comfortable" spacing="normal" data-testid="tools-page">
      {/* A dedicated page header keeps heading hierarchy consistent with other migrated feature screens. */}
      <header className={styles.pageHeader}>
        <PrimitiveHeading level={1} className={styles.pageTitle}>
          {t('tools.title')}
        </PrimitiveHeading>
        <PrimitiveText as="p" size="sm" color="secondary" className={styles.pageSubtitle}>
          {t('tools.subtitle')}
        </PrimitiveText>
      </header>

      <Grid data-testid="tools-grid" cols={{ mobile: 1, tablet: 2 }} gap="normal">
        {tools.map((tool) => {
          const Icon = TOOL_ICON_MAP[tool.id as keyof typeof TOOL_ICON_MAP] ?? Wrench;

          return (
            <PrimitiveCard key={tool.id} variant="outlined" data-testid={`tool-card-${tool.id}`} className={styles.toolCard}>
              <PrimitiveCardContent className={styles.toolContent}>
                <div className={styles.iconWrap} aria-hidden="true">
                  <Icon size={20} />
                </div>

                <div className={styles.textBlock}>
                  <PrimitiveHeading level={3} className={styles.toolTitle}>
                    {tool.title}
                  </PrimitiveHeading>
                  <PrimitiveText as="p" size="sm" color="secondary">
                    {tool.description}
                  </PrimitiveText>
                </div>

                <PrimitiveButton
                  type="button"
                  variant="secondary"
                  className={styles.toolAction}
                  onClick={() => handleToolAction(tool)}
                  aria-label={tool.title}
                >
                  {tool.title}
                  <ArrowUpRight size={14} />
                </PrimitiveButton>
              </PrimitiveCardContent>
            </PrimitiveCard>
          );
        })}
      </Grid>

      {activeTool ? (
        <Suspense fallback={null}>
          <ToolsDialog
            open={Boolean(activeTool)}
            title={activeTool.title}
            activeToolId={activeTool.id}
            onOpenChange={(open: boolean) => !open && setActiveTool(null)}
            closeLabel={t('common.close')}
          />
        </Suspense>
      ) : null}
    </PageContainer>
  );
}
