import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { projects } from '@/lib/content';
import { siteUrl } from '@/lib/site';

type Props = { params: Promise<{ slug: string }> };
export const dynamicParams = false;
export function generateStaticParams() {
  return projects.map(({ slug }) => ({ slug }));
}
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = projects.find((p) => p.slug === slug);
  return p
    ? {
        title: p.title,
        description: p.summary,
        alternates: siteUrl ? { canonical: '/projects/' + slug } : undefined,
      }
    : {};
}
export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const index = projects.findIndex((p) => p.slug === slug);
  if (index < 0) notFound();
  const p = projects[index],
    next = projects[(index + 1) % projects.length];
  return (
    <div id="top">
      <Header />
      <main id="main" className="shell detail">
        <Link className="back" href="/#work">
          ← Project index
        </Link>
        <div className="section-label">
          <span className="marker" />
          Project 0{index + 1} / {p.category}
        </div>
        <h1>
          {p.title}
          <span className="mint">.</span>
        </h1>
        <p className="lead">{p.summary}</p>
        <div className="detail-meta">
          <span>{p.status}</span>
          <span>{p.stack.join(' · ')}</span>
        </div>
        <figure className={'detail-image project-preview preview-' + p.image}>
          <Image
            src={'/projects/' + p.image + '.webp'}
            width={1360}
            height={840}
            sizes="(max-width: 768px) 94vw, 80vw"
            alt={p.alt}
            priority
          />
        </figure>
        <div className="case-body">
          <h2>Inside the project</h2>
          <div>
            <p className="lead">{p.overview}</p>
            {p.decisions.map((s) => (
              <section key={s.title}>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
              </section>
            ))}
            <div className="actions">
              {p.demo && (
                <a className="button primary" href={p.demo}>
                  Open demo
                </a>
              )}
              <a className="button secondary" href={p.repository}>
                GitHub repository
              </a>
            </div>
          </div>
        </div>
        <Link className="next-project" href={'/projects/' + next.slug}>
          <span className="section-label">Next project</span>
          <strong>{next.title} ↗</strong>
        </Link>
      </main>
      <Footer />
    </div>
  );
}
