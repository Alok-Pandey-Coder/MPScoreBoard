import React from 'react';
import Link from 'next/link';
import { Landmark, Building2, MapPin, ArrowUpRight, Users, BookOpen } from 'lucide-react';
import { INDIA_STATES } from '@/lib/indiaGeoData';

export const NagrikStateCardsGrid: React.FC = () => {
  const featuredStates = [
    {
      id: 'delhi',
      name: 'Delhi',
      regionalName: 'दिल्ली',
      type: 'National Capital Territory',
      seats: 7,
      mps: 7,
      status: 'Active Snapshot',
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {featuredStates.map((st) => {
        const Icon = st.icon;
        const isDelhi = st.id === 'delhi';

        return (
          <div
            key={st.id}
            className="group bg-[#161c24] hover:bg-[#1a222d] border border-[#27323f] hover:border-cyan-500/50 rounded-3xl p-6 transition-all duration-300 flex flex-col justify-between shadow-xl"
          >
            <div>
              {/* Top Row: Icon + State Name + Seats/Fund + Arrow */}
              <div className="flex items-start justify-between gap-4 mb-5">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-[#1e2733] border border-[#2e3b4b] flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform">
                    <Icon className="w-6 h-6 stroke-[1.75]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-extrabold text-white font-['Outfit'] tracking-tight group-hover:text-cyan-400 transition-colors">
                      {st.name}
                    </h3>
                    <p className="text-xs text-slate-400 font-sans">
                      {st.regionalName}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                    LOK SABHA SEATS
                  </div>
                  <div className="text-lg font-extrabold text-white font-['Outfit'] flex items-center justify-end gap-1">
                    <span>{st.seats}</span>
                    <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition-colors" />
                  </div>
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-2 mb-6">
                <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                  isDelhi
                    ? 'bg-cyan-950/70 text-cyan-300 border-cyan-800'
                    : 'bg-[#1b232e] text-slate-400 border-[#2a3746]'
                }`}>
                  {isDelhi ? 'Verified Active Coverage' : `${st.seats} Seats Demarcated`}
                </span>
                <span className="text-xs text-slate-400">
                  Fund: {st.fundsAllocated}
                </span>
              </div>
            </div>

            {/* Bottom Row Links (like Nagrik screenshot 5) */}
            <div className="pt-4 border-t border-[#232c37] flex items-center justify-between text-xs text-slate-400">
              <Link href={isDelhi ? `/mp/chandni-chowk-delhi` : `/state/${st.id}`}
                className="hover:text-white transition-colors flex items-center gap-1"
              >
                <span>Constituencies</span>
              </Link>
              <span>•</span>
              <Link href={isDelhi ? `/mp/new-delhi-delhi` : `/state/${st.id}`}
                className="hover:text-white transition-colors flex items-center gap-1"
              >
                <span>MPs</span>
              </Link>
              <span>•</span>
              <Link href="/about"
                className="hover:text-white transition-colors flex items-center gap-1"
              >
                <span>Sources</span>
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
};

