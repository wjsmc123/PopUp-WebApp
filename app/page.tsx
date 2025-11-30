'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, CloudSun, Wind, Map } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { LoadingScreen } from '@/components/LoadingScreen';
import { useAuthStore } from '@/lib/store/authStore';
import { getSchedule } from '@/app/actions';
import { getThemeClasses } from '@/lib/utils';
import type { ScheduleItem } from '@/types';

export default function HomePage() {
  const router = useRouter();
  const { user, eventData } = useAuthStore();
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const hasFetchedSchedule = useRef<string | null>(null);

  useEffect(() => {
    if (!user) {
      hasFetchedSchedule.current = null;
      router.push('/login');
      return;
    }

    if (hasFetchedSchedule.current === user.eventId) {
      return;
    }

    hasFetchedSchedule.current = user.eventId;
    const fetchSchedule = async () => {
      const items = await getSchedule(user.eventId);
      setSchedule(items);
    };

    fetchSchedule();
  }, [user, router]);

  if (!user) {
    return null;
  }

  // If we have user but no eventData, render DashboardLayout so it can fetch it
  if (!eventData) {
    return <DashboardLayout><LoadingScreen /></DashboardLayout>;
  }

  const theme = getThemeClasses(eventData.theme);

  return (
    <DashboardLayout>
      {/* Welcome */}
      <section className="animate-slide-up">
        <h2 className={`text-3xl ${theme.fontHeading} mb-1`}>
          Good Morning, <span className="opacity-50 italic">{user.firstName}.</span>
        </h2>
        <div className="flex items-center gap-2 text-stone-500 text-xs">
          <MapPin size={12} /> {eventData.location}
        </div>
      </section>

      {/* Weather Widgets */}
      <section className="grid grid-cols-2 gap-3 animate-slide-up" style={{ animationDelay: '100ms' }}>
        <div className={`bg-white p-4 border border-stone-200 ${theme.cardShape} flex flex-col justify-between h-32 relative overflow-hidden group hover:shadow-md transition-shadow`}>
          <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity duration-500">
            <CloudSun size={60} />
          </div>
          <span className="text-[10px] uppercase tracking-widest text-stone-400">Air Temp</span>
          <div className="flex items-baseline gap-1">
            <span className={`text-4xl ${theme.fontHeading}`}>{eventData.weather.temp}°</span>
            <span className="text-xs text-stone-400">C</span>
          </div>
          <div className={`text-xs ${theme.accentText} font-medium`}>{eventData.weather.condition}</div>
        </div>

        <div className={`bg-white p-4 border border-stone-200 ${theme.cardShape} flex flex-col justify-between h-32 relative overflow-hidden group hover:shadow-md transition-shadow`}>
          <div className={`absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity duration-500 ${theme.accentText}`}>
            <Wind size={60} />
          </div>
          <span className="text-[10px] uppercase tracking-widest text-stone-400">Wind</span>
          <div className="flex items-baseline gap-1">
            <span className={`text-4xl ${theme.fontHeading}`}>{eventData.weather.wind}</span>
            <span className="text-xs text-stone-400">km/h</span>
          </div>
          <div className="w-full bg-stone-100 h-1 rounded-full overflow-hidden mt-2">
            <div className={`h-full w-2/3 ${theme.accentBg}`}></div>
          </div>
        </div>
      </section>

      {/* Map Placeholder */}
      <section className={`h-48 bg-stone-900 ${theme.cardShape} relative overflow-hidden group shadow-lg animate-slide-up`} style={{ animationDelay: '200ms' }}>
        {/* Abstract Map Graphic */}
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '16px 16px' }}></div>
        <svg viewBox="0 0 200 100" className="absolute inset-0 w-full h-full stroke-stone-600 fill-none" strokeWidth="1">
          <path d="M20,50 Q50,10 80,50 T150,50 T200,80" />
          <path d="M0,80 Q50,80 80,20 T180,20" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <button className={`bg-white/10 backdrop-blur-md border border-white/20 text-white px-4 py-2 ${theme.buttonShape} flex items-center gap-2 text-sm hover:bg-white/20 transition hover:scale-105 active:scale-95`}>
            <Map size={16} /> Open Site Map
          </button>
        </div>
        <div className="absolute top-4 left-4">
          <div className={`w-3 h-3 ${theme.accentBg} rounded-full animate-pulse shadow-[0_0_10px_rgba(255,255,255,0.5)]`}></div>
        </div>
      </section>

      {/* Timeline */}
      <section className="animate-slide-up" style={{ animationDelay: '300ms' }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-lg ${theme.fontHeading}`}>Today&apos;s Agenda</h3>
          <span className="text-xs font-mono border border-stone-200 px-2 py-1 rounded text-stone-400 bg-white/50">
            {new Date().toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric' })}
          </span>
        </div>
        <div className="space-y-4 pl-4 border-l-2 border-stone-200">
          {schedule.length === 0 ? (
            <p className="text-xs text-stone-400 italic">No scheduled events for today.</p>
          ) : (
            schedule.map((item) => (
              <div key={item.id} className={`relative transition-opacity duration-300 ${!item.active ? 'opacity-50 hover:opacity-80' : ''}`}>
                <div className={`absolute -left-[21px] top-1.5 w-3 h-3 rounded-full border-2 border-white ${item.active ? theme.accentBg : 'bg-stone-300'}`}></div>
                <div className="flex flex-col">
                  <div className="flex justify-between items-center">
                    <span className={`text-xs font-bold ${item.active ? theme.accentText : 'text-stone-400'}`}>{item.time}</span>
                    {item.active && (
                      <span className={`text-[10px] uppercase ${theme.accentBg} text-white px-1.5 rounded animate-pulse`}>Live</span>
                    )}
                  </div>
                  <h4 className="font-medium">{item.title}</h4>
                  <p className="text-xs text-stone-500">{item.type}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </DashboardLayout>
  );
}
