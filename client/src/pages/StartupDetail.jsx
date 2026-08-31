import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  ExternalLink,
  MapPin,
  User,
  Edit2,
  Trash2,
  Globe,
  Tag,
  Clock,
  CheckCircle2,
  Calendar,
  AlertTriangle,
} from 'lucide-react';
import startupService from '../services/startupService';
import { StageBadge, IndustryBadge, DecisionBadge } from '../components/common/Badge';
import StartupModal from '../components/startup/StartupModal';
import DeleteConfirmModal from '../components/common/DeleteConfirmModal';
import { PageLoader } from '../components/common/Loader';

export const StartupDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [startup, setStartup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Edit / Delete Modals
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (message, type = 'success') => {
    setToastMessage({ message, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  const fetchStartup = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await startupService.getStartupById(id);
      setStartup(data);
    } catch (err) {
      console.error('Error fetching startup:', err);
      setError(err.message || 'Startup not found.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchStartup();
  }, [id]);

  const handleUpdate = async (payload) => {
    try {
      setActionLoading(true);
      const updated = await startupService.updateStartup(id, payload);
      setStartup(updated);
      setIsEditOpen(false);
      showToast(`'${updated.companyName}' profile updated!`);
    } catch (err) {
      console.error('Error updating startup:', err);
      showToast(err.message || 'Failed to update profile.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setActionLoading(true);
      await startupService.deleteStartup(id);
      showToast(`'${startup.companyName}' deleted.`);
      setIsDeleteOpen(false);
      navigate('/startups');
    } catch (err) {
      console.error('Error deleting startup:', err);
      showToast(err.message || 'Failed to delete startup.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <PageLoader />;
  }

  if (error || !startup) {
    return (
      <div className="max-w-md mx-auto my-12 bg-white rounded-[32px] p-8 text-center shadow-sm border border-slate-200">
        <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
          <AlertTriangle className="w-6 h-6 stroke-[2.5]" />
        </div>
        <h2 className="text-lg font-bold font-display text-slate-900">Startup Not Found</h2>
        <p className="text-xs text-slate-600 mt-1 mb-5">{error || 'The requested startup does not exist.'}</p>
        <Link
          to="/startups"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#191919] text-white text-xs font-bold font-display hover:opacity-90 transition-opacity"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Startups</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 text-slate-900 w-full min-w-0">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-xs font-black font-display animate-in slide-in-from-bottom duration-150 ${
            toastMessage.type === 'error'
              ? 'bg-[#ffbaba] text-[#191919]'
              : 'bg-[#9df5a9] text-[#191919]'
          }`}
        >
          {toastMessage.type === 'error' ? (
            <AlertTriangle className="w-4 h-4" />
          ) : (
            <CheckCircle2 className="w-4 h-4 stroke-[3]" />
          )}
          <span>{toastMessage.message}</span>
        </div>
      )}

      {/* 🏷️ Top Navigation Bar */}
      <div className="flex items-center justify-between">
        <Link
          to="/startups"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-extrabold font-display text-slate-700 bg-white hover:bg-slate-100 border border-slate-200/80 shadow-xs transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Startups</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsEditOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-bold font-display text-slate-800 bg-white hover:bg-slate-100 border border-slate-200/80 shadow-xs transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Edit Profile</span>
          </button>
          <button
            type="button"
            onClick={() => setIsDeleteOpen(true)}
            className="p-2 rounded-2xl text-slate-400 hover:text-rose-700 hover:bg-rose-50 border border-slate-200/80 transition-colors"
            title="Delete Startup"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 🏢 Main Company Header Card */}
      <div className="bg-white rounded-[32px] p-6 sm:p-8 shadow-sm border border-slate-200/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-5 min-w-0">
          <div className="w-16 h-16 rounded-2xl bg-[#191919] text-white flex items-center justify-center font-display font-black text-2xl shadow-sm flex-shrink-0">
            {startup.companyName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900 tracking-tight truncate">
                {startup.companyName}
              </h1>
              {startup.website && (
                <a
                  href={startup.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-slate-900 transition-colors"
                  title="Visit Website"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 mt-2">
              <IndustryBadge industry={startup.industry} />
              <StageBadge stage={startup.stage} />
              <DecisionBadge status={startup.decision?.status || 'UNDER_EVALUATION'} />
              {startup.pipelineStage && (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold font-display bg-[#f4f7f4] text-slate-700 border border-slate-200">
                  {startup.pipelineStage}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 📋 Detail Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Description & Overview (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-[32px] p-6 sm:p-7 shadow-sm border border-slate-200/80 space-y-3">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-500 font-display">
              Company Overview & Value Proposition
            </h3>
            <p className="text-sm text-slate-800 font-medium leading-relaxed bg-[#f4f7f4] p-5 rounded-2xl border border-slate-200/60 font-sans">
              {startup.description || 'No description provided.'}
            </p>
          </div>
        </div>

        {/* Right Column: Founder & Location Metadata (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Founder Profile */}
          <div className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-200/80 space-y-3">
            <div className="flex items-center gap-2 text-slate-500 text-xs font-extrabold uppercase tracking-wider font-display">
              <User className="w-4 h-4" />
              <span>Founder Profile</span>
            </div>
            <div className="p-4 rounded-2xl bg-[#f4f7f4] border border-slate-200/60 space-y-1">
              <div className="text-base font-extrabold font-display text-slate-950">
                {startup.founder?.name}
              </div>
              <div className="text-xs text-slate-600 font-medium leading-relaxed">
                {startup.founder?.background || 'No background information provided.'}
              </div>
            </div>
          </div>

          {/* Location & Website */}
          <div className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-200/80 space-y-3">
            <div className="flex items-center gap-2 text-slate-500 text-xs font-extrabold uppercase tracking-wider font-display">
              <MapPin className="w-4 h-4" />
              <span>HQ & Web Presence</span>
            </div>
            <div className="p-4 rounded-2xl bg-[#f4f7f4] border border-slate-200/60 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium font-display">HQ Location:</span>
                <span className="font-bold text-slate-900 font-display">{startup.location || 'Not Specified'}</span>
              </div>
              {startup.website && (
                <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
                  <span className="text-slate-500 font-medium font-display">Website:</span>
                  <a
                    href={startup.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-emerald-700 hover:underline truncate max-w-[180px]"
                  >
                    {startup.website}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Startup Modal */}
      <StartupModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSave={handleUpdate}
        startup={startup}
        loading={actionLoading}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        itemName={startup?.companyName}
        loading={actionLoading}
      />
    </div>
  );
};

export default StartupDetail;
