'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { profile, siteSections } from '@/lib/content';
import { LocationStamp, Portrait } from './Shared';

const codeNotes = [
  [
    'Layout',
    '.site-frame { padding-inline: var(--gutter); }',
    'The header, section rules and project rows share a single fluid gutter.',
  ],
  [
    'Portrait',
    'sample.getImageData(0, 0, w, h)',
    'The canvas samples the cutout’s visible pixels. Scrolling disperses those points and reversing scroll brings them back.',
  ],
  [
    'Timeline',
    'position: sticky;',
    'The year stays beside the role nearest the middle of the viewport. On small screens the dates sit with their roles.',
  ],
];

export default function SiteControls() {
  const menu = useRef<HTMLDialogElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const [code, setCode] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dockVisible, setDockVisible] = useState(true);
  const [current, setCurrent] = useState('top');
  const [marks, setMarks] = useState<number[]>([]);
  const codeButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const root = document.querySelector<HTMLElement>('.site-view')!;
    const sections = Array.from(
      root.querySelectorAll<HTMLElement>('[data-surface]'),
    );
    const navTargets = siteSections.map((s) => document.getElementById(s.id)!);
    let offsets: number[] = [];
    let last = scrollY;
    let frame = 0;
    function update() {
      frame = 0;
      const y = window.scrollY;
      const pointer = y + innerHeight * 0.46;
      const index = offsets.findLastIndex((top) => top <= pointer);
      const active = sections[Math.max(0, index)];
      root.dataset.theme = active.dataset.surface;
      root.dataset.enhanced = 'true';
      const activeId = active.dataset.nav || active.id;
      setCurrent(activeId || 'top');
      setScrolled(y > 96);
      if (y < 45 || y < last - 2) setDockVisible(true);
      else if (y > last + 2) setDockVisible(false);
      last = y;
    }
    function queue() {
      if (!frame) frame = requestAnimationFrame(update);
    }
    function measure() {
      const y = window.scrollY;
      const startOf = (e: HTMLElement) => e.getBoundingClientRect().top + y;
      offsets = sections.map(startOf);
      const span = Math.max(
        1,
        document.documentElement.scrollHeight - innerHeight,
      );
      setMarks(navTargets.map((e) => Math.min(1, startOf(e) / span) * 100));
      queue();
    }
    function toggleCode() {
      setCode((value) => !value);
      setDockVisible(true);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && !menu.current?.open) {
        if (root.dataset.code === 'true') {
          setCode(false);
          codeButton.current?.focus();
        }
      }
    }
    const resize = new ResizeObserver(measure);
    resize.observe(root);
    measure();
    window.addEventListener('scroll', queue, { passive: true });
    window.addEventListener('resize', measure);
    window.addEventListener('site-code', toggleCode);
    window.addEventListener('keydown', onKey);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(closeTimer.current);
      resize.disconnect();
      window.removeEventListener('scroll', queue);
      window.removeEventListener('resize', measure);
      window.removeEventListener('site-code', toggleCode);
      window.removeEventListener('keydown', onKey);
      document.body.classList.remove('menu-locked');
    };
  }, []);
  useEffect(() => {
    const root = document.querySelector<HTMLElement>('.site-view');
    if (root) root.dataset.code = String(code);
  }, [code]);
  function openMenu() {
    const dialog = menu.current;
    if (!dialog || dialog.open) return;
    dialog.dataset.closing = 'false';
    dialog.showModal();
    document.body.classList.add('menu-locked');
    dialog
      .querySelector<HTMLAnchorElement>('nav a')
      ?.focus({ preventScroll: true });
  }
  function closeMenu(target?: string) {
    const dialog = menu.current;
    if (!dialog?.open) return;
    clearTimeout(closeTimer.current);
    dialog.dataset.closing = 'true';
    closeTimer.current = setTimeout(
      () => {
        dialog.close();
        document.body.classList.remove('menu-locked');
        if (target) {
          const el = document.getElementById(target);
          if (el) {
            history.pushState(null, '', '#' + target);
            el.focus({ preventScroll: true });
            el.scrollIntoView();
          }
        }
      },
      matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 180,
    );
  }
  return (
    <>
      <header className="masthead site-frame">
        <a href="#top" className="owner">
          {profile.name}
          <i aria-hidden="true">••</i>
        </a>
        <span className="mast-role">{profile.role}</span>
        <a className="mast-status" href="#contact">
          <i className="status-dot" />
          {profile.availability}
        </a>
        <nav aria-label="Primary">
          <a href="#about">About</a>
          <a href="#work">Work</a>
          <a href="#contact">Contact</a>
        </nav>
        <button
          className="menu-outline"
          aria-haspopup="dialog"
          onClick={openMenu}
        >
          Menu <span aria-hidden="true">••</span>
        </button>
      </header>
      <button
        aria-label="Open menu"
        aria-haspopup="dialog"
        data-visible={scrolled}
        className="float-menu"
        onClick={openMenu}
      >
        <span />
        <span />
      </button>
      <nav aria-label="Page progress" className="edge-nav">
        {siteSections.map((s, i) => (
          <a
            href={'#' + s.id}
            style={{ top: (marks[i] ?? (i + 1) * 11) + '%' }}
            key={s.id}
            aria-label={s.label}
            aria-current={current === s.id ? 'location' : undefined}
          >
            <span>{s.label}</span>
          </a>
        ))}
      </nav>
      {scrolled && (
        <span className="section-indicator">
          {siteSections.find((s) => s.id === current)?.marker ||
            (current === 'statement' ? 'My motto' : 'Introduction')}
        </span>
      )}
      <div className="mode-dock" data-visible={dockVisible || code}>
        <button
          ref={codeButton}
          className="code-switch"
          onClick={() => setCode(!code)}
          aria-expanded={code}
          aria-controls="code-notes"
          aria-label={code ? 'Hide the code' : 'Show the code'}
        >
          &lt;/&gt;
        </button>
        <Link href="/?v=site" className="active-mode" aria-current="page">
          Site
        </Link>
        <Link href="/experience" prefetch={false}>
          Story
        </Link>
      </div>
      {code && (
        <>
          <div className="layout-lines" aria-hidden="true">
            {Array.from({ length: 12 }, (_, i) => (
              <i key={i} />
            ))}
          </div>
          <aside
            id="code-notes"
            className="code-notes"
            aria-label="Implementation notes"
          >
            <header>
              <b>Inside this site</b>
              <button
                aria-label="Close code view"
                onClick={() => {
                  setCode(false);
                  codeButton.current?.focus();
                }}
              >
                ×
              </button>
            </header>
            {codeNotes.map(([name, snippet, note]) => (
              <section key={name}>
                <h3>{name}</h3>
                <code>{snippet}</code>
                <p>{note}</p>
              </section>
            ))}
          </aside>
        </>
      )}
      <dialog
        ref={menu}
        className="site-menu"
        onCancel={(e) => {
          e.preventDefault();
          closeMenu();
        }}
        aria-label="Site navigation"
      >
        <div className="menu-top">
          <span>{profile.name}</span>
          <a
            href="#contact"
            onClick={(e) => {
              e.preventDefault();
              closeMenu('contact');
            }}
          >
            Let’s talk ↗
          </a>
        </div>
        <div className="menu-links">
          <nav aria-label="All sections">
            {siteSections.map((s, i) => (
              <a
                key={s.id}
                href={'#' + s.id}
                onClick={(e) => {
                  e.preventDefault();
                  closeMenu(s.id);
                }}
              >
                <small>(0{i + 1})</small>
                <b>{s.label}</b>
                <span>{s.detail}</span>
              </a>
            ))}
          </nav>
        </div>
        <Portrait className="menu-portrait" decorative />
        <div className="menu-bottom">
          <LocationStamp />
          <div>
            <a href={profile.github}>GitHub ↗</a>
            <a href={profile.linkedin}>LinkedIn ↗</a>
          </div>
        </div>
        <button
          className="menu-close"
          aria-label="Close menu"
          onClick={() => closeMenu()}
        >
          ×
        </button>
      </dialog>
    </>
  );
}
