import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { Spinner } from './Loader';

export const DeleteConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Delete Startup',
  message = 'Are you sure you want to delete this startup profile? This action will permanently remove all evaluations and scorecard history.',
  itemName,
  loading = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md bg-white rounded-[32px] p-7 shadow-2xl border border-slate-100 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={loading}
          className="w-8 h-8 rounded-full bg-[#f4f7f4] hover:bg-slate-200 text-slate-600 flex items-center justify-center absolute top-6 right-6 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon & Heading */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#ffbaba] text-slate-900 flex items-center justify-center flex-shrink-0 shadow-sm">
            <AlertTriangle className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h3 className="text-base font-bold font-display text-slate-900">{title}</h3>
            {itemName && (
              <p className="text-xs font-bold text-rose-600 mt-0.5 font-display">
                {itemName}
              </p>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-slate-500 leading-relaxed">{message}</p>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-5 py-2.5 text-xs font-bold font-display text-slate-600 hover:text-slate-900 bg-[#f4f7f4] hover:bg-slate-200 rounded-2xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold font-display text-slate-900 bg-[#ffbaba] hover:bg-[#ffa6a6] rounded-2xl shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? (
              <>
                <Spinner size="sm" />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                <span>Delete Profile</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
