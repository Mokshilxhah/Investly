import React from 'react';
import { ExternalLink, Edit2, Trash2, ChevronRight } from 'lucide-react';
import { StageBadge, IndustryBadge } from '../common/Badge';

export const StartupTable = ({ startups, onOpenProfile, onEdit, onDelete }) => {
  return (
    <div className="w-full overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-800">
          <thead className="bg-[#f4f7f4] text-[11px] uppercase tracking-wider text-slate-600 font-display font-extrabold border-b border-slate-200/80">
            <tr>
              <th className="px-5 py-4 font-bold">Company</th>
              <th className="px-4 py-4 font-bold">Industry</th>
              <th className="px-4 py-4 font-bold">Stage</th>
              <th className="px-4 py-4 font-bold">Founder</th>
              <th className="px-4 py-4 font-bold">Location</th>
              <th className="px-5 py-4 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-display">
            {startups.map((startup) => {
              return (
                <tr
                  key={startup._id}
                  onClick={() => onOpenProfile(startup)}
                  className="hover:bg-[#f8faf8] transition-colors cursor-pointer group"
                >
                  {/* Company Name & Website */}
                  <td className="px-5 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#191919] text-white flex items-center justify-center font-black font-display text-xs shadow-xs">
                        {startup.companyName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <span className="font-extrabold text-slate-950 group-hover:text-emerald-700 transition-colors">
                          {startup.companyName}
                        </span>
                        {startup.website && (
                          <span className="text-[11px] text-slate-400 block mt-0.5">
                            {startup.website.replace(/^https?:\/\//, '')}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Industry */}
                  <td className="px-4 py-4 whitespace-nowrap">
                    <IndustryBadge industry={startup.industry} />
                  </td>

                  {/* Stage */}
                  <td className="px-4 py-4 whitespace-nowrap">
                    <StageBadge stage={startup.stage} />
                  </td>

                  {/* Founder */}
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div>
                      <div className="font-bold text-slate-900">{startup.founder?.name}</div>
                      {startup.founder?.background && (
                        <div className="text-slate-500 text-[11px] font-medium truncate max-w-[160px]">
                          {startup.founder.background}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Location */}
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="text-slate-600 font-medium">
                      {startup.location || '—'}
                    </span>
                  </td>

                  {/* Inline CRUD Actions */}
                  <td
                    className="px-5 py-4 whitespace-nowrap text-right"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => onEdit(startup)}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold font-display text-slate-700 bg-[#f4f7f4] hover:bg-slate-200 transition-colors flex items-center gap-1"
                        title="Edit"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(startup)}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onOpenProfile(startup)}
                        className="px-3 py-1.5 rounded-xl text-xs font-black font-display text-slate-950 bg-[#9df5a9] hover:bg-[#8ee59a] transition-colors ml-1"
                      >
                        View
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StartupTable;
