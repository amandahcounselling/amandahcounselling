import { ArrowLeft } from 'lucide-react';
import { withBase } from '../lib/paths';

type SpecialtyPageProps = {
  specialty: {
    title: string;
    description: string;
    heroImage: string;
  };
};

export default function SpecialtyPage({ specialty }: SpecialtyPageProps) {
  return (
    <section className="from-primary/10 via-background to-secondary/20 bg-gradient-to-br px-6 py-14 lg:px-8">
      <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[1fr_0.8fr]">
        <div className="space-y-6">
          <a
            href={withBase('/specialties')}
            className="text-primary inline-flex items-center gap-2 text-sm font-bold"
          >
            <ArrowLeft className="h-4 w-4" />
            All specialties
          </a>
          <div className="space-y-4">
            <p className="text-primary text-sm font-bold uppercase tracking-[0.2em]">
              Specialty
            </p>
            <h1 className="font-heading text-foreground text-4xl font-bold md:text-6xl">
              {specialty.title}
            </h1>
            <p className="text-muted-foreground max-w-2xl text-lg leading-relaxed">
              {specialty.description}
            </p>
          </div>
        </div>
        <img
          src={withBase(specialty.heroImage)}
          alt=""
          className="h-80 w-full rounded-[2rem] object-cover shadow-lg"
        />
      </div>
    </section>
  );
}
