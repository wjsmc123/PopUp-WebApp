'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, ToggleLeft, ToggleRight } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { LoadingScreen } from '@/components/LoadingScreen';
import { useAuthStore } from '@/lib/store/authStore';
import { getThemeClasses } from '@/lib/utils';

export default function SettingsPage() {
  const router = useRouter();
  const { user, eventData, logout } = useAuthStore();
  const [eventUpdates, setEventUpdates] = useState(true);
  const [partnerOffers, setPartnerOffers] = useState(false);

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

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-slide-up">
        <h2 className={`text-3xl ${theme.fontHeading}`}>Preferences</h2>

        <section className={`bg-white p-6 border border-stone-200 space-y-6 ${theme.cardShape}`}>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-400">
              WhatsApp Notification Number
            </label>
            <div className="flex gap-2">
              <select className="bg-stone-50 border border-stone-200 p-2 rounded text-sm text-stone-600">
                <option>+44</option>
                <option>+33</option>
                <option>+1</option>
              </select>
              <input
                type="tel"
                placeholder="7700 900000"
                className="flex-1 bg-stone-50 border border-stone-200 p-2 rounded text-stone-900 text-sm focus:outline-none focus:ring-1 focus:ring-stone-400"
                defaultValue={user.whatsapp}
              />
            </div>
            <p className="text-[10px] text-stone-400">
              We will send booking confirmations and urgent weather alerts here.
            </p>
          </div>

          <div className="border-t border-stone-100 pt-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Event Updates</span>
              <button onClick={() => setEventUpdates(!eventUpdates)}>
                {eventUpdates ? (
                  <ToggleRight size={24} className={`${theme.accentText} cursor-pointer`} />
                ) : (
                  <ToggleLeft size={24} className="text-stone-300 cursor-pointer" />
                )}
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Partner Offers</span>
              <button onClick={() => setPartnerOffers(!partnerOffers)}>
                {partnerOffers ? (
                  <ToggleRight size={24} className={`${theme.accentText} cursor-pointer`} />
                ) : (
                  <ToggleLeft size={24} className="text-stone-300 cursor-pointer" />
                )}
              </button>
            </div>
          </div>
        </section>

        <button
          onClick={handleLogout}
          className={`w-full border border-stone-300 text-stone-500 py-3 hover:bg-stone-100 hover:text-red-500 transition-colors flex items-center justify-center gap-2 text-sm ${theme.buttonShape}`}
        >
          <LogOut size={16} /> Sign Out
        </button>
      </div>
    </DashboardLayout>
  );
}
