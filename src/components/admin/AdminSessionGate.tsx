import type { ReactNode } from 'react';
import { useOptionalAdmin } from '../../lib/admin/admin-context';
import EditModeToolbar from './EditModeToolbar';

type AdminSessionGateProps = {
  children?: ReactNode;
};

/** Defer auth-dependent toolbar UI until the client session has been restored from storage. */
export default function AdminSessionGate({ children }: AdminSessionGateProps) {
  const admin = useOptionalAdmin();

  return (
    <>
      {children}
      {admin ? <EditModeToolbar /> : null}
    </>
  );
}
