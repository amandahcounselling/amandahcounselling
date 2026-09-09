import type { ReactNode } from 'react';
import { AdminProvider } from '../../lib/admin/admin-context';
import EditModeToolbar from './EditModeToolbar';

export default function AdminShell({ children }: { children: ReactNode }) {
  return (
    <AdminProvider>
      {children}
      <EditModeToolbar />
    </AdminProvider>
  );
}
