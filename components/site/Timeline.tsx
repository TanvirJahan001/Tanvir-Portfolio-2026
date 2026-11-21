'use client';
import { useEffect, useRef, useState } from 'react';
import { experience } from '@/lib/content';
import { clamp, onSiteScroll } from './siteScroll';

const digits = Array.from({ length: 10 }, (_, i) => i);
export default function Timeline() {
  const list = useRef<HTMLOListElement>(null);
  const [active, setActive] = useState(0);
  useEffect(() => {
    const el = list.current!;
    const rows = Array.from(el.children);
    return onSiteScroll(({ tops, y, height }) => {
      const pivot = y + height * 0.5;
      setActive(
        Math.max(
          0,
          rows.findLastIndex((row) => tops.get(row)! <= pivot),
        ),
      );
      const center = (row: Element) =>
        tops.get(row)! + (row as HTMLElement).offsetHeight * 0.5;
      const first = center(rows[0]),
        last = center(rows[rows.length - 1]);
      el.style.setProperty('--line-start', rows[0].clientHeight * 0.5 + 'px');
      el.style.setProperty(
        '--line-end',
        rows[rows.length - 1].clientHeight * 0.5 + 'px',
      );
      el.style.setProperty(
        '--line-progress',
        String(clamp((pivot - first) / Math.max(1, last - first))),
      );
    });
  }, []);
  const year = experience[active].year,
    numeric = /^\d{4}$/.test(year);
  const lastNumber =
    experience
      .slice(0, active + 1)
      .findLast((item) => /^\d{4}$/.test(item.year))?.year || '0000';
  return (
    <div className="history">
      <div className="year-column" aria-hidden="true">
        <div className="sticky-year">
          <b className="year-display" data-numeric={numeric}>
            <span className="number-columns">
              {Array.from(lastNumber, (d, i) => (
                <span className="digit-window" key={i}>
                  <span
                    className="digit-strip"
                    style={{ transform: 'translateY(-' + Number(d) + 'em)' }}
                  >
                    {digits.map((n) => (
                      <span key={n}>{n}</span>
                    ))}
                  </span>
                </span>
              ))}
            </span>
            <span className="word-year">{numeric ? '' : year}</span>
          </b>
          <small>{experience[active].period}</small>
        </div>
      </div>
      <div>
        <p className="micro-title">History</p>
        <ol ref={list}>
          {experience.map((item, i) => (
            <li key={item.organization} data-active={active === i}>
              <small>{item.year}</small>
              <h3>{item.title}</h3>
              <p>
                {item.organization} · {item.period}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
