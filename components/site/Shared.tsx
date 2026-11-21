import Image from 'next/image';
import { profile, siteSections } from '@/lib/content';
import LocalTime from '../LocalTime';

export function Portrait({
  className = '',
  priority = false,
  decorative = false,
}) {
  return (
    <Image
      className={className}
      src={profile.portrait}
      alt={decorative ? '' : 'Tanvir Jahan'}
      width={640}
      height={640}
      unoptimized
      priority={priority}
    />
  );
}
export function LocationStamp() {
  return (
    <div className="location-stamp">
      <Image src="/site/globe.svg" alt="" width={96} height={96} />
      <div>
        <strong>
          Rajshahi <LocalTime />
        </strong>
        <small>Bangladesh · UTC+6</small>
      </div>
    </div>
  );
}
export function SectionMark({ id }: { id: string }) {
  const index = siteSections.findIndex((item) => item.id === id);
  const item = siteSections[index];
  return (
    <header className="section-mark" data-entrance="marker">
      <span
        aria-hidden="true"
        data-scramble={'(' + String(index + 1).padStart(2, '0') + ')'}
      >
        ({String(index + 1).padStart(2, '0')})
      </span>
      <b>
        <span className="sr-only">{item.marker}</span>
        <span aria-hidden="true" data-scramble={item.marker}>
          {item.marker}
        </span>
      </b>
      <small>{item.caption}</small>
    </header>
  );
}
export function NameLine() {
  return (
    <div className="name-line-art" aria-hidden="true">
      <div>
        {Array.from({ length: 8 }, (_, i) => (
          <span key={i}>{profile.name} • </span>
        ))}
      </div>
    </div>
  );
}
