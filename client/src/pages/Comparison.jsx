import React, { useState, useEffect, useMemo } from 'react';
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
  ShieldAlert,
  Star,
  FileText,
  DollarSign,
  AlertTriangle,
  Zap,
  RotateCcw,
  Sparkles,
  Trophy,
} from 'lucide-react';
import startupService from '../services/startupService';
import { PageLoader } from '../components/common/Loader';

const CORE_5_QUALITIES = [
  { key: 'domainExpertise', label: 'Domain Expertise' },
  { key: 'execution', label: 'Execution Ability' },
  { key: 'vision', label: 'Vision & Strategy' },
  { key: 'technicalMastery', label: 'Technical Mastery' },
  { key: 'teamStrength', label: 'Leadership & Team' },
];

export const Comparison = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [allStartups, setAllStartups] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await startupService.getStartups();
        const list = data || [];
        setAllStartups(list);

        const queryIds = searchParams.get('ids');
        if (queryIds) {
          const ids = queryIds.split(',').filter(Boolean);
          setSelectedIds(ids.slice(0, 4));
        } else if (list.length >= 2) {
          // Pre-select top 2 evaluated startups or first 2
          const evaluated = list.filter(
            (s) =>
              (s.scorecard?.overallInvestmentScore && s.scorecard.overallInvestmentScore > 0) ||
              (s.evaluation?.overallScore && s.evaluation.overallScore > 0)
          );
          if (evaluated.length >= 2) {
            setSelectedIds([evaluated[0]._id, evaluated[1]._id]);
          } else if (list.length > 0) {
            setSelectedIds(list.slice(0, Math.min(2, list.length)).map((s) => s._id));
          }
        }
      } catch (err) {
        console.error('Error fetching startups for comparison:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [searchParams]);

  const handleDropdownSelect = (id) => {
    if (!id) return;
    if (!selectedIds.includes(id)) {
      if (selectedIds.length >= 4) return;
      const updated = [...selectedIds, id];
      setSelectedIds(updated);
      setSearchParams({ ids: updated.join(',') });
    }
  };

  const handleRemove = (id) => {
    const updated = selectedIds.filter((item) => item !== id);
    setSelectedIds(updated);
    if (updated.length > 0) {
      setSearchParams({ ids: updated.join(',') });
    } else {
      setSearchParams({});
    }
  };

  const handleClearAll = () => {
    setSelectedIds([]);
    setSearchParams({});
  };

  // Hydrate selected startups with 100% real saved database & studio data
  const comparedStartups = useMemo(() => {
    return allStartups
      .filter((s) => selectedIds.includes(s._id))
      .map((startup) => {
        let localStudio = null;
        try {
          const raw = localStorage.getItem(`eval_studio_${startup._id}`);
          if (raw) localStudio = JSON.parse(raw);
        } catch (e) {}

        // 1. Resolve 5 Founder Dimensions (1 to 5 Stars scale from MongoDB data)
        const starRatings = {};

        CORE_5_QUALITIES.forEach((q) => {
          let score10 = 0;
          if (startup.evaluation?.[q.key] !== undefined && startup.evaluation?.[q.key] !== null) {
            score10 = startup.evaluation[q.key];
          } else if (q.key === 'technicalMastery' && startup.evaluation?.experience) {
            score10 = startup.evaluation.experience;
          } else if (q.key === 'teamStrength' && startup.evaluation?.teamStrength) {
            score10 = startup.evaluation.teamStrength;
          } else if (localStudio?.starRatings?.[q.key] !== undefined) {
            score10 = localStudio.starRatings[q.key] * 2;
          }

          const stars = Math.max(0, Math.min(5, Math.round(score10 / 2)));
          starRatings[q.key] = stars;
        });

        // 2. Resolve Meeting Rounds
        const roundsList = Array.isArray(localStudio?.roundsList) ? localStudio.roundsList : [];
        const roundsCount = roundsList.length;
        const avgRoundScore =
          roundsCount > 0
            ? roundsList.reduce((acc, r) => acc + (parseFloat(r.score) || 0), 0) / roundsCount
            : null;

        // 3. Compute Composite Founder Score (out of 10)
        let founderScore = 0;
        if (startup.evaluation?.overallScore !== undefined && startup.evaluation?.overallScore !== null && startup.evaluation.overallScore > 0) {
          founderScore = startup.evaluation.overallScore;
        } else {
          const starVals = Object.values(starRatings);
          const hasRatedStars = starVals.some((v) => v > 0);
          if (hasRatedStars) {
            const rated = starVals.filter((v) => v > 0);
            const sum = rated.reduce((a, b) => a + b, 0);
            const avgStar10 = ((sum / rated.length) / 5) * 10;
            if (avgRoundScore !== null) {
              founderScore = Math.round(((avgStar10 * 0.5) + (avgRoundScore * 0.5)) * 10) / 10;
            } else {
              founderScore = Math.round(avgStar10 * 10) / 10;
            }
          }
        }

        // 4. Resolve Commercial Scores from live MongoDB
        const marketScore =
          startup.analysis?.marketScore !== undefined && startup.analysis?.marketScore !== null && startup.analysis.marketScore > 0
            ? startup.analysis.marketScore
            : localStudio?.analyticsScores?.marketScore || 0;

        const growthScore =
          startup.analysis?.growthScore !== undefined && startup.analysis?.growthScore !== null && startup.analysis.growthScore > 0
            ? startup.analysis.growthScore
            : localStudio?.analyticsScores?.growthScore || 0;

        const businessModelScore =
          startup.analysis?.businessModelScore !== undefined && startup.analysis?.businessModelScore !== null && startup.analysis.businessModelScore > 0
            ? startup.analysis.businessModelScore
            : localStudio?.analyticsScores?.businessModelScore || 0;

        const competitionScore =
          startup.analysis?.competitionScore !== undefined && startup.analysis?.competitionScore !== null && startup.analysis.competitionScore > 0
            ? startup.analysis.competitionScore
            : localStudio?.analyticsScores?.competitionScore || 0;

        const riskScore =
          startup.analysis?.riskScore !== undefined && startup.analysis?.riskScore !== null
            ? startup.analysis.riskScore
            : localStudio?.analyticsScores?.riskScore !== undefined
            ? localStudio.analyticsScores.riskScore
            : 0;

        // 5. Compute Overall Weighted Score (Formula: 30% Founder, 20% Market, 20% Growth, 15% Model, 10% Moat, 5% Risk Mitigation)
        let overallScore = 0;
        if (startup.scorecard?.overallInvestmentScore) {
          overallScore = startup.scorecard.overallInvestmentScore;
        } else if (founderScore > 0 || marketScore > 0 || growthScore > 0) {
          const rMitigated = Math.max(0, 10 - riskScore);
          const weighted =
            founderScore * 0.30 +
            marketScore * 0.20 +
            growthScore * 0.20 +
            businessModelScore * 0.15 +
            competitionScore * 0.10 +
            rMitigated * 0.05;
          overallScore = Math.round(weighted * 10) / 10;
        }

        // 6. Resolve Decision Status
        const decisionStatus =
          startup.decision?.status ||
          (overallScore >= 8.0 ? 'INVEST' : overallScore >= 6.0 ? 'WATCHLIST' : 'UNDER_EVALUATION');

        // 7. Real Text Fields
        const revenue =
          startup.analysis?.revenue || localStudio?.analyticsData?.revenue || '';
        const investmentThesis =
          startup.analysis?.investmentThesis ||
          localStudio?.analyticsData?.investmentThesis ||
          startup.decision?.comment ||
          '';

        return {
          ...startup,
          starRatings,
          roundsCount,
          avgRoundScore,
          founderScore,
          marketScore,
          growthScore,
          businessModelScore,
          competitionScore,
          riskScore,
          overallScore,
          decisionStatus,
          revenue,
          investmentThesis,
          strengths: startup.scorecard?.strengths || [],
          concerns: startup.scorecard?.concerns || [],
        };
      });
  }, [allStartups, selectedIds]);

  // Find best performers across dimensions
  const highlights = useMemo(() => {
    if (comparedStartups.length < 2) return null;
    const maxOverall = Math.max(...comparedStartups.map((s) => s.overallScore || 0));
    const maxFounder = Math.max(...comparedStartups.map((s) => s.founderScore || 0));
    const maxMarket = Math.max(...comparedStartups.map((s) => s.marketScore || 0));
    const maxGrowth = Math.max(...comparedStartups.map((s) => s.growthScore || 0));

    return {
      topOverallId: maxOverall > 0 ? comparedStartups.find((s) => s.overallScore === maxOverall)?._id : null,
      topFounderId: maxFounder > 0 ? comparedStartups.find((s) => s.founderScore === maxFounder)?._id : null,
      topMarketId: maxMarket > 0 ? comparedStartups.find((s) => s.marketScore === maxMarket)?._id : null,
      topGrowthId: maxGrowth > 0 ? comparedStartups.find((s) => s.growthScore === maxGrowth)?._id : null,
    };
  }, [comparedStartups]);

  // Filter ONLY eligible startups for comparison (INVEST / WATCHLIST & evaluated deals)
  const eligibleStartups = allStartups.filter((s) => {
    const isInvestOrWatchlist =
      s.decision?.status === 'INVEST' || s.decision?.status === 'WATCHLIST';
    const isEvaluated = Boolean(
      (s.scorecard?.overallInvestmentScore && s.scorecard.overallInvestmentScore > 0) ||
      (s.evaluation?.overallScore && s.evaluation.overallScore > 0)
    );
    return isInvestOrWatchlist || isEvaluated;
  });

  const availableToAdd = eligibleStartups.filter((s) => !selectedIds.includes(s._id));

  if (loading) return <PageLoader />;

  return (
    <div className="max-w-7xl mx-auto space-y-4 text-slate-900 w-full min-w-0 pb-16 font-sans">
      {/* 🏷️ Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white rounded-[24px] p-4 px-5 shadow-xs border border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#191919] text-[#9df5a9] flex items-center justify-center shadow-xs">
            <GitCompare className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-black font-display text-slate-900 tracking-tight">
              Deal Comparison Matrix
            </h1>
          </div>
        </div>

        {/* Right Controls: Dropdown & Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Add Startup Selector Dropdown */}
          <select
            value=""
            onChange={(e) => handleDropdownSelect(e.target.value)}
            disabled={selectedIds.length >= 4 || availableToAdd.length === 0}
            className="bg-[#191919] hover:bg-slate-900 border border-slate-900 text-[#9df5a9] text-xs font-bold font-display rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#9df5a9] cursor-pointer disabled:opacity-50 shadow-xs"
          >
            <option value="" disabled className="bg-[#191919] text-slate-400">
              {selectedIds.length >= 4
                ? 'Max 4 Startups Compared'
                : availableToAdd.length === 0
                ? 'No More Eligible Deals Available'
                : '+ Select Eligible Startup to Compare...'}
            </option>
            {availableToAdd.map((s) => (
              <option key={s._id} value={s._id} className="bg-white text-slate-900 font-medium">
                {s.companyName} ({s.decision?.status || (s.scorecard?.overallInvestmentScore ? `${s.scorecard.overallInvestmentScore.toFixed(1)}/10` : 'Evaluated')})
              </option>
            ))}
          </select>

          {selectedIds.length > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              className="px-3 py-2.5 rounded-xl text-xs font-bold font-display text-slate-600 bg-[#f4f7f4] hover:bg-slate-200 transition-colors shadow-2xs"
            >
              Clear
            </button>
          )}

          <Link
            to="/evaluation"
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-black font-display text-slate-950 bg-[#9df5a9] hover:bg-[#8ee59a] shadow-xs transition-transform hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap"
          >
            <Target className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Evaluation Studio</span>
          </Link>
        </div>
      </div>

      {/* 📊 Empty State */}
      {comparedStartups.length === 0 ? (
        <div className="bg-white rounded-[28px] p-16 text-center shadow-xs border border-slate-200/80 space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-[#f8faf8] border border-slate-200 flex items-center justify-center mx-auto text-slate-400 shadow-xs">
            <Scale className="w-7 h-7 text-slate-400" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-extrabold font-display text-slate-900">
              No Startups Selected for Comparison
            </h3>
            <p className="text-xs text-slate-500 font-display font-medium max-w-sm mx-auto">
              Select 2 to 4 startups from the dropdown above to compare their live founder pedigree, commercial unit economics, and deal scores side by side.
            </p>
          </div>
        </div>
      ) : (
        /* 📊 Dynamic Side-by-Side Grid */
        <div
          className={`grid grid-cols-1 md:grid-cols-2 ${
            comparedStartups.length === 3
              ? 'lg:grid-cols-3'
              : comparedStartups.length >= 4
              ? 'lg:grid-cols-4'
              : 'lg:grid-cols-2'
          } gap-4 items-stretch`}
        >
          {comparedStartups.map((s) => {
            const isTopOverall = highlights?.topOverallId === s._id && s.overallScore > 0;
            const isTopFounder = highlights?.topFounderId === s._id && s.founderScore > 0;
            const isTopMarket = highlights?.topMarketId === s._id && s.marketScore > 0;

            const decisionBadgeClass =
              s.decisionStatus === 'INVEST'
                ? 'bg-[#9df5a9] text-slate-950 border-emerald-300'
                : s.decisionStatus === 'WATCHLIST'
                ? 'bg-amber-100 text-amber-900 border-amber-300'
                : s.decisionStatus === 'REJECT'
                ? 'bg-rose-100 text-rose-900 border-rose-300'
                : 'bg-slate-100 text-slate-800 border-slate-300';

            return (
              <div
                key={s._id}
                className={`bg-white rounded-[26px] p-5 shadow-xs border flex flex-col justify-between space-y-4 relative transition-all ${
                  isTopOverall
                    ? 'border-emerald-400 ring-2 ring-emerald-300/40'
                    : 'border-slate-200/90'
                }`}
              >
                {/* Winner Highlight Ribbon */}
                {isTopOverall && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-[#191919] text-[#9df5a9] text-[10px] font-black font-display flex items-center gap-1 shadow-xs border border-emerald-500/40">
                    <Trophy className="w-3 h-3 text-[#9df5a9]" />
                    <span>Top Deal Score</span>
                  </div>
                )}

                <div className="space-y-4">
                  {/* 1. Header: Company Info, Status & Score */}
                  <div className="flex items-start justify-between pb-3.5 border-b border-slate-100 gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <h2 className="text-base font-black font-display text-slate-950 truncate">
                          {s.companyName}
                        </h2>
                        <button
                          type="button"
                          onClick={() => handleRemove(s._id)}
                          className="text-slate-400 hover:text-rose-600 p-0.5 transition-colors cursor-pointer"
                          title="Remove from comparison"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="text-[11px] font-bold text-slate-500 font-display mt-0.5 truncate">
                        {s.industry} • {s.stage}
                      </div>
                      {s.location && s.location !== 'Location Not Specified' && (
                        <div className="text-[10px] font-semibold text-slate-400 truncate">
                          {s.location}
                        </div>
                      )}
                    </div>

                    {/* Overall Score Box */}
                    <div className="text-right flex-shrink-0">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-lg text-[9px] font-black font-display uppercase tracking-wider border ${decisionBadgeClass}`}
                      >
                        {s.decisionStatus}
                      </span>
                      <div className="text-lg font-black font-display text-slate-950 mt-0.5">
                        {s.overallScore > 0 ? s.overallScore.toFixed(1) : '—'}
                        <span className="text-[10px] text-slate-400 font-normal"> /10</span>
                      </div>
                    </div>
                  </div>

                  {/* 2. 👤 Founder Pedigree (30%) */}
                  <div className="bg-[#f8faf8] p-3.5 rounded-2xl border border-slate-200/70 space-y-2.5 shadow-2xs">
                    <div className="flex items-center justify-between text-xs pb-1.5 border-b border-slate-200/60 font-display">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-900" />
                        <span className="font-extrabold text-slate-900">Founder & Team (30%)</span>
                      </div>
                      <span className="font-black text-slate-950 bg-white border border-slate-200 px-2 py-0.5 rounded-md text-[11px]">
                        {s.founderScore > 0 ? `${s.founderScore.toFixed(1)}/10` : 'Not Rated'}
                      </span>
                    </div>

                    {/* Founder Name & Bio */}
                    {s.founder?.name && (
                      <div className="text-[11px] font-display">
                        <span className="font-extrabold text-slate-900">{s.founder.name}</span>
                        {s.founder?.background && (
                          <p className="text-[10px] text-slate-600 font-medium leading-relaxed line-clamp-2 mt-0.5">
                            {s.founder.background}
                          </p>
                        )}
                      </div>
                    )}

                    {/* 5 Qualities Star Rating Grid (Rated 1 to 5 Stars) */}
                    <div className="space-y-1 pt-1">
                      {CORE_5_QUALITIES.map((q) => {
                        const stars = s.starRatings[q.key] || 0;

                        return (
                          <div
                            key={q.key}
                            className="flex items-center justify-between text-[11px] font-display bg-white px-2.5 py-1.5 rounded-lg border border-slate-200/60"
                          >
                            <span className="font-bold text-slate-700 text-[10.5px]">{q.label}</span>
                            <div className="flex items-center gap-2">
                              <span className="font-black text-slate-950 text-[11px] font-display">
                                {stars > 0 ? `${stars}/5` : '—'}
                              </span>
                              <div className="flex items-center">
                                {[1, 2, 3, 4, 5].map((st) => (
                                  <Star
                                    key={st}
                                    className={`w-3 h-3 ${
                                      st <= stars
                                        ? 'fill-amber-400 text-amber-400'
                                        : 'text-slate-200'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Meeting Rounds Count */}
                    <div className="text-[10px] font-bold text-slate-500 pt-0.5 flex items-center justify-between">
                      <span>{s.roundsCount > 0 ? `${s.roundsCount} Rounds Logged` : '0 Rounds Logged'}</span>
                      {s.avgRoundScore && (
                        <span className="text-emerald-800 font-black">
                          Avg: {s.avgRoundScore.toFixed(1)}/10
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 3. 📊 Commercial Analytics (70%) */}
                  <div className="bg-[#f8faf8] p-3.5 rounded-2xl border border-slate-200/70 space-y-2.5 shadow-2xs">
                    <div className="flex items-center justify-between text-xs pb-1.5 border-b border-slate-200/60 font-display">
                      <div className="flex items-center gap-1.5">
                        <BarChart3 className="w-3.5 h-3.5 text-emerald-700" />
                        <span className="font-extrabold text-slate-900">Commercial (70%)</span>
                      </div>
                      {s.revenue && (
                        <span className="text-[9px] font-black bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded border border-emerald-200 truncate max-w-[120px]">
                          {s.revenue}
                        </span>
                      )}
                    </div>

                    {/* 4 Pillars Clean Score Meters */}
                    <div className="space-y-2">
                      {[
                        { label: 'Market TAM (20%)', score: s.marketScore },
                        { label: 'Growth & Traction (20%)', score: s.growthScore },
                        { label: 'Business Model (15%)', score: s.businessModelScore },
                        { label: 'Competitive Moat (10%)', score: s.competitionScore },
                      ].map((p) => (
                        <div key={p.label} className="space-y-0.5">
                          <div className="flex items-center justify-between text-[10px] font-display">
                            <span className="font-bold text-slate-600 truncate">{p.label}</span>
                            <span className="font-black text-slate-900">
                              {p.score > 0 ? `${p.score.toFixed(1)}/10` : '—'}
                            </span>
                          </div>
                          <div className="w-full bg-slate-200/70 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-emerald-500 h-full rounded-full transition-all"
                              style={{ width: `${Math.min(100, Math.max(0, (p.score / 10) * 100))}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 4. 🛡️ Risk Radar (5%) */}
                  <div className="bg-[#f8faf8] px-3.5 py-2.5 rounded-xl border border-slate-200/70 flex items-center justify-between text-xs shadow-2xs font-display">
                    <div className="flex items-center gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                      <span className="font-extrabold text-slate-800 text-[11px]">Risk Radar (5%)</span>
                    </div>
                    <span className="font-black text-slate-900 text-[11px]">
                      {s.riskScore > 0
                        ? s.riskScore <= 3
                          ? `🟢 Low (${s.riskScore.toFixed(1)}/10)`
                          : s.riskScore <= 6
                          ? `🟡 Moderate (${s.riskScore.toFixed(1)}/10)`
                          : `🔴 High (${s.riskScore.toFixed(1)}/10)`
                        : '🟢 Low Risk'}
                    </span>
                  </div>

                  {/* 5. 📝 Investment Thesis */}
                  {s.investmentThesis ? (
                    <div className="bg-[#f8faf8] p-2.5 rounded-xl border border-slate-200/60 space-y-1">
                      <span className="text-[9px] font-extrabold text-slate-500 uppercase tracking-tight">
                        Thesis:
                      </span>
                      <p className="text-[10px] text-slate-700 italic font-medium leading-relaxed line-clamp-2">
                        "{s.investmentThesis}"
                      </p>
                    </div>
                  ) : (
                    <div className="bg-[#f8faf8] p-2 rounded-xl border border-slate-200/60 text-center">
                      <span className="text-[10px] text-slate-400 font-medium">
                        No thesis recorded yet
                      </span>
                    </div>
                  )}
                </div>

                {/* 6. Action Link to Studio */}
                <Link
                  to={`/evaluation?id=${s._id}`}
                  className="w-full py-2.5 rounded-xl bg-[#f4f7f4] hover:bg-slate-200 text-slate-900 text-xs font-black font-display flex items-center justify-center gap-1.5 transition-all shadow-2xs hover:scale-[1.01]"
                >
                  <span>Evaluate in Studio</span>
                  <Target className="w-3.5 h-3.5 text-emerald-700" />
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Comparison;
