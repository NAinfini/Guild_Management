import React from 'react';
import {
  PrimitiveDialog,
  PrimitiveDialogContent,
  PrimitiveDialogHeader,
  PrimitiveDialogTitle,
} from '@/components';
import { NexusControlStudio } from '@/features/Tools/components/NexusControlStudio';
import { StyleBuilder } from '@/features/Tools/components/StyleBuilder';
import styles from '../Tools.module.css';

interface ToolsDialogProps {
  open: boolean;
  title: string;
  activeToolId: string;
  onOpenChange: (open: boolean) => void;
  closeLabel: string;
}

export default function ToolsDialog({ open, title, activeToolId, onOpenChange, closeLabel }: ToolsDialogProps) {
  return (
    <PrimitiveDialog open={open} onOpenChange={onOpenChange}>
      <PrimitiveDialogContent
        data-testid="tools-dialog"
        className={styles.dialogPanel}
        closeLabel={closeLabel}
        aria-describedby={undefined}
      >
        <PrimitiveDialogHeader>
          <PrimitiveDialogTitle>{title}</PrimitiveDialogTitle>
        </PrimitiveDialogHeader>

        {activeToolId === 'nexus-controls' ? <NexusControlStudio /> : null}
        {activeToolId === 'style-builder' ? <StyleBuilder /> : null}
      </PrimitiveDialogContent>
    </PrimitiveDialog>
  );
}
