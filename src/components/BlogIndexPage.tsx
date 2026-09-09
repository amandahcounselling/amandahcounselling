import { ArrowRight } from 'lucide-react';
import { pageContent } from '../lib/content';
import { withBase } from '../lib/paths';
import ContentField from './admin/ContentField';
import PageShell from './PageShell';

export type BlogSummary = {
  slug: string;
  title: string;
  description: string;
  pubDate: string;
  heroImage?: string;
};

type BlogIndexPageProps = {
  posts: BlogSummary[];
};

const content = pageContent.blog;

export default function BlogIndexPage({ posts }: BlogIndexPageProps) {
  return (
    <PageShell
      eyebrow={content.shell.eyebrow}
      title={content.shell.title}
      description={content.shell.description}
    >
      <section className="px-6 py-16 lg:px-8">
        <div className="mx-auto grid max-w-5xl gap-8">
          {posts.map((post) => (
            <article
              key={post.slug}
              className="bg-card grid overflow-hidden rounded-[2rem] border border-border shadow-sm md:grid-cols-[0.8fr_1.2fr]"
            >
              {post.heroImage && (
                <img
                  src={withBase(post.heroImage)}
                  alt=""
                  className="h-64 w-full object-cover md:h-full"
                />
              )}
              <div className="space-y-4 p-6 md:p-8">
                <p className="text-primary text-sm font-bold">
                  {new Date(post.pubDate).toLocaleDateString('en', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
                <h2 className="font-heading text-foreground text-3xl font-bold">
                  {post.title}
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  {post.description}
                </p>
                <a
                  href={withBase(`/blog/${post.slug}`)}
                  className="text-primary inline-flex items-center gap-2 font-bold"
                >
                  <ContentField
                    sourceId="pages.blog"
                    path="readArticleLabel"
                    fallback={content.readArticleLabel}
                  />
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
