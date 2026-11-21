// All Site scroll consumers use the same viewport, section offsets and frame.
export type ScrollSnapshot = {
  y: number;
  height: number;
  width: number;
  reduced: boolean;
  tops: Map<Element, number>;
  sections: HTMLElement[];
  pageHeight: number;
};
type Listener = (snapshot: ScrollSnapshot) => void;
const listeners = new Set<Listener>();
let snapshot: ScrollSnapshot | undefined;
let stop: (() => void) | undefined;

function start(root: HTMLElement) {
  let frame = 0,
    dirty = true,
    mounted = true;
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  function draw() {
    frame = 0;
    const y = window.scrollY;
    if (dirty || !snapshot) {
      const sections = Array.from(
        root.querySelectorAll<HTMLElement>('[data-surface]'),
      );
      const tops = new Map<Element, number>();
      for (const el of [
        ...sections,
        ...root.querySelectorAll('.editorial,.history li'),
      ]) {
        tops.set(el, el.getBoundingClientRect().top + y);
      }
      snapshot = {
        y,
        height: innerHeight,
        width: innerWidth,
        reduced: preference.matches,
        tops,
        sections,
        pageHeight: document.documentElement.scrollHeight,
      };
      dirty = false;
    }
    snapshot.y = y;
    listeners.forEach((fn) => fn(snapshot!));
  }
  function queue() {
    if (mounted && !frame) frame = requestAnimationFrame(draw);
  }
  function measure() {
    dirty = true;
    queue();
  }
  const observer =
    typeof ResizeObserver === 'undefined'
      ? undefined
      : new ResizeObserver(measure);
  observer?.observe(root);
  root.querySelectorAll('[data-surface]').forEach((s) => observer?.observe(s));
  window.addEventListener('scroll', queue, { passive: true });
  window.addEventListener('resize', measure);
  preference.addEventListener('change', measure);
  document.fonts.ready.then(measure);
  document.fonts.addEventListener('loadingdone', measure);
  draw();
  return () => {
    mounted = false;
    cancelAnimationFrame(frame);
    observer?.disconnect();
    window.removeEventListener('scroll', queue);
    window.removeEventListener('resize', measure);
    preference.removeEventListener('change', measure);
    document.fonts.removeEventListener('loadingdone', measure);
    snapshot = undefined;
  };
}
export function onSiteScroll(fn: Listener) {
  const root = document.querySelector<HTMLElement>('.site-view');
  if (!root) return () => {};
  listeners.add(fn);
  if (!stop) stop = start(root);
  else if (snapshot) fn(snapshot);
  return () => {
    listeners.delete(fn);
    if (!listeners.size) {
      stop?.();
      stop = undefined;
    }
  };
}
export const clamp = (value: number) => Math.max(0, Math.min(1, value));

// Ease wheel input only. Native scrolling still owns gestures, focus, keys,
// anchors, nested scroll panels, browser zoom, and the scrollbar.
export function easeWheel(root: HTMLElement) {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let frame = 0,
    target = 0,
    written = 0,
    previous = 0;
  function cancel() {
    cancelAnimationFrame(frame);
    frame = 0;
  }
  function tick(time: number) {
    if (document.hidden || reduced.matches || Math.abs(scrollY - written) > 2) {
      cancel();
      return;
    }
    const fraction = 1 - Math.exp(-Math.min(time - previous, 64) / 165);
    const next =
      Math.abs(target - written) < 1
        ? target
        : written + (target - written) * fraction;
    previous = time;
    written = next;
    window.scrollTo({ top: next, behavior: 'instant' });
    if (next === target) {
      frame = 0;
      return;
    }
    frame = requestAnimationFrame(tick);
  }
  function wheel(e: WheelEvent) {
    if (
      e.defaultPrevented ||
      !e.cancelable ||
      reduced.matches ||
      e.ctrlKey ||
      e.shiftKey ||
      e.metaKey ||
      !e.deltaY ||
      Math.abs(e.deltaX) > Math.abs(e.deltaY)
    )
      return;
    if (
      !(e.target instanceof Element) ||
      !root.contains(e.target) ||
      e.target.closest(
        'dialog,.faq-log,.code-notes,textarea,select,[contenteditable=true]',
      )
    )
      return;
    const delta =
      e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? innerHeight : 1);
    const base = frame && Math.abs(scrollY - written) <= 2 ? target : scrollY;
    target = Math.max(
      0,
      Math.min(
        document.documentElement.scrollHeight - innerHeight,
        base + delta,
      ),
    );
    if (!frame && target === scrollY) return;
    e.preventDefault();
    if (!frame) {
      written = scrollY;
      previous = performance.now() - 16;
      frame = requestAnimationFrame(tick);
    }
  }
  root.addEventListener('wheel', wheel, { passive: false });
  const interrupts = [
    'pointerdown',
    'touchstart',
    'keydown',
    'hashchange',
    'popstate',
    'blur',
  ] as const;
  interrupts.forEach((event) =>
    window.addEventListener(event, cancel, { passive: true }),
  );
  reduced.addEventListener('change', cancel);
  return () => {
    cancel();
    root.removeEventListener('wheel', wheel);
    interrupts.forEach((event) => window.removeEventListener(event, cancel));
    reduced.removeEventListener('change', cancel);
  };
}
