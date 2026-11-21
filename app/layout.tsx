import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import Motion from '@/components/Motion';
import { profile } from '@/lib/content';
import { siteUrl } from '@/lib/site';
import './globals.css';

// The public repository also hosts the cover before a deployment origin is configured.
const cover = siteUrl
  ? new URL('/social-cover.png', siteUrl).href
  : 'https://raw.githubusercontent.com/TanvirJahan001/Tanvir-Portfolio-2026/main/public/social-cover.png';

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: {
    default: 'Tanvir Jahan — Full-Stack Developer & Software Engineer',
    template: '%s — Tanvir Jahan',
  },
  description:
    'Selected work by Tanvir Jahan, a full-stack developer building business applications, interactive interfaces and automation systems in Rajshahi, Bangladesh.',
  authors: [{ name: profile.name }],
  openGraph: {
    type: 'website',
    siteName: 'Tanvir Jahan',
    images: [
      {
        url: cover,
        width: 1200,
        height: 630,
        alt: 'Tanvir Jahan and an original orbital particle sculpture',
      },
    ],
  },
  twitter: { card: 'summary_large_image', images: [cover] },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={GeistSans.variable + ' ' + GeistMono.variable}
    >
      <head>
        <link rel="preconnect" href="https://api.fontshare.com" />
        <link
          rel="preconnect"
          href="https://cdn.fontshare.com"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://api.fontshare.com/v2/css?f[]=general-sans@300,400,600,700&display=swap"
        />
      </head>
      <body>
        <a className="skip" href="#main">
          Skip to content
        </a>
        {children}
        <Motion />
      </body>
    </html>
  );
}
