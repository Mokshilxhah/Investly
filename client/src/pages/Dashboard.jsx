import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowUpRight,
  ChevronRight,
  Check,
  Eye,
  X,
  Clock,
  Building2,
  BarChart2,
  TrendingUp,
  Layers,
  Plus,
} from 'lucide-react';
import startupService from '../services/startupService';

export const Dashboard = ({ onOpenAddModal }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await startupService.getDashboardMetrics();
      setData(res);
    } catch (err) {
      console.error('Error fetching dashboard metrics:', err);
      setError(err.message || 'Could not load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    // Listen for global startup creation events to auto-refresh
    const handleCreated = () => fetchDashboardData();
    window.addEventListener('startup-created', handleCreated);
    return () => window.removeEventListener('startup-created', handleCreated);
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6 animate-pulse w-full min-w-0">
        <div className="h-10 w-48 bg-white/70 rounded-3xl" />
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-28 bg-white/70 rounded-3xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 h-96 bg-white/70 rounded-3xl" />
          <div className="lg:col-span-5 h-96 bg-white/70 rounded-3xl" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-md mx-auto my-12 bg-white rounded-3xl p-8 text-center shadow-sm border border-slate-200">
        <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
          <X className="w-6 h-6 stroke-[2.5]" />
        </div>
        <h2 className="text-lg font-bold font-display text-slate-900">Failed to load data</h2>
        <p className="text-xs text-slate-600 mt-1 mb-5">{error || 'Server connection error'}</p>
        <button
          onClick={fetchDashboardData}
          className="px-5 py-2.5 rounded-2xl bg-[#191919] text-white text-xs font-bold font-display hover:opacity-90 transition-opacity"
        >
          Try Again
        </button>
      </div>
    );
  }

  const {
    totalStartups = 0,
    underEvaluation = 0,
    invested = 0,
    watchlist = 0,
    rejected = 0,
    avgFounderScore = 0,
    avgInvestmentScore = 0,
    byIndustry = [],
    topOpportunities = [],
  } = data;

  const renderStatusTag = (status) => {
    switch (status) {
      case 'INVEST':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-black font-display bg-[#9df5a9] text-slate-950 shadow-xs">
            Invest
          </span>
        );
      case 'WATCHLIST':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-black font-display bg-[#fedd89] text-slate-950 shadow-xs">
            Watchlist
          </span>
        );
      case 'REJECT':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-black font-display bg-[#ffbaba] text-slate-950 shadow-xs">
            Reject
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full text-xs font-black font-display bg-[#b0a2ff] text-slate-950 shadow-xs">
            Evaluating
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 text-slate-900 w-full min-w-0">
      {/* 🏷️ 1. PAGE HEADER: Title & Direct Link */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900 tracking-tight">
            Dashboard
          </h1>
        </div>

        <Link
          to="/startups"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold font-display text-slate-800 bg-white hover:bg-slate-100 border border-slate-200/80 shadow-xs transition-all"
        >
          <span>All Startups</span>
          <ChevronRight className="w-3.5 h-3.5 text-emerald-600" />
        </Link>
      </div>

      {/* 📊 2. TOP 5 METRIC CARDS (Always rendered with true numbers) */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        {/* Total */}
        <div className="bg-[#191919] text-white rounded-[28px] p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold font-display text-slate-300">
              Total Startups
            </span>
            <div className="w-8 h-8 rounded-xl bg-white/10 text-[#9df5a9] flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black font-display tracking-tight text-white mt-3">
            {totalStartups}
          </div>
        </div>

        {/* Evaluating */}
        <div className="bg-[#b0a2ff] text-slate-950 rounded-[28px] p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold font-display">
              Evaluating
            </span>
            <div className="w-8 h-8 rounded-xl bg-white/60 flex items-center justify-center">
              <Clock className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black font-display tracking-tight mt-3">
            {underEvaluation}
          </div>
        </div>

        {/* Invested */}
        <div className="bg-[#9df5a9] text-slate-950 rounded-[28px] p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold font-display">
              Invested
            </span>
            <div className="w-8 h-8 rounded-xl bg-white/60 flex items-center justify-center">
              <Check className="w-4 h-4 stroke-[3]" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black font-display tracking-tight mt-3">
            {invested}
          </div>
        </div>

        {/* Watchlist */}
        <div className="bg-[#fedd89] text-slate-950 rounded-[28px] p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold font-display">
              Watchlist
            </span>
            <div className="w-8 h-8 rounded-xl bg-white/60 flex items-center justify-center">
              <Eye className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black font-display tracking-tight mt-3">
            {watchlist}
          </div>
        </div>

        {/* Rejected */}
        <div className="bg-[#ffbaba] text-slate-950 rounded-[28px] p-5 shadow-sm flex flex-col justify-between col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold font-display">
              Rejected
            </span>
            <div className="w-8 h-8 rounded-xl bg-white/60 flex items-center justify-center">
              <X className="w-4 h-4 stroke-[3]" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black font-display tracking-tight mt-3">
            {rejected}
          </div>
        </div>
      </div>

      {/* 🚀 3. MAIN SECTION: Top Startups (Left) + Portfolio Averages & Industries (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Top Startups Showcase */}
        <div className="lg:col-span-7 bg-white rounded-[32px] p-6 sm:p-7 shadow-sm border border-slate-200/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#191919] text-white flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-[#9df5a9]" />
                </div>
                <h3 className="text-base font-extrabold font-display text-slate-900">
                  Top Scored Startups
                </h3>
              </div>
              <Link
                to="/startups"
                className="text-xs font-bold text-slate-600 hover:text-emerald-700 font-display flex items-center gap-1"
              >
                <span>View all ({totalStartups})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* List of Startup Cards or Graceful In-Grid Empty State */}
            {topOpportunities.length === 0 ? (
              <div className="py-12 text-center space-y-3 bg-[#f4f7f4] rounded-2xl border border-slate-200/60 p-6">
                <div className="w-10 h-10 rounded-xl bg-white text-slate-400 flex items-center justify-center mx-auto shadow-xs">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold font-display text-slate-800">No Startups Yet</h4>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Start by creating your first startup profile.
                  </p>
                </div>
                {onOpenAddModal && (
                  <button
                    type="button"
                    onClick={onOpenAddModal}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black font-display text-slate-950 bg-[#9df5a9] hover:bg-[#8ee59a] transition-all shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[3]" />
                    <span>Add Startup</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {topOpportunities.slice(0, 5).map((startup) => {
                  const score =
                    startup.scorecard?.overallInvestmentScore ??
                    startup.evaluation?.overallScore ??
                    null;
                  const status = startup.decision?.status || 'UNDER_EVALUATION';

                  return (
                    <Link
                      key={startup._id}
                      to="/startups"
                      className="p-4 rounded-2xl bg-[#f4f7f4] hover:bg-[#eaf1ea] border border-slate-200/60 transition-all cursor-pointer flex items-center justify-between gap-4 group block"
                    >
                      {/* Left Info */}
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-11 h-11 rounded-2xl bg-[#191919] text-white flex items-center justify-center font-black font-display text-sm flex-shrink-0 shadow-xs">
                          {startup.companyName.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="font-black font-display text-sm text-slate-950 group-hover:text-emerald-800 transition-colors truncate">
                            {startup.companyName}
                          </div>
                          <div className="text-xs text-slate-600 font-medium mt-0.5 truncate">
                            {startup.founder?.name} • {startup.industry} • {startup.stage}
                          </div>
                        </div>
                      </div>

                      {/* Right Info */}
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="text-right">
                          <div className="text-base font-black font-display text-slate-950">
                            {score !== null ? `${score.toFixed(1)}` : '—'}
                            <span className="text-xs font-normal text-slate-500 ml-0.5">/10</span>
                          </div>
                        </div>
                        {renderStatusTag(status)}
                        <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-slate-600 shadow-xs group-hover:bg-[#9df5a9] group-hover:text-slate-950 transition-colors">
                          <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-display mt-4">
            <span className="text-slate-500 font-medium">View all startups in the directory for full profiles.</span>
          </div>
        </div>

        {/* Right Column (5 cols): Scoring Averages + Industries */}
        <div className="lg:col-span-5 space-y-6">
          {/* Average Scores Card */}
          <div className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-200/80 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#191919] text-white flex items-center justify-center">
                  <BarChart2 className="w-4 h-4 text-[#9df5a9]" />
                </div>
                <h3 className="text-sm font-extrabold font-display text-slate-900">
                  Portfolio Averages
                </h3>
              </div>
              <span className="text-xs text-slate-500 font-bold font-display">10-point scale</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl bg-[#9df5a9] text-slate-950 flex flex-col justify-between">
                <span className="text-xs font-bold font-display">Founder Avg</span>
                <div className="text-3xl font-black font-display mt-2">
                  {avgFounderScore.toFixed(1)}
                  <span className="text-xs font-normal opacity-70">/10</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#b0a2ff] text-slate-950 flex flex-col justify-between">
                <span className="text-xs font-bold font-display">Overall Avg</span>
                <div className="text-3xl font-black font-display mt-2">
                  {avgInvestmentScore.toFixed(1)}
                  <span className="text-xs font-normal opacity-70">/10</span>
                </div>
              </div>
            </div>
          </div>

          {/* Top Industries Card */}
          <div className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-200/80 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#191919] text-white flex items-center justify-center">
                  <Layers className="w-4 h-4 text-[#9df5a9]" />
                </div>
                <h3 className="text-sm font-extrabold font-display text-slate-900">
                  Industries Breakdown
                </h3>
              </div>
              <span className="text-xs text-slate-500 font-bold font-display">
                {byIndustry.length} total
              </span>
            </div>

            {byIndustry.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400 font-display font-medium bg-[#f4f7f4] rounded-2xl">
                No industry data recorded yet.
              </div>
            ) : (
              <div className="space-y-3">
                {byIndustry.slice(0, 5).map((item) => {
                  const percentage = totalStartups > 0 ? Math.round((item.count / totalStartups) * 100) : 0;

                  return (
                    <div key={item._id} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-display">
                        <span className="font-bold text-slate-800">{item._id}</span>
                        <span className="font-extrabold text-slate-950">
                          {item.count} ({percentage}%)
                        </span>
                      </div>
                      <div className="w-full h-2 bg-[#f4f7f4] rounded-full overflow-hidden border border-slate-100">
                        <div
                          className="h-full bg-[#9df5a9] rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
