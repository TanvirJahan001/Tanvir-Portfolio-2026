import type { CSSProperties } from 'react';

export function Words({
  text,
  offset = 0,
  hero = false,
  proximity = false,
}: {
  text: string;
  offset?: number;
  hero?: boolean;
  proximity?: boolean;
}) {
  return text.split(' ').map((word, i) => (
    <span key={i} aria-hidden="true">
      <span className={'word-mask' + (hero ? ' intro-word' : '')}>
        <span
          className="motion-word"
          style={{ '--word-index': i + offset } as CSSProperties}
        >
          {proximity
            ? Array.from(word, (letter, j) => (
                <span className="near-char" key={j}>
                  {letter}
                </span>
              ))
            : word}
        </span>
      </span>{' '}
    </span>
  ));
}
export function Ink({ text }: { text: string }) {
  return text.split(' ').map((word, i) => (
    <span key={i} className="ink-word" aria-hidden="true">
      {word}{' '}
    </span>
  ));
}
export function Rollover({ text }: { text: string }) {
  return (
    <span className="roll-label" aria-hidden="true">
      {Array.from(text, (letter, i) => (
        <span key={i} style={{ '--char-index': i } as CSSProperties}>
          <i>{letter === ' ' ? '\u00a0' : letter}</i>
          <i>{letter === ' ' ? '\u00a0' : letter}</i>
        </span>
      ))}
    </span>
  );
}
