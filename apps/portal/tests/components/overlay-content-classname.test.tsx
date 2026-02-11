import React from 'react';
import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { Drawer, DrawerContent } from '@/components/layout/Drawer';
import { DropdownMenu, DropdownMenuContent } from '@/components/advanced/DropdownMenu';
import { ContextMenuContent } from '@/components/advanced/ContextMenu';
import { AlertDialog, AlertDialogContent } from '@/components/feedback/AlertDialog';
import { HoverCard, HoverCardContent } from '@/components/feedback/HoverCard';
import { Popover, PopoverContent } from '@/components/feedback/Popover';

describe('overlay content className handling', () => {
  it('accepts string className props without throwing', () => {
    expect(() =>
      render(
        <Drawer open onOpenChange={() => undefined}>
          <DrawerContent className="test-class">drawer</DrawerContent>
        </Drawer>
      )
    ).not.toThrow();

    expect(() =>
      render(
        <DropdownMenu>
          <DropdownMenuContent className="test-class">dropdown</DropdownMenuContent>
        </DropdownMenu>
      )
    ).not.toThrow();

    expect(() =>
      render(
        <ContextMenuContent
          className="test-class"
          open={false}
          anchorReference="anchorPosition"
          anchorPosition={undefined}
          onClose={() => undefined}
        >
          context
        </ContextMenuContent>
      )
    ).not.toThrow();

    expect(() =>
      render(
        <AlertDialog open onOpenChange={() => undefined}>
          <AlertDialogContent className="test-class">alert</AlertDialogContent>
        </AlertDialog>
      )
    ).not.toThrow();

    expect(() =>
      render(
        <HoverCard>
          <HoverCardContent className="test-class">hover</HoverCardContent>
        </HoverCard>
      )
    ).not.toThrow();

    expect(() =>
      render(
        <Popover open onOpenChange={() => undefined}>
          <PopoverContent className="test-class">popover</PopoverContent>
        </Popover>
      )
    ).not.toThrow();
  });
});
