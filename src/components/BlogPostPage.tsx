import { ArrowLeft } from 'lucide-react';
import { withBase } from '../lib/paths';

type BlogPostPageProps = {
  post: {
    title: string;
    description: string;
    pubDate: string;
    heroImage?: string;
  };
};

export default function BlogPostPage({ post }: BlogPostPageProps) {
  return (
    <section className="from-primary/10 via-background to-secondary/20 bg-gradient-to-br px-6 py-14 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <a
          href={withBase('/blog')}
          className="text-primary inline-flex items-center gap-2 text-sm font-bold"
        >
          <ArrowLeft className="h-4 w-4" />
          All posts
        </a>
        <p className="text-primary text-sm font-bold uppercase tracking-[0.2em]">
          {new Date(post.pubDate).toLocaleDateString('en', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          })}
        </p>
        <h1 className="font-heading text-foreground text-4xl font-bold md:text-6xl">
          {post.title}
        </h1>
        <p className="text-muted-foreground text-lg leading-relaxed">
          {post.description}
        </p>
        {post.heroImage && (
          <img
            src={withBase(post.heroImage)}
            alt=""
            className="mt-8 h-80 w-full rounded-[2rem] object-cover shadow-lg"
          />
        )}
      </div>
    </section>
  );
}
