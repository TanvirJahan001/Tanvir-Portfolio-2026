import { profile } from '@/lib/content';
import Link from 'next/link';
export default function Footer() {
  return (
    <footer className="contact shell" id="contact">
      <div className="section-label">
        <span className="marker" />
        Contact
      </div>
      <div className="contact-body">
        <div>
          <h2>
            Let’s build
            <br />
            <em>something.</em>
          </h2>
          <p>Have a role, a project or a workflow in mind?</p>
        </div>
        <div className="contact-links">
          <a className="email" href={'mailto:' + profile.email}>
            {profile.email}
          </a>
          <div>
            <a href={profile.github}>GitHub</a>
            <a href={profile.linkedin}>LinkedIn</a>
          </div>
        </div>
      </div>
      <div className="footer-line">
        <span>© 2026 Tanvir Jahan</span>
        <Link href="/#top">Back to top ↑</Link>
      </div>
    </footer>
  );
}
