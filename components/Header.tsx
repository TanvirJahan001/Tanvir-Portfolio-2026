import Link from 'next/link';

export function Monogram() {
  return (
    <svg
      viewBox="0 0 43 35"
      width="37"
      height="31"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M1 4h27l-1.6 6.8h-8.2l-4.8 20H6.5l4.8-20H0zM33.6 4H41l-4.1 17.5c-1.6 6.6-5.8 9.5-12 9.5h-6l1.6-6.8h4.6c2.6 0 4.1-1.3 4.8-4.2z" />
    </svg>
  );
}
export default function Header() {
  return (
    <header className="header shell">
      <Link href="/" className="brand" aria-label="Tanvir Jahan home">
        <Monogram />
        <span>Tanvir Jahan</span>
      </Link>
      <nav aria-label="Primary">
        <Link href="/#work">Work</Link>
        <Link href="/#about">About</Link>
        <Link href="/#contact" className="nav-contact">
          Contact
        </Link>
      </nav>
    </header>
  );
}
