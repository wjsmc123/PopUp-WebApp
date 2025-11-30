'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight, Flag, Loader2 } from 'lucide-react';
import { signIn } from '@/app/actions';
import { useAuthStore } from '@/lib/store/authStore';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { OfflineBanner } from '@/components/OfflineBanner';

export default function LoginPage() {
  const [booking, setBooking] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const router = useRouter();
  const isOnline = useNetworkStatus();
  const { setUser } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isOnline) {
      setError('Connection lost. Please try again when online.');
      return;
    }
    
    setError('');
    setIsSubmitting(true);
    
    try {
      const result = await signIn(booking, name);
      
      if (result.success && result.user) {
        setUser(result.user);
        // Small delay to ensure store is updated before navigation
        setTimeout(() => {
          router.push('/');
        }, 100);
      } else {
        setError(result.error || 'Booking reference invalid or not found.');
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error(err);
      setError('An unexpected error occurred.');
      setIsSubmitting(false);
    }
  };

  const fillSampleLogin = (ref: string, firstName: string) => {
    setBooking(ref);
    setName(firstName);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden bg-[#FDFCF8]">
      <div className="absolute inset-0 bg-[radial-gradient(#E7E5E4_1px,transparent_1px)] [background-size:24px_24px] opacity-50" />
      
      {!isOnline && <OfflineBanner />}

      <div className="relative z-10 w-full max-w-sm space-y-8">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-stone-900 mx-auto rounded-full flex items-center justify-center mb-4 shadow-xl shadow-stone-200">
            <span className="text-stone-50 font-serif font-bold text-2xl italic">TPH</span>
          </div>
          <h1 className="text-3xl font-serif text-stone-900 tracking-tight">
            The Pop Up Hotel
          </h1>
          <p className="text-stone-500 font-sans text-sm">
            Sanctuary at the heart of the action.
          </p>
        </div>

        <form 
          onSubmit={handleSubmit} 
          className="space-y-4 bg-white/80 backdrop-blur-sm p-8 rounded-xl border border-stone-200 shadow-lg"
        >
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-400">
              Booking Reference
            </label>
            <input
              type="text"
              value={booking}
              onChange={(e) => setBooking(e.target.value)}
              placeholder="e.g. TPH-SIL-001"
              disabled={isSubmitting}
              className="w-full bg-stone-50 border border-stone-200 rounded p-3 text-stone-900 font-mono focus:outline-none focus:ring-2 focus:ring-stone-400 transition-all placeholder:text-stone-300 disabled:opacity-50"
            />
          </div>
          
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-400">
              First Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Lewis"
              disabled={isSubmitting}
              className="w-full bg-stone-50 border border-stone-200 rounded p-3 text-stone-900 font-sans focus:outline-none focus:ring-2 focus:ring-stone-400 transition-all placeholder:text-stone-300 disabled:opacity-50"
            />
          </div>

          {error && (
            <p className="text-red-500 text-xs text-center flex items-center justify-center gap-1">
              <Flag size={10} /> {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting || !isOnline}
            className="w-full bg-stone-900 text-white font-medium py-3 rounded hover:bg-stone-800 transition-colors flex items-center justify-center gap-2 disabled:bg-stone-400"
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <>
                Enter Sanctuary <ChevronRight size={16} />
              </>
            )}
          </button>
        </form>

        <div className="text-center space-y-2">
          <p className="text-[10px] uppercase tracking-widest text-stone-400">
            Sample Logins (Must exist in DB)
          </p>
          <div className="flex justify-center gap-2 text-[10px] text-stone-500 font-mono">
            <button
              className="hover:text-stone-900 hover:underline"
              onClick={() => fillSampleLogin('TPH-SIL-001', 'Lewis')}
            >
              SIL-001
            </button>{' '}
            •
            <button
              className="hover:text-stone-900 hover:underline"
              onClick={() => fillSampleLogin('TPH-MON-001', 'Charles')}
            >
              MON-001
            </button>{' '}
            •
            <button
              className="hover:text-stone-900 hover:underline"
              onClick={() => fillSampleLogin('TPH-GLA-001', 'Dua')}
            >
              GLA-001
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
