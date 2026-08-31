import React from 'react';
import {
  X,
  Building2,
  ExternalLink,
  MapPin,
  User,
  Edit2,
  Trash2,
  Globe,
} from 'lucide-react';
import { IndustryBadge, StageBadge, DecisionBadge } from '../common/Badge';

export const StartupProfileModal = ({
  isOpen,
  onClose,
  startup,
  onEdit,
  onDelete,
}) => {
  if (!isOpen || !startup) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-xl bg-white rounded-[32px] shadow-2xl border border-slate-200/80 overflow-hidden flex flex-col p-6 sm:p-7 space-y-5 max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-[#191919] text-white flex items-center justify-center font-display font-black text-base shadow-xs flex-shrink-0">
              {startup.companyName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-extrabold font-display text-slate-900 tracking-tight truncate">
                  {startup.companyName}
                </h2>
                {startup.website && (
                  <a
                    href={startup.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-400 hover:text-slate-800 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-1.5 mt-1">
                <IndustryBadge industry={startup.industry} />
                <StageBadge stage={startup.stage} />
                <DecisionBadge status={startup.decision?.status || 'UNDER_EVALUATION'} />
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-[#f4f7f4] hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors flex-shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto space-y-4 flex-1 pr-1">
          {/* Company Overview */}
          <div className="space-y-1.5">
            <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 font-display">
              Company Overview & Value Proposition
            </h4>
            <p className="text-xs text-slate-700 font-medium leading-relaxed bg-[#f8faf8] p-3.5 rounded-2xl border border-slate-200/60 font-sans">
              {startup.description || 'No description provided.'}
            </p>
          </div>

          {/* Founder & Track Record */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1 text-slate-400 text-[10px] font-extrabold uppercase tracking-wider font-display">
              <User className="w-3 h-3" />
              <span>Founder & Background</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#f8faf8] border border-slate-200/60 space-y-0.5">
              <div className="text-xs font-extrabold font-display text-slate-950">
                {startup.founder?.name}
              </div>
              <div className="text-[11px] text-slate-600 font-medium leading-relaxed">
                {startup.founder?.background || 'No founder background provided.'}
              </div>
            </div>
          </div>

          {/* Location & Website */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1 text-slate-400 text-[10px] font-extrabold uppercase tracking-wider font-display">
              <MapPin className="w-3 h-3" />
              <span>HQ & Presence</span>
            </div>
            <div className="p-3 rounded-2xl bg-[#f8faf8] border border-slate-200/60 space-y-1.5 text-[11px]">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium font-display">HQ Location:</span>
                <span className="font-bold text-slate-900 font-display">{startup.location || 'Not Specified'}</span>
              </div>
              {startup.website && (
                <div className="flex items-center justify-between pt-1.5 border-t border-slate-200/60">
                  <span className="text-slate-500 font-medium font-display">Website:</span>
                  <a
                    href={startup.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-emerald-700 hover:underline truncate max-w-[200px]"
                  >
                    {startup.website}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              onClose();
              onDelete(startup);
            }}
            className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-400 hover:text-rose-700 font-display transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Startup</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              onEdit(startup);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold font-display text-slate-900 bg-[#f4f7f4] hover:bg-slate-200 transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Edit Details</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default StartupProfileModal;
