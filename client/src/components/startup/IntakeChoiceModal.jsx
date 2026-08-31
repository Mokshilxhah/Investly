import React from 'react';
import {
  X,
  Plus,
  FileSpreadsheet,
  Edit3,
  ChevronRight,
} from 'lucide-react';

export const IntakeChoiceModal = ({
  isOpen,
  onClose,
  onSelectManual,
  onSelectUpload,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md bg-white rounded-[32px] shadow-2xl border border-slate-200/80 overflow-hidden flex flex-col p-6 sm:p-7 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-extrabold font-display text-slate-900 leading-tight">
              Add Startups
            </h2>
            <p className="text-[11px] text-slate-500 font-display font-medium mt-0.5">
              Select your preferred intake method.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#f4f7f4] hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 2 Choice Options */}
        <div className="space-y-2.5">
          {/* Option 1: Manual Step-by-Step Form */}
          <button
            type="button"
            onClick={() => {
              onClose();
              onSelectManual();
            }}
            className="w-full text-left p-4 rounded-2xl bg-[#f8faf8] hover:bg-[#edf5ed] border border-slate-200/80 hover:border-slate-300 transition-all duration-150 flex items-center justify-between gap-3.5 group cursor-pointer hover:scale-[1.01]"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-[#191919] text-[#9df5a9] flex items-center justify-center font-display flex-shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                <Edit3 className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-extrabold font-display text-slate-950 group-hover:text-emerald-800 transition-colors">
                  Add Manually
                </div>
                <p className="text-[11px] text-slate-500 font-medium leading-normal font-display truncate">
                  Single startup 3-step intake form with founder & details.
                </p>
              </div>
            </div>
            <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-slate-400 group-hover:text-slate-950 shadow-xs flex-shrink-0">
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>

          {/* Option 2: Upload Directly from Excel / CSV */}
          <button
            type="button"
            onClick={() => {
              onClose();
              onSelectUpload();
            }}
            className="w-full text-left p-4 rounded-2xl bg-[#f8faf8] hover:bg-[#edf5ed] border border-slate-200/80 hover:border-slate-300 transition-all duration-150 flex items-center justify-between gap-3.5 group cursor-pointer hover:scale-[1.01]"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-[#9df5a9] text-slate-950 flex items-center justify-center font-display flex-shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                <FileSpreadsheet className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-extrabold font-display text-slate-950 group-hover:text-emerald-800 transition-colors flex items-center gap-1.5">
                  <span>Upload Directly (Excel / CSV)</span>
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-[#191919] text-white">
                    Bulk
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium leading-normal font-display truncate">
                  Import multiple startups with automatic column mapping.
                </p>
              </div>
            </div>
            <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-slate-400 group-hover:text-slate-950 shadow-xs flex-shrink-0">
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default IntakeChoiceModal;
