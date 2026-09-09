import AdminApp from './AdminApp';
import AdminShell from './AdminShell';

type AdminPageProps = {
  view: 'dashboard' | 'settings' | 'faq' | 'fees';
};

export default function AdminPage({ view }: AdminPageProps) {
  return (
    <AdminShell>
      <AdminApp view={view} />
    </AdminShell>
  );
}
