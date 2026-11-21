'use client';
import { useEffect, useRef } from 'react';
import { profile } from '@/lib/content';

export default function PortraitField() {
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const el = canvas.current!;
    const container = el.parentElement!;
    const hero = container.closest<HTMLElement>('.site-hero')!;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const context = el.getContext('2d');
    if (!context) return;
    const ctx = context;
    const image = new Image();
    let loaded = false,
      visible = false,
      frame = 0;
    const particles: {
      x: number;
      y: number;
      tone: number;
      angle: number;
      reach: number;
    }[] = [];
    function render() {
      frame = 0;
      const progress = Math.min(
        1,
        Math.max(
          0,
          -hero.getBoundingClientRect().top / (hero.offsetHeight * 0.76),
        ),
      );
      const amount =
        reduced.matches || !loaded ? 0 : Math.max(0, (progress - 0.12) / 0.88);
      container.style.setProperty(
        '--scatter',
        String(Math.min(1, amount * 1.8)),
      );
      hero.style.setProperty(
        '--name-opacity',
        String(
          reduced.matches ? 0 : Math.sin(progress * Math.PI) * amount * 0.7,
        ),
      );
      ctx.clearRect(0, 0, el.width, el.height);
      if (!amount || !visible || document.hidden) return;
      const box = container.getBoundingClientRect();
      const scale = Math.min(
        box.width / image.naturalWidth,
        box.height / image.naturalHeight,
      );
      const w = image.naturalWidth * scale,
        h = image.naturalHeight * scale;
      if (
        el.width !== Math.ceil(box.width) ||
        el.height !== Math.ceil(box.height)
      ) {
        el.width = Math.ceil(box.width);
        el.height = Math.ceil(box.height);
      }
      for (const p of particles) {
        const v = p.tone;
        ctx.fillStyle = 'rgb(' + v + ' ' + v + ' ' + v + ')';
        ctx.fillRect(
          (box.width - w) / 2 + p.x * w + Math.cos(p.angle) * p.reach * amount,
          box.height -
            h +
            p.y * h -
            amount * (40 + p.reach) +
            Math.sin(p.angle) * p.reach * amount,
          1.7,
          1.7,
        );
      }
    }
    function queue() {
      if (!frame && visible) frame = requestAnimationFrame(render);
    }
    image.onload = () => {
      const source = document.createElement('canvas');
      const w = 180,
        h = Math.max(
          1,
          Math.round((w * image.naturalHeight) / image.naturalWidth),
        );
      source.width = w;
      source.height = h;
      const sample = source.getContext('2d');
      if (!sample) return;
      sample.drawImage(image, 0, 0, w, h);
      const { data } = sample.getImageData(0, 0, w, h);
      for (let y = 0; y < h; y += 2)
        for (let x = 0; x < w; x += 2) {
          const i = (y * w + x) * 4;
          if (data[i + 3] < 120 || data[i] < 12) continue;
          particles.push({
            x: x / w,
            y: y / h,
            tone: data[i],
            angle: (((x * 19 + y * 17) % 360) * Math.PI) / 180,
            reach: 10 + ((x * 13 + y * 37) % 100),
          });
        }
      loaded = true;
      queue();
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !reduced.matches && !image.src)
        image.src = profile.portrait;
      if (visible) queue();
    });
    function preference() {
      if (!reduced.matches && !image.src) image.src = profile.portrait;
      queue();
    }
    observer.observe(hero);
    window.addEventListener('scroll', queue, { passive: true });
    window.addEventListener('resize', queue);
    reduced.addEventListener('change', preference);
    document.addEventListener('visibilitychange', queue);
    return () => {
      observer.disconnect();
      image.onload = null;
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', queue);
      window.removeEventListener('resize', queue);
      reduced.removeEventListener('change', preference);
      document.removeEventListener('visibilitychange', queue);
    };
  }, []);
  return <canvas ref={canvas} aria-hidden="true" />;
}
