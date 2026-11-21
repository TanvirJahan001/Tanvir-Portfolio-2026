'use client';

import { useEffect, useRef } from 'react';
import { onSiteScroll } from './siteScroll';
import './fields.css';

interface Dot {
  x: number;
  y: number;
  spread: number;
  lift: number;
  delay: number;
  dx: number;
  dy: number;
}

const clamp = (v: number) => Math.max(0, Math.min(1, v));

/** The labels and inline numerals remain in the DOM, including before hydration. */
export default function FactField() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (
      typeof ResizeObserver === 'undefined' ||
      typeof IntersectionObserver === 'undefined'
    )
      return;
    const canvas = ref.current!;
    const strip = canvas.parentElement!;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    let dots: Dot[] = [];
    let width = 0,
      padding = 0,
      height = 0;
    let frame = 0,
      visible = false,
      disposed = false,
      lastFrame = 0;
    let pointer: { x: number; y: number } | undefined;
    function measure() {
      if (disposed) return;
      delete strip.dataset.dots;
      dots = [];
      if (motion.matches || !visible) return;
      const r = strip.getBoundingClientRect();
      width = Math.ceil(r.width);
      padding = Math.ceil(r.height);
      height = padding * 3;
      const dpr = Math.min(
        devicePixelRatio || 1,
        2,
        Math.sqrt(4500000 / (width * height)),
      );
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.top = -padding + 'px';
      canvas.style.height = height + 'px';
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      const mask = document.createElement('canvas');
      mask.width = width;
      mask.height = padding;
      const ink = mask.getContext('2d', { willReadFrequently: true });
      if (!ink) return;
      for (const numeral of strip.querySelectorAll('b')) {
        const style = getComputedStyle(numeral);
        ink.font =
          style.fontWeight + ' ' + style.fontSize + ' ' + style.fontFamily;
        ink.letterSpacing = style.letterSpacing;
        const text = numeral.textContent || '';
        const range = document.createRange();
        range.selectNodeContents(numeral);
        const bounds = range.getBoundingClientRect();
        const baseline =
          bounds.top - r.top + ink.measureText(text).fontBoundingBoxAscent;
        ink.fillText(text, bounds.left - r.left, baseline);
      }
      const pixels = ink.getImageData(0, 0, width, padding).data;
      // A staggered screen retains thin strokes and separates the individual dots.
      const pitch = Math.max(2.6, Math.sqrt((width * padding) / 24000));
      for (let row = 0, y = 0; y < padding; y += pitch, row++) {
        for (let x = (row % 2) * pitch * 0.5; x < width; x += pitch) {
          if (pixels[(Math.floor(y) * width + Math.floor(x)) * 4 + 3] < 96)
            continue;
          const seed = Math.sin(x * 7.13 + y * 41.79) * 13758.5;
          const noise = seed - Math.floor(seed);
          dots.push({
            x,
            y: y + padding,
            spread: (noise - 0.5) * Math.min(width * 0.44, 290),
            lift: 70 + 150 * noise,
            delay: noise * 0.1 + (x / width) * 0.06,
            dx: 0,
            dy: 0,
          });
        }
      }
      if (dots.length) strip.dataset.dots = 'ready';
      queue();
    }

    function render(time: number) {
      frame = 0;
      if (!visible || motion.matches || document.hidden || !dots.length) return;
      const rect = strip.getBoundingClientRect();
      const top = rect.top / window.innerHeight;
      const ease = 1 - Math.exp(-Math.min(60, time - lastFrame || 16) / 66);
      lastFrame = time;
      ctx!.clearRect(0, 0, width, height);
      if (top >= 1 || top < -0.2) return;
      ctx!.fillStyle = getComputedStyle(strip).color;
      let settling = false;
      const groups = Array.from({ length: 8 }, () => new Path2D());
      for (const dot of dots) {
        const entering = clamp((top - 0.69 + dot.delay) / 0.31);
        const leaving = clamp((0.105 - top + dot.delay * 0.17) / 0.168);
        const spread = entering * entering + leaving * leaving;
        const alpha = Math.min(1 - entering ** 2, 1 - leaving);
        if (alpha < 0.035) continue;
        const x = dot.x + dot.spread * spread;
        const y = dot.y + dot.lift * (entering * entering - leaving * leaving);
        let u = 0,
          v = 0;
        if (pointer) {
          const px = x - (pointer.x - rect.left),
            py = y - (pointer.y - rect.top + padding);
          const distance = Math.hypot(px, py);
          if (distance < 78 && distance > 0.01) {
            const push = (1 - distance / 78) ** 2 * 53;
            u = (px / distance) * push;
            v = (py / distance) * push;
          }
        }
        dot.dx += (u - dot.dx) * ease;
        dot.dy += (v - dot.dy) * ease;
        if (Math.abs(u - dot.dx) + Math.abs(v - dot.dy) > 0.08) settling = true;
        const path = groups[Math.min(7, Math.floor(alpha * 8))];
        path.moveTo(x + dot.dx + 1.03, y + dot.dy);
        path.arc(x + dot.dx, y + dot.dy, 1.03, 0, Math.PI * 2);
      }
      groups.forEach((path, i) => {
        ctx!.globalAlpha = (i + 1) / 8;
        ctx!.fill(path);
      });
      ctx!.globalAlpha = 1;
      if (settling) queue();
    }
    function queue() {
      if (visible && !disposed && !frame && !motion.matches && !document.hidden)
        frame = requestAnimationFrame(render);
    }
    function move(e: PointerEvent) {
      if (e.pointerType !== 'mouse') return;
      pointer = { x: e.clientX, y: e.clientY };
      queue();
    }
    function leave() {
      pointer = undefined;
      queue();
    }
    const resize = new ResizeObserver(measure);
    resize.observe(strip);
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) measure();
        else {
          cancelAnimationFrame(frame);
          frame = 0;
          pointer = undefined;
        }
      },
      { rootMargin: '25% 0px' },
    );
    observer.observe(strip);
    void document.fonts.ready.then(measure);
    document.fonts.addEventListener('loadingdone', measure);
    strip.addEventListener('pointermove', move);
    strip.addEventListener('pointerleave', leave);
    const unsubscribe = onSiteScroll(queue);
    motion.addEventListener('change', measure);
    document.addEventListener('visibilitychange', queue);
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      resize.disconnect();
      delete strip.dataset.dots;
      strip.removeEventListener('pointermove', move);
      strip.removeEventListener('pointerleave', leave);
      motion.removeEventListener('change', measure);
      unsubscribe();
      document.fonts.removeEventListener('loadingdone', measure);
      document.removeEventListener('visibilitychange', queue);
    };
  }, []);
  return <canvas className="fact-field" ref={ref} aria-hidden="true" />;
}
