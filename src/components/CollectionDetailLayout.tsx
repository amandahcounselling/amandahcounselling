import type { ReactNode } from 'react';
import { AdminProvider } from '../lib/admin/admin-context';
import AdminSessionGate from './admin/AdminSessionGate';
import MarkdownEditorPanel from './admin/MarkdownEditorPanel';
import SiteFooter from './SiteFooter';
import SiteHeader from './SiteHeader';

type CollectionDetailLayoutProps = {
  repoPath: string;
  frontmatter: Record<string, unknown>;
  body: string;
  children: ReactNode;
};

export default function CollectionDetailLayout({
  repoPath,
  frontmatter,
  body,
  children,
}: CollectionDetailLayoutProps) {
  return (
    <AdminProvider>
      <div className="bg-background min-h-screen pb-24">
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
        <MarkdownEditorPanel repoPath={repoPath} frontmatter={frontmatter} body={body} />
        <AdminSessionGate>{null}</AdminSessionGate>
      </div>
    </AdminProvider>
  );
}
