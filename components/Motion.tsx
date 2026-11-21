'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
export default function Motion() {
  const path = usePathname();
  useEffect(() => {
    if (path === '/') return;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const obs = new IntersectionObserver((entries) => {
      for (const entry of entries)
        if (entry.isIntersecting) {
          entry.target.animate(
            [
              { opacity: 0.55, transform: 'translateY(16px)' },
              { opacity: 1, transform: 'none' },
            ],
            { duration: 550, easing: 'ease-out' },
          );
          obs.unobserve(entry.target);
        }
    });
    document.querySelectorAll('[data-reveal]').forEach((el) => obs.observe(el));
    const buttons = document.querySelectorAll<HTMLElement>('.button');
    function attract(event: PointerEvent) {
      if (event.pointerType !== 'mouse') return;
      const button = event.currentTarget as HTMLElement;
      const box = button.getBoundingClientRect();
      button.style.setProperty(
        '--pull-x',
        ((event.clientX - box.left) / box.width) * 6 - 3 + 'px',
      );
      button.style.setProperty(
        '--pull-y',
        ((event.clientY - box.top) / box.height) * 4 - 2 + 'px',
      );
    }
    function reset(event: PointerEvent) {
      const button = event.currentTarget as HTMLElement;
      button.style.removeProperty('--pull-x');
      button.style.removeProperty('--pull-y');
    }
    buttons.forEach((button) => {
      button.addEventListener('pointermove', attract);
      button.addEventListener('pointerleave', reset);
    });
    return () => {
      obs.disconnect();
      buttons.forEach((button) => {
        button.removeEventListener('pointermove', attract);
        button.removeEventListener('pointerleave', reset);
      });
    };
  }, [path]);
  return null;
}
