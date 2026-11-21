'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { principles, profile, questions } from '@/lib/content';
import { Portrait } from './Shared';

export function Principles() {
  const [active, setActive] = useState(0);
  const item = principles[active];
  return (
    <div className="principle-layout">
      <div
        role="tablist"
        aria-label="Engineering principles"
        className="principle-tabs"
      >
        {principles.map((p, i) => (
          <button
            key={p.tab}
            type="button"
            role="tab"
            aria-controls="principle-panel"
            id={'principle-' + i}
            aria-selected={i === active}
            tabIndex={i === active ? 0 : -1}
            onClick={() => setActive(i)}
            onKeyDown={(e) => {
              let next = i;
              if (['ArrowRight', 'ArrowDown'].includes(e.key))
                next = (i + 1) % principles.length;
              else if (['ArrowLeft', 'ArrowUp'].includes(e.key))
                next = (i + principles.length - 1) % principles.length;
              else if (e.key === 'Home') next = 0;
              else if (e.key === 'End') next = principles.length - 1;
              else return;
              e.preventDefault();
              setActive(next);
              document.getElementById('principle-' + next)?.focus();
            }}
          >
            {p.tab}
          </button>
        ))}
      </div>
      <div
        role="tabpanel"
        id="principle-panel"
        aria-labelledby={'principle-' + active}
        tabIndex={0}
      >
        <div key={active} className="principle-copy">
          <h2>
            <span>“</span>
            {item.title}
            <span>”</span>
          </h2>
          <p>{item.body}</p>
          <div className="signature">
            <strong>{profile.name}</strong>
            <Link href={'/projects/' + item.slug}>{item.project} ↗</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PortfolioFAQ() {
  const [messages, setMessages] = useState<number[]>([]);
  const log = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (messages.length && log.current)
      log.current.scrollTop = log.current.scrollHeight;
  }, [messages]);
  return (
    <div className="faq-panel">
      <div
        className="faq-log"
        role="log"
        aria-label="Portfolio answers"
        aria-live="polite"
        ref={log}
      >
        <div className="faq-reply">
          <Portrait decorative />
          <p>Hi! Choose a question about my work or how to get in touch.</p>
        </div>
        {messages.map((index, i) => (
          <div key={i}>
            <p className="asked">{questions[index][0]}</p>
            <div className="faq-reply">
              <Portrait decorative />
              <p>{questions[index][1]}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="faq-questions">
        {questions.map(([q], i) => (
          <button
            key={q}
            onClick={() =>
              setMessages((old) => (old.at(-1) === i ? old : [...old, i]))
            }
          >
            {q}
          </button>
        ))}
      </div>
      <div className="faq-bottom">
        <b>Local FAQ</b>
        <a href={'mailto:' + profile.email}>Email Tanvir ↗</a>
        {messages.length > 0 && (
          <button onClick={() => setMessages([])}>Clear</button>
        )}
      </div>
    </div>
  );
}
