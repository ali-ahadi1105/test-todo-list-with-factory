'use client';

import { Providers } from '@/app/providers';
import { ReactNode } from 'react';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <Providers>{children}</Providers>;
}
