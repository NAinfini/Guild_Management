import { createFileRoute } from '@tanstack/react-router';
import { Settings as SettingsPage } from '../../features/Settings';

export const Route = createFileRoute('/_layout/settings')({
  component: SettingsPage,
});
