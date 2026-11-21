'use client';
import Link from 'next/link';
import type { CSSProperties, MouseEvent } from 'react';
import { onSiteScroll } from './siteScroll';
import { Rollover } from './AnimatedText';
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
    'ctx.getImageData(0, 0, width, height)',
    'The points move from my portrait into my name and then my emblem as you scroll. Reduced motion and software rendering keep the photo in place.',
  ],
  [
    'Timeline',
    'position: sticky;',
    'The year stays beside the role nearest the middle of the viewport. On small screens the dates sit with their roles.',
  ],
];

export default function SiteControls() {
  const menu = useRef<HTMLDialogElement>(null);
  const curtain = useRef<HTMLDivElement>(null);
  const sweep = useRef<Animation | null>(null);
  const closeHold = useRef<Animation | null>(null);
  const destination = useRef<string | undefined>(undefined);
  const [code, setCode] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dockVisible, setDockVisible] = useState(true);
  const [current, setCurrent] = useState('top');
  const [marks, setMarks] = useState<number[]>([]);
  const codeButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const root = document.querySelector<HTMLElement>('.site-view')!;
    let previous = window.scrollY,
      direction = 0,
      travel = 0;
    let measured: Map<Element, number> | undefined;
    const navTargets = siteSections.map((s) => document.getElementById(s.id)!);
    const unsubscribe = onSiteScroll(
      ({ y, height, sections, tops, pageHeight }) => {
        const delta = y - previous;
        // On the exact boundary, the surface being entered owns the pixel.
        const reversing = delta < 0 || (delta === 0 && direction < 0);
        const center = y + height * 0.5;
        const active =
          sections.findLast((el) =>
            reversing ? tops.get(el)! < center : tops.get(el)! <= center,
          ) || sections[0];
        root.dataset.theme = active.dataset.surface;
        root.dataset.enhanced = 'true';
        setCurrent(active.dataset.nav || active.id || 'top');
        setScrolled(y > 96);
        if (measured !== tops) {
          setMarks(
            navTargets.map(
              (el) =>
                100 *
                Math.min(1, tops.get(el)! / Math.max(1, pageHeight - height)),
            ),
          );
          measured = tops;
        }
        if (delta) {
          if (Math.sign(delta) !== direction) {
            direction = Math.sign(delta);
            travel = 0;
          }
          travel += Math.abs(delta);
          if (y < 64 || travel >= 6) {
            setDockVisible(y < 64 || direction < 0);
          }
        }
        previous = y;
      },
    );
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
    window.addEventListener('site-code', toggleCode);
    window.addEventListener('keydown', onKey);
    return () => {
      unsubscribe();
      sweep.current?.cancel();
      closeHold.current?.cancel();
      window.removeEventListener('site-code', toggleCode);
      window.removeEventListener('keydown', onKey);
      document.body.classList.remove('menu-locked');
    };
  }, []);
  useEffect(() => {
    const root = document.querySelector<HTMLElement>('.site-view');
    if (root) root.dataset.code = String(code);
  }, [code]);
  function openMenu(event: MouseEvent<HTMLButtonElement>) {
    const dialog = menu.current!,
      layer = curtain.current!;
    destination.current = undefined;
    if (dialog.open) {
      if (dialog.dataset.closing === 'true') {
        dialog.dataset.closing = 'false';
        closeHold.current?.cancel();
        if (sweep.current) {
          sweep.current.playbackRate = 1;
          sweep.current.play();
        }
      }
      return;
    }
    const rect = event.currentTarget.getBoundingClientRect();
    const x = rect.x + rect.width / 2,
      y = rect.y + rect.height / 2;
    const radius = 1.5 * Math.max(innerWidth, innerHeight);
    dialog.dataset.closing = 'false';
    dialog.showModal();
    document.body.classList.add('menu-locked');
    window.dispatchEvent(new Event('site-menu-open'));
    sweep.current?.cancel();
    sweep.current = layer.animate(
      [
        { clipPath: `circle(0px at ${x}px ${y}px)` },
        { clipPath: `circle(${radius}px at ${x}px ${y}px)` },
      ],
      {
        duration: matchMedia('(prefers-reduced-motion: reduce)').matches
          ? 0
          : 900,
        easing: 'cubic-bezier(.76,0,.24,1)',
        fill: 'both',
      },
    );
    dialog
      .querySelector<HTMLAnchorElement>('nav a')
      ?.focus({ preventScroll: true });
  }
  function closeMenu(target?: string) {
    const dialog = menu.current;
    if (!dialog?.open) return;
    if (target) destination.current = target;
    if (dialog.dataset.closing === 'true') return;
    dialog.dataset.closing = 'true';
    const finish = () => {
      if (!dialog.open || dialog.dataset.closing !== 'true') return;
      dialog.close();
      document.body.classList.remove('menu-locked');
      sweep.current?.cancel();
      sweep.current = null;
      const id = destination.current;
      if (id) {
        history.pushState(null, '', '#' + id);
        const el = document.getElementById(id);
        el?.focus({ preventScroll: true });
        el?.scrollIntoView();
      }
    };
    const animation = sweep.current;
    if (!animation || matchMedia('(prefers-reduced-motion: reduce)').matches) {
      finish();
      return;
    }
    animation.pause();
    const hold = dialog.animate([], { duration: 100 });
    closeHold.current = hold;
    hold.finished.then(
      () => {
        if (dialog.dataset.closing !== 'true' || closeHold.current !== hold)
          return;
        animation.playbackRate = -900 / 650;
        animation.play();
        animation.finished.then(finish, () => {});
      },
      () => {},
    );
  }
  return (
    <>
      <header className="masthead site-frame">
        <a href="#top" className="owner" aria-label={profile.name}>
          <Rollover text={profile.name} />
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
        <div className="menu-curtain" ref={curtain} aria-hidden="true" />
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
              <div
                className="menu-window"
                key={s.id}
                style={{ '--row': i } as CSSProperties}
              >
                <a
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
              </div>
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
          onClick={(e) =>
            menu.current?.dataset.closing === 'true' ? openMenu(e) : closeMenu()
          }
        >
          ×
        </button>
      </dialog>
    </>
  );
}
