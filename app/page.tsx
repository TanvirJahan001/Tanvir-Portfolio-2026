import type { CSSProperties } from 'react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
  contactSteps,
  deskStudies,
  facts,
  heroCopy,
  processSteps,
  profile,
  projects,
  services,
  sideProjects,
  skills,
} from '@/lib/content';
import { siteUrl } from '@/lib/site';
import SiteControls from '@/components/site/SiteControls';
import {
  LocationStamp,
  NameLine,
  Portrait,
  SectionMark,
} from '@/components/site/Shared';
import WorkList from '@/components/site/WorkList';
import Timeline from '@/components/site/Timeline';
import Statement from '@/components/site/Statement';
import { PortfolioFAQ, Principles } from '@/components/site/Conversations';
import LocalTime from '@/components/LocalTime';
import './site.css';

const PortraitField = dynamic(() => import('@/components/site/PortraitField'));
export const metadata: Metadata = {
  alternates: siteUrl ? { canonical: '/' } : undefined,
};
const email = 'mailto:' + profile.email;

export default function Home() {
  return (
    <div className="site-view" id="top">
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
      <SiteControls />
      <main id="main">
        <section
          aria-labelledby="intro-title"
          data-surface="dark"
          data-nav="top"
          className="site-hero site-frame"
        >
          <div className="hero-name-band">
            <NameLine />
          </div>
          <div className="hero-location">
            <LocationStamp />
          </div>
          <div className="hero-portrait">
            <Portrait priority />
            <PortraitField />
          </div>
          <div className="intro-copy">
            <span className="intro-arrow" aria-hidden="true">
              ↘
            </span>
            <h1 id="intro-title">
              {heroCopy.lines.map((line, row) => (
                <span className="intro-line" key={line}>
                  {line.split(' ').map((word, i) => (
                    <span key={word}>
                      <span
                        className="intro-word"
                        style={
                          {
                            '--word-offset': (((i + row) % 3) - 1) * 28 + 'px',
                          } as CSSProperties
                        }
                      >
                        {word}
                      </span>{' '}
                    </span>
                  ))}
                </span>
              ))}
            </h1>
            <p>{heroCopy.body}</p>
            <div className="intro-actions">
              <a className="violet-link" href="#contact">
                Let’s talk
              </a>
              <a href="#work">See the work ↘</a>
            </div>
          </div>
        </section>
        <section
          id="about"
          className="site-section site-frame"
          data-surface="light"
          tabIndex={-1}
          aria-label="About me"
        >
          <SectionMark id="about" />
          <div className="about-message">
            <p className="editorial">
              I build the parts of a web app that people rely on:{' '}
              <strong>
                the screen that makes sense, the record that stays accurate, the
                workflow that keeps moving.
              </strong>{' '}
              I connect them from front to back.
            </p>
            <Image
              src="/site/emblem.svg"
              alt="Interface and systems engineering"
              width={240}
              height={240}
            />
          </div>
          <div className="fact-strip">
            {facts.map((f) => (
              <div key={f.label}>
                <p>
                  <b>{f.value}</b>
                  <span>{f.unit}</span>
                </p>
                <small>{f.label}</small>
              </div>
            ))}
          </div>
        </section>
        <section
          id="services"
          className="site-section site-frame"
          data-surface="light"
          tabIndex={-1}
        >
          <SectionMark id="services" />
          <h2 className="services-intro">
            From the first screen
            <br />
            to the last database call.
          </h2>
          <div className="service-grid">
            {services.map(([title, description], i) => (
              <article key={title}>
                <small>0{i + 1}</small>
                <h3>{title}</h3>
                <p>{description}</p>
              </article>
            ))}
          </div>
          <div className="process-block">
            <h3>From first question to working software</h3>
            <ol>
              {processSteps.map(([title, body], i) => (
                <li key={title}>
                  <small>0{i + 1}</small>
                  <div>
                    <h4>{title}</h4>
                    <p>{body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>
        <section
          id="work"
          className="site-section site-frame"
          data-surface="dark"
          tabIndex={-1}
        >
          <SectionMark id="work" />
          <h2 className="major-heading">Work I’ve brought to life</h2>
          <p className="work-lead">
            Business applications, commerce and a small experiment in three
            dimensions.
          </p>
          <WorkList />
        </section>
        <section
          id="building"
          className="site-section site-frame"
          data-surface="dark"
          tabIndex={-1}
        >
          <SectionMark id="building" />
          <h2 className="major-heading">Projects of my own</h2>
          <div className="side-projects">
            {sideProjects.map((p, i) => (
              <article key={p.title}>
                <div className="side-number">
                  <small>0{i + 1}</small>
                  {p.href && <span aria-hidden="true">↗</span>}
                </div>
                <h3>{p.href ? <a href={p.href}>{p.title}</a> : p.title}</h3>
                <p>{p.summary}</p>
                <ul>
                  {p.stack.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
                <footer>
                  {p.kind}
                  <span>{p.status}</span>
                </footer>
              </article>
            ))}
          </div>
        </section>
        <section
          id="experience"
          className="site-section site-frame"
          data-surface="dark"
          tabIndex={-1}
          aria-label="Experience"
        >
          <SectionMark id="experience" />
          <p className="history-intro">
            Since <strong>2022</strong> I’ve built responsive interfaces as a
            freelancer. Today I connect <strong>frontend and backend</strong>{' '}
            systems at AI Media.
          </p>
          <a className="small-outline" href={profile.linkedin}>
            Full profile on LinkedIn ↗
          </a>
          <Timeline />
          <div className="toolkit">
            <p className="micro-title">My toolkit</p>
            <div className="toolkit-window">
              <div>
                {[0, 1].map((n) => (
                  <ul aria-hidden={n === 1 || undefined} key={n}>
                    {skills
                      .flatMap(([, items]) => items.split(', ').slice(0, 3))
                      .map((t) => (
                        <li key={t}>{t}</li>
                      ))}
                  </ul>
                ))}
              </div>
            </div>
          </div>
        </section>
        <Statement />
        <section
          id="principles"
          className="site-section site-frame"
          data-surface="light"
          tabIndex={-1}
          aria-label="Engineering principles"
        >
          <SectionMark id="principles" />
          <Principles />
        </section>
        <section
          id="experiments"
          className="site-section site-frame"
          data-surface="light"
          tabIndex={-1}
        >
          <SectionMark id="experiments" />
          <h2 className="major-heading">After hours</h2>
          <div className="lab-columns">
            <div>
              <h3 className="micro-title">On my desk</h3>
              <a className="desk-print" href={projects[2].demo}>
                <Image
                  src="/projects/desk.webp"
                  width={320}
                  height={205}
                  alt=""
                />
                <div>
                  <small>Interactive experiment</small>
                  <strong>3D Developer Desk</strong>
                  <span>Three.js · Vue.js</span>
                </div>
                <b aria-hidden="true">↗</b>
              </a>
              <Link className="lab-link" href="/projects/developer-desk">
                Inside the project ↗
              </Link>
            </div>
            <div>
              <h3 className="micro-title">Inside the scene</h3>
              {deskStudies.map(([t, d], i) => (
                <div className="lab-study" key={t}>
                  <div>
                    <h4>{t}</h4>
                    <p>{d}</p>
                  </div>
                  <small>0{i + 1}</small>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section
          id="contact"
          className="site-section site-frame"
          data-surface="light"
          tabIndex={-1}
        >
          <SectionMark id="contact" />
          <div className="chat-layout">
            <div>
              <h2 className="major-heading">
                Ask me
                <br />
                anything.
              </h2>
              <p>
                Explore a few questions about my projects, the tools I use and
                how I work. For a conversation about your own project,{' '}
                <a href={email}>email me</a>.
              </p>
              <small className="small-outline">
                • Portfolio FAQ · Curated answers
              </small>
            </div>
            <PortfolioFAQ />
          </div>
        </section>
      </main>
      <footer
        id="start"
        className="site-footer site-frame"
        data-surface="dark"
        data-nav="contact"
      >
        <span className="small-outline">
          <i className="status-dot" />
          {profile.availability}
        </span>
        <div className="closing-title">
          <Portrait decorative />
          <h2>
            What can we
            <br />
            build together?
          </h2>
        </div>
        <div className="closing-process">
          <ol>
            {contactSteps.map(([t, d], i) => (
              <li key={t}>
                <small>0{i + 1}</small>
                <strong>{t}</strong>
                <p>{d}</p>
              </li>
            ))}
          </ol>
          <a className="project-start" href={email}>
            Start a<br />
            project<span>↗</span>
          </a>
        </div>
        <div className="closing-links">
          <a href={email}>{profile.email}</a>
          <a href={profile.linkedin}>LinkedIn ↗</a>
        </div>
        <div className="footer-meta">
          {[
            ['Based in', profile.location],
            ['Local time', <LocalTime key="clock" />],
            ['Built with', 'Next.js · TypeScript'],
            [
              'Elsewhere',
              <a href={profile.github} key="gh">
                GitHub ↗
              </a>,
            ],
            [
              'Navigation',
              <a href="#top" key="top">
                Back to top ↑
              </a>,
            ],
          ].map(([label, value]) => (
            <div key={String(label)}>
              <small>{label}</small>
              <p>{value}</p>
            </div>
          ))}
        </div>
        <NameLine />
      </footer>
    </div>
  );
}
