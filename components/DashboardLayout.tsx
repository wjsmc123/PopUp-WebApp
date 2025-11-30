'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell } from 'lucide-react';
import { useAuthStore } from '@/lib/store/authStore';
import { getEvent } from '@/app/actions';
import { getThemeClasses } from '@/lib/utils';
import { LoadingScreen } from '@/components/LoadingScreen';
import { OfflineBanner } from '@/components/OfflineBanner';
import { BottomDock } from '@/components/BottomDock';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import type { EventConfig } from '@/types';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, eventData, setEventData } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const requestedEventId = useRef<string | null>(null);
  const isOnline = useNetworkStatus();

  useEffect(() => {
    if (!user) {
      requestedEventId.current = null; // reset guard on logout
      router.push('/login');
      return;
    }

    if (eventData || requestedEventId.current === user.eventId) {
      return; // Already have event data
    }

    let isMounted = true;
    requestedEventId.current = user.eventId;
    setLoading(true);
    
    const fetchEventData = async () => {
      try {
        const event = await getEvent(user.eventId);
        if (event && isMounted) {
          setEventData(event);
        }
      } catch (error) {
        console.error('Error fetching event data:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchEventData();
    
    return () => {
      isMounted = false;
    };
  }, [user, eventData, setEventData, router]);

  if (!user) {
    return null; // Will redirect to login
  }

  if (loading || !eventData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFCF8]">
        <LoadingScreen />
      </div>
    );
  }

  const theme = getThemeClasses(eventData.theme);

  return (
    <div className={`min-h-screen text-stone-800 pb-24 ${theme.bg} ${theme.fontBody} transition-colors duration-500`}>
      {!isOnline && <OfflineBanner />}

      {/* HEADER */}
      <nav className={`fixed ${isOnline ? 'top-0' : 'top-8'} left-0 right-0 z-50 glass px-6 py-4 flex items-center justify-between ${theme.navStyle} transition-all duration-300`}>
        <div>
          <h1 className={`text-xl font-bold leading-none ${theme.fontHeading} transition-all`}>
            {eventData.name}
          </h1>
          <p className={`text-[10px] uppercase tracking-widest text-stone-500 mt-1 ${theme.fontBody}`}>
            {theme.tagline}
          </p>
        </div>
        <div className="flex gap-4">
          <button className="relative group">
            <Bell size={20} className="text-stone-600 transition-transform group-hover:rotate-12" />
            <span className={`absolute -top-1 -right-1 w-2 h-2 rounded-full ${theme.accentBg}`}></span>
          </button>
        </div>
      </nav>

      <main className="pt-24 px-4 sm:px-6 max-w-md mx-auto space-y-8 animate-fade-in">
        {children}
      </main>

      {/* BOTTOM DOCK */}
      <BottomDock theme={theme} />
    </div>
  );
}
