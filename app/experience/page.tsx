import type { Metadata } from 'next';
import Story from '@/components/Story';
import { siteUrl } from '@/lib/site';
export const metadata: Metadata = {
  title: 'Immersive experience',
  description:
    'Explore four interactive particle studies from Tanvir’s software engineering practice.',
  alternates: siteUrl ? { canonical: '/experience' } : undefined,
};
export default function Experience() {
  return <Story />;
}
