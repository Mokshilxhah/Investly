import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Star,
  Plus,
  Trash2,
  Check,
  BarChart3,
  Calendar,
  CheckSquare,
  TrendingUp,
  ShieldAlert,
  Briefcase,
  Layers,
  FileText,
  Award,
  Zap,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Send,
} from 'lucide-react';
import startupService from '../services/startupService';
import { PageLoader, Spinner } from '../components/common/Loader';

const MEETING_TYPES = [
  'Introductory Call',
  'Screening Round',
  'Technical Deep Dive',
  'Founder Meeting',
  'Due Diligence',
  'Committee Pitch',
  'Follow-up Q&A',
];

// Simple, easy-to-understand founder qualities
const INITIAL_QUALITIES_TODO = [
  { id: '1', text: 'Good Communication', done: false },
  { id: '2', text: 'Fast Learner', done: false },
  { id: '3', text: 'Hard Working', done: false },
  { id: '4', text: 'Honest & Open', done: false },
  { id: '5', text: 'Full-Time Focus', done: false },
  { id: '6', text: 'Team Player', done: false },
];

// 5 Core Scoring Dimensions
const CORE_5_QUALITIES = [
  { key: 'domainExpertise', label: 'Domain' },
  { key: 'execution', label: 'Execution' },
  { key: 'vision', label: 'Vision' },
  { key: 'technicalMastery', label: 'Technical' },
  { key: 'teamStrength', label: 'Leadership' },
];

// Simple, Fair Dropdown Options with full score tiers
const MARKET_DROPDOWN_OPTIONS = [
  { label: 'Select market size...', score: '' },
  { label: 'Early unproven / Emerging TAM (5.0)', score: 5.0 },
  { label: 'Small specialized niche (6.0)', score: 6.0 },
  { label: 'Moderate addressable market (7.0)', score: 7.0 },
  { label: 'Large attractive market (8.0)', score: 8.0 },
  { label: 'Massive $10B+ global market (9.0)', score: 9.0 },
  { label: 'Dominant secular industry shift (10.0)', score: 10.0 },
];

const MODEL_DROPDOWN_OPTIONS = [
  { label: 'Select business model...', score: '' },
  { label: 'Early pricing validation (5.0)', score: 5.0 },
  { label: 'Moderate gross margins (6.0)', score: 6.0 },
  { label: 'Predictable recurring model (7.0)', score: 7.0 },
  { label: 'High software gross margins (8.0)', score: 8.0 },
  { label: 'Top-tier enterprise SaaS LTV/CAC (9.0)', score: 9.0 },
  { label: 'Best-in-class venture unit economics (10.0)', score: 10.0 },
];

const GROWTH_DROPDOWN_OPTIONS = [
  { label: 'Select growth stage...', score: '' },
  { label: 'Prototype / Day 0 (5.0)', score: 5.0 },
  { label: 'Early beta user traction (6.0)', score: 6.0 },
  { label: 'Consistent MoM customer acquisition (7.0)', score: 7.0 },
  { label: 'Strong ARR expansion velocity (8.0)', score: 8.0 },
  { label: 'Rapid hyper-growth & 130%+ NRR (9.0)', score: 9.0 },
  { label: 'Breakout market category leader (10.0)', score: 10.0 },
];

const MOAT_DROPDOWN_OPTIONS = [
  { label: 'Select moat & defense...', score: '' },
  { label: 'Early advantage / Execution speed (5.0)', score: 5.0 },
  { label: 'Differentiated product experience (6.0)', score: 6.0 },
  { label: 'High switching costs & workflow stickiness (7.0)', score: 7.0 },
  { label: 'Proprietary IP & enterprise integration moat (8.0)', score: 8.0 },
  { label: 'Strong data flywheel & network effects (9.0)', score: 9.0 },
  { label: 'Monopolistic distribution & platform lock-in (10.0)', score: 10.0 },
];

// Helper to always highlight the matching or closest tier in the dropdown
const getMatchingDropdownValue = (score, options) => {
  if (score === undefined || score === null || score === '' || Number(score) === 0) return '';
  const num = Number(score);
  const exact = options.find((o) => o.score !== '' && Math.abs(Number(o.score) - num) < 0.01);
  if (exact) return exact.score;
  const valid = options.filter((o) => o.score !== '');
  if (valid.length === 0) return '';
  let closest = valid[0];
  let minDiff = Math.abs(Number(closest.score) - num);
  for (const opt of valid) {
    const diff = Math.abs(Number(opt.score) - num);
    if (diff < minDiff) {
      minDiff = diff;
      closest = opt;
    }
  }
  return closest.score;
};

export const Evaluation = () => {
  const { id: paramId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const startupId = paramId || searchParams.get('id');

  // Main Tab Switcher: 'founder' | 'analytics' | 'summary'
  const [activeTab, setActiveTab] = useState('founder');

  const [startups, setStartups] = useState([]);
  const [selectedStartup, setSelectedStartup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // ==========================================
  // 1. FOUNDER EVALUATION STATE
  // ==========================================
  const [selectedMeetingType, setSelectedMeetingType] = useState(MEETING_TYPES[0]);
  const [meetingNotes, setMeetingNotes] = useState('');
  const [currentRoundScore, setCurrentRoundScore] = useState(8);
  const [roundsList, setRoundsList] = useState([]);
  const [qualitiesTodoList, setQualitiesTodoList] = useState(INITIAL_QUALITIES_TODO);
  const [newQualityInput, setNewQualityInput] = useState('');
  const [starRatings, setStarRatings] = useState({
    domainExpertise: 0,
    execution: 0,
    vision: 0,
    technicalMastery: 0,
    teamStrength: 0,
  });
  const [hoverStars, setHoverStars] = useState({});

  // ==========================================
  // 2. ANALYTICS SCORE STATE
  // ==========================================
  const [analyticsScores, setAnalyticsScores] = useState({
    marketScore: 0,
    businessModelScore: 0,
    growthScore: 0,
    competitionScore: 0,
    riskScore: 2.0,
  });

  const [analyticsData, setAnalyticsData] = useState({
    marketOpportunity: '',
    businessModel: '',
    revenue: '',
    growthPotential: '',
    competitiveLandscape: '',
    keyRisks: '',
    investmentThesis: '',
  });

  const [riskCategories, setRiskCategories] = useState({
    founderRisk: 'LOW',
    marketRisk: 'LOW',
    executionRisk: 'LOW',
    financialRisk: 'LOW',
    competitiveRisk: 'LOW',
  });

  // ==========================================
  // 3. FINAL DECISION STATE
  // ==========================================
  const [decisionChoice, setDecisionChoice] = useState('UNDER_EVALUATION');
  const [decisionComment, setDecisionComment] = useState('');
  const [savingDecision, setSavingDecision] = useState(false);

  const showToast = (message, type = 'success') => {
    setToastMessage({ message, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Auto-compute accurate Risk Score based on risk category levels
  const autoCalculatedRiskScore = useMemo(() => {
    const values = Object.values(riskCategories);
    const highCount = values.filter((v) => v === 'HIGH').length;
    const medCount = values.filter((v) => v === 'MEDIUM').length;
    const lowCount = values.filter((v) => v === 'LOW').length;

    // Accurate formula: High=2.0pts, Med=1.0pt, Low=0.2pt
    const computed = (highCount * 2.0) + (medCount * 1.0) + (lowCount * 0.2);
    return Math.min(10, Math.max(0, Math.round(computed * 10) / 10));
  }, [riskCategories]);

  // Sync auto-calculated risk score
  useEffect(() => {
    setAnalyticsScores((prev) => ({ ...prev, riskScore: autoCalculatedRiskScore }));
  }, [autoCalculatedRiskScore]);

  // Load Startups
  useEffect(() => {
    const fetchStartups = async () => {
      try {
        setLoading(true);
        const data = await startupService.getStartups();
        const list = data || [];
        setStartups(list);

        if (startupId) {
          const found = list.find((s) => s._id === startupId);
          if (found) {
            setSelectedStartup(found);
            loadCleanStartupData(found);
          } else if (list.length > 0) {
            setSelectedStartup(list[0]);
            loadCleanStartupData(list[0]);
          }
        } else if (list.length > 0) {
          setSelectedStartup(list[0]);
          setSearchParams({ id: list[0]._id }, { replace: true });
          loadCleanStartupData(list[0]);
        }
      } catch (err) {
        console.error('Error fetching startups for evaluation:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStartups();
  }, [startupId]);

  // Clean data loader: Always prioritizes live database records
  const loadCleanStartupData = (startup) => {
    if (!startup) return;

    if (startup.decision) {
      setDecisionChoice(startup.decision.status || 'UNDER_EVALUATION');
      setDecisionComment(startup.decision.comment || '');
    }

    const hasDbFounder = Boolean(
      startup.evaluation?.overallScore !== undefined &&
      startup.evaluation?.overallScore !== null &&
      startup.evaluation.overallScore > 0
    );

    const hasDbAnalysis = Boolean(
      startup.analysis?.marketScore !== undefined &&
      startup.analysis?.marketScore !== null &&
      startup.analysis.marketScore > 0
    );

    // 1. Resolve Star Ratings (from MongoDB or default)
    const exp = startup.evaluation?.technicalMastery || startup.evaluation?.experience || 0;
    const initialStars = {
      domainExpertise: startup.evaluation?.domainExpertise ? Math.max(1, Math.min(5, Math.round(startup.evaluation.domainExpertise / 2))) : 0,
      execution: startup.evaluation?.execution ? Math.max(1, Math.min(5, Math.round(startup.evaluation.execution / 2))) : 0,
      vision: startup.evaluation?.vision ? Math.max(1, Math.min(5, Math.round(startup.evaluation.vision / 2))) : 0,
      technicalMastery: exp ? Math.max(1, Math.min(5, Math.round(exp / 2))) : 0,
      teamStrength: startup.evaluation?.teamStrength ? Math.max(1, Math.min(5, Math.round(startup.evaluation.teamStrength / 2))) : 0,
    };

    // 2. Resolve Analytics Scores (from MongoDB or default)
    const initialAnalyticsScores = {
      marketScore: startup.analysis?.marketScore || 0,
      businessModelScore: startup.analysis?.businessModelScore || 0,
      growthScore: startup.analysis?.growthScore || 0,
      competitionScore: startup.analysis?.competitionScore || 0,
      riskScore: startup.analysis?.riskScore !== undefined && startup.analysis?.riskScore !== null ? startup.analysis.riskScore : (hasDbAnalysis ? 2.0 : 0),
    };

    // 3. Resolve Text Data
    const initialAnalyticsData = {
      marketOpportunity: startup.analysis?.marketOpportunity || '',
      businessModel: startup.analysis?.businessModel || '',
      revenue: startup.analysis?.revenue || '',
      growthPotential: startup.analysis?.growthPotential || '',
      competitiveLandscape: startup.analysis?.competitiveLandscape || '',
      keyRisks: startup.analysis?.keyRisks || '',
      investmentThesis: startup.analysis?.investmentThesis || startup.decision?.comment || '',
    };

    // 4. Resolve Risk Categories
    const initialRiskCategories = startup.analysis?.riskCategories || {
      founderRisk: startup.analysis?.riskScore && startup.analysis.riskScore > 6 ? 'HIGH' : startup.analysis?.riskScore && startup.analysis.riskScore > 3 ? 'MEDIUM' : 'LOW',
      marketRisk: 'LOW',
      executionRisk: 'LOW',
      financialRisk: 'LOW',
      competitiveRisk: 'LOW',
    };

    // 5. Resolve Meeting Notes & Checklist
    const initialMeetingNotes = startup.founder?.background || startup.evaluation?.meetingNotes || '';
    const initialChecklist = INITIAL_QUALITIES_TODO.map((t) => ({
      ...t,
      done: hasDbFounder ? (startup.evaluation.overallScore >= 7.0) : false,
    }));

    // Check if user has active session adjustments in local storage
    try {
      const localData = localStorage.getItem(`eval_studio_${startup._id}`);
      if (localData) {
        const parsed = JSON.parse(localData);
        if (Array.isArray(parsed.roundsList)) setRoundsList(parsed.roundsList);
        else setRoundsList([]);

        if (Array.isArray(parsed.qualitiesTodoList) && parsed.qualitiesTodoList.some(q => q.done)) {
          setQualitiesTodoList(parsed.qualitiesTodoList);
        } else {
          setQualitiesTodoList(initialChecklist);
        }

        // If local storage has valid ratings, use them; otherwise fallback to DB
        const hasLocalStars = parsed.starRatings && Object.values(parsed.starRatings).some(v => v > 0);
        setStarRatings(hasLocalStars ? parsed.starRatings : initialStars);

        setMeetingNotes(parsed.meetingNotes || initialMeetingNotes);

        const hasLocalAnalytics = parsed.analyticsScores && Object.values(parsed.analyticsScores).some(v => v > 0);
        setAnalyticsScores(hasLocalAnalytics ? parsed.analyticsScores : initialAnalyticsScores);
        setAnalyticsData(parsed.analyticsData || initialAnalyticsData);
        setRiskCategories(parsed.riskCategories || initialRiskCategories);
        return;
      }
    } catch (e) {
      console.warn('Local storage read error', e);
    }

    setStarRatings(initialStars);
    setRoundsList([]);
    setQualitiesTodoList(initialChecklist);
    setMeetingNotes(initialMeetingNotes);
    setAnalyticsScores(initialAnalyticsScores);
    setAnalyticsData(initialAnalyticsData);
    setRiskCategories(initialRiskCategories);
  };

  const handleSelectStartup = (id) => {
    setSearchParams({ id });
    const found = startups.find((s) => s._id === id);
    if (found) {
      setSelectedStartup(found);
      loadCleanStartupData(found);
    }
  };

  // ==========================================================
  // FOUNDER EVALUATION COMPUTATIONS
  // ==========================================================
  const handleAddRound = (e) => {
    if (e) e.preventDefault();
    if (!selectedMeetingType) return;

    const parsedScore = typeof currentRoundScore === 'number' && !isNaN(currentRoundScore)
      ? currentRoundScore
      : parseFloat(currentRoundScore) || 8;
    const finalScore = Math.max(1, Math.min(10, parsedScore));

    const newRound = {
      id: `round-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      type: selectedMeetingType,
      score: finalScore,
      date: new Date().toISOString().split('T')[0],
    };

    setRoundsList((prev) => {
      const updated = [...prev, newRound];
      if (selectedStartup?._id) {
        try {
          const existing = JSON.parse(localStorage.getItem(`eval_studio_${selectedStartup._id}`) || '{}');
          localStorage.setItem(
            `eval_studio_${selectedStartup._id}`,
            JSON.stringify({ ...existing, roundsList: updated })
          );
        } catch (err) {
          console.warn(err);
        }
      }
      return updated;
    });

    showToast(`Logged ${selectedMeetingType} (${finalScore}/10)`);
  };

  const handleDeleteRound = (roundId) => {
    setRoundsList((prev) => {
      const updated = prev.filter((r) => r.id !== roundId);
      if (selectedStartup?._id) {
        try {
          const existing = JSON.parse(localStorage.getItem(`eval_studio_${selectedStartup._id}`) || '{}');
          localStorage.setItem(
            `eval_studio_${selectedStartup._id}`,
            JSON.stringify({ ...existing, roundsList: updated })
          );
        } catch (err) {
          console.warn(err);
        }
      }
      return updated;
    });
  };

  const avgRoundScore = useMemo(() => {
    if (roundsList.length === 0) return null;
    const sum = roundsList.reduce((acc, r) => acc + (Number(r.score) || 0), 0);
    return sum / roundsList.length;
  }, [roundsList]);

  const handleSetStar = (key, rating) => {
    setStarRatings((prev) => {
      const updated = {
        ...prev,
        [key]: prev[key] === rating ? 0 : rating,
      };
      if (selectedStartup?._id) {
        try {
          const existing = JSON.parse(localStorage.getItem(`eval_studio_${selectedStartup._id}`) || '{}');
          localStorage.setItem(
            `eval_studio_${selectedStartup._id}`,
            JSON.stringify({ ...existing, starRatings: updated })
          );
        } catch (err) {
          console.warn(err);
        }
      }
      return updated;
    });
  };

  const hasAnyStarsRated = useMemo(() => {
    return Object.values(starRatings).some((val) => val > 0);
  }, [starRatings]);

  const avgStarScoreOutOf10 = useMemo(() => {
    if (!hasAnyStarsRated) return null;
    const values = Object.values(starRatings);
    const ratedValues = values.filter((v) => v > 0);
    const sum = ratedValues.reduce((acc, val) => acc + val, 0);
    const avg = sum / (ratedValues.length || 1);
    return (avg / 5) * 10;
  }, [starRatings, hasAnyStarsRated]);

  const compositeFounderScore = useMemo(() => {
    if (avgStarScoreOutOf10 !== null && avgRoundScore !== null) {
      return (avgStarScoreOutOf10 * 0.5) + (avgRoundScore * 0.5);
    }
    if (avgRoundScore !== null) return avgRoundScore;
    if (selectedStartup?.evaluation?.overallScore) return selectedStartup.evaluation.overallScore;
    if (avgStarScoreOutOf10 !== null) return avgStarScoreOutOf10;
    return null;
  }, [avgStarScoreOutOf10, avgRoundScore, selectedStartup]);

  // Qualities Checklist
  const handleToggleTodo = (todoId) => {
    setQualitiesTodoList((prev) => {
      const updated = prev.map((t) => (t.id === todoId ? { ...t, done: !t.done } : t));
      if (selectedStartup?._id) {
        try {
          const existing = JSON.parse(localStorage.getItem(`eval_studio_${selectedStartup._id}`) || '{}');
          localStorage.setItem(
            `eval_studio_${selectedStartup._id}`,
            JSON.stringify({ ...existing, qualitiesTodoList: updated })
          );
        } catch (err) {
          console.warn(err);
        }
      }
      return updated;
    });
  };

  const handleAddQualityTodo = (e) => {
    if (e) e.preventDefault();
    if (!newQualityInput.trim()) return;

    const newTodo = {
      id: `todo-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      text: newQualityInput.trim(),
      done: false,
    };

    setQualitiesTodoList((prev) => {
      const updated = [...prev, newTodo];
      if (selectedStartup?._id) {
        try {
          const existing = JSON.parse(localStorage.getItem(`eval_studio_${selectedStartup._id}`) || '{}');
          localStorage.setItem(
            `eval_studio_${selectedStartup._id}`,
            JSON.stringify({ ...existing, qualitiesTodoList: updated })
          );
        } catch (err) {
          console.warn(err);
        }
      }
      return updated;
    });

    setNewQualityInput('');
  };

  const handleDeleteTodo = (todoId) => {
    setQualitiesTodoList((prev) => {
      const updated = prev.filter((t) => t.id !== todoId);
      if (selectedStartup?._id) {
        try {
          const existing = JSON.parse(localStorage.getItem(`eval_studio_${selectedStartup._id}`) || '{}');
          localStorage.setItem(
            `eval_studio_${selectedStartup._id}`,
            JSON.stringify({ ...existing, qualitiesTodoList: updated })
          );
        } catch (err) {
          console.warn(err);
        }
      }
      return updated;
    });
  };

  const completedTodosCount = qualitiesTodoList.filter((t) => t.done).length;

  // ==========================================================
  // ANALYTICS SCORE COMPUTATIONS & PRESETS
  // ==========================================================
  const handleScoreChange = (dimKey, val) => {
    const num = Math.max(0, Math.min(10, parseFloat(val) || 0));
    setAnalyticsScores((prev) => {
      const updated = { ...prev, [dimKey]: num };
      if (selectedStartup?._id) {
        try {
          const existing = JSON.parse(localStorage.getItem(`eval_studio_${selectedStartup._id}`) || '{}');
          localStorage.setItem(
            `eval_studio_${selectedStartup._id}`,
            JSON.stringify({ ...existing, analyticsScores: updated })
          );
        } catch (err) {
          console.warn(err);
        }
      }
      return updated;
    });
  };

  const handleDataChange = (field, val) => {
    setAnalyticsData((prev) => {
      const updated = { ...prev, [field]: val };
      if (selectedStartup?._id) {
        try {
          const existing = JSON.parse(localStorage.getItem(`eval_studio_${selectedStartup._id}`) || '{}');
          localStorage.setItem(
            `eval_studio_${selectedStartup._id}`,
            JSON.stringify({ ...existing, analyticsData: updated })
          );
        } catch (err) {
          console.warn(err);
        }
      }
      return updated;
    });
  };

  const handleSetRiskLevel = (catKey, level) => {
    setRiskCategories((prev) => {
      const updated = { ...prev, [catKey]: level };
      if (selectedStartup?._id) {
        try {
          const existing = JSON.parse(localStorage.getItem(`eval_studio_${selectedStartup._id}`) || '{}');
          localStorage.setItem(
            `eval_studio_${selectedStartup._id}`,
            JSON.stringify({ ...existing, riskCategories: updated })
          );
        } catch (err) {
          console.warn(err);
        }
      }
      return updated;
    });
  };

  const hasAnyAnalyticsRated = useMemo(() => {
    return (
      (analyticsScores.marketScore || 0) > 0 ||
      (analyticsScores.businessModelScore || 0) > 0 ||
      (analyticsScores.growthScore || 0) > 0 ||
      (analyticsScores.competitionScore || 0) > 0
    );
  }, [analyticsScores]);

  const avgAnalyticsScore = useMemo(() => {
    if (!hasAnyAnalyticsRated) return null;
    const rated = [
      analyticsScores.marketScore,
      analyticsScores.businessModelScore,
      analyticsScores.growthScore,
      analyticsScores.competitionScore,
    ].filter((v) => v > 0);
    const sum = rated.reduce((a, b) => a + b, 0);
    return sum / (rated.length || 1);
  }, [analyticsScores, hasAnyAnalyticsRated]);

  // Overall Weighted Score: Founder 30% + Market 20% + Growth 20% + Model 15% + Comp 10% + Risk 5%
  const compositeInvestmentScore = useMemo(() => {
    const fScore = compositeFounderScore || 0;
    const mScore = analyticsScores.marketScore || 0;
    const gScore = analyticsScores.growthScore || 0;
    const bScore = analyticsScores.businessModelScore || 0;
    const cScore = analyticsScores.competitionScore || 0;
    const rScore = Math.max(0, 10 - (analyticsScores.riskScore || 0)); // Lower risk = higher mitigation score

    if (fScore === 0 && !hasAnyAnalyticsRated) return null;

    const weighted =
      (fScore * 0.30) +
      (mScore * 0.20) +
      (gScore * 0.20) +
      (bScore * 0.15) +
      (cScore * 0.10) +
      (rScore * 0.05);

    return Math.round(weighted * 10) / 10;
  }, [compositeFounderScore, analyticsScores, hasAnyAnalyticsRated]);

  const systemRecommendation = useMemo(() => {
    if (compositeInvestmentScore === null) return null;
    if (compositeInvestmentScore >= 8.0) return 'INVEST';
    if (compositeInvestmentScore >= 6.0) return 'WATCHLIST';
    return 'REJECT';
  }, [compositeInvestmentScore]);

  // Smart 1-Click Thesis Generator
  const handleGenerateSmartThesis = () => {
    const company = selectedStartup?.companyName || 'The startup';
    const mScore = analyticsScores.marketScore || 7;
    const gScore = analyticsScores.growthScore || 7;
    const highRisks = Object.entries(riskCategories)
      .filter(([_, level]) => level === 'HIGH')
      .map(([k]) => k.replace('Risk', ''));

    let thesisText = '';
    if (compositeInvestmentScore && compositeInvestmentScore >= 8.0) {
      thesisText = `${company} shows strong momentum (${mScore}/10 market, ${gScore}/10 growth) and high founder potential. Recommended for investment.`;
    } else if (compositeInvestmentScore && compositeInvestmentScore >= 6.0) {
      const riskMention = highRisks.length > 0 ? `monitor ${highRisks.join(', ')} risk.` : 'track user progress over coming weeks.';
      thesisText = `${company} has promising potential, but requires monitoring: ${riskMention} Recommended for Watchlist.`;
    } else {
      thesisText = `${company} is in very early development with key fundamentals to prove. Recommended to monitor from a distance.`;
    }

    handleDataChange('investmentThesis', thesisText);
    showToast('Generated summary thesis ✨');
  };

  // ==========================================
  // BACKEND SAVE HANDLERS
  // ==========================================
  const handleSaveFounderEvaluation = async () => {
    if (!selectedStartup) return;

    try {
      setSaving(true);
      const calculatedOverallScore = compositeFounderScore !== null
        ? Math.round(compositeFounderScore * 10) / 10
        : 0;

      const evaluationPayload = {
        domainExpertise: (starRatings.domainExpertise || 0) * 2,
        execution: (starRatings.execution || 0) * 2,
        vision: (starRatings.vision || 0) * 2,
        experience: (starRatings.technicalMastery || 0) * 2,
        teamStrength: (starRatings.teamStrength || 0) * 2,
        overallScore: calculatedOverallScore,
        meetingNotes: meetingNotes.trim(),
      };

      const result = await startupService.updateEvaluation(selectedStartup._id, evaluationPayload);

      try {
        localStorage.setItem(
          `eval_studio_${selectedStartup._id}`,
          JSON.stringify({
            roundsList,
            qualitiesTodoList,
            starRatings,
            meetingNotes,
            analyticsScores,
            analyticsData,
            riskCategories,
          })
        );
      } catch (e) {
        console.warn('Local storage error', e);
      }

      if (result?.data) setSelectedStartup(result.data);

      showToast(
        calculatedOverallScore > 0
          ? `Founder score saved (${calculatedOverallScore.toFixed(1)}/10)`
          : 'Founder evaluation saved successfully',
        'success'
      );
    } catch (err) {
      console.error('Save error:', err);
      showToast(err.message || 'Failed to save evaluation', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAnalytics = async () => {
    if (!selectedStartup) return;

    try {
      setSaving(true);
      const payload = {
        marketOpportunity: analyticsData.marketOpportunity,
        marketScore: analyticsScores.marketScore || 0,
        businessModel: analyticsData.businessModel,
        businessModelScore: analyticsScores.businessModelScore || 0,
        competitiveLandscape: analyticsData.competitiveLandscape,
        competitionScore: analyticsScores.competitionScore || 0,
        revenue: analyticsData.revenue,
        growthPotential: analyticsData.growthPotential,
        growthScore: analyticsScores.growthScore || 0,
        keyRisks: analyticsData.keyRisks,
        riskScore: analyticsScores.riskScore || 0,
        riskCategories,
        investmentThesis: analyticsData.investmentThesis,
      };

      const result = await startupService.updateAnalysis(selectedStartup._id, payload);

      try {
        localStorage.setItem(
          `eval_studio_${selectedStartup._id}`,
          JSON.stringify({
            roundsList,
            qualitiesTodoList,
            starRatings,
            meetingNotes,
            analyticsScores,
            analyticsData,
            riskCategories,
          })
        );
      } catch (e) {
        console.warn('Local storage error', e);
      }

      if (result?.data) setSelectedStartup(result.data);

      showToast(
        avgAnalyticsScore !== null
          ? `Analytics saved (${avgAnalyticsScore.toFixed(1)}/10)`
          : 'Analytics saved successfully',
        'success'
      );
    } catch (err) {
      console.error('Save error:', err);
      showToast(err.message || 'Failed to save analytics', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleRecordFinalDecision = async () => {
    if (!selectedStartup) return;

    const hasFounderScore = compositeFounderScore !== null && compositeFounderScore > 0;
    const hasAnalyticsScore = avgAnalyticsScore !== null && avgAnalyticsScore > 0;
    if (!hasFounderScore || !hasAnalyticsScore) {
      showToast('Please complete both Founder Evaluation and Analytics scores first', 'error');
      return;
    }

    try {
      setSavingDecision(true);
      const payload = {
        status: decisionChoice,
        comment: decisionComment.trim(),
        decidedBy: 'Investment Analyst',
      };

      const result = await startupService.updateDecision(selectedStartup._id, payload);
      if (result?.data) setSelectedStartup(result.data);

      showToast(`Final decision recorded: ${decisionChoice}`, 'success');
    } catch (err) {
      console.error('Decision error:', err);
      showToast(err.message || 'Failed to record decision', 'error');
    } finally {
      setSavingDecision(false);
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="max-w-7xl mx-auto space-y-5 text-slate-900 w-full min-w-0 pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-xs font-black font-display animate-in slide-in-from-bottom duration-150 ${
            toastMessage.type === 'error' ? 'bg-rose-500 text-white shadow-rose-500/20' : 'bg-[#9df5a9] text-[#191919]'
          }`}
        >
          {toastMessage.type === 'error' ? (
            <ShieldAlert className="w-4 h-4 text-white" />
          ) : (
            <Check className="w-4 h-4 stroke-[3]" />
          )}
          <span>{toastMessage.message}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 sm:p-5 rounded-[24px] border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Link
              to="/startups"
              className="text-xs font-bold text-slate-500 hover:text-slate-900 font-display flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Startups</span>
            </Link>
            <span className="text-slate-300">•</span>
            <span className="text-xs font-bold text-emerald-700 font-display">Evaluation Studio</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold font-display text-slate-900 tracking-tight mt-0.5">
            Evaluation Studio
          </h1>
        </div>

        {/* Startup Selector */}
        {startups.length > 0 && selectedStartup && (
          <div className="flex items-center gap-2.5 bg-[#f8faf8] px-3.5 py-1.5 rounded-2xl border border-slate-200/80 self-start sm:self-auto">
            <div className="w-7 h-7 rounded-xl bg-[#191919] text-white flex items-center justify-center font-black font-display text-xs flex-shrink-0">
              {selectedStartup.companyName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="text-[9px] font-extrabold uppercase tracking-wider text-slate-500 font-display">
                Startup
              </div>
              <select
                value={selectedStartup._id}
                onChange={(e) => handleSelectStartup(e.target.value)}
                className="bg-transparent text-xs font-extrabold font-display text-slate-950 focus:outline-none cursor-pointer pr-1"
              >
                {startups.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.companyName}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* 🔀 3-Tab Switcher */}
      <div className="flex items-center justify-between bg-white p-1.5 rounded-2xl border border-slate-200/80 shadow-xs overflow-x-auto">
        <div className="flex items-center gap-1.5 min-w-max">
          {/* Tab 1 */}
          <button
            type="button"
            onClick={() => setActiveTab('founder')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold font-display transition-all ${
              activeTab === 'founder'
                ? 'bg-[#191919] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-950 hover:bg-[#f4f7f4]'
            }`}
          >
            <User className="w-3.5 h-3.5 text-[#9df5a9]" />
            <span>1. Founder Evaluation</span>
            <span
              className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                activeTab === 'founder'
                  ? 'bg-[#9df5a9] text-slate-950'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              {compositeFounderScore !== null ? `${compositeFounderScore.toFixed(1)}/10` : '—'}
            </span>
          </button>

          {/* Tab 2 */}
          <button
            type="button"
            onClick={() => setActiveTab('analytics')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold font-display transition-all ${
              activeTab === 'analytics'
                ? 'bg-[#191919] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-950 hover:bg-[#f4f7f4]'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-emerald-400" />
            <span>2. Analytics Score</span>
            <span
              className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                activeTab === 'analytics'
                  ? 'bg-emerald-400 text-slate-950'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              {avgAnalyticsScore !== null ? `${avgAnalyticsScore.toFixed(1)}/10` : '—'}
            </span>
          </button>

          {/* Tab 3 */}
          <button
            type="button"
            onClick={() => setActiveTab('summary')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold font-display transition-all ${
              activeTab === 'summary'
                ? 'bg-[#191919] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-950 hover:bg-[#f4f7f4]'
            }`}
          >
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span>3. Summary & Final Verdict</span>
            <span
              className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                activeTab === 'summary'
                  ? 'bg-amber-400 text-slate-950'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              {compositeInvestmentScore !== null ? `${compositeInvestmentScore.toFixed(1)}/10` : '—'}
            </span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 🌟 TAB 1: FOUNDER EVALUATION */}
      {/* ========================================================================= */}
      {activeTab === 'founder' && (
        <div className="bg-white rounded-[28px] p-5 sm:p-6 shadow-sm border border-slate-200/80 space-y-5">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#191919] text-white flex items-center justify-center shadow-xs">
                <User className="w-5 h-5 text-[#9df5a9]" />
              </div>
              <div>
                <h2 className="text-base font-extrabold font-display text-slate-900">
                  Founder Evaluation
                </h2>
                <div className="text-[11px] text-slate-500 font-display">
                  {selectedStartup ? `${selectedStartup.companyName} (${selectedStartup.stage || 'Seed'})` : 'Startup Evaluation'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="flex items-center gap-1.5 bg-[#f8faf8] border border-slate-200/80 px-3.5 py-1.5 rounded-xl">
                <span className="text-xs font-bold text-slate-500 font-display">Founder Score:</span>
                <span className="text-base font-black font-display text-slate-950">
                  {compositeFounderScore !== null ? compositeFounderScore.toFixed(1) : '—'}
                  <span className="text-xs text-slate-400 font-normal"> / 10</span>
                </span>
              </div>

              <button
                type="button"
                onClick={handleSaveFounderEvaluation}
                disabled={saving}
                className="px-4 py-2 rounded-xl text-xs font-black font-display text-slate-950 bg-[#9df5a9] hover:bg-[#8ee59a] transition-all shadow-xs flex items-center gap-1.5 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
              >
                {saving ? <Spinner size="sm" color="black" /> : <Check className="w-4 h-4 stroke-[3]" />}
                <span>Save Evaluation</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            
            {/* Section 1: Meeting Rounds */}
            <div className="lg:col-span-4 bg-[#f8faf8] p-4.5 sm:p-5 rounded-2xl border border-slate-200/70 flex flex-col justify-between space-y-4 shadow-2xs">
              <div className="space-y-3.5">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200/70">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-700" />
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 font-display">
                      Meeting Rounds
                    </h3>
                  </div>
                  <span className="text-[10px] font-black font-display text-slate-700 bg-white px-2 py-0.5 rounded-md border border-slate-200/80 shadow-2xs">
                    {avgRoundScore !== null ? `Avg: ${avgRoundScore.toFixed(1)}/10` : '0 rounds'}
                  </span>
                </div>

                <div className="space-y-2">
                  <select
                    value={selectedMeetingType}
                    onChange={(e) => setSelectedMeetingType(e.target.value)}
                    className="w-full bg-white border border-slate-200/90 rounded-xl px-2.5 py-1.5 text-xs font-bold font-display text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#9df5a9]"
                  >
                    {MEETING_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 flex-1 bg-white border border-slate-200/90 rounded-xl px-2 py-1 shadow-2xs min-w-0">
                      <span className="text-[10px] font-bold text-slate-500 font-display whitespace-nowrap">Score:</span>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        step="0.5"
                        value={currentRoundScore}
                        onChange={(e) => setCurrentRoundScore(parseFloat(e.target.value) || 0)}
                        className="w-full bg-transparent text-xs font-black font-display text-slate-900 text-center focus:outline-none"
                      />
                      <span className="text-[10px] font-bold text-slate-400 font-display">/10</span>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddRound}
                      className="py-1.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold font-display flex items-center gap-1 shadow-xs transition-colors flex-shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Log</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {roundsList.length === 0 ? (
                    <div className="text-center py-4 text-xs text-slate-400 font-medium bg-white/50 rounded-xl border border-dashed border-slate-200">
                      No rounds logged yet.
                    </div>
                  ) : (
                    roundsList.map((round) => (
                      <div
                        key={round.id}
                        className="bg-white p-2.5 rounded-xl border border-slate-200/90 flex items-center justify-between text-xs shadow-2xs gap-2"
                      >
                        <span className="font-bold text-slate-900 truncate min-w-0 flex-1">
                          {round.type}
                        </span>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <span className="font-black bg-[#f4f7f4] px-1.5 py-0.5 rounded text-[11px] text-slate-900">
                            {round.score}/10
                          </span>
                          <button
                            type="button"
                            onClick={() => handleDeleteRound(round.id)}
                            className="text-slate-300 hover:text-rose-600 p-0.5 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="pt-2 border-t border-slate-200/70 space-y-1">
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-600 font-display block">
                    Discussion Notes
                  </label>
                  <textarea
                    rows={2}
                    value={meetingNotes}
                    onChange={(e) => setMeetingNotes(e.target.value)}
                    placeholder="Discussion notes..."
                    className="w-full bg-white border border-slate-200/90 rounded-xl p-2 text-xs text-slate-800 font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#9df5a9] resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Qualities Checklist */}
            <div className="lg:col-span-4 bg-[#f8faf8] p-4.5 sm:p-5 rounded-2xl border border-slate-200/70 space-y-3.5 shadow-2xs flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200/70">
                  <div className="flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-emerald-700" />
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 font-display">
                      Qualities Checklist
                    </h3>
                  </div>
                  <span className="text-[10px] font-bold font-display text-emerald-800 bg-[#9df5a9]/50 px-2 py-0.5 rounded-full">
                    {completedTodosCount}/{qualitiesTodoList.length} Done
                  </span>
                </div>

                <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1">
                  {qualitiesTodoList.map((todo) => (
                    <div
                      key={todo.id}
                      onClick={() => handleToggleTodo(todo.id)}
                      className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer select-none gap-2 ${
                        todo.done
                          ? 'bg-white border-emerald-300 shadow-2xs'
                          : 'bg-white/80 border-slate-200/80 hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1 overflow-hidden">
                        <div
                          className={`w-3.5 h-3.5 rounded flex items-center justify-center flex-shrink-0 ${
                            todo.done ? 'bg-[#191919] text-[#9df5a9]' : 'border border-slate-300'
                          }`}
                        >
                          {todo.done && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        </div>
                        <span
                          className={`text-xs font-display font-bold truncate block ${
                            todo.done ? 'text-slate-900 line-through opacity-70' : 'text-slate-800'
                          }`}
                        >
                          {todo.text}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteTodo(todo.id);
                        }}
                        className="text-slate-300 hover:text-rose-600 p-0.5 flex-shrink-0 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <form onSubmit={handleAddQualityTodo} className="flex items-center gap-1.5 pt-2 border-t border-slate-200/70">
                <input
                  type="text"
                  value={newQualityInput}
                  onChange={(e) => setNewQualityInput(e.target.value)}
                  placeholder="Add quality..."
                  className="flex-1 min-w-0 bg-white border border-slate-200/90 rounded-xl px-2.5 py-1.5 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#9df5a9]"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold font-display transition-colors flex-shrink-0"
                >
                  Add
                </button>
              </form>
            </div>

            {/* Section 3: 5 Core Qualities Star Rating */}
            <div className="lg:col-span-4 bg-[#f8faf8] p-4.5 sm:p-5 rounded-2xl border border-slate-200/70 space-y-3.5 shadow-2xs flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200/70">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 font-display">
                      5 Core Qualities
                    </h3>
                  </div>
                  <span className="text-[10px] font-bold font-display text-slate-800 bg-white px-2 py-0.5 rounded-md border border-slate-200/80 shadow-2xs">
                    {avgStarScoreOutOf10 !== null ? `${((avgStarScoreOutOf10 / 10) * 5).toFixed(1)} / 5 ⭐` : '0 / 5 ⭐'}
                  </span>
                </div>

                <div className="space-y-1.5">
                  {CORE_5_QUALITIES.map((q) => {
                    const rating = starRatings[q.key] || 0;
                    const activeHover = hoverStars[q.key] || 0;

                    return (
                      <div
                        key={q.key}
                        className="bg-white p-2.5 rounded-xl border border-slate-200/90 flex items-center justify-between gap-2 shadow-2xs"
                      >
                        <span className="text-xs font-extrabold font-display text-slate-900 truncate min-w-0 flex-1">
                          {q.label}
                        </span>

                        <div className="flex items-center gap-0.5 flex-shrink-0">
                          {[1, 2, 3, 4, 5].map((num) => {
                            const isFilled = (activeHover || rating) >= num;
                            return (
                              <button
                                key={num}
                                type="button"
                                onClick={() => handleSetStar(q.key, num)}
                                onMouseEnter={() =>
                                  setHoverStars((prev) => ({ ...prev, [q.key]: num }))
                                }
                                onMouseLeave={() =>
                                  setHoverStars((prev) => ({ ...prev, [q.key]: 0 }))
                                }
                                className="p-0.5 focus:outline-none transition-transform hover:scale-110"
                              >
                                <Star
                                  className={`w-3.5 h-3.5 ${
                                    isFilled
                                      ? 'text-amber-400 fill-amber-400'
                                      : 'text-slate-200 fill-slate-100'
                                  }`}
                                />
                              </button>
                            );
                          })}
                          <span className="ml-1 text-xs font-black font-display text-slate-800 min-w-[12px] text-right">
                            {rating > 0 ? rating : '0'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-white border border-slate-200/90 flex items-center justify-between text-xs font-display shadow-2xs">
                <span className="font-bold text-slate-500">Quality Score:</span>
                <span className="font-black text-slate-900">
                  {avgStarScoreOutOf10 !== null ? `${avgStarScoreOutOf10.toFixed(1)} / 10` : '— / 10'}
                </span>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* 📊 TAB 2: ANALYTICS SCORE (ALL HORIZONTAL ROWS, ZERO OVERFLOW) */}
      {/* ========================================================================= */}
      {activeTab === 'analytics' && (
        <div className="bg-white rounded-[28px] p-5 sm:p-6 shadow-sm border border-slate-200/80 space-y-4">
          
          {/* Top Bar: Clean, No Subtitle Paragraph, No Redundant Decision Badge */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#191919] text-white flex items-center justify-center shadow-xs">
                <BarChart3 className="w-5 h-5 text-emerald-400" />
              </div>
              <h2 className="text-base font-extrabold font-display text-slate-900">
                Investment Analytics & Scorecard
              </h2>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="flex items-center gap-1.5 bg-[#f8faf8] border border-slate-200/80 px-3.5 py-1.5 rounded-xl">
                <span className="text-xs font-bold text-slate-500 font-display">Analytics:</span>
                <span className="text-base font-black font-display text-slate-950">
                  {avgAnalyticsScore !== null ? avgAnalyticsScore.toFixed(1) : '—'}
                  <span className="text-xs text-slate-400 font-normal"> / 10</span>
                </span>
              </div>

              <button
                type="button"
                onClick={handleSaveAnalytics}
                disabled={saving}
                className="px-4 py-2 rounded-xl text-xs font-black font-display text-slate-950 bg-[#9df5a9] hover:bg-[#8ee59a] transition-all shadow-xs flex items-center gap-1.5 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
              >
                {saving ? <Spinner size="sm" color="black" /> : <Check className="w-4 h-4 stroke-[3]" />}
                <span>Save Analytics</span>
              </button>
            </div>
          </div>

          {/* 6 Clean Horizontal Rows */}
          <div className="space-y-2.5">
            
            {/* ROW 1: Market */}
            <div className="bg-[#f8faf8] p-3 rounded-2xl border border-slate-200/70 grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center shadow-2xs">
              <div className="sm:col-span-3 flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-white border border-slate-200/80 flex items-center justify-center shadow-2xs flex-shrink-0">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-700" />
                </div>
                <span className="text-xs font-black text-slate-900 font-display truncate">
                  Market Size & TAM
                </span>
              </div>

              <div className="sm:col-span-4 min-w-0">
                <select
                  value={getMatchingDropdownValue(analyticsScores.marketScore, MARKET_DROPDOWN_OPTIONS)}
                  onChange={(e) => handleScoreChange('marketScore', parseFloat(e.target.value) || 0)}
                  className="w-full bg-white border border-slate-200/90 rounded-xl px-2.5 py-1.5 text-xs font-bold font-display text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#9df5a9] cursor-pointer"
                >
                  {MARKET_DROPDOWN_OPTIONS.map((opt) => (
                    <option key={opt.label} value={opt.score}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Wide Non-Truncated Score Stepper */}
              <div className="sm:col-span-2 min-w-0">
                <div className="flex items-center justify-center gap-1 bg-white border border-slate-200 px-2 py-1 rounded-xl shadow-2xs">
                  <span className="text-[10px] font-bold text-slate-400 font-display">Score:</span>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    step="0.5"
                    value={analyticsScores.marketScore || ''}
                    placeholder="0"
                    onChange={(e) => handleScoreChange('marketScore', e.target.value)}
                    className="w-8 text-center text-xs font-black font-display text-slate-900 bg-transparent focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400 font-display">/10</span>
                </div>
              </div>

              <div className="sm:col-span-3 min-w-0">
                <input
                  type="text"
                  value={analyticsData.marketOpportunity}
                  onChange={(e) => handleDataChange('marketOpportunity', e.target.value)}
                  placeholder="Market notes..."
                  className="w-full bg-white border border-slate-200/80 rounded-xl px-3 py-1.5 text-xs text-slate-800 font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#9df5a9]"
                />
              </div>
            </div>

            {/* ROW 2: Business Model */}
            <div className="bg-[#f8faf8] p-3 rounded-2xl border border-slate-200/70 grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center shadow-2xs">
              <div className="sm:col-span-3 flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-white border border-slate-200/80 flex items-center justify-center shadow-2xs flex-shrink-0">
                  <Briefcase className="w-3.5 h-3.5 text-slate-700" />
                </div>
                <span className="text-xs font-black text-slate-900 font-display truncate">
                  Business Model
                </span>
              </div>

              <div className="sm:col-span-4 min-w-0">
                <select
                  value={getMatchingDropdownValue(analyticsScores.businessModelScore, MODEL_DROPDOWN_OPTIONS)}
                  onChange={(e) => handleScoreChange('businessModelScore', parseFloat(e.target.value) || 0)}
                  className="w-full bg-white border border-slate-200/90 rounded-xl px-2.5 py-1.5 text-xs font-bold font-display text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#9df5a9] cursor-pointer"
                >
                  {MODEL_DROPDOWN_OPTIONS.map((opt) => (
                    <option key={opt.label} value={opt.score}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Wide Non-Truncated Score Stepper */}
              <div className="sm:col-span-2 min-w-0">
                <div className="flex items-center justify-center gap-1 bg-white border border-slate-200 px-2 py-1 rounded-xl shadow-2xs">
                  <span className="text-[10px] font-bold text-slate-400 font-display">Score:</span>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    step="0.5"
                    value={analyticsScores.businessModelScore || ''}
                    placeholder="0"
                    onChange={(e) => handleScoreChange('businessModelScore', e.target.value)}
                    className="w-8 text-center text-xs font-black font-display text-slate-900 bg-transparent focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400 font-display">/10</span>
                </div>
              </div>

              <div className="sm:col-span-3 min-w-0">
                <input
                  type="text"
                  value={analyticsData.businessModel}
                  onChange={(e) => handleDataChange('businessModel', e.target.value)}
                  placeholder="Monetization notes..."
                  className="w-full bg-white border border-slate-200/80 rounded-xl px-3 py-1.5 text-xs text-slate-800 font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#9df5a9]"
                />
              </div>
            </div>

            {/* ROW 3: Growth & Traction */}
            <div className="bg-[#f8faf8] p-3 rounded-2xl border border-slate-200/70 grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center shadow-2xs">
              <div className="sm:col-span-3 flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-white border border-slate-200/80 flex items-center justify-center shadow-2xs flex-shrink-0">
                  <TrendingUp className="w-3.5 h-3.5 text-blue-700" />
                </div>
                <span className="text-xs font-black text-slate-900 font-display truncate">
                  Growth & Traction
                </span>
              </div>

              <div className="sm:col-span-4 min-w-0">
                <select
                  value={getMatchingDropdownValue(analyticsScores.growthScore, GROWTH_DROPDOWN_OPTIONS)}
                  onChange={(e) => handleScoreChange('growthScore', parseFloat(e.target.value) || 0)}
                  className="w-full bg-white border border-slate-200/90 rounded-xl px-2.5 py-1.5 text-xs font-bold font-display text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#9df5a9] cursor-pointer"
                >
                  {GROWTH_DROPDOWN_OPTIONS.map((opt) => (
                    <option key={opt.label} value={opt.score}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Wide Non-Truncated Score Stepper */}
              <div className="sm:col-span-2 min-w-0">
                <div className="flex items-center justify-center gap-1 bg-white border border-slate-200 px-2 py-1 rounded-xl shadow-2xs">
                  <span className="text-[10px] font-bold text-slate-400 font-display">Score:</span>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    step="0.5"
                    value={analyticsScores.growthScore || ''}
                    placeholder="0"
                    onChange={(e) => handleScoreChange('growthScore', e.target.value)}
                    className="w-8 text-center text-xs font-black font-display text-slate-900 bg-transparent focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400 font-display">/10</span>
                </div>
              </div>

              <div className="sm:col-span-3 min-w-0 flex items-center gap-2">
                <input
                  type="text"
                  value={analyticsData.revenue}
                  onChange={(e) => handleDataChange('revenue', e.target.value)}
                  placeholder="MRR"
                  className="w-16 flex-shrink-0 bg-white border border-slate-200/80 rounded-xl px-2 py-1.5 text-xs text-slate-900 font-bold placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#9df5a9]"
                />
                <input
                  type="text"
                  value={analyticsData.growthPotential}
                  onChange={(e) => handleDataChange('growthPotential', e.target.value)}
                  placeholder="Growth notes..."
                  className="flex-1 min-w-0 bg-white border border-slate-200/80 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#9df5a9]"
                />
              </div>
            </div>

            {/* ROW 4: Competitive Moat */}
            <div className="bg-[#f8faf8] p-3 rounded-2xl border border-slate-200/70 grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center shadow-2xs">
              <div className="sm:col-span-3 flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-white border border-slate-200/80 flex items-center justify-center shadow-2xs flex-shrink-0">
                  <Layers className="w-3.5 h-3.5 text-purple-700" />
                </div>
                <span className="text-xs font-black text-slate-900 font-display truncate">
                  Competitive Moat
                </span>
              </div>

              <div className="sm:col-span-4 min-w-0">
                <select
                  value={getMatchingDropdownValue(analyticsScores.competitionScore, MOAT_DROPDOWN_OPTIONS)}
                  onChange={(e) => handleScoreChange('competitionScore', parseFloat(e.target.value) || 0)}
                  className="w-full bg-white border border-slate-200/90 rounded-xl px-2.5 py-1.5 text-xs font-bold font-display text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#9df5a9] cursor-pointer"
                >
                  {MOAT_DROPDOWN_OPTIONS.map((opt) => (
                    <option key={opt.label} value={opt.score}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Wide Non-Truncated Score Stepper */}
              <div className="sm:col-span-2 min-w-0">
                <div className="flex items-center justify-center gap-1 bg-white border border-slate-200 px-2 py-1 rounded-xl shadow-2xs">
                  <span className="text-[10px] font-bold text-slate-400 font-display">Score:</span>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    step="0.5"
                    value={analyticsScores.competitionScore || ''}
                    placeholder="0"
                    onChange={(e) => handleScoreChange('competitionScore', e.target.value)}
                    className="w-8 text-center text-xs font-black font-display text-slate-900 bg-transparent focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400 font-display">/10</span>
                </div>
              </div>

              <div className="sm:col-span-3 min-w-0">
                <input
                  type="text"
                  value={analyticsData.competitiveLandscape}
                  onChange={(e) => handleDataChange('competitiveLandscape', e.target.value)}
                  placeholder="Advantage notes..."
                  className="w-full bg-white border border-slate-200/80 rounded-xl px-3 py-1.5 text-xs text-slate-800 font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#9df5a9]"
                />
              </div>
            </div>

            {/* ROW 5: Risk Radar Card */}
            <div className="bg-[#f8faf8] p-4 sm:p-5 rounded-2xl border border-slate-200/70 space-y-3 shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200/60">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-white border border-slate-200/80 flex items-center justify-center shadow-2xs flex-shrink-0">
                    <ShieldAlert className="w-4 h-4 text-rose-600" />
                  </div>
                  <div>
                    <span className="text-xs sm:text-sm font-black text-slate-900 font-display">
                      Risk Radar
                    </span>
                    <span className="text-xs text-slate-500 font-medium ml-2">
                      (Auto-Score: <strong className="text-slate-900 font-black">{autoCalculatedRiskScore}</strong> / 10)
                    </span>
                  </div>
                </div>

                {/* 5 Risk Badges in clean horizontal flex row */}
                <div className="flex items-center gap-2 flex-wrap">
                  {Object.entries(riskCategories).map(([catKey, level]) => (
                    <div
                      key={catKey}
                      className={`px-2.5 py-1.5 rounded-xl border text-xs font-display flex items-center gap-2 shadow-2xs ${
                        level === 'HIGH'
                          ? 'bg-rose-50 border-rose-200 text-rose-900'
                          : level === 'MEDIUM'
                          ? 'bg-amber-50 border-amber-200 text-amber-900'
                          : 'bg-white border-slate-200 text-slate-800'
                      }`}
                    >
                      <span className="text-xs font-bold capitalize">
                        {catKey.replace('Risk', '')}
                      </span>
                      <select
                        value={level}
                        onChange={(e) => handleSetRiskLevel(catKey, e.target.value)}
                        className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md focus:outline-none cursor-pointer ${
                          level === 'HIGH'
                            ? 'bg-rose-600 text-white'
                            : level === 'MEDIUM'
                            ? 'bg-amber-500 text-white'
                            : 'bg-emerald-600 text-white'
                        }`}
                      >
                        <option value="LOW" className="bg-white text-slate-900">LOW</option>
                        <option value="MEDIUM" className="bg-white text-slate-900">MED</option>
                        <option value="HIGH" className="bg-white text-slate-900">HIGH</option>
                      </select>
                    </div>
                  ))}
                </div>
              </div>

              {/* Full-width Risk Notes */}
              <input
                type="text"
                value={analyticsData.keyRisks}
                onChange={(e) => handleDataChange('keyRisks', e.target.value)}
                placeholder="Key risk notes & mitigation details..."
                className="w-full bg-white border border-slate-200/80 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-800 font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#9df5a9]"
              />
            </div>

            {/* ROW 6: Investment Thesis Card */}
            <div className="bg-[#f8faf8] p-4 sm:p-5 rounded-2xl border border-slate-200/70 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between gap-3 pb-2 border-b border-slate-200/60">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-white border border-slate-200/80 flex items-center justify-center shadow-2xs flex-shrink-0">
                    <FileText className="w-4 h-4 text-emerald-700" />
                  </div>
                  <div>
                    <span className="text-xs sm:text-sm font-black text-slate-900 font-display">
                      Investment Thesis
                    </span>
                    <span className="text-xs text-slate-500 font-medium ml-2 hidden sm:inline">
                      Core rationale & conviction
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleGenerateSmartThesis}
                  className="inline-flex items-center gap-1.5 text-xs font-black text-emerald-950 bg-[#9df5a9] hover:bg-[#8ee59a] px-3.5 py-1.5 rounded-xl transition-all shadow-xs flex-shrink-0 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Auto-Write</span>
                </button>
              </div>

              {/* Full Width Beautiful Multi-line Textarea */}
              <textarea
                rows={3}
                value={analyticsData.investmentThesis}
                onChange={(e) => handleDataChange('investmentThesis', e.target.value)}
                placeholder="Investment rationale, thesis summary, key opportunities and conviction (click Auto-Write or type here)..."
                className="w-full bg-white border border-slate-200/80 rounded-2xl p-3.5 text-xs sm:text-sm text-slate-800 font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#9df5a9] leading-relaxed resize-y"
              />
            </div>

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* ⚡ TAB 3: FAST EXECUTIVE VERDICT (MINIMAL, INSTANT & HIGH IMPACT) */}
      {/* ========================================================================= */}
      {activeTab === 'summary' && (() => {
        const hasFounderScore = compositeFounderScore !== null && compositeFounderScore > 0;
        const hasAnalyticsScore = avgAnalyticsScore !== null && avgAnalyticsScore > 0;
        const isEvaluationReady = hasFounderScore && hasAnalyticsScore;

        return (
          <div className="bg-white rounded-[28px] p-5 sm:p-6 shadow-sm border border-slate-200/80 space-y-4">
            
            {/* ⚡ 1. Top Executive Cockpit: Score + 1-Click Decision Action */}
            <div className="bg-[#191919] text-white rounded-[22px] p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-white/10 flex items-center justify-center flex-shrink-0">
                  <Award className="w-5 h-5 text-[#9df5a9]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg sm:text-xl font-black font-display text-white tracking-tight">
                      {selectedStartup ? selectedStartup.companyName : 'Startup'}
                    </h2>
                    {selectedStartup?.stage && (
                      <span className="bg-white/15 px-2 py-0.5 rounded-md text-[10px] font-bold text-slate-300">
                        {selectedStartup.stage}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400 font-medium mt-0.5">
                    Final Decision Cockpit
                  </div>
                </div>
              </div>

              {/* Score Pill + Quick Decision Actions */}
              <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
                {/* Overall Deal Score */}
                <div className="flex items-center gap-2 bg-white/10 px-3.5 py-1.5 rounded-xl border border-white/10">
                  <span className="text-[11px] font-bold text-slate-400 font-display">Score:</span>
                  <span className="text-lg font-black font-display text-white">
                    {isEvaluationReady && compositeInvestmentScore !== null ? compositeInvestmentScore.toFixed(1) : '—'}
                    <span className="text-xs text-slate-400 font-normal"> / 10</span>
                  </span>
                  {isEvaluationReady && systemRecommendation && (
                    <span
                      className={`ml-1.5 px-2 py-0.5 rounded-lg text-[10px] font-black font-display uppercase tracking-wider ${
                        systemRecommendation === 'INVEST'
                          ? 'bg-[#9df5a9] text-slate-950'
                          : systemRecommendation === 'WATCHLIST'
                          ? 'bg-amber-400 text-slate-950'
                          : 'bg-rose-500 text-white'
                      }`}
                    >
                      {systemRecommendation}
                    </span>
                  )}
                </div>

                {/* 3 Fast 1-Click Decision Selectors (Only active when both are evaluated) */}
                {isEvaluationReady ? (
                  <div className="flex items-center gap-1.5 bg-white/10 p-1 rounded-xl border border-white/10">
                    <button
                      type="button"
                      onClick={() => setDecisionChoice('INVEST')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-black font-display transition-all flex items-center gap-1 ${
                        decisionChoice === 'INVEST'
                          ? 'bg-[#9df5a9] text-slate-950 shadow-xs'
                          : 'text-slate-300 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>Invest</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDecisionChoice('WATCHLIST')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-black font-display transition-all flex items-center gap-1 ${
                        decisionChoice === 'WATCHLIST'
                          ? 'bg-amber-400 text-slate-950 shadow-xs'
                          : 'text-slate-300 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Watchlist</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDecisionChoice('REJECT')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-black font-display transition-all flex items-center gap-1 ${
                        decisionChoice === 'REJECT'
                          ? 'bg-rose-600 text-white shadow-xs'
                          : 'text-slate-300 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                  </div>
                ) : (
                  <div className="px-3 py-1.5 rounded-xl bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-bold font-display flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-300 flex-shrink-0" />
                    <span>Evaluation Incomplete</span>
                  </div>
                )}
              </div>
            </div>

            {/* 📊 2. Streamlined 2-Card Visual Matrix: Founder vs. Commercial */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
              
              {/* Left Card: 👤 Founder (30%) */}
              <div className="bg-[#f8faf8] p-4 rounded-2xl border border-slate-200/70 space-y-3 shadow-2xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-[#191919]" />
                      <span className="text-xs font-black text-slate-900 font-display">
                        Founder Performance (30%)
                      </span>
                    </div>
                    <span className="text-xs font-black bg-white border border-slate-200 px-2 py-0.5 rounded-lg text-slate-950 shadow-2xs">
                      {hasFounderScore ? `${compositeFounderScore.toFixed(1)} / 10` : 'Not Scored'}
                    </span>
                  </div>

                  {/* 5 Compact Star Rows */}
                  <div className="space-y-1.5 pt-2">
                    {CORE_5_QUALITIES.map((q) => {
                      const rating = starRatings[q.key] || 0;
                      return (
                        <div key={q.key} className="flex items-center justify-between text-xs py-0.5">
                          <span className="font-bold text-slate-700 truncate">{q.label}</span>
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((num) => (
                              <Star
                                key={num}
                                className={`w-3 h-3 ${
                                  rating >= num ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-100'
                                }`}
                              />
                            ))}
                            <span className="text-[11px] font-black text-slate-800 ml-1 min-w-[12px] text-right">
                              {rating}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Founder Quick Stats */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-[11px] font-bold text-slate-600">
                  <span>{roundsList.length} Rounds Logged {avgRoundScore !== null ? `(Avg: ${avgRoundScore.toFixed(1)})` : ''}</span>
                  <span className="text-emerald-700 font-black">{completedTodosCount} of {qualitiesTodoList.length} Verified ✓</span>
                </div>
              </div>

              {/* Right Card: 📊 Analytics (70%) */}
              <div className="bg-[#f8faf8] p-4 rounded-2xl border border-slate-200/70 space-y-3 shadow-2xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-emerald-700" />
                      <span className="text-xs font-black text-slate-900 font-display">
                        Commercial Analytics (70%)
                      </span>
                    </div>
                    <span className="text-xs font-black bg-white border border-slate-200 px-2 py-0.5 rounded-lg text-slate-950 shadow-2xs">
                      {hasAnalyticsScore ? `${avgAnalyticsScore.toFixed(1)} / 10` : 'Not Scored'}
                    </span>
                  </div>

                  {/* 4 Clean Progress Meters */}
                  <div className="space-y-2 pt-2">
                    {[
                      { label: 'Market Size & TAM', score: analyticsScores.marketScore || 0, weight: '20%' },
                      { label: 'Growth & Traction', score: analyticsScores.growthScore || 0, weight: '20%', extra: analyticsData.revenue },
                      { label: 'Business Model', score: analyticsScores.businessModelScore || 0, weight: '15%' },
                      { label: 'Competitive Moat', score: analyticsScores.competitionScore || 0, weight: '10%' },
                    ].map((p) => (
                      <div key={p.label} className="space-y-1">
                        <div className="flex items-center justify-between text-xs font-display">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-700 truncate">{p.label}</span>
                            {p.extra && <span className="text-[9px] font-black bg-emerald-100 text-emerald-800 px-1 py-0.2 rounded">{p.extra}</span>}
                          </div>
                          <span className="font-black text-slate-900">{p.score > 0 ? `${p.score.toFixed(1)}/10` : '—'}</span>
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

                {/* Risk Quick Stat */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-[11px] font-bold text-slate-600">
                  <span>Risk Mitigation (5%)</span>
                  <span className="font-black text-slate-900">
                    {autoCalculatedRiskScore <= 3 ? '🟢 Low Risk' : autoCalculatedRiskScore <= 6 ? '🟡 Moderate Risk' : '🔴 High Risk'} ({autoCalculatedRiskScore}/10)
                  </span>
                </div>
              </div>

            </div>

            {/* 📝 3. Action Block: Either Requirement Alert OR Compact 1-Click Save Bar */}
            {!isEvaluationReady ? (
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-black text-amber-900 font-display">
                      Evaluation Incomplete
                    </div>
                    <div className="text-amber-800 text-[11px] mt-0.5">
                      Both Founder Evaluation and Commercial Analytics must be scored before recording the final committee decision.
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto">
                  {!hasFounderScore && (
                    <button
                      type="button"
                      onClick={() => setActiveTab('founder')}
                      className="flex-1 sm:flex-none px-3 py-1.5 rounded-xl bg-white border border-amber-300 text-amber-900 font-bold font-display hover:bg-amber-100 transition-colors"
                    >
                      Score Founder →
                    </button>
                  )}
                  {!hasAnalyticsScore && (
                    <button
                      type="button"
                      onClick={() => setActiveTab('analytics')}
                      className="flex-1 sm:flex-none px-3 py-1.5 rounded-xl bg-amber-600 text-white font-bold font-display hover:bg-amber-700 transition-colors shadow-2xs"
                    >
                      Score Analytics →
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-[#f8faf8] p-4 rounded-2xl border border-slate-200/70 space-y-3 shadow-2xs">
                {/* Thesis Quote */}
                <div className="flex items-center gap-2 text-xs text-slate-800 font-medium bg-white p-3 rounded-xl border border-slate-200/80">
                  <FileText className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                  <span className="italic truncate flex-1">
                    "{analyticsData.investmentThesis || 'Click Auto-Write in Analytics tab to generate thesis...'}"
                  </span>
                </div>

                {/* 1-Line Partner Notes & Save Decision Button */}
                <div className="flex flex-col sm:flex-row items-center gap-2.5">
                  <input
                    type="text"
                    value={decisionComment}
                    onChange={(e) => setDecisionComment(e.target.value)}
                    placeholder="Partner decision notes or conditions..."
                    className="flex-1 w-full bg-white border border-slate-200/90 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#9df5a9]"
                  />

                  <button
                    type="button"
                    onClick={async () => {
                      await handleRecordFinalDecision();
                      window.dispatchEvent(new Event('startup-created'));
                    }}
                    disabled={savingDecision}
                    className="w-full sm:w-auto px-5 py-2 rounded-xl text-xs font-black font-display text-slate-950 bg-[#9df5a9] hover:bg-[#8ee59a] transition-all shadow-xs flex items-center justify-center gap-1.5 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 whitespace-nowrap flex-shrink-0"
                  >
                    {savingDecision ? <Spinner size="sm" color="black" /> : <Send className="w-3.5 h-3.5" />}
                    <span>Save Decision ({decisionChoice})</span>
                  </button>
                </div>
              </div>
            )}

          </div>
        );
      })()}

    </div>
  );
};

export default Evaluation;
