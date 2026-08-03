import type { Metadata } from 'next';
import { PageHeader } from '@/components/shared/PageHeader';
import { HomeDashboard } from '@/components/home/HomeDashboard';
export const metadata: Metadata = { title: 'Home' };
export default function HomePage() { return <div className="space-y-6"><PageHeader title="Today" description="Your sales operation at a glance" /><HomeDashboard /></div>; }
