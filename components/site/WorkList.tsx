'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { projects } from '@/lib/content';

export default function WorkList() {
  const [touchPreview, setTouchPreview] = useState('');
  const list = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = list.current!;
    const print = root.querySelector<HTMLElement>('.work-print')!;
    const cursor = root.querySelector<HTMLElement>('.project-cursor')!;
    const layers = Array.from(
      print.querySelectorAll<HTMLElement>('.print-layer'),
    );
    const rows = Array.from(root.querySelectorAll<HTMLElement>('.work-row'));
    const reduce = matchMedia('(prefers-reduced-motion: reduce)');
    let active = -1,
      frame = 0,
      x = 0,
      y = 0,
      cx = 0,
      cy = 0,
      destX = 0,
      destY = 0,
      tilt = 0,
      previous = 0;
    let pointer: { x: number; y: number } | undefined;
    function hide() {
      pointer = undefined;
      active = -1;
      root.removeAttribute('data-preview');
      cancelAnimationFrame(frame);
      frame = 0;
      rows.forEach((row) => row.removeAttribute('data-pointed'));
    }
    function draw(now: number) {
      if (active < 0) return;
      const elapsed = Math.min(64, Math.max(1, now - previous));
      previous = now;
      const follow = reduce.matches ? 1 : 1 - Math.pow(0.86, elapsed / 16.67);
      const cursorFollow = reduce.matches
        ? 1
        : 1 - Math.pow(0.82, elapsed / 16.67);
      const dx = (destX - x) * follow;
      x += dx;
      y += (destY - y) * follow;
      cx += (destX - cx) * cursorFollow;
      cy += (destY - cy) * cursorFollow;
      tilt += (Math.max(-8, Math.min(8, dx * 1.1)) - tilt) * cursorFollow;
      if (reduce.matches) tilt = 0;
      const angle = (Math.abs(tilt) * Math.PI) / 180;
      const halfW =
        (print.offsetWidth * Math.cos(angle) +
          print.offsetHeight * Math.sin(angle)) /
          2 +
        4;
      const halfH =
        (print.offsetHeight * Math.cos(angle) +
          print.offsetWidth * Math.sin(angle)) /
          2 +
        4;
      const within = (pos: number, half: number, size: number) =>
        Math.max(half, Math.min(size - half, pos));
      print.style.left = within(x, halfW, innerWidth) + 'px';
      print.style.top = within(y, halfH, innerHeight) + 'px';
      print.style.rotate = tilt + 'deg';
      cursor.style.left = within(cx, 52, innerWidth) + 'px';
      cursor.style.top = within(cy, 52, innerHeight) + 'px';
      frame =
        Math.abs(destX - x) +
          Math.abs(destY - y) +
          Math.abs(destX - cx) +
          Math.abs(destY - cy) +
          Math.abs(tilt) >
        0.08
          ? requestAnimationFrame(draw)
          : 0;
    }
    function show(row: HTMLElement, px: number, py: number) {
      const index = rows.indexOf(row);
      if (index < 0) return;
      if (active < 0) {
        x = cx = px;
        y = cy = py;
        tilt = 0;
      }
      if (index !== active) {
        rows[active]?.removeAttribute('data-pointed');
        row.dataset.pointed = 'true';
        layers.forEach((layer, i) => {
          layer.dataset.layer =
            i === index ? 'current' : i === active ? 'previous' : 'hidden';
        });
      }
      active = index;
      destX = px;
      destY = py;
      root.dataset.preview = 'true';
      if (!frame) {
        previous = performance.now() - 16;
        draw(performance.now());
      }
    }
    function move(e: PointerEvent) {
      if (e.pointerType !== 'mouse' || !(e.target instanceof Element)) return;
      const row = e.target.closest<HTMLElement>('.work-row');
      if (row) {
        pointer = { x: e.clientX, y: e.clientY };
        show(row, pointer.x, pointer.y);
      } else hide();
    }
    function focus(e: FocusEvent) {
      if (
        !(e.target instanceof HTMLElement) ||
        !e.target.matches('.work-row:focus-visible')
      )
        return;
      const r = e.target.getBoundingClientRect();
      show(e.target, r.left + r.width * 0.62, r.top + r.height / 2);
    }
    function scroll() {
      if (active < 0) return;
      // A hash jump or the tail of a wheel gesture can finish under a stationary mouse.
      // Keep its preview only while the pointer still hits the same project.
      if (
        pointer &&
        document
          .elementFromPoint(pointer.x, pointer.y)
          ?.closest('.work-row') === rows[active]
      )
        return;
      hide();
    }
    root.addEventListener('pointerover', move);
    root.addEventListener('pointermove', move);
    window.addEventListener('scroll', scroll, { passive: true });
    root.addEventListener('pointerleave', hide);
    root.addEventListener('focusin', focus);
    root.addEventListener('focusout', hide);
    const interrupts = ['resize', 'blur', 'site-menu-open'] as const;
    interrupts.forEach((type) => window.addEventListener(type, hide));
    document.addEventListener('visibilitychange', hide);
    reduce.addEventListener('change', hide);
    return () => {
      hide();
      root.removeEventListener('pointerover', move);
      root.removeEventListener('pointermove', move);
      window.removeEventListener('scroll', scroll);
      root.removeEventListener('pointerleave', hide);
      root.removeEventListener('focusin', focus);
      root.removeEventListener('focusout', hide);
      interrupts.forEach((type) => window.removeEventListener(type, hide));
      document.removeEventListener('visibilitychange', hide);
      reduce.removeEventListener('change', hide);
    };
  }, []);
  return (
    <div className="work-list" ref={list}>
      {projects.map((project, i) => (
        <article key={project.slug} className="work-entry" data-entrance="row">
          <Link href={'/projects/' + project.slug} className="work-row">
            <small className="work-no">0{i + 1}</small>
            <div className="row-main">
              <h3>{project.title}</h3>
              <p>{project.summary}</p>
            </div>
            <div className="work-meta">
              {project.category}
              <span>• {project.status}</span>
            </div>
            <span className="row-arrow" aria-hidden="true">
              →
            </span>
          </Link>
          <button
            className="touch-preview"
            aria-expanded={touchPreview === project.slug}
            aria-controls={'preview-' + project.slug}
            onClick={() =>
              setTouchPreview(touchPreview === project.slug ? '' : project.slug)
            }
          >
            {touchPreview === project.slug ? 'Hide preview' : 'Preview image'}
          </button>
          <div
            id={'preview-' + project.slug}
            hidden={touchPreview !== project.slug}
            className="touch-image"
          >
            <Image
              src={'/projects/' + project.image + '.webp'}
              width={660}
              height={420}
              alt={project.alt}
              sizes="90vw"
            />
          </div>
        </article>
      ))}
      <div className="work-print" aria-hidden="true">
        <div>
          {projects.map((project) => (
            <div className="print-layer" key={project.slug}>
              <Image
                src={'/projects/' + project.image + '.webp'}
                width={440}
                height={280}
                sizes="410px"
                alt=""
              />
            </div>
          ))}
        </div>
      </div>
      <div className="project-cursor" aria-hidden="true">
        <span>View project ↗</span>
      </div>
    </div>
  );
}
