'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Flag, CreditCard, Coffee, Wind, ChevronRight } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { LoadingScreen } from '@/components/LoadingScreen';
import { useAuthStore } from '@/lib/store/authStore';
import { getThemeClasses } from '@/lib/utils';

export default function PersonalPage() {
  const router = useRouter();
  const { user, eventData } = useAuthStore();

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  if (!user || !eventData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFCF8]">
        <LoadingScreen />
      </div>
    );
  }

  const theme = getThemeClasses(eventData.theme);

  return (
    <DashboardLayout>
      {/* Digital Key Card */}
      <div className={`bg-stone-900 text-stone-50 p-6 relative overflow-hidden shadow-xl ${theme.cardShape} animate-flip-in`}>
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <div className="w-32 h-32 border-4 border-white rounded-full"></div>
        </div>
        <div className="relative z-10 space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] text-stone-400 uppercase tracking-widest">Sanctuary</span>
              <h3 className={`text-3xl mt-1 ${theme.fontHeading}`}>{user.roomNumber}</h3>
              <p className="text-stone-400 text-xs">{user.roomType}</p>
            </div>
            <div className="text-right">
              <Flag size={20} className="text-stone-600 mb-2 ml-auto" />
            </div>
          </div>

          <div className="flex justify-between items-end border-t border-stone-700 pt-4">
            <div>
              <span className="text-[10px] text-stone-500 uppercase block">Check In</span>
              <span className="text-sm font-mono">{user.checkIn}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-stone-500 uppercase block">Check Out</span>
              <span className="text-sm font-mono">{user.checkOut}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Status */}
      <div className={`bg-white p-4 border border-stone-200 flex items-center justify-between ${theme.cardShape} animate-slide-up`} style={{ animationDelay: '100ms' }}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-stone-100 rounded-full text-stone-600">
            <CreditCard size={20} />
          </div>
          <div>
            <span className="text-xs font-bold block">Current Tab</span>
            <span className={`text-[10px] ${theme.accentText}`}>Unpaid</span>
          </div>
        </div>
        <span className="text-xl font-mono">£{user.currentTab.toFixed(2)}</span>
      </div>

      {/* Services */}
      <section className="space-y-3 animate-slide-up" style={{ animationDelay: '200ms' }}>
        <h3 className={`text-lg ${theme.fontHeading}`}>Concierge Services</h3>
        <button className={`w-full bg-white p-4 border border-stone-200 text-left hover:bg-stone-50 transition-colors flex items-center justify-between ${theme.cardShape}`}>
          <div className="flex items-center gap-3">
            <Coffee className="text-stone-400" size={18} />
            <span className="text-sm">Room Service Breakfast</span>
          </div>
          <ChevronRight size={16} className="text-stone-300" />
        </button>
        <button className={`w-full bg-white p-4 border border-stone-200 text-left hover:bg-stone-50 transition-colors flex items-center justify-between ${theme.cardShape}`}>
          <div className="flex items-center gap-3">
            <Wind className="text-stone-400" size={18} />
            <span className="text-sm">Spa & Wellness</span>
          </div>
          <ChevronRight size={16} className="text-stone-300" />
        </button>
      </section>
    </DashboardLayout>
  );
}
