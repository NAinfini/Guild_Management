import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Search } from 'lucide-react';
import {
  Avatar,
  BottomSheetDialog,
  Button,
  PrimitiveInput,
  ScrollArea,
} from '@/components';
import { formatPower } from '@/lib/utils';
import type { User } from '@/types';

type InviteMemberDialogProps = {
  open: boolean;
  onClose: () => void;
  members: User[];
  currentParticipants: User[];
  currentUserId?: string;
  onAdd: (userId: string) => void;
};

export default function InviteMemberDialog({
  open,
  onClose,
  members,
  currentParticipants,
  currentUserId,
  onAdd,
}: InviteMemberDialogProps) {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteError, setInviteError] = useState('');
  const [inviteSuccess, setInviteSuccess] = useState('');

  const availableMembers = members
    .filter((member) => member.id !== currentUserId)
    .filter((member) => !currentParticipants.some((participant) => participant.id === member.id))
    .filter((member) => member.username.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleInviteSubmit = () => {
    const normalized = inviteEmail.trim();
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized);
    if (!isValid) {
      setInviteSuccess('');
      setInviteError(t('events.invalid_email'));
      return;
    }

    setInviteError('');
    setInviteSuccess(t('events.invite_sent'));
    setInviteEmail('');
  };

  return (
    <BottomSheetDialog
      open={open}
      onClose={onClose}
      title={t('events.add_operative')}
      fullWidth
      maxWidth="xs"
    >
      <div className="px-2 pb-3" data-testid="invite-member-dialog">
        <div className="relative mb-2 mt-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <PrimitiveInput
            placeholder={`${t('common.search')}...`}
            value={searchQuery}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(event.target.value)}
            className="h-10 w-full rounded-lg pl-9 text-sm"
            aria-label={t('common.search')}
          />
        </div>

        <ScrollArea className="h-[260px] w-full rounded-md border p-4">
          <ul className="space-y-1 rounded-lg bg-background p-1">
            {availableMembers.map((member) => (
              <li
                key={member.id}
                className="mx-1 w-auto rounded-md px-2 py-1 transition-colors hover:bg-accent/60"
              >
                <div className="flex w-full items-center gap-2">
                  <Avatar src={member.avatar_url} alt={member.username} className="h-8 w-8 rounded-md" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-extrabold">{member.username}</p>
                    <p className="font-mono text-xs text-muted-foreground">{formatPower(member.power)}</p>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-primary"
                    onClick={() => onAdd(member.id)}
                    data-testid={`invite-member-add-${member.id}`}
                    aria-label={`${t('events.add_operative')} ${member.username}`}
                  >
                    <Plus className="h-[18px] w-[18px]" aria-hidden />
                  </Button>
                </div>
              </li>
            ))}
            {availableMembers.length === 0 ? (
              <li className="py-4 text-center text-xs text-muted-foreground">{t('events.no_operations')}</li>
            ) : null}
          </ul>
        </ScrollArea>

        <div className="mt-2.5 flex flex-col gap-1.5">
          <label className="space-y-1">
            <span className="text-xs font-semibold tracking-wide text-muted-foreground">{t('events.invite_email')}</span>
            <PrimitiveInput
              type="email"
              placeholder={t('events.invite_email')}
              value={inviteEmail}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                setInviteEmail(event.target.value);
                if (inviteError) {
                  setInviteError('');
                }
              }}
              aria-label={t('events.invite_email')}
              className="w-full"
            />
          </label>
          {inviteError ? (
            <div
              className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
              role="alert"
              aria-live="assertive"
              aria-atomic="true"
              data-testid="invite-member-error-message"
            >
              {inviteError}
            </div>
          ) : null}
          {inviteSuccess ? (
            <div
              className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300"
              role="status"
              aria-live="polite"
              aria-atomic="true"
              data-testid="invite-member-success-message"
            >
              {inviteSuccess}
            </div>
          ) : null}
          <Button
            variant="outline"
            onClick={handleInviteSubmit}
            data-testid="invite-member-submit"
          >
            {t('common.invite')}
          </Button>
        </div>
      </div>
    </BottomSheetDialog>
  );
}
