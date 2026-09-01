import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  GitCompare,
  ArrowLeft,
  Building2,
  CheckCircle2,
  TrendingUp,
  Award,
  BarChart3,
  Scale,
  Plus,
  X,
  Target,
  User,
} from 'lucide-react';
import startupService from '../services/startupService';
import { StageBadge, IndustryBadge, DecisionBadge } from '../components/common/Badge';
import { PageLoader } from '../components/common/Loader';

export const Comparison = () => {
  const [searchParams] = useSearchParams();
  const [allStartups, setAllStartups] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await startupService.getStartups();
        setAllStartups(data || []);

        const queryIds = searchParams.get('ids');
        if (queryIds) {
          const ids = queryIds.split(',').filter(Boolean);
          setSelectedIds(ids.slice(0, 3));
        } else {
          // Default to clean blank state
          setSelectedIds([]);
        }
      } catch (err) {
        console.error('Error fetching startups for comparison:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [searchParams]);

  const toggleSelect = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      if (selectedIds.length >= 3) {
        return;
      }
      setSelectedIds([...selectedIds, id]);
    }
  };

  if (loading) return <PageLoader />;

  const comparedStartups = allStartups.filter((s) => selectedIds.includes(s._id));

  return (
    <div className="max-w-6xl mx-auto space-y-5 text-slate-900 w-full min-w-0 pb-16 font-sans">
      {/* 🏷️ Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white rounded-[24px] p-4.5 px-5 shadow-xs border border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <GitCompare className="w-5 h-5 text-emerald-600" />
            <h1 className="text-xl font-black font-display text-slate-900">
              Deal Comparison Matrix
            </h1>
          </div>
          <p className="text-[11px] text-slate-500 font-display mt-0.5">
            Select up to 3 startups from your pipeline to compare scores, team depth, and metrics side-by-side.
          </p>
        </div>

        <Link
          to="/evaluation"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black font-display text-slate-950 bg-[#9df5a9] hover:bg-[#8ee59a] shadow-xs"
        >
          <Target className="w-3.5 h-3.5" />
          <span>Go to Evaluation</span>
        </Link>
      </div>

      {/* 🔍 Quick Selector Chips */}
      {allStartups.length > 0 ? (
        <div className="bg-white rounded-[20px] p-3 shadow-2xs border border-slate-200/90 flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-black text-slate-400 uppercase font-display mr-1">
            Select ({selectedIds.length}/3):
          </span>
          {allStartups.map((s) => {
            const isSelected = selectedIds.includes(s._id);
            return (
              <button
                key={s._id}
                type="button"
                onClick={() => toggleSelect(s._id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold font-display transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#191919] text-[#9df5a9] shadow-2xs font-black'
                    : 'bg-[#f4f7f4] text-slate-700 hover:bg-slate-200 border border-slate-200/60'
                }`}
              >
                {isSelected ? '✓ ' : '+ '}
                {s.companyName}
              </button>
            );
          })}
        </div>
      ) : null}

      {/* 📊 Side-by-Side Comparison Cards or Blank State */}
      {comparedStartups.length === 0 ? (
        <div className="bg-white rounded-[28px] p-12 sm:p-16 text-center shadow-xs border border-slate-200/80 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-[#f8faf8] border border-slate-200 flex items-center justify-center mx-auto text-slate-400 shadow-2xs">
            <GitCompare className="w-6 h-6 text-slate-400" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-black font-display text-slate-900">
              No Startups Selected for Comparison
            </h3>
            <p className="text-xs text-slate-500 font-medium max-w-md mx-auto">
              Click on 1 to 3 startups from the selector above to compare their live evaluation scores, commercial traction, and committee verdicts side by side.
            </p>
          </div>
        </div>
      ) : (
        <div className={`grid grid-cols-1 md:grid-cols-${comparedStartups.length} gap-4`}>
          {comparedStartups.map((startup) => {
            const founderScore = startup.evaluation?.overallScore || null;
            const analyticsScore = startup.analysis?.marketScore || null;
            const overallScore = startup.scorecard?.overallInvestmentScore || null;

            return (
              <div
                key={startup._id}
                className="bg-white rounded-[24px] p-5 shadow-xs border border-slate-200/90 space-y-4 flex flex-col justify-between"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                    <div>
                      <h3 className="text-base font-black font-display text-slate-900">
                        {startup.companyName}
                      </h3>
                      <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                        <IndustryBadge industry={startup.industry} />
                        <StageBadge stage={startup.stage} />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleSelect(startup._id)}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                      title="Remove from comparison"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Score Gauges */}
                  <div className="grid grid-cols-3 gap-2 pt-3 text-center">
                    <div className="p-2 rounded-xl bg-[#f8faf8] border border-slate-200">
                      <div className="text-[9px] font-bold text-slate-400 uppercase font-display">
                        Founder
                      </div>
                      <div className="text-sm font-black text-slate-900 mt-0.5">
                        {founderScore !== null ? `${founderScore.toFixed(1)}/10` : '—'}
                      </div>
                    </div>

                    <div className="p-2 rounded-xl bg-[#f8faf8] border border-slate-200">
                      <div className="text-[9px] font-bold text-slate-400 uppercase font-display">
                        Analytics
                      </div>
                      <div className="text-sm font-black text-slate-900 mt-0.5">
                        {analyticsScore !== null ? `${analyticsScore.toFixed(1)}/10` : '—'}
                      </div>
                    </div>

                    <div className="p-2 rounded-xl bg-[#191919] text-white shadow-2xs">
                      <div className="text-[9px] font-bold text-[#9df5a9] uppercase font-display">
                        Overall
                      </div>
                      <div className="text-sm font-black text-white mt-0.5">
                        {overallScore !== null ? `${overallScore.toFixed(1)}/10` : '—'}
                      </div>
                    </div>
                  </div>

                  {/* Core Details */}
                  <div className="space-y-3 pt-4 text-xs font-display">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">
                        Founding Team
                      </span>
                      <span className="text-slate-800 font-bold">{startup.founder?.name}</span>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                        {startup.founder?.background || 'No founder bio'}
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">
                        Market Opportunity
                      </span>
                      <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                        {startup.analysis?.marketOpportunity || 'No market notes'}
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">
                        Business Model
                      </span>
                      <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                        {startup.analysis?.businessModel || 'No model notes'}
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">
                        Committee Verdict
                      </span>
                      <div className="mt-1">
                        <DecisionBadge status={startup.decision?.status || 'UNDER_EVALUATION'} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Score in Hub CTA */}
                <div className="pt-3 border-t border-slate-100">
                  <Link
                    to={`/evaluation?id=${startup._id}`}
                    className="w-full py-2 rounded-xl bg-[#f4f7f4] hover:bg-slate-200 text-slate-800 text-xs font-black font-display flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span>Evaluate Startup</span>
                    <Target className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Comparison;
