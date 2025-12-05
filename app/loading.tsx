'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { HomeSkeleton, ShopSkeleton, PersonalSkeleton, SettingsSkeleton } from '@/components/Skeletons';
import { useAuthStore } from '@/lib/store/authStore';
import { getThemeClasses } from '@/lib/utils';

function FetchingMessage() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center text-stone-500 text-xs uppercase tracking-[0.4em]">
      Fetching latest view...
    </div>
  );
}

export default function Loading() {
  const pathname = usePathname();
  const eventData = useAuthStore((state) => state.eventData);
  const theme = eventData ? getThemeClasses(eventData.theme) : getThemeClasses('silverstone');

  let skeleton: ReactNode;

  if (!pathname) {
    skeleton = <FetchingMessage />;
  } else if (pathname.startsWith('/shop')) {
    skeleton = <ShopSkeleton theme={theme} />;
  } else if (pathname.startsWith('/personal')) {
    skeleton = <PersonalSkeleton theme={theme} />;
  } else if (pathname.startsWith('/settings')) {
    skeleton = <SettingsSkeleton theme={theme} />;
  } else {
    skeleton = <HomeSkeleton theme={theme} />;
  }

  return <DashboardLayout>{skeleton}</DashboardLayout>;
}
