import React from 'react';
import Link from 'next/link';
import { Landmark, Building2, ArrowUpRight } from 'lucide-react';

export const NagrikStateCardsGrid: React.FC = () => {
  const featuredStates = [
    {
      id: 'delhi',
      name: 'Delhi',
      regionalName: 'दिल्ली',
      type: 'National Capital Territory',
      seats: 7,
      mps: 7,
      status: 'Data available',
      icon: Landmark,
      fundsAllocated: '₹ 35.0 Cr',
    },
    {
      id: 'uttar-pradesh',
      name: 'Uttar Pradesh',
      regionalName: 'उत्तर प्रदेश',
      type: 'State',
      seats: 80,
      mps: 80,
      status: 'Pipeline',
      icon: Building2,
      fundsAllocated: '₹ 400.0 Cr',
    },
    {
      id: 'maharashtra',
      name: 'Maharashtra',
      regionalName: 'महाराष्ट्र',
      type: 'State',
      seats: 48,
      mps: 48,
      status: 'Pipeline',
      icon: Landmark,
      fundsAllocated: '₹ 240.0 Cr',
    },
    {
      id: 'west-bengal',
      name: 'West Bengal',
      regionalName: 'পশ্চিমবঙ্গ',
      type: 'State',
      seats: 42,
      mps: 42,
      status: 'Pipeline',
      icon: Building2,
      fundsAllocated: '₹ 210.0 Cr',
    },
    {
      id: 'karnataka',
      name: 'Karnataka',
      regionalName: 'ಕರ್ನಾಟಕ',
      type: 'State',
      seats: 28,
      mps: 28,
      status: 'Pipeline',
      icon: Landmark,
      fundsAllocated: '₹ 140.0 Cr',
    },
    {
      id: 'tamil-nadu',
      name: 'Tamil Nadu',
      regionalName: 'தமிழ்நாடு',
      type: 'State',
      seats: 39,
      mps: 39,
      status: 'Pipeline',
      icon: Building2,
      fundsAllocated: '₹ 195.0 Cr',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
      {featuredStates.map((st) => {
        const Icon = st.icon;
        const isDelhi = st.id === 'delhi';

        return (
          <div
            key={st.id}
            className="group bg-white dark:bg-[#0E1420] border border-stone-200/90 dark:border-[#1E2636] hover:border-amber-500/60 rounded-xl p-5 transition-all flex flex-col justify-between shadow-xs hover:shadow-md"
          >
            <div>
              {/* Top Row: Icon + State Name + Seats */}
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-stone-100 dark:bg-[#16202E] border border-stone-200 dark:border-[#26344A] flex items-center justify-center text-amber-600 dark:text-amber-400 group-hover:border-amber-500/60 transition-colors">
                    <Icon className="w-5 h-5 stroke-[1.75]" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100 tracking-tight group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                      {st.name}
                    </h3>
                    <p className="text-[11px] font-mono text-stone-500 dark:text-stone-400">
                      {st.regionalName} · {st.type}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[10px] font-mono uppercase font-bold tracking-wider text-stone-400">
                    SEATS
                  </div>
                  <div className="text-base font-extrabold font-mono text-stone-900 dark:text-white flex items-center justify-end gap-1 tabular-nums">
                    <span>{st.seats}</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-amber-500 transition-colors" />
                  </div>
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-2 mb-4 font-mono text-[11px]">
                <span className={`px-2 py-0.5 rounded border ${
                  isDelhi
                    ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 font-bold'
                    : 'bg-stone-100 dark:bg-[#151D2A] text-stone-600 dark:text-stone-400 border-stone-200 dark:border-[#222E40]'
                }`}>
                  {isDelhi ? 'Delhi data available' : `${st.seats} Seats in Pipeline`}
                </span>
                <span className="text-stone-500 dark:text-stone-400">
                  {st.fundsAllocated}
                </span>
              </div>
            </div>

            {/* Bottom Row Links */}
            <div className="pt-3 border-t border-stone-100 dark:border-[#1A2333] flex items-center justify-between text-xs font-mono text-stone-500 dark:text-stone-400">
              <Link
                href={isDelhi ? `#find-constituency` : `/state/${st.id}`}
                className="hover:text-stone-900 dark:hover:text-stone-200 transition-colors"
              >
                Constituencies
              </Link>
              <span>·</span>
              <Link
                href={isDelhi ? `#delhi-mps` : `/state/${st.id}`}
                className="hover:text-stone-900 dark:hover:text-stone-200 transition-colors"
              >
                Members
              </Link>
              <span>·</span>
              <Link
                href="/about"
                className="hover:text-stone-900 dark:hover:text-stone-200 transition-colors"
              >
                Provenance
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
};
