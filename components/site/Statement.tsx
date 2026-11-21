'use client';

import { useEffect, useRef, useState } from 'react';
import './Statement.css';

const lines = [
  ['Make', 'it'],
  ['feel', 'simple.'],
];
type Phase = 'ready' | 'falling' | 'repairing';

interface WordBody {
  left: number;
  top: number;
  width: number;
  height: number;
  x: number;
  y: number;
  angle: number;
  vx: number;
  vy: number;
  spin: number;
  release: number;
  supportsWords: boolean;
  floorInset: number;
  frames: Keyframe[];
}

function bounds(body: WordBody) {
  const c = Math.abs(Math.cos(body.angle));
  const s = Math.abs(Math.sin(body.angle));
  const halfWidth = (body.width * c + body.height * s) / 2;
  const halfHeight = (body.height * c + body.width * s) / 2;
  const cx = body.left + body.width / 2 + body.x;
  const cy = body.top + body.height / 2 + body.y;
  return {
    left: cx - halfWidth,
    right: cx + halfWidth,
    top: cy - halfHeight,
    bottom: cy + halfHeight,
  };
}

// Sample the fall once per click so playback can run on the compositor.
function fallFrames(nodes: HTMLElement[], stage: DOMRect) {
  const length = 3.3;
  const step = 1 / 60;
  const codeHeight =
    nodes.find((node) => node.classList.contains('motto-code'))?.offsetHeight ??
    0;
  const hintHeight =
    nodes.find((node) => node.classList.contains('motto-hint'))?.offsetHeight ??
    0;
  const bodies: WordBody[] = nodes.map((node) => {
    const r = node.getBoundingClientRect();
    return {
      left: r.left - stage.left,
      top: r.top - stage.top,
      width: r.width,
      height: r.height,
      x: 0,
      y: 0,
      angle: 0,
      vx: (Math.random() - 0.5) * Math.min(240, stage.width * 0.28),
      vy: -(40 + Math.random() * 175),
      spin: (Math.random() - 0.5) * 2.7,
      release: 0.42 + Math.random() * 0.32,
      supportsWords: node.classList.contains('physics-word'),
      // Keep the small captions legible beneath the type when the pile settles.
      floorInset: node.classList.contains('motto-code')
        ? 0
        : node.classList.contains('motto-hint')
          ? codeHeight
          : codeHeight + hintHeight,
      frames: [{ transform: 'none', offset: 0 }],
    };
  });
  const floor = stage.height - 8;
  const gravity = Math.max(820, stage.height * 1.8);
  for (let tick = 1; tick <= Math.round(length / step); tick++) {
    const elapsed = tick * step;
    // Resolve the lower words first so those above can land on the settled pile.
    const supports: ReturnType<typeof bounds>[] = [];
    const ordered = [...bodies].sort(
      (a, b) => bounds(b).bottom - bounds(a).bottom,
    );
    for (const body of ordered) {
      if (elapsed > body.release) {
        const before = bounds(body);
        body.vy += gravity * step;
        body.x += body.vx * step;
        body.y += body.vy * step;
        body.angle += body.spin * step;
        if (elapsed > length - 0.65) {
          body.spin *= 0.85;
          body.angle *= 0.87;
        }
        const after = bounds(body);
        if (after.left < 4 || after.right > stage.width - 4) {
          body.x +=
            after.left < 4 ? 4 - after.left : stage.width - 4 - after.right;
          body.vx *= -0.35;
        }
        let surface = floor - body.floorInset;
        for (const other of supports) {
          const overlap =
            Math.min(other.right, after.right) -
            Math.max(other.left, after.left);
          if (
            overlap > Math.min(24, body.width * 0.15) &&
            (before.bottom <= other.top + 12 ||
              (before.top + before.bottom) / 2 <
                (other.top + other.bottom) / 2 - 3)
          ) {
            surface = Math.min(surface, other.top);
          }
        }
        if (after.bottom >= surface && body.vy >= 0) {
          body.y -= after.bottom - surface;
          body.vy = body.vy > 95 ? -body.vy * 0.17 : 0;
          body.vx *= 0.77;
          body.spin *= 0.64;
          body.angle *= 0.87;
          if (body.supportsWords && Math.abs(body.vy) < 35)
            supports.push(bounds(body));
        }
      }
      if (tick % 2 === 0) {
        body.frames.push({
          offset: Math.min(1, elapsed / length),
          transform: `translate(${body.x.toFixed(2)}px, ${body.y.toFixed(2)}px) rotate(${body.angle.toFixed(3)}rad)`,
        });
      }
    }
  }
  return bodies.map((b) => b.frames);
}

export default function Statement() {
  const [phase, setPhase] = useState<Phase>('ready');
  const [alternate, setAlternate] = useState(false);
  const section = useRef<HTMLElement>(null);
  const field = useRef<HTMLDivElement>(null);
  const animations = useRef<Animation[]>([]);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function clearPlayback() {
    animations.current.forEach((a) => a.cancel());
    animations.current = [];
    if (timer.current !== null) clearTimeout(timer.current);
    timer.current = null;
  }

  useEffect(() => {
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    function reset() {
      clearPlayback();
      setPhase('ready');
      setAlternate(false);
    }
    window.addEventListener('resize', reset);
    preference.addEventListener('change', reset);
    return () => {
      window.removeEventListener('resize', reset);
      preference.removeEventListener('change', reset);
      clearPlayback();
    };
  }, []);

  function play() {
    if (!section.current || !field.current) return;
    const nodes = Array.from(
      section.current.querySelectorAll<HTMLElement>(
        '.physics-word, .tumble-extra',
      ),
    );
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (phase === 'falling') {
      const poses = nodes.map(
        (e) =>
          new DOMMatrix(
            getComputedStyle(e).transform === 'none'
              ? undefined
              : getComputedStyle(e).transform,
          ),
      );
      clearPlayback();
      if (reduced) {
        setPhase('ready');
        return;
      }
      setPhase('repairing');
      poses.forEach((pose, index) => {
        const angle = Math.atan2(pose.b, pose.a);
        const frames = Array.from({ length: 31 }, (_, i) => {
          const t = i / 30;
          const spring = i === 30 ? 0 : Math.exp(-5.1 * t) * Math.cos(t * 6.8);
          return {
            transform: `translate(${pose.e * spring}px, ${pose.f * spring}px) rotate(${angle * spring}rad)`,
          };
        });
        animations.current.push(
          nodes[index].animate(frames, { duration: 1150, fill: 'both' }),
        );
      });
      timer.current = setTimeout(() => {
        clearPlayback();
        setPhase('ready');
      }, 2400);
      return;
    }
    clearPlayback();
    setAlternate(false);
    setPhase('falling');
    if (reduced) return;
    const tracks = fallFrames(nodes, section.current.getBoundingClientRect());
    animations.current.push(
      field.current.animate(
        [
          { transform: 'none' },
          { transform: 'translate(12px,-3px) rotate(.4deg)' },
          { transform: 'translate(-7px,2px)' },
          { transform: 'translate(5px,-1px)' },
          { transform: 'none' },
        ],
        { duration: 350, easing: 'ease-out' },
      ),
    );
    tracks.forEach((frames, i) =>
      animations.current.push(
        nodes[i].animate(frames, { duration: 3300, fill: 'forwards' }),
      ),
    );
  }

  const broken = phase === 'falling';
  return (
    <section
      ref={section}
      id="statement"
      className="statement site-frame"
      data-phase={phase}
      data-surface="dark"
      tabIndex={-1}
    >
      <p className="micro-title tumble-extra">My motto</p>
      <div
        ref={field}
        className="statement-field"
        data-broken={phase !== 'ready'}
        data-alternate={alternate}
        onPointerMove={(e) => {
          if (e.pointerType !== 'mouse' || phase !== 'ready') return;
          const r = e.currentTarget.getBoundingClientRect();
          e.currentTarget.style.setProperty(
            '--lens-x',
            e.clientX - r.left + 'px',
          );
          e.currentTarget.style.setProperty(
            '--lens-y',
            e.clientY - r.top + 'px',
          );
        }}
      >
        <h2 aria-label="Make it feel simple.">
          {lines.map((line, row) => (
            <span className="statement-line" key={row}>
              {line.map((word, col) => (
                <span
                  aria-hidden="true"
                  key={word}
                  className={
                    'physics-word' + (word === 'simple.' ? ' accent-word' : '')
                  }
                >
                  {word}
                  {col === 0 ? ' ' : ''}
                </span>
              ))}
            </span>
          ))}
        </h2>
        <div className="statement-lens" aria-hidden="true">
          Keep it
          <br />
          working.
        </div>
        <button
          className="lens-control"
          disabled={phase !== 'ready'}
          aria-label="Alternate reading: Keep it working."
          aria-pressed={alternate}
          onClick={() => setAlternate(!alternate)}
        />
      </div>
      <small className="motto-hint tumble-extra">
        {alternate
          ? 'Keep it working.'
          : 'Explore the words for another reading.'}
      </small>
      <div className="play-slot">
        <button className="play-control" aria-pressed={broken} onClick={play}>
          {broken ? 'Restore it ↺' : 'Break it'}
        </button>
      </div>
      <button
        className="motto-code tumble-extra"
        onClick={() => window.dispatchEvent(new Event('site-code'))}
      >
        &lt;/&gt;　Show the code
      </button>
      {broken && (
        <div className="type-diagnostics" aria-hidden="true">
          <span>layout · word anchors released</span>
          <span>motion · gravity active</span>
          <span>type · restore available</span>
        </div>
      )}
      {phase === 'repairing' && (
        <div className="type-repair" aria-hidden="true">
          <b>Restoring layout</b>
          <span>Read original positions</span>
          <span>Align word anchors</span>
          <span>Layout restored ✓</span>
        </div>
      )}
      <span className="sr-only" role="status">
        {broken
          ? 'Words released. Restore the layout with Restore it.'
          : phase === 'repairing'
            ? 'Restoring original word positions.'
            : ''}
      </span>
    </section>
  );
}
