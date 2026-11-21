'use client';
import type { CSSProperties } from 'react';
import { useState } from 'react';

const lines = [
  ['Make', 'it'],
  ['feel', 'simple.'],
];
export default function Statement() {
  const [broken, setBroken] = useState(false),
    [alternate, setAlternate] = useState(false);
  return (
    <section
      id="statement"
      className="statement site-frame"
      data-surface="dark"
      tabIndex={-1}
    >
      <p className="micro-title">My motto</p>
      <div
        className="statement-field"
        data-broken={broken}
        data-alternate={alternate}
        onPointerMove={(e) => {
          if (e.pointerType !== 'mouse' || broken) return;
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
                  className={word === 'simple.' ? 'accent-word' : ''}
                  style={
                    {
                      '--fall': (row ? 0.42 : 0.8) + col * 0.15,
                      '--twist': [-14, 8, 12, -7][row * 2 + col] + 'deg',
                      '--slide': [-10, 8, -5, 5][row * 2 + col] + '%',
                    } as CSSProperties
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
          disabled={broken}
          aria-label="Alternate reading: Keep it working."
          aria-pressed={alternate}
          onClick={() => setAlternate(!alternate)}
        />
      </div>
      <small className="motto-hint">
        {alternate
          ? 'Keep it working.'
          : 'Explore the words for another reading.'}
      </small>
      <button
        className="play-control"
        aria-pressed={broken}
        onClick={() => {
          setBroken(!broken);
          setAlternate(false);
        }}
      >
        {broken ? 'Restore it ↺' : 'Break it'}
      </button>
      <button
        className="motto-code"
        onClick={() => window.dispatchEvent(new Event('site-code'))}
      >
        &lt;/&gt;　Show the code
      </button>
    </section>
  );
}
