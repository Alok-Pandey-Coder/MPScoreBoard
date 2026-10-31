'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { X, Search, Share2, ExternalLink } from 'lucide-react';
import { MPRecord } from '@/types/mp';
import { MPAvatar } from '@/components/ui/MPAvatar';
import { Toast } from '@/components/common/Toast';

interface CompareClientProps {
  mps: MPRecord[];
}

// Colors for the comparison bars matching the reference design:
// Member 1: Dark Charcoal / Black
// Member 2: Terracotta / Rust Orange (#c2410c)
// Member 3: Deep Teal / Blue (#0e7490)
const MEMBER_BAR_COLORS = [
  { fill: 'bg-[#18181b] dark:bg-slate-200', text: 'text-[#18181b] dark:text-slate-200' },
  { fill: 'bg-[#c2410c] dark:bg-orange-500', text: 'text-[#c2410c] dark:text-orange-400' },
  { fill: 'bg-[#0e7490] dark:bg-teal-400', text: 'text-[#0e7490] dark:text-teal-300' },
];

export const CompareClient: React.FC<CompareClientProps> = ({ mps }) => {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Read initial slugs from URL params
  const initialSlugs = React.useMemo(() => {
    const membersParam = searchParams?.get('members');
    if (membersParam) {
      const split = membersParam.split(',').filter(Boolean);
      if (split.length > 0) return split.slice(0, 3);
    }
    const a = searchParams?.get('a');
    const b = searchParams?.get('b');
    const c = searchParams?.get('c');
    const list: string[] = [];
    if (a) list.push(a);
    if (b) list.push(b);
    if (c) list.push(c);
    if (list.length > 0) return list.slice(0, 3);

    // Default to first two MPs (Chandni Chowk & New Delhi)
    return [mps[0]?.slug || 'chandni-chowk-delhi', mps[2]?.slug || mps[1]?.slug || 'new-delhi-delhi'];
  }, [searchParams, mps]);

  const [selectedSlugs, setSelectedSlugs] = useState<string[]>(initialSlugs);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Sync to URL
  useEffect(() => {
    if (selectedSlugs.length > 0) {
      const query = `members=${selectedSlugs.join(',')}`;
      router.replace(`/compare?${query}`, { scroll: false });
    }
  }, [selectedSlugs, router]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter selected MP objects
  const selectedMPs = selectedSlugs
    .map((slug) => mps.find((m) => m.slug === slug))
    .filter((m): m is MPRecord => Boolean(m));

  // Autocomplete matching list
  const filteredCandidates = searchQuery.trim()
    ? mps.filter(
        (m) =>
          !selectedSlugs.includes(m.slug) &&
          (m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            m.constituency.toLowerCase().includes(searchQuery.toLowerCase()) ||
            m.party.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : [];

  const handleAddMember = (slug: string) => {
    if (selectedSlugs.length < 3 && !selectedSlugs.includes(slug)) {
      setSelectedSlugs([...selectedSlugs, slug]);
    }
    setSearchQuery('');
    setIsDropdownOpen(false);
  };

  const handleRemoveMember = (slugToRemove: string) => {
    if (selectedSlugs.length <= 1) return; // Keep at least one
    setSelectedSlugs(selectedSlugs.filter((s) => s !== slugToRemove));
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setToastOpen(true);
    }
  };

  // Helper metric extractors
  const getAttendancePct = (m: MPRecord): number | null => {
    if (m.is_minister || m.performance?.status === 'not_applicable') return null;
    return m.performance?.attendance_pct ?? null;
  };

  const getQuestions = (m: MPRecord): number | null => {
    if (m.is_minister || m.performance?.status === 'not_applicable') return null;
    return m.performance?.questions ?? null;
  };

  const getMpladsSpentCr = (m: MPRecord): number | null => {
    if (m.mplads?.expenditure_cr !== undefined && m.mplads?.expenditure_cr !== null) {
      return m.mplads.expenditure_cr;
    }
    return null;
  };

  const getWorksCompleted = (m: MPRecord): number | null => {
    if (m.mplads?.works_count?.completed !== undefined && m.mplads?.works_count?.completed !== null) {
      return m.mplads.works_count.completed;
    }
    return null;
  };

  const getPendingCases = (m: MPRecord): number | null => {
    if (m.affidavit?.declared_criminal_cases !== undefined && m.affidavit?.declared_criminal_cases !== null) {
      return m.affidavit.declared_criminal_cases;
    }
    return null;
  };

  // Maximum values among selected MPs to draw relative comparison bars
  const maxQuestions = Math.max(
    ...selectedMPs.map((m) => getQuestions(m) ?? 0),
    1
  );

  const maxSpentCr = Math.max(
    ...selectedMPs.map((m) => getMpladsSpentCr(m) ?? 0),
    0.01
  );

  const maxWorks = Math.max(
    ...selectedMPs.map((m) => getWorksCompleted(m) ?? 0),
    1
  );

  return (
    <div className="min-h-screen bg-[#FAF7F2] dark:bg-[#14191F] text-[#1c1917] dark:text-[#F3F4F6] py-10 px-4 sm:px-6 lg:px-8 font-sans transition-colors duration-200">
      <div className="max-w-5xl mx-auto space-y-7">
        {/* Top Explanatory Notice (Matching reference screenshot exactly) */}
        <p className="text-xs text-[#78716c] dark:text-slate-400 leading-relaxed font-normal">
          Add up to three members. Bars compare these people to each other, not to a score. The sitting house median uses listed members only — missing is not zero.
        </p>

        {/* Add a member search input & Selected Member Chips */}
        <div className="space-y-3" ref={searchRef}>
          <div>
            <label
              htmlFor="add-member-input"
              className="block text-xs font-medium text-[#44403c] dark:text-slate-300 mb-1.5"
            >
              Add a member
            </label>
            <div className="relative">
              <input
                id="add-member-input"
                type="text"
                value={searchQuery}
                disabled={selectedSlugs.length >= 3}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsDropdownOpen(true);
                }}
                onFocus={() => setIsDropdownOpen(true)}
                placeholder={
                  selectedSlugs.length >= 3 ? 'Maximum 3 members compared' : 'Type a name'
                }
                className="w-full bg-white dark:bg-[#1A222D] border border-[#DDD6C8] dark:border-[#303A45] rounded-lg px-3.5 py-2.5 text-sm text-[#1c1917] dark:text-white placeholder-[#a8a29e] dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[#78716c] dark:focus:ring-cyan-500 shadow-xs transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              />

              {/* Autocomplete Dropdown */}
              {isDropdownOpen && searchQuery.trim() && (
                <div className="absolute top-full left-0 right-0 mt-1.5 bg-white dark:bg-[#171D24] border border-[#DDD6C8] dark:border-[#303A45] rounded-xl shadow-xl z-30 max-h-64 overflow-y-auto divide-y divide-[#F2EDE4] dark:divide-[#252F3D]">
                  {filteredCandidates.length > 0 ? (
                    filteredCandidates.map((cand) => (
                      <button
                        key={cand.slug}
                        type="button"
                        onClick={() => handleAddMember(cand.slug)}
                        className="w-full text-left px-4 py-3 flex items-center justify-between hover:bg-[#F6F2EB] dark:hover:bg-[#202936] transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <MPAvatar imageUrl={cand.image_url} name={cand.name} size="sm" className="rounded-full" />
                          <div>
                            <div className="text-sm font-semibold text-[#1c1917] dark:text-white">
                              {cand.name}
                            </div>
                            <div className="text-xs text-[#78716c] dark:text-slate-400">
                              {cand.constituency} • {cand.party}
                            </div>
                          </div>
                        </div>
                        <span className="text-xs font-semibold text-[#0e7490] dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/60 px-2.5 py-1 rounded-md border border-cyan-200 dark:border-cyan-800/60">
                          + Add
                        </span>
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-xs text-[#78716c] dark:text-slate-400">
                      No matching members found.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Active Member Pills (Matching reference screenshot exactly) */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {selectedMPs.map((mp) => (
              <div
                key={mp.slug}
                className="inline-flex items-center gap-2 bg-[#18181b] dark:bg-[#1F2937] text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-xs border border-transparent dark:border-slate-700 animate-in fade-in duration-200"
              >
                <span>{mp.name}</span>
                {selectedSlugs.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveMember(mp.slug)}
                    aria-label={`Remove ${mp.name}`}
                    className="hover:text-stone-300 dark:hover:text-slate-300 focus:outline-none cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* The Exact Comparison Matrix Table */}
        <div className="overflow-x-auto pb-4">
          <table className="w-full text-left border-collapse min-w-[620px]">
            <tbody>
              {/* Row 1: Header / MP Avatars & Names */}
              <tr className="border-b border-[#E7E1D7] dark:border-[#273344]">
                <td className="py-4 w-44 sm:w-52 pr-4 text-xs font-medium text-[#78716c] dark:text-slate-400 align-middle">
                  {/* Empty header cell */}
                </td>
                {selectedMPs.map((mp) => (
                  <td key={mp.slug} className="py-4 px-3 align-middle">
                    <Link
                      href={`/mp/${mp.slug}`}
                      className="inline-flex items-center gap-2.5 group"
                    >
                      <div className="w-9 h-9 rounded-full overflow-hidden border border-[#DDD6C8] dark:border-slate-700 shrink-0">
                        <MPAvatar
                          imageUrl={mp.image_url}
                          name={mp.name}
                          size="sm"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="text-sm sm:text-base font-semibold text-[#1c1917] dark:text-white group-hover:underline">
                        {mp.name}
                      </span>
                    </Link>
                  </td>
                ))}
              </tr>

              {/* Row 2: House */}
              <tr className="border-b border-[#E7E1D7] dark:border-[#273344]">
                <td className="py-3.5 pr-4 text-xs sm:text-sm font-medium text-[#78716c] dark:text-slate-400">
                  House
                </td>
                {selectedMPs.map((mp) => (
                  <td key={mp.slug} className="py-3.5 px-3 text-xs sm:text-sm text-[#1c1917] dark:text-slate-200">
                    {mp.term || '18th Lok Sabha'}
                  </td>
                ))}
              </tr>

              {/* Row 3: Role */}
              <tr className="border-b border-[#E7E1D7] dark:border-[#273344]">
                <td className="py-3.5 pr-4 text-xs sm:text-sm font-medium text-[#78716c] dark:text-slate-400">
                  Role
                </td>
                {selectedMPs.map((mp) => (
                  <td key={mp.slug} className="py-3.5 px-3 text-xs sm:text-sm text-[#1c1917] dark:text-slate-200">
                    {mp.is_minister ? 'Union Minister' : 'Member of Parliament'}
                  </td>
                ))}
              </tr>

              {/* Row 4: Attendance (Value + Horizontal Bar) */}
              <tr className="border-b border-[#E7E1D7] dark:border-[#273344]">
                <td className="py-4 pr-4 text-xs sm:text-sm font-medium text-[#78716c] dark:text-slate-400 align-top">
                  Attendance
                </td>
                {selectedMPs.map((mp, idx) => {
                  const pct = getAttendancePct(mp);
                  const color = MEMBER_BAR_COLORS[idx % MEMBER_BAR_COLORS.length];

                  return (
                    <td key={mp.slug} className="py-4 px-3 align-top">
                      <div className="text-xs sm:text-sm text-[#1c1917] dark:text-slate-200">
                        {pct !== null ? `${pct}%` : 'not applicable (minister)'}
                      </div>

                      {pct !== null && (
                        <div className="w-full max-w-[280px] h-2 bg-[#E2DBD0] dark:bg-slate-700/80 rounded-full overflow-hidden mt-1.5">
                          <div
                            className={`h-full ${color.fill} rounded-full transition-all duration-500`}
                            style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
                          />
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>

              {/* Row 5: Questions (Value + Horizontal Bar) */}
              <tr className="border-b border-[#E7E1D7] dark:border-[#273344]">
                <td className="py-4 pr-4 text-xs sm:text-sm font-medium text-[#78716c] dark:text-slate-400 align-top">
                  Questions
                </td>
                {selectedMPs.map((mp, idx) => {
                  const q = getQuestions(mp);
                  const color = MEMBER_BAR_COLORS[idx % MEMBER_BAR_COLORS.length];
                  const barWidth = q !== null ? Math.min(100, (q / maxQuestions) * 100) : 0;

                  return (
                    <td key={mp.slug} className="py-4 px-3 align-top">
                      <div className="text-xs sm:text-sm text-[#1c1917] dark:text-slate-200">
                        {q !== null ? q : 'not applicable (minister)'}
                      </div>

                      {q !== null && (
                        <div className="w-full max-w-[280px] h-2 bg-[#E2DBD0] dark:bg-slate-700/80 rounded-full overflow-hidden mt-1.5">
                          <div
                            className={`h-full ${color.fill} rounded-full transition-all duration-500`}
                            style={{ width: `${barWidth}%` }}
                          />
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>

              {/* Row 6: MPLADS spent (Value + Horizontal Bar) */}
              <tr className="border-b border-[#E7E1D7] dark:border-[#273344]">
                <td className="py-4 pr-4 text-xs sm:text-sm font-medium text-[#78716c] dark:text-slate-400 align-top">
                  MPLADS spent
                </td>
                {selectedMPs.map((mp, idx) => {
                  const spent = getMpladsSpentCr(mp);
                  const color = MEMBER_BAR_COLORS[idx % MEMBER_BAR_COLORS.length];
                  const barWidth = spent !== null ? Math.min(100, (spent / maxSpentCr) * 100) : 0;

                  return (
                    <td key={mp.slug} className="py-4 px-3 align-top">
                      <div className="text-xs sm:text-sm text-[#1c1917] dark:text-slate-200">
                        {spent !== null ? `₹${spent.toFixed(2)} cr` : 'not listed'}
                      </div>

                      {spent !== null && (
                        <div className="w-full max-w-[280px] h-2 bg-[#E2DBD0] dark:bg-slate-700/80 rounded-full overflow-hidden mt-1.5">
                          <div
                            className={`h-full ${color.fill} rounded-full transition-all duration-500`}
                            style={{ width: `${barWidth}%` }}
                          />
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>

              {/* Row 7: Works completed (Value + Horizontal Bar) */}
              <tr className="border-b border-[#E7E1D7] dark:border-[#273344]">
                <td className="py-4 pr-4 text-xs sm:text-sm font-medium text-[#78716c] dark:text-slate-400 align-top">
                  Works completed
                </td>
                {selectedMPs.map((mp, idx) => {
                  const works = getWorksCompleted(mp);
                  const color = MEMBER_BAR_COLORS[idx % MEMBER_BAR_COLORS.length];
                  const barWidth = works !== null ? Math.min(100, (works / maxWorks) * 100) : 0;

                  return (
                    <td key={mp.slug} className="py-4 px-3 align-top">
                      <div className="text-xs sm:text-sm text-[#1c1917] dark:text-slate-200">
                        {works !== null ? works : 'not listed'}
                      </div>

                      {works !== null && (
                        <div className="w-full max-w-[280px] h-2 bg-[#E2DBD0] dark:bg-slate-700/80 rounded-full overflow-hidden mt-1.5">
                          <div
                            className={`h-full ${color.fill} rounded-full transition-all duration-500`}
                            style={{ width: `${barWidth}%` }}
                          />
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>

              {/* Row 8: Pending cases disclosed (Value only, NO bar) */}
              <tr className="border-b border-[#E7E1D7] dark:border-[#273344]">
                <td className="py-4 pr-4 text-xs sm:text-sm font-medium text-[#78716c] dark:text-slate-400">
                  Pending cases disclosed
                </td>
                {selectedMPs.map((mp) => {
                  const cases = getPendingCases(mp);

                  return (
                    <td key={mp.slug} className="py-4 px-3 text-xs sm:text-sm text-[#1c1917] dark:text-slate-200">
                      {cases !== null ? cases : 'not listed'}
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Bottom Explanatory Notes & Medians (Matching reference screenshot exactly) */}
        <div className="pt-4 space-y-2 text-xs text-[#78716c] dark:text-slate-400 leading-relaxed border-t border-[#E7E1D7] dark:border-[#273344]">
          <p>
            Catalog as of 31 Oct 2026. Sitting house medians (listed members only): Lok Sabha attendance 96%, questions 172, MPLADS spent ₹2.44 cr. Not a score.
          </p>
          <p>
            Latest listed Lok Sabha session: 18th Lok Sabha. 19 sittings held, 7,529 questions listed, 95% median attendance among listed members. Not a score.
          </p>
        </div>

        {/* Share Button */}
        <div className="pt-2 flex items-center justify-between">
          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-[#1A222D] text-[#44403c] dark:text-slate-300 border border-[#DDD6C8] dark:border-[#303A45] hover:bg-[#F2EDE4] dark:hover:bg-[#222E3E] transition-colors cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share comparison link</span>
          </button>
        </div>
      </div>

      <Toast
        message="Comparison link copied to clipboard!"
        isOpen={toastOpen}
        onClose={() => setToastOpen(false)}
      />
    </div>
  );
};
