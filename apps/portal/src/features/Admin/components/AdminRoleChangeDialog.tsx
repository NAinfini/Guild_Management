import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@/ui-bridge/material';
import { type Role } from '../../../types';

type TranslateFn = (key: string, options?: Record<string, unknown>) => string;

interface DialogToken {
  bg?: string;
  border?: string;
  shadow?: string;
}

interface AdminRoleChangeDialogProps {
  open: boolean;
  pendingRole: Role;
  memberUsername: string;
  online: boolean;
  dialogToken?: DialogToken;
  t: TranslateFn;
  onCancel: () => void;
  onConfirm: (role: Role) => void;
}

export default function AdminRoleChangeDialog({
  open,
  pendingRole,
  memberUsername,
  online,
  dialogToken,
  t,
  onCancel,
  onConfirm,
}: AdminRoleChangeDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      PaperProps={{
        sx: {
          bgcolor: dialogToken?.bg || 'background.paper',
          border: '1px solid',
          borderColor: dialogToken?.border || 'divider',
          boxShadow: dialogToken?.shadow || 'none',
          borderRadius: 'var(--cmp-dialog-radius, 16px)',
        },
      }}
    >
      <DialogTitle>{t('admin.confirm_role_change') || 'Confirm role change'}</DialogTitle>
      <DialogContent>
        <Typography variant="body2">
          {t('admin.confirm_role_body') || `Change ${memberUsername} to ${pendingRole}? This requires admin confirmation.`}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>{t('common.cancel') || 'Cancel'}</Button>
        <Button variant="contained" color="warning" disabled={!online} onClick={() => onConfirm(pendingRole)}>
          {t('common.confirm') || 'Confirm'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
