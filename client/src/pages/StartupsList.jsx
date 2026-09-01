import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Plus,
  AlertTriangle,
  RotateCcw,
  FileSpreadsheet,
  Download,
  Check,
} from 'lucide-react';
import startupService from '../services/startupService';
import SearchFilterBar from '../components/startup/SearchFilterBar';
import StartupTable from '../components/startup/StartupTable';
import StartupModal from '../components/startup/StartupModal';
import StartupProfileModal from '../components/startup/StartupProfileModal';
import DeleteConfirmModal from '../components/common/DeleteConfirmModal';

export const StartupsList = ({ onOpenAddModal, onOpenExcelModal }) => {
  const navigate = useNavigate();
  
  // Instant Cache Initialization (0ms initial load)
  const [startups, setStartups] = useState(() => {
    try {
      const cached = localStorage.getItem('cached_startups_list');
      if (cached) return JSON.parse(cached);
    } catch (e) {
      console.warn('Could not read cached startups:', e);
    }
    return [];
  });
  
  const [loading, setLoading] = useState(() => {
    try {
      const cached = localStorage.getItem('cached_startups_list');
      return !cached || JSON.parse(cached).length === 0;
    } catch (e) {
      return true;
    }
  });
  const [error, setError] = useState(null);

  // Search, Filter & Sort States
  const [search, setSearch] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('ALL');
  const [selectedStage, setSelectedStage] = useState('ALL');
  const [sortBy, setSortBy] = useState('createdAt-desc');

  // Modal States
  const [profileStartup, setProfileStartup] = useState(null);
  const [selectedStartupForEdit, setSelectedStartupForEdit] = useState(null);
  const [selectedStartupForDelete, setSelectedStartupForDelete] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (message, type = 'success') => {
    setToastMessage({ message, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Fetch Startups Function
  const fetchStartups = useCallback(async (isBackground = false) => {
    try {
      if (!isBackground && startups.length === 0) {
        setLoading(true);
      }
      setError(null);

      const [sortField, sortOrder] = sortBy.split('-');

      const params = {
        search: search.trim() || undefined,
        industry: selectedIndustry !== 'ALL' ? selectedIndustry : undefined,
        stage: selectedStage !== 'ALL' ? selectedStage : undefined,
        sortBy: sortField,
        sortOrder: sortOrder,
      };

      const data = await startupService.getStartups(params);
      const list = data || [];
      setStartups(list);
      
      // Cache unfiltered list for instant bootstrap
      if (!search && selectedIndustry === 'ALL' && selectedStage === 'ALL' && list.length > 0) {
        try {
          localStorage.setItem('cached_startups_list', JSON.stringify(list));
        } catch (e) {}
      }
    } catch (err) {
      console.error('Error fetching startups:', err);
      if (startups.length === 0) {
        setError(err.message || 'Failed to load startups.');
      }
    } finally {
      setLoading(false);
    }
  }, [search, selectedIndustry, selectedStage, sortBy, startups.length]);

  useEffect(() => {
    fetchStartups();

    const handleCreated = () => fetchStartups();
    window.addEventListener('startup-created', handleCreated);
    return () => window.removeEventListener('startup-created', handleCreated);
  }, [fetchStartups]);

  // Handle Edit Save
  const handleSaveStartup = async (payload) => {
    try {
      setActionLoading(true);
      if (selectedStartupForEdit) {
        const updated = await startupService.updateStartup(
          selectedStartupForEdit._id,
          payload
        );
        showToast(`'${updated.companyName}' updated!`);
        setSelectedStartupForEdit(null);
        if (profileStartup?._id === updated._id) {
          setProfileStartup(updated);
        }
        await fetchStartups();
      }
    } catch (err) {
      console.error('Error saving startup:', err);
      showToast(err.message || 'Failed to save startup details.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Delete
  const handleDeleteStartup = async () => {
    if (!selectedStartupForDelete) return;

    try {
      setActionLoading(true);
      await startupService.deleteStartup(selectedStartupForDelete._id);
      showToast(`'${selectedStartupForDelete.companyName}' deleted.`);
      setSelectedStartupForDelete(null);
      setProfileStartup(null);
      await fetchStartups();
    } catch (err) {
      console.error('Error deleting startup:', err);
      showToast(err.message || 'Failed to delete startup.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleResetFilters = () => {
    setSearch('');
    setSelectedIndustry('ALL');
    setSelectedStage('ALL');
    setSortBy('createdAt-desc');
  };

  // 1-Click Export to CSV
  const handleExportCSV = () => {
    if (!startups || startups.length === 0) {
      showToast('No startups available to export', 'error');
      return;
    }

    try {
      const headers = [
        'Company Name',
        'Industry',
        'Financing Stage',
        'Pipeline Stage',
        'Founder Name',
        'Founder Background',
        'Location',
        'Website',
        'Founder Score',
        'Market Score',
        'Business Model Score',
        'Growth Score',
        'Competition Score',
        'Risk Score',
        'Overall Deal Score',
        'Recommendation',
        'Decision Status',
        'Decision Comment',
        'Decided By',
        'Decided At',
        'Description',
      ];

      const escapeCSV = (val) => {
        if (val === null || val === undefined) return '""';
        const str = String(val).replace(/"/g, '""');
        return `"${str}"`;
      };

      const rows = startups.map((s) => [
        escapeCSV(s.companyName),
        escapeCSV(s.industry),
        escapeCSV(s.stage),
        escapeCSV(s.pipelineStage || 'Discovered'),
        escapeCSV(s.founder?.name || ''),
        escapeCSV(s.founder?.background || ''),
        escapeCSV(s.location || ''),
        escapeCSV(s.website || ''),
        escapeCSV(s.evaluation?.overallScore !== undefined ? s.evaluation.overallScore : ''),
        escapeCSV(s.analysis?.marketScore !== undefined ? s.analysis.marketScore : ''),
        escapeCSV(s.analysis?.businessModelScore !== undefined ? s.analysis.businessModelScore : ''),
        escapeCSV(s.analysis?.growthScore !== undefined ? s.analysis.growthScore : ''),
        escapeCSV(s.analysis?.competitionScore !== undefined ? s.analysis.competitionScore : ''),
        escapeCSV(s.analysis?.riskScore !== undefined ? s.analysis.riskScore : ''),
        escapeCSV(s.scorecard?.overallInvestmentScore !== undefined ? s.scorecard.overallInvestmentScore : ''),
        escapeCSV(s.scorecard?.systemRecommendation || 'PENDING'),
        escapeCSV(s.decision?.status || 'UNDER_EVALUATION'),
        escapeCSV(s.decision?.comment || ''),
        escapeCSV(s.decision?.decidedBy || ''),
        escapeCSV(s.decision?.decidedAt ? new Date(s.decision.decidedAt).toISOString().split('T')[0] : ''),
        escapeCSV(s.description || ''),
      ]);

      const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const filename = `investly-pipeline-${new Date().toISOString().split('T')[0]}.csv`;

      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showToast(`Exported ${startups.length} startups to CSV!`);
    } catch (err) {
      console.error('Error exporting CSV:', err);
      showToast('Failed to export CSV file.', 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 text-slate-900 w-full min-w-0">
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
            <Check className="w-4 h-4 stroke-[3]" />
          )}
          <span>{toastMessage.message}</span>
        </div>
      )}

      {/* 🏷️ 1. PAGE HEADER: Title, Import Excel, Export CSV & Add Startup Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900 tracking-tight">
            Startups
          </h1>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto flex-wrap">
          {/* Direct Excel / CSV Upload Button */}
          <button
            type="button"
            onClick={onOpenExcelModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold font-display text-slate-800 bg-white hover:bg-slate-100 border border-slate-200/80 shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Import CSV</span>
          </button>

          {/* Export to CSV Button */}
          <button
            type="button"
            onClick={handleExportCSV}
            disabled={startups.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold font-display text-slate-800 bg-white hover:bg-slate-100 border border-slate-200/80 shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            title="Export filtered startup list to CSV"
          >
            <Download className="w-4 h-4 text-slate-700" />
            <span>Export CSV</span>
          </button>

          {/* Add Startup Button (Opens 2-Option Choice Modal) */}
          <button
            type="button"
            onClick={onOpenAddModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-black font-display text-slate-950 bg-[#9df5a9] hover:bg-[#8ee59a] shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Add Startup</span>
          </button>
        </div>
      </div>

      {/* 🔍 2. SEARCH, FILTER & SORT TOOLBAR */}
      <SearchFilterBar
        search={search}
        setSearch={setSearch}
        selectedIndustry={selectedIndustry}
        setSelectedIndustry={setSelectedIndustry}
        selectedStage={selectedStage}
        setSelectedStage={setSelectedStage}
        sortBy={sortBy}
        setSortBy={setSortBy}
        onResetFilters={handleResetFilters}
      />

      {/* Error Banner */}
      {error && (
        <div className="p-5 rounded-3xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <span className="text-xs font-semibold">{error}</span>
          </div>
          <button
            onClick={fetchStartups}
            className="px-4 py-1.5 text-xs font-bold bg-white rounded-xl shadow-sm hover:bg-rose-100"
          >
            Retry
          </button>
        </div>
      )}

      {/* 📋 3. STRUCTURED STARTUPS TABLE VIEW */}
      {loading ? (
        <div className="h-80 bg-white/70 rounded-[28px] animate-pulse border border-slate-200/80" />
      ) : startups.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-[32px] p-12 text-center space-y-4 shadow-sm border border-slate-200/80">
          <div className="w-14 h-14 rounded-2xl bg-[#f4f7f4] flex items-center justify-center mx-auto text-slate-400">
            <Building2 className="w-7 h-7" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-base font-bold font-display text-slate-900">No Startups Found</h3>
            <p className="text-xs text-slate-500 font-display font-medium">
              {search || selectedIndustry !== 'ALL' || selectedStage !== 'ALL'
                ? 'No startups match your search filters.'
                : 'Start by importing your spreadsheet or adding a startup manually.'}
            </p>
          </div>
          <div className="pt-2 flex items-center justify-center gap-3">
            {search || selectedIndustry !== 'ALL' || selectedStage !== 'ALL' ? (
              <button
                onClick={handleResetFilters}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold font-display text-slate-700 bg-[#f4f7f4] hover:bg-slate-200 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Filters</span>
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onOpenExcelModal}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold font-display text-slate-800 bg-white hover:bg-slate-100 border border-slate-200 shadow-xs transition-colors"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <span>Import Excel / CSV</span>
                </button>
                <button
                  type="button"
                  onClick={onOpenAddModal}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold font-display text-slate-900 bg-[#9df5a9] hover:bg-[#8ee59a] transition-colors shadow-sm"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>Add Startup</span>
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Active Startups Table Content */
        <div className="space-y-4">
          <div className="text-xs text-slate-500 font-bold flex items-center justify-between font-display">
            <span>{startups.length} {startups.length === 1 ? 'startup profile' : 'startup profiles'}</span>
          </div>

          <StartupTable
            startups={startups}
            onOpenProfile={(s) => setProfileStartup(s)}
            onEdit={(s) => setSelectedStartupForEdit(s)}
            onDelete={(s) => setSelectedStartupForDelete(s)}
          />
        </div>
      )}

      {/* 🔍 Startup Profile Details Modal */}
      <StartupProfileModal
        isOpen={Boolean(profileStartup)}
        onClose={() => setProfileStartup(null)}
        startup={profileStartup}
        onEdit={(s) => setSelectedStartupForEdit(s)}
        onDelete={(s) => setSelectedStartupForDelete(s)}
      />

      {/* Edit Startup Modal */}
      <StartupModal
        isOpen={Boolean(selectedStartupForEdit)}
        onClose={() => setSelectedStartupForEdit(null)}
        onSave={handleSaveStartup}
        startup={selectedStartupForEdit}
        loading={actionLoading}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(selectedStartupForDelete)}
        onClose={() => setSelectedStartupForDelete(null)}
        onConfirm={handleDeleteStartup}
        itemName={selectedStartupForDelete?.companyName}
        loading={actionLoading}
      />
    </div>
  );
};

export default StartupsList;
