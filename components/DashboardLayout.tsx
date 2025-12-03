'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bell, LogIn } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/lib/store/authStore';
import { getEvent, getSchedule, getProducts } from '@/app/actions';
import { getThemeClasses } from '@/lib/utils';
import { LoadingScreen } from '@/components/LoadingScreen';
import { OfflineBanner } from '@/components/OfflineBanner';
import { BottomDock } from '@/components/BottomDock';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { useProfileRealtime } from '@/hooks/useProfileRealtime';
import type { EventConfig } from '@/types';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, eventData, setEventData } = useAuthStore();
  const queryClient = useQueryClient();
  const isOnline = useNetworkStatus();
  const eventId = user?.eventId;

  useProfileRealtime(user?.id);

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  const {
    data: queriedEvent,
    isLoading: eventLoading,
    isFetching: eventFetching,
    error,
  } = useQuery<EventConfig | null>({
    queryKey: ['event', eventId],
    queryFn: async () => {
      if (!eventId) return null;
      return getEvent(eventId);
    },
    enabled: Boolean(eventId),
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 60,
  });

  useEffect(() => {
    if (queriedEvent) {
      setEventData(queriedEvent);
    }
  }, [queriedEvent, setEventData]);

  useEffect(() => {
    if (!eventId) return;
    queryClient.prefetchQuery({
      queryKey: ['schedule', eventId],
      queryFn: () => getSchedule(eventId),
    }).catch(() => undefined);
    queryClient.prefetchQuery({
      queryKey: ['products', eventId],
      queryFn: () => getProducts(eventId),
    }).catch(() => undefined);
  }, [eventId, queryClient]);

  if (!user) {
    return (
      <div className="relative min-h-screen flex items-center justify-center bg-[#050505] text-white px-6">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.15), transparent 40%), radial-gradient(circle at 80% 0, rgba(255,255,255,0.1), transparent 45%)',
          }}
        ></div>
        <div className="relative max-w-sm w-full text-center space-y-6">
          <div className="space-y-2">
            <p className="text-[10px] uppercase tracking-[0.3em] text-stone-500">PopUp Concierge</p>
            <h1 className="text-3xl font-semibold">You&apos;re almost there.</h1>
            <p className="text-sm text-stone-400">
              Sign in with your booking reference to unlock your personalised schedule, dining, and concierge services.
            </p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-2 text-left">
            <p className="text-xs uppercase tracking-[0.3em] text-stone-400">Next step</p>
            <p className="text-base font-medium">Continue to secure login</p>
            <p className="text-xs text-stone-500">Use the link below. We&apos;ll keep your place.</p>
          </div>
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 bg-white text-stone-900 px-5 py-2.5 rounded-full text-sm font-semibold tracking-wide hover:bg-stone-100 transition-colors"
          >
            <LogIn size={16} /> Continue to login
          </Link>
          <div className="flex items-center justify-center gap-2 text-[10px] uppercase tracking-[0.4em] text-stone-500">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Secure session
          </div>
        </div>
      </div>
    );
  }

  const resolvedEvent = eventData || queriedEvent;

  if ((eventLoading || eventFetching) && !resolvedEvent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFCF8]">
        <LoadingScreen />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFCF8] text-center px-6 text-sm text-red-500">
        <div>
          <p className="font-semibold">Unable to load event data.</p>
          <p>Please refresh or check your connection.</p>
        </div>
      </div>
    );
  }

  if (!resolvedEvent) {
    return null;
  }

  const theme = getThemeClasses(resolvedEvent.theme);

  return (
    <div className={`min-h-screen text-stone-800 pb-24 ${theme.bg} ${theme.fontBody} transition-colors duration-500`}>
      {!isOnline && <OfflineBanner />}

      {/* HEADER */}
      <nav className={`fixed ${isOnline ? 'top-0' : 'top-8'} left-0 right-0 z-50 glass px-6 py-4 flex items-center justify-between ${theme.navStyle} transition-all duration-300`}>
        <div>
          <h1 className={`text-xl font-bold leading-none ${theme.fontHeading} transition-all`}>
            {resolvedEvent.name}
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
