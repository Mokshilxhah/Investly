import React from 'react';
import { Search, RotateCcw, ArrowUpDown } from 'lucide-react';

const INDUSTRIES = [
  'ALL',
  'Fintech',
  'Healthtech',
  'AI/ML',
  'SaaS',
  'CleanTech',
  'Cybersecurity',
  'E-commerce',
  'EdTech',
  'Logistics',
  'BioTech',
];

const STAGES = ['ALL', 'Idea', 'Pre-seed', 'Seed', 'Series A', 'Series B+'];

const SORT_OPTIONS = [
  { value: 'createdAt-desc', label: 'Newest First' },
  { value: 'createdAt-asc', label: 'Oldest First' },
  { value: 'companyName-asc', label: 'Name (A-Z)' },
  { value: 'companyName-desc', label: 'Name (Z-A)' },
  { value: 'industry-asc', label: 'Industry (A-Z)' },
  { value: 'stage-asc', label: 'Stage' },
];

export const SearchFilterBar = ({
  search,
  setSearch,
  selectedIndustry,
  setSelectedIndustry,
  selectedStage,
  setSelectedStage,
  sortBy,
  setSortBy,
  onResetFilters,
}) => {
  const hasActiveFilters =
    search ||
    selectedIndustry !== 'ALL' ||
    selectedStage !== 'ALL';

  return (
    <div className="bg-white rounded-[24px] p-4 shadow-sm border border-slate-200/80 space-y-3 w-full min-w-0">
      {/* Top: Search Input */}
      <div className="relative w-full min-w-0">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search startups by company name, founder, industry, location..."
          className="w-full pl-10 pr-16 py-2 rounded-xl bg-[#f4f7f4] border border-slate-200/60 text-slate-900 placeholder-slate-400 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#9df5a9] transition-all"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-2.5 top-2 text-[11px] font-bold text-slate-600 hover:text-slate-900 bg-white px-2.5 py-0.5 rounded-full shadow-xs"
          >
            Clear
          </button>
        )}
      </div>

      {/* Bottom: Filter Dropdowns & Sorters */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t border-slate-100 w-full min-w-0">
        <div className="flex flex-wrap items-center gap-2 min-w-0">
          {/* Industry Filter */}
          <div className="flex items-center gap-1.5 bg-[#f4f7f4] px-2.5 py-1.5 rounded-xl border border-slate-200/60">
            <span className="text-[11px] text-slate-500 font-bold font-display">Industry:</span>
            <select
              value={selectedIndustry}
              onChange={(e) => setSelectedIndustry(e.target.value)}
              className="bg-transparent text-slate-900 text-xs font-bold focus:outline-none cursor-pointer"
            >
              {INDUSTRIES.map((ind) => (
                <option key={ind} value={ind} className="bg-white text-slate-900">
                  {ind === 'ALL' ? 'All Industries' : ind}
                </option>
              ))}
            </select>
          </div>

          {/* Stage Filter */}
          <div className="flex items-center gap-1.5 bg-[#f4f7f4] px-2.5 py-1.5 rounded-xl border border-slate-200/60">
            <span className="text-[11px] text-slate-500 font-bold font-display">Stage:</span>
            <select
              value={selectedStage}
              onChange={(e) => setSelectedStage(e.target.value)}
              className="bg-transparent text-slate-900 text-xs font-bold focus:outline-none cursor-pointer"
            >
              {STAGES.map((stg) => (
                <option key={stg} value={stg} className="bg-white text-slate-900">
                  {stg === 'ALL' ? 'All Stages' : stg}
                </option>
              ))}
            </select>
          </div>

          {/* Reset Filters */}
          {hasActiveFilters && (
            <button
              onClick={onResetFilters}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold font-display text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200/60 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Sort Options */}
        <div className="flex items-center gap-1.5 bg-[#f4f7f4] px-2.5 py-1.5 rounded-xl border border-slate-200/60">
          <ArrowUpDown className="w-3 h-3 text-slate-400" />
          <span className="text-[11px] text-slate-500 font-bold font-display">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-transparent text-slate-900 text-xs font-bold focus:outline-none cursor-pointer"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-white text-slate-900">
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default SearchFilterBar;
