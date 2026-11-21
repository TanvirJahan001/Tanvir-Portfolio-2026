import type { CSSProperties } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Orbit from '@/components/Orbit';
import LocalTime from '@/components/LocalTime';
import { experience, profile, projects, skills } from '@/lib/content';
import { siteUrl } from '@/lib/site';

export const metadata: Metadata = {
  alternates: siteUrl ? { canonical: '/' } : undefined,
};
export default function Home() {
  return (
    <div id="top">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Person',
            name: profile.name,
            jobTitle: profile.role,
            sameAs: [profile.github, profile.linkedin],
            url: siteUrl?.href,
          }),
        }}
      />
      <Header />
      <main id="main">
        <section className="hero shell" aria-labelledby="intro-title">
          <div className="hero-field" aria-hidden="true" />
          <div className="hero-copy">
            <div className="eyebrow hero-kicker">
              <span className="signal" />
              Developer portfolio <span className="muted slash">/</span> 2026
            </div>
            <h1 id="intro-title" aria-label="Tanvir Jahan">
              {['Tanvir', 'Jahan'].map((word, w) => (
                <span className="name-line" key={word} aria-hidden="true">
                  {Array.from(word).map((c, i) => (
                    <span key={i} style={{ '--i': i + w * 6 } as CSSProperties}>
                      {c}
                    </span>
                  ))}
                  {w === 1 && <b>.</b>}
                </span>
              ))}
            </h1>
            <p className="hero-role">
              Full-Stack Developer <span>&amp;</span> Software Engineer
            </p>
            <p className="hero-description">
              I build web applications, business systems and automations that
              make everyday work simpler.
            </p>
            <div className="actions">
              <Link className="button primary" href="#work">
                Explore my work
              </Link>
              <Link
                className="button secondary"
                href="/experience"
                prefetch={false}
              >
                <svg
                  viewBox="0 0 18 18"
                  width="16"
                  height="16"
                  fill="none"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path d="m9 1.5 6.6 3.8v7.4L9 16.5l-6.6-3.8V5.3zM2.4 5.3 9 9l6.6-3.7M9 9v7.5" />
                </svg>
                Enter 3D experience
              </Link>
            </div>
          </div>
          <Orbit />
          <div className="hero-foot">
            <a href="#work">
              <span className="scroll-glyph" aria-hidden="true">
                ↓
              </span>
              Scroll to work
            </a>
            <LocalTime />
          </div>
        </section>

        <section
          className="work shell section"
          id="work"
          aria-labelledby="work-title"
        >
          <div className="section-label">
            <span className="marker" />
            Project index
          </div>
          <div className="section-heading">
            <h2 id="work-title">
              Selected work<span className="mint">.</span>
            </h2>
            <span className="count">[ 01 — 03 ]</span>
          </div>
          <div className="work-grid">
            {projects.map((p, i) => (
              <Link
                data-reveal
                key={p.slug}
                href={'/projects/' + p.slug}
                className={'project-card project-' + i}
              >
                <div className={'project-preview preview-' + p.image}>
                  <Image
                    src={'/projects/' + p.image + '.webp'}
                    width={1100}
                    height={700}
                    sizes={
                      i === 0
                        ? '(max-width: 740px) 90vw, 56vw'
                        : '(max-width: 740px) 90vw, 42vw'
                    }
                    alt={p.alt}
                  />
                </div>
                <div className="project-copy">
                  <div className="project-meta">
                    <span>0{i + 1}</span>
                    <i />
                    {p.category}
                  </div>
                  <h3>{p.title}</h3>
                  <p>{p.summary}</p>
                  <span className="case-link">
                    View project <span aria-hidden="true">↗</span>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section
          className="about shell section"
          id="about"
          aria-labelledby="about-title"
        >
          <div className="section-label">
            <span className="marker" />
            About the developer
          </div>
          <div className="about-intro" data-reveal>
            <h2 id="about-title">
              Behind <br />
              the <em>work.</em>
            </h2>
            <div>
              <p className="lead">
                I’m Tanvir, a full-stack developer based in Rajshahi,
                Bangladesh.
              </p>
              <p>
                I like working close to the people who use a system. A shift
                recorded on a phone, a payroll report on a deadline, a product
                that fits the right device. Those details shape how I design the
                interface and the data underneath it.
              </p>
              <p>
                My current interests are workflow automation, AI integrations
                and motion that makes complex interfaces easier to explore.
              </p>
            </div>
          </div>
          <div className="practice">
            <h3>Experience</h3>
            <div className="practice-rows">
              {experience.map((role) => (
                <article key={role.organization}>
                  <span className="eyebrow">{role.period}</span>
                  <h4>
                    {role.title} <span>· {role.organization}</span>
                  </h4>
                  <p>{role.contribution}</p>
                </article>
              ))}
            </div>
          </div>
          <div className="practice">
            <h3>Expertise</h3>
            <div className="practice-rows">
              {skills.map(([name, list]) => (
                <details key={name}>
                  <summary>
                    {name}
                    <span aria-hidden="true">+</span>
                  </summary>
                  <p>{list}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
