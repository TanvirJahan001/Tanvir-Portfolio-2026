'use client';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import {
  Component,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { chapters } from '@/lib/content';
import { Monogram } from './Header';

const Scene = dynamic(() => import('./StoryScene'), {
  ssr: false,
  loading: () => <div className="scene-poster" />,
});
class SceneBoundary extends Component<
  { children: ReactNode; onFailure: () => void },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onFailure();
  }
  render() {
    return this.state.failed ? (
      <div className="scene-poster" />
    ) : (
      this.props.children
    );
  }
}
export default function Story() {
  const [chapter, setChapter] = useState(0),
    [paused, setPaused] = useState(false),
    [sound, setSound] = useState(false);
  const [reduced, setReduced] = useState(true),
    [active, setActive] = useState(true),
    [failed, setFailed] = useState(false);
  const audio = useRef<AudioContext | null>(null);
  const failure = useCallback(() => setFailed(true), []);
  const info = chapters[chapter];
  const tone = useCallback((index: number) => {
    const ctx = audio.current;
    if (!ctx || ctx.state !== 'running') return;
    const osc = ctx.createOscillator(),
      gain = ctx.createGain(),
      t = ctx.currentTime;
    osc.frequency.value = [196, 246.94, 293.66, 392][index];
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.035, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
    osc.connect(gain).connect(ctx.destination);
    osc.onended = () => {
      osc.disconnect();
      gain.disconnect();
    };
    osc.start();
    osc.stop(t + 0.52);
  }, []);
  const select = useCallback(
    (index: number) => {
      setChapter(index);
      if (sound) tone(index);
    },
    [sound, tone],
  );
  async function toggleSound() {
    if (sound) {
      setSound(false);
      return;
    }
    try {
      const ctx = audio.current ?? new AudioContext();
      audio.current = ctx;
      await ctx.resume();
      setSound(true);
      tone(chapter);
    } catch {
      setSound(false);
    }
  }
  useEffect(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    const motion = () => setReduced(media.matches),
      visibility = () => setActive(!document.hidden);
    motion();
    visibility();
    media.addEventListener('change', motion);
    document.addEventListener('visibilitychange', visibility);
    return () => {
      media.removeEventListener('change', motion);
      document.removeEventListener('visibilitychange', visibility);
      void audio.current?.close();
      audio.current = null;
    };
  }, []);
  return (
    <main className="story shell" id="main">
      <header className="story-head">
        <Link href="/" className="brand" aria-label="Tanvir Jahan home">
          <Monogram />
          <span>Tanvir Jahan</span>
        </Link>
        <Link className="exit" href="/">
          Exit to portfolio <span aria-hidden="true">×</span>
        </Link>
      </header>
      <div className="story-layout">
        <div className="story-copy" aria-live="polite">
          <div className="eyebrow">
            <span className="signal" />
            Field study / 0{chapter + 1}
          </div>
          <h1 key={info.title}>{info.title}</h1>
          <p>{info.text}</p>
          <Link className="case-link" href={info.href}>
            {info.link} ↗
          </Link>
        </div>
        <div className="story-art" aria-hidden="true">
          {failed ? (
            <div className="scene-poster" />
          ) : (
            <SceneBoundary onFailure={failure}>
              <Scene
                chapter={chapter}
                active={active}
                still={paused || reduced}
                onFailure={failure}
              />
            </SceneBoundary>
          )}
        </div>
      </div>
      <div className="story-console">
        <nav aria-label="Story chapters">
          {chapters.map((c, i) => (
            <button
              key={c.name}
              aria-current={i === chapter ? 'step' : undefined}
              onClick={() => select(i)}
            >
              <small>0{i + 1}</small>
              {c.name}
            </button>
          ))}
        </nav>
        <div className="story-settings">
          {!failed && !reduced && (
            <button aria-pressed={paused} onClick={() => setPaused(!paused)}>
              {paused ? 'Resume motion' : 'Pause motion'}
            </button>
          )}
          <button aria-pressed={sound} onClick={toggleSound}>
            Sound {sound ? 'on' : 'off'}
          </button>
        </div>
      </div>
    </main>
  );
}
