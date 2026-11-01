'use client';

import React, { useState } from 'react';
import { MapPin, Navigation } from 'lucide-react';
import { useMessages } from '@/context/LanguageContext';
import { mapMessages } from '@/lib/messages/map';

interface LocateMySeatProps {
  /** State id the lookup is scoped to (e.g. "delhi", "goa"). */
  stateId: string;
  /** Called with the matched constituency slug; the parent focuses it on its map. */
  onResolved: (slug: string) => void;
}

type Status =
  | { kind: 'idle' }
  | { kind: 'loading'; by: 'pincode' | 'location' }
  | { kind: 'found'; seat: string }
  | { kind: 'error'; message: string };

const PINCODE = /^[1-9]\d{5}$/;

/** Find my constituency in this state by 6-digit pincode or by device location. */
export const LocateMySeat: React.FC<LocateMySeatProps> = ({ stateId, onResolved }) => {
  const t = useMessages(mapMessages);
  const [pincode, setPincode] = useState('');
  const [status, setStatus] = useState<Status>({ kind: 'idle' });

  const resolve = async (body: Record<string, unknown>) => {
    try {
      const res = await fetch('/api/locate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...body, state: stateId }),
      });
      const data = await res.json();
      const result = data?.result;
      if (data?.status === 'success' && result?.slug) {
        setStatus({ kind: 'found', seat: result.constituency });
        onResolved(result.slug);
        return;
      }
      const reason = result?.reason;
      setStatus({
        kind: 'error',
        message:
          reason === 'unsupported' ? t.locateUnsupported : reason === 'outside' ? t.locateOutside : t.locateNotFound,
      });
    } catch {
      setStatus({ kind: 'error', message: t.locateFailed });
    }
  };

  const submitPincode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!PINCODE.test(pincode)) {
      setStatus({ kind: 'error', message: t.pincodeInvalid });
      return;
    }
    setStatus({ kind: 'loading', by: 'pincode' });
    void resolve({ pincode });
  };

  const useLocation = () => {
    if (!navigator.geolocation) {
      setStatus({ kind: 'error', message: t.geoUnsupported });
      return;
    }
    setStatus({ kind: 'loading', by: 'location' });
    navigator.geolocation.getCurrentPosition(
      (pos) => void resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setStatus({ kind: 'error', message: t.geoDenied }),
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  const loading = status.kind === 'loading';

  return (
    <div className="space-y-2.5">
      <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
        {t.locateTitle}
      </div>

      <form onSubmit={submitPincode} className="flex gap-2">
        <input
          type="text"
          inputMode="numeric"
          autoComplete="postal-code"
          maxLength={6}
          value={pincode}
          onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
          placeholder={t.pincodePlaceholder}
          aria-label={t.pincodePlaceholder}
          className="min-w-0 flex-1 px-3 py-2 bg-white dark:bg-[#141C29] border border-stone-300 dark:border-[#232F42] rounded-lg text-xs font-mono tracking-widest text-stone-900 dark:text-stone-100 placeholder:tracking-normal placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-3 py-2 rounded-lg bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-950 text-xs font-mono font-bold uppercase tracking-wider disabled:opacity-60 cursor-pointer"
        >
          {loading && status.by === 'pincode' ? t.locating : t.pincodeFind}
        </button>
      </form>

      <button
        type="button"
        onClick={useLocation}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs font-mono uppercase tracking-wider rounded-lg shadow-sm transition-colors disabled:opacity-60 cursor-pointer"
      >
        <Navigation className={`w-3.5 h-3.5 ${loading && status.by === 'location' ? 'animate-spin' : ''}`} aria-hidden="true" />
        <span>{loading && status.by === 'location' ? t.locating : t.useMyLocation}</span>
      </button>

      <div aria-live="polite" className="min-h-[1rem] text-[11px] font-mono">
        {status.kind === 'found' && (
          <p className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
            <MapPin className="w-3 h-3" aria-hidden="true" />
            {t.locateFound(status.seat)}
          </p>
        )}
        {status.kind === 'error' && <p className="text-amber-700 dark:text-amber-400">{status.message}</p>}
      </div>
      <p className="text-[10px] font-mono text-stone-400 dark:text-stone-500">{t.locatePrivacy}</p>
    </div>
  );
};
