import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ExternalLink,
  MapPin,
  User,
  Edit2,
  Trash2,
  ChevronRight,
  Building2,
  Target,
} from 'lucide-react';
import { StageBadge, IndustryBadge } from '../common/Badge';

export const StartupCard = ({ startup, onOpenProfile, onEdit, onDelete, onEvaluate }) => {
  const navigate = useNavigate();
  return (
    <div
      onClick={() => onOpenProfile(startup)}
      className="group bg-white rounded-[24px] p-5 shadow-xs border border-slate-200/80 hover:border-slate-300 hover:shadow-md transition-all duration-150 cursor-pointer flex flex-col justify-between overflow-hidden w-full min-w-0"
    >
      {/* 🏷️ Top: Avatar, Company Name, Industry & Stage Badges */}
      <div className="space-y-3 min-w-0">
        <div className="flex items-start justify-between gap-3 min-w-0">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-11 h-11 rounded-2xl bg-[#191919] text-white flex items-center justify-center font-display font-black text-sm flex-shrink-0 shadow-xs">
              {startup.companyName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 truncate">
                <h3 className="text-base font-extrabold font-display text-slate-900 group-hover:text-emerald-700 transition-colors truncate">
                  {startup.companyName}
                </h3>
                {startup.website && (
                  <a
                    href={startup.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-slate-400 hover:text-slate-900 transition-colors flex-shrink-0"
                    title="Website"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-1.5 mt-1">
                <IndustryBadge industry={startup.industry} />
                <StageBadge stage={startup.stage} />
              </div>
            </div>
          </div>
        </div>

        {/* Value Proposition / Description */}
        <p className="text-xs text-slate-600 font-medium line-clamp-2 leading-relaxed font-sans">
          {startup.description || 'No description provided.'}
        </p>

        {/* Founder & Location Strip */}
        <div className="p-3 rounded-2xl bg-[#f4f7f4] border border-slate-200/60 space-y-1 text-xs text-slate-700">
          <div className="flex items-center gap-2">
            <User className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
            <span className="font-bold text-slate-950 truncate">{startup.founder?.name}</span>
            {startup.founder?.background && (
              <span className="text-slate-500 truncate max-w-[140px] font-medium">
                — {startup.founder.background}
              </span>
            )}
          </div>
          {startup.location && (
            <div className="flex items-center gap-2 text-slate-500 font-medium">
              <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <span className="truncate">{startup.location}</span>
            </div>
          )}
        </div>
      </div>

      {/* 🛠️ Bottom: CRUD Actions & Evaluate */}
      <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
        {/* Inline Edit & Delete Actions */}
        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => onEdit(startup)}
            className="px-2.5 py-1.5 rounded-xl text-xs font-bold font-display text-slate-700 bg-[#f4f7f4] hover:bg-slate-200 transition-colors flex items-center gap-1"
            title="Edit Startup"
          >
            <Edit2 className="w-3 h-3" />
            <span>Edit</span>
          </button>
          <button
            type="button"
            onClick={() => onDelete(startup)}
            className="p-1.5 rounded-xl text-slate-400 hover:text-rose-700 hover:bg-rose-50 transition-colors"
            title="Delete Startup"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Evaluate CTA Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (onEvaluate) {
              onEvaluate(startup);
            } else {
              navigate(`/evaluation?id=${startup._id}`);
            }
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black font-display text-slate-950 bg-[#9df5a9] hover:bg-[#8ee59a] transition-colors shadow-xs"
          title="Evaluate Startup"
        >
          <Target className="w-3.5 h-3.5" />
          <span>Evaluate</span>
        </button>
      </div>
    </div>
  );
};

export default StartupCard;
