'use client';
import { useEffect, useRef, useState } from 'react';
import { experience } from '@/lib/content';

export default function Timeline() {
  const list = useRef<HTMLOListElement>(null);
  const [active, setActive] = useState(0);
  useEffect(() => {
    const rows = Array.from(list.current!.children);
    let frame = 0;
    function update() {
      frame = 0;
      const pivot = innerHeight * 0.49;
      let nearest = 0,
        distance = Infinity;
      rows.forEach((row, i) => {
        const r = row.getBoundingClientRect(),
          d = Math.abs(r.top + r.height / 2 - pivot);
        if (d < distance) {
          nearest = i;
          distance = d;
        }
      });
      setActive(nearest);
    }
    function queue() {
      if (!frame) frame = requestAnimationFrame(update);
    }
    update();
    window.addEventListener('scroll', queue, { passive: true });
    window.addEventListener('resize', queue);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', queue);
      window.removeEventListener('resize', queue);
    };
  }, []);
  return (
    <div className="history">
      <div className="year-column" aria-hidden="true">
        <div className="sticky-year">
          <b key={active}>{experience[active].year}</b>
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
