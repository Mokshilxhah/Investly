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

  // Filter ONLY startups with decision category INVEST or WATCHLIST
  const eligibleStartups = useMemo(() => {
    return allStartups.filter((s) => {
      const status = s.decision?.status;
      return status === 'INVEST' || status === 'WATCHLIST';
    });
  }, [allStartups]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await startupService.getStartups();
        const list = data || [];
        setAllStartups(list);

        // Filter list to only INVEST and WATCHLIST
        const filteredList = list.filter(
          (s) => s.decision?.status === 'INVEST' || s.decision?.status === 'WATCHLIST'
        );

        const queryIds = searchParams.get('ids');
        if (queryIds) {
          const ids = queryIds
            .split(',')
            .filter((id) => filteredList.some((s) => s._id === id))
            .slice(0, 3); // Max 3 startups
          setSelectedIds(ids);
        } else if (filteredList.length >= 2) {
          // Pre-select top 2 from eligible list
          setSelectedIds([filteredList[0]._id, filteredList[1]._id]);
        } else if (filteredList.length > 0) {
          setSelectedIds([filteredList[0]._id]);
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
      if (selectedIds.length >= 3) return; // Strict max 3 limit
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

  // Holistic Multi-Pillar All-Rounder Analysis Engine (evaluates balance, floor strength, and low risk beyond just raw score)
  const allRounderAnalysis = useMemo(() => {
    if (comparedStartups.length < 2) return null;

    const evaluatedList = comparedStartups.map((s) => {
      const founder = s.founderScore || 0;
      const market = s.marketScore || 0;
      const growth = s.growthScore || 0;
      const model = s.businessModelScore || 0;
      const moat = s.competitionScore || 0;
      const riskMitigation = Math.max(0, 10 - (s.riskScore || 0));

      const pillars = [
        { label: 'Founder & Team', score: founder, weight: 0.30 },
        { label: 'Market & TAM', score: market, weight: 0.20 },
        { label: 'Growth Traction', score: growth, weight: 0.20 },
        { label: 'Business Model', score: model, weight: 0.15 },
        { label: 'Defensible Moat', score: moat, weight: 0.10 },
        { label: 'Risk Mitigation', score: riskMitigation, weight: 0.05 },
      ];

      const scoresArray = [founder, market, growth, model, moat, riskMitigation];
      const avgScore = scoresArray.reduce((a, b) => a + b, 0) / scoresArray.length;
      const minPillar = Math.min(...scoresArray);
      
      // Standard deviation / balance measure
      const variance = scoresArray.reduce((acc, val) => acc + Math.pow(val - avgScore, 2), 0) / scoresArray.length;
      const stdDev = Math.sqrt(variance);

      // Composite All-Rounder Balance Score:
      // High score + high consistency (low variance) + strong minimum floor (no fatal flaws)
      const balanceIndex = (s.overallScore * 0.40) + (avgScore * 0.30) + (minPillar * 0.25) - (stdDev * 0.15);

      // Qualitative highlights
      const strengths = [];
      if (founder >= 8.5) strengths.push('proven founder pedigree');
      else if (founder >= 7.0) strengths.push('strong founder execution');

      if (market >= 8.0) strengths.push('large expanding TAM');
      if (growth >= 8.0) strengths.push('high revenue velocity');
      if (model >= 8.0) strengths.push('high software gross margins');
      if (moat >= 8.0) strengths.push('defensible technical moat');
      if (s.riskScore <= 3.0) strengths.push('minimal execution risk');

      let detailedReason = '';
      if (minPillar >= 7.0) {
        detailedReason = `Complete all-around strength with no weak dimensions (lowest individual pillar is ${minPillar.toFixed(1)}/10). Balances ${strengths.slice(0, 3).join(', ')} with an institutional risk profile.`;
      } else if (s.decisionStatus === 'INVEST') {
        detailedReason = `Highest overall committee conviction deal featuring ${strengths.slice(0, 3).join(', ')} and sustainable capital efficiency.`;
      } else {
        detailedReason = `Superior risk-adjusted opportunity across compared companies with well-balanced ${strengths.slice(0, 2).join(' and ')}.`;
      }

      return {
        startup: s,
        balanceIndex,
        minPillar,
        stdDev,
        pillars,
        strengths,
        detailedReason,
      };
    });

    evaluatedList.sort((a, b) => b.balanceIndex - a.balanceIndex);
    return evaluatedList[0];
  }, [comparedStartups]);

  const availableToAdd = eligibleStartups.filter((s) => !selectedIds.includes(s._id));

  if (loading) return <PageLoader />;

  return (
    <div className="max-w-7xl mx-auto space-y-5 text-slate-900 w-full min-w-0 pb-16 font-sans">
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
            <p className="text-[11px] font-semibold text-slate-500 font-display">
              Side-by-side analysis of Invest & Watchlist deals (Max 3)
            </p>
          </div>
        </div>

        {/* Right Controls: Dropdown & Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Add Startup Selector Dropdown */}
          <select
            value=""
            onChange={(e) => handleDropdownSelect(e.target.value)}
            disabled={selectedIds.length >= 3 || availableToAdd.length === 0}
            className="bg-[#191919] hover:bg-slate-900 border border-slate-900 text-[#9df5a9] text-xs font-bold font-display rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#9df5a9] cursor-pointer disabled:opacity-50 shadow-xs"
          >
            <option value="" disabled className="bg-[#191919] text-slate-400">
              {selectedIds.length >= 3
                ? 'Max 3 Startups Compared'
                : availableToAdd.length === 0
                ? 'No More Invest/Watchlist Deals'
                : '+ Add Deal to Compare (Max 3)...'}
            </option>
            {availableToAdd.map((s) => (
              <option key={s._id} value={s._id} className="bg-white text-slate-900 font-medium">
                {s.companyName} ({s.decision?.status || 'Evaluated'} • {s.scorecard?.overallInvestmentScore ? `${s.scorecard.overallInvestmentScore.toFixed(1)}/10` : s.stage})
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
              Select 2 to 3 deals from your Invest or Watchlist pipeline using the dropdown above to evaluate live founder pedigree, commercial unit economics, and deal conviction side by side.
            </p>
          </div>
        </div>
      ) : (
        /* 📊 Dynamic Side-by-Side Grid (Max 3 Startups) */
        <div
          className={`grid grid-cols-1 ${
            comparedStartups.length === 2
              ? 'md:grid-cols-2'
              : 'md:grid-cols-2 lg:grid-cols-3'
          } gap-4 items-stretch`}
        >
          {comparedStartups.map((s) => {
            const isTopAllRounder = allRounderAnalysis?.startup?._id === s._id;

            const decisionBadgeClass =
              s.decisionStatus === 'INVEST'
                ? 'bg-[#9df5a9] text-slate-950 border-emerald-300'
                : s.decisionStatus === 'WATCHLIST'
                ? 'bg-amber-100 text-amber-900 border-amber-300'
                : 'bg-slate-100 text-slate-800 border-slate-300';

            return (
              <div
                key={s._id}
                className={`bg-white rounded-[26px] p-5 shadow-xs border flex flex-col justify-between space-y-4 relative transition-all ${
                  isTopAllRounder
                    ? 'border-emerald-400 ring-2 ring-emerald-300/40'
                    : 'border-slate-200/90'
                }`}
              >
                {/* Winner Highlight Ribbon */}
                {isTopAllRounder && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-[#191919] text-[#9df5a9] text-[10px] font-black font-display flex items-center gap-1 shadow-xs border border-emerald-500/40 whitespace-nowrap">
                    <Trophy className="w-3 h-3 text-[#9df5a9]" />
                    <span>Top All-Rounder Deal</span>
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

      {/* 🌟 4. Fast Executive Decision Verdict Banner */}
      {allRounderAnalysis && (
        <div className="bg-[#191919] text-white rounded-[22px] p-4 sm:p-5 shadow-sm border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div className="flex items-start sm:items-center gap-3.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[#9df5a9] text-[#191919] flex items-center justify-center font-black shadow-xs flex-shrink-0 mt-0.5 sm:mt-0">
              <Trophy className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-black font-display uppercase tracking-widest text-[#9df5a9]">
                  Committee Top Pick
                </span>
                <span className="bg-white/10 text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded-md">
                  Complete All-Rounder
                </span>
              </div>
              <div className="flex items-baseline gap-2 mt-0.5">
                <h2 className="text-base sm:text-lg font-black font-display text-white truncate">
                  {allRounderAnalysis.startup.companyName}
                </h2>
                <span className="text-xs text-slate-400 font-medium">
                  ({allRounderAnalysis.startup.industry} • {allRounderAnalysis.startup.stage})
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium leading-relaxed mt-1 line-clamp-2">
                {allRounderAnalysis.detailedReason}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0 self-end md:self-auto">
            <div className="bg-white/10 px-3.5 py-1.5 rounded-xl border border-white/10 text-center">
              <div className="text-[9px] font-bold text-slate-400 font-display uppercase tracking-wider">
                Deal Score
              </div>
              <div className="text-sm font-black font-display text-[#9df5a9]">
                {allRounderAnalysis.startup.overallScore > 0 ? `${allRounderAnalysis.startup.overallScore.toFixed(1)}/10` : '—'}
              </div>
            </div>

            <Link
              to={`/evaluation?id=${allRounderAnalysis.startup._id}`}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-black font-display text-slate-950 bg-[#9df5a9] hover:bg-[#8ee59a] transition-all shadow-xs hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap"
            >
              <span>Open Diligence</span>
              <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default Comparison;
