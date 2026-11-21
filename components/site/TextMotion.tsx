'use client';
import { useEffect } from 'react';
import { clamp, onSiteScroll, easeWheel } from './siteScroll';

export default function TextMotion() {
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const root = document.querySelector<HTMLElement>('.site-view')!;
    const words = Array.from(root.querySelectorAll<HTMLElement>('.intro-word'));
    const copy = root.querySelector<HTMLElement>('.intro-copy')!;
    const lead = copy.querySelector<HTMLElement>('p')!,
      actions = copy.querySelector<HTMLElement>('.intro-actions')!;
    const arrow = copy.querySelector<HTMLElement>('.intro-arrow')!,
      place = root.querySelector<HTMLElement>('.hero-location')!;
    const about = root.querySelector('#about')!,
      ink = Array.from(root.querySelectorAll<HTMLElement>('.ink-word'));
    const hero = root.querySelector('.site-hero')!;
    let lastHero = -1,
      lastInk = -1,
      reduced = false;
    const stop = onSiteScroll((s) => {
      reduced = s.reduced;
      const wide = s.width > 1040;
      const fraction = reduced
        ? 0
        : Math.max(0, (s.y - (s.tops.get(hero) ?? 0)) / s.height);
      const start = wide ? 0.107 : s.width <= 700 ? 0.168 : 0.127;
      const span = wide ? 0.3025 : 0.182,
        spread = wide ? 0.2475 : 0.145;
      const scaled = clamp((fraction - start) / (span + spread));
      if (lastHero !== fraction && (lastHero <= 1 || fraction < 1)) {
        const ease = scaled * scaled * (3 - 2 * scaled);
        copy.style.translate =
          '0 ' +
          Math.min(fraction, start + span + spread) * s.height * 0.3 +
          'px';
        words.forEach((word, i) => {
          const progress = clamp(
            (fraction - start - (spread * i) / Math.max(1, words.length - 1)) /
              span,
          );
          const fall = progress * progress;
          word.style.translate = '0 ' + 140 * fall + 'px';
          word.style.rotate =
            progress * ((i % 2 ? 1 : -1) * (4 + (i % 6))) + 'deg';
          word.style.opacity = String(1 - fall);
          word.style.filter = progress
            ? 'blur(' + progress * 3 + 'px)'
            : 'none';
        });
        for (const el of [lead, actions]) {
          el.style.translate = '0 ' + ease * 24 + 'px';
          el.style.setProperty(
            '--exit-alpha',
            String(Math.max(0, 1 - 1.6 * ease)),
          );
        }
        arrow.style.rotate = ease * 55 + 'deg';
        arrow.style.opacity = String(1 - ease);
        place.style.translate = -64 * ease + 'px';
        place.style.opacity = String(1 - ease);
      }
      lastHero = fraction;
      const progress = reduced
        ? 1
        : clamp((s.y - (s.tops.get(about)! - s.height)) / s.height);
      if (lastInk !== progress) {
        ink.forEach((e, i) => {
          e.style.opacity = String(
            0.45 +
              0.55 *
                clamp(
                  (progress - (0.64 * i) / Math.max(1, ink.length - 1)) / 0.3,
                ),
          );
        });
        lastInk = progress;
      }
    });
    const stopWheel = easeWheel(root);
    const timers = new Map<HTMLElement, number>();
    function label(el: HTMLElement) {
      const original = el.dataset.scramble!;
      if (reduced || timers.has(el)) return;
      const start = performance.now();
      function paint(now: number) {
        const step = Math.floor((now - start) / 38);
        const fixed = Math.floor(
          (step / (original.length <= 4 ? 8 : 17)) * original.length,
        );
        el.textContent = Array.from(original, (c, i) =>
          i < fixed || /\s/.test(c)
            ? c
            : '#1</[]{}_-*+=0'[(i * 11 + step * 7) % 14],
        ).join('');
        if (reduced || fixed >= original.length) {
          el.textContent = original;
          timers.delete(el);
        } else timers.set(el, requestAnimationFrame(paint));
      }
      timers.set(el, requestAnimationFrame(paint));
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const { target, isIntersecting } of entries) {
          const el = target as HTMLElement;
          if (isIntersecting) {
            el.dataset.entered = 'true';
            observer.unobserve(el);
            el.querySelectorAll<HTMLElement>('[data-scramble]').forEach(label);
          }
        }
      },
      { threshold: 0, rootMargin: '0px 0px -1% 0px' },
    );
    root.querySelectorAll<HTMLElement>('[data-entrance]').forEach((el) => {
      // Anchors and restored scroll positions open in a readable, settled state.
      el.dataset.entered = String(el.getBoundingClientRect().bottom < 0);
      if (el.dataset.entered === 'false') observer.observe(el);
    });
    root.dataset.motion = 'ready';
    let lastButton: HTMLElement | null = null,
      chars: HTMLElement[] = [];
    function clearPointer() {
      lastButton?.style.removeProperty('translate');
      lastButton = null;
      chars.forEach((c) => c.style.removeProperty('transform'));
      chars = [];
    }
    function pointer(e: PointerEvent) {
      if (
        reduced ||
        e.pointerType !== 'mouse' ||
        !(e.target instanceof Element)
      )
        return;
      const button = e.target.closest<HTMLElement>(
        '.violet-link,.menu-outline,.project-start,.float-menu',
      );
      if (lastButton && button !== lastButton)
        lastButton.style.removeProperty('translate');
      if (button) {
        const rect = button.getBoundingClientRect();
        button.style.translate =
          (e.clientX - rect.left - rect.width / 2) * 0.18 +
          'px ' +
          (e.clientY - rect.top - rect.height / 2) * 0.18 +
          'px';
      }
      lastButton = button;
      const heading = e.target.closest<HTMLElement>('[data-proximity]');
      if (!heading && !chars.length) return;
      chars.forEach((c) => c.style.removeProperty('transform'));
      chars = [];
      heading?.querySelectorAll<HTMLElement>('.near-char').forEach((c) => {
        const r = c.getBoundingClientRect(),
          dx = r.left + r.width / 2 - e.clientX,
          dy = r.top + r.height / 2 - e.clientY,
          strength = clamp(1 - Math.hypot(dx, dy) / 155);
        if (strength) {
          c.style.transform =
            'translateY(' +
            -0.16 * strength +
            'em) rotate(' +
            (dx < 0 ? -1 : 1) * 5 * strength +
            'deg)';
          chars.push(c);
        }
      });
    }
    root.addEventListener('pointermove', pointer);
    root.addEventListener('pointerleave', clearPointer);
    window.addEventListener('site-menu-open', clearPointer);
    window.addEventListener('blur', clearPointer);
    return () => {
      stop();
      stopWheel();
      observer.disconnect();
      timers.forEach(cancelAnimationFrame);
      clearPointer();
      root.removeEventListener('pointermove', pointer);
      root.removeEventListener('pointerleave', clearPointer);
      window.removeEventListener('site-menu-open', clearPointer);
      window.removeEventListener('blur', clearPointer);
      delete root.dataset.motion;
    };
  }, []);
  return null;
}
