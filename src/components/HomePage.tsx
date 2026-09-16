import { pageContent } from '../lib/content';
import type { PageSection } from '../content-data/pages.schema';
import AdminSessionGate from './admin/AdminSessionGate';
import { AdminProvider } from '../lib/admin/admin-context';
import SiteFooter from './SiteFooter';
import SiteHeader from './SiteHeader';
import PageSections from './PageSections';

type HomeSpecialty = {
  slug: string;
  title: string;
  description: string;
};

type HomePageProps = {
  specialties: HomeSpecialty[];
};

const content = pageContent.home;

function HomePageContent({ specialties }: HomePageProps) {
  return (
    <div className="bg-background min-h-screen pb-24">
      <SiteHeader />
      <main>
        <PageSections
          sourceId="pages.home"
          sections={content.sections as PageSection[]}
          specialties={specialties}
        />
      </main>
      <SiteFooter />
      <AdminSessionGate>{null}</AdminSessionGate>
    </div>
  );
}

export default function HomePage(props: HomePageProps) {
  return (
    <AdminProvider>
      <HomePageContent {...props} />
    </AdminProvider>
  );
}
