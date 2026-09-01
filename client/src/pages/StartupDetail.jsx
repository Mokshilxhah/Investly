import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

export const StartupDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      navigate(`/evaluation?id=${id}`, { replace: true });
    } else {
      navigate('/evaluation', { replace: true });
    }
  }, [id, navigate]);

  return null;
};

const LegacyOldStartupDetail = () => {
  const [startup, setStartup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('founder');
  
  // Form States
  const [founderScore, setFounderScore] = useState(7);
  const [analyticsScore, setAnalyticsScore] = useState(7);
  const [meetingExperience, setMeetingExperience] = useState('');
  const [selectedQualities, setSelectedQualities] = useState([]);
  const [marketOpportunity, setMarketOpportunity] = useState('');
  const [businessModel, setBusinessModel] = useState('');
  const [growthTraction, setGrowthTraction] = useState('');
  const [defensibilityMoat, setDefensibilityMoat] = useState('');
  const [investmentThesis, setInvestmentThesis] = useState('');
  const [decisionStatus, setDecisionStatus] = useState('UNDER_EVALUATION');
  const [decisionComment, setDecisionComment] = useState('');

  // To-Do States
  const [founderTodos, setFounderTodos] = useState([]);
  const [founderTodoInput, setFounderTodoInput] = useState('');
  const [analyticsTodos, setAnalyticsTodos] = useState([]);
  const [analyticsTodoInput, setAnalyticsTodoInput] = useState('');

  const [saving, setSaving] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (message) => {
    setToastMessage({ message });
    setTimeout(() => setToastMessage(null), 3000);
  };

  const fetchStartup = async () => {
    try {
      setLoading(true);
      const res = await startupService.getById(id);
      const data = res.data;
      setStartup(data);

      // Populate Founder Data
      if (data.evaluation) {
        setFounderScore(data.evaluation.experience || 7);
        setMeetingExperience(data.founder.background);
      }

      // Populate Analytics Data
      if (data.analysis) {
        setAnalyticsScore(data.analysis.marketScore || 7);
        setMarketOpportunity(data.analysis.marketOpportunity || '');
        setBusinessModel(data.analysis.businessModel || '');
        setGrowthTraction(data.analysis.growthPotential || '');
        setDefensibilityMoat(data.analysis.competitiveLandscape || '');
        setInvestmentThesis(data.analysis.investmentThesis || '');
      }

      // Populate Decision
      if (data.decision) {
        setDecisionStatus(data.decision.status || 'UNDER_EVALUATION');
        setDecisionComment(data.decision.comment || '');
      }
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

  // Quality Tag Toggle
  const toggleQuality = (quality) => {
    if (selectedQualities.includes(quality)) {
      setSelectedQualities(selectedQualities.filter((q) => q !== quality));
    } else {
      setSelectedQualities([...selectedQualities, quality]);
    }
  };

  // To-Do Handlers
  const addFounderTodo = () => {
    if (!founderTodoInput.trim()) return;
    setFounderTodos([
      ...founderTodos,
      { id: Date.now(), text: founderTodoInput.trim(), done: false },
    ]);
    setFounderTodoInput('');
  };

  const toggleFounderTodo = (todoId) => {
    setFounderTodos(
      founderTodos.map((t) => (t.id === todoId ? { ...t, done: !t.done } : t))
    );
  };

  const removeFounderTodo = (todoId) => {
    setFounderTodos(founderTodos.filter((t) => t.id !== todoId));
  };

  const addAnalyticsTodo = () => {
    if (!analyticsTodoInput.trim()) return;
    setAnalyticsTodos([
      ...analyticsTodos,
      { id: Date.now(), text: analyticsTodoInput.trim(), done: false },
    ]);
    setAnalyticsTodoInput('');
  };

  const toggleAnalyticsTodo = (todoId) => {
    setAnalyticsTodos(
      analyticsTodos.map((t) => (t.id === todoId ? { ...t, done: !t.done } : t))
    );
  };

  const removeAnalyticsTodo = (todoId) => {
    setAnalyticsTodos(analyticsTodos.filter((t) => t.id !== todoId));
  };

  // Save Founder Evaluation (Option 1)
  const handleSaveFounder = async () => {
    try {
      setSaving(true);
      const res = await startupService.updateEvaluation(id, {
        experience: founderScore,
        domainExpertise: founderScore,
        execution: founderScore,
        vision: founderScore,
        teamStrength: founderScore,
      });

      // Also update founder bio with meeting observations if present
      if (meetingExperience) {
        await startupService.updateStartup(id, {
          founder: {
            name: startup.founder?.name || 'Founding Team',
            background: meetingExperience,
          },
        });
      }

      setStartup(res.data);
      window.dispatchEvent(new CustomEvent('startup-created'));
      showToast('🧑‍💼 Founder meeting score & observations saved!');
    } catch (err) {
      showToast(err.message || 'Failed to save founder score', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Save Analytics & Decision (Option 2)
  const handleSaveAnalytics = async () => {
    try {
      setSaving(true);
      const analysisRes = await startupService.updateAnalysis(id, {
        marketScore: analyticsScore,
        marketOpportunity,
        businessModelScore: analyticsScore,
        businessModel,
        growthScore: analyticsScore,
        growthPotential: growthTraction,
        competitionScore: analyticsScore,
        competitiveLandscape: defensibilityMoat,
        riskScore: analyticsScore,
        keyRisks: defensibilityMoat,
        investmentThesis,
      });

      if (decisionStatus) {
        await startupService.updateDecision(id, {
          status: decisionStatus,
          comment: decisionComment,
          decidedBy: 'Investment Analyst',
        });
      }

      setStartup(analysisRes.data);
      window.dispatchEvent(new CustomEvent('startup-created'));
      showToast('📊 Analytics score & investment decision saved!');
    } catch (err) {
      showToast(err.message || 'Failed to save analytics score', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (payload) => {
    try {
      setActionLoading(true);
      const updated = await startupService.updateStartup(id, payload);
      setStartup(updated);
      setIsEditOpen(false);
      showToast(`'${updated.companyName}' profile updated!`);
    } catch (err) {
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
      showToast(err.message || 'Failed to delete startup.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <PageLoader />;

  if (error || !startup) {
    return (
      <div className="max-w-md mx-auto my-12 bg-white rounded-3xl p-8 text-center shadow-sm border border-slate-200">
        <h2 className="text-lg font-bold font-display text-slate-900">Startup Not Found</h2>
        <Link
          to="/startups"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#191919] text-white text-xs font-bold font-display mt-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Startups</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4 text-slate-900 w-full min-w-0 pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-black font-display bg-[#9df5a9] text-[#191919] animate-in slide-in-from-bottom">
          <CheckCircle2 className="w-4 h-4 stroke-[3]" />
          <span>{toastMessage.message}</span>
        </div>
      )}

      {/* 🏷️ Top Navigation Bar */}
      <div className="flex items-center justify-between">
        <Link
          to="/startups"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold font-display text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 shadow-2xs transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Directory</span>
        </Link>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setIsEditOpen(true)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold font-display text-slate-800 bg-white hover:bg-slate-100 border border-slate-200 shadow-2xs"
          >
            <Edit2 className="w-3 h-3" />
            <span>Edit Profile</span>
          </button>
          <button
            type="button"
            onClick={() => setIsDeleteOpen(true)}
            className="p-1.5 rounded-xl text-slate-400 hover:text-rose-700 hover:bg-rose-50 border border-slate-200"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 🏢 Compact Company Header & Live Gauges */}
      <div className="bg-white rounded-[24px] p-4.5 px-5 shadow-xs border border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 font-display">
              Startup Evaluation
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-[11px] font-medium text-slate-500 font-display">
              Founder: {startup.founder?.name}
            </span>
          </div>

          <h1 className="text-xl font-black font-display text-slate-900 tracking-tight mt-0.5">
            {startup.companyName}
          </h1>

          <div className="flex items-center gap-1.5 mt-1.5">
            <IndustryBadge industry={startup.industry} />
            <StageBadge stage={startup.stage} />
            <DecisionBadge status={decisionStatus || 'UNDER_EVALUATION'} />
          </div>
        </div>

        {/* Live Gauges */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <div className="p-2 px-3 rounded-xl bg-[#f8faf8] border border-slate-200 text-center min-w-[85px]">
            <div className="text-[9px] font-bold font-display uppercase tracking-wider text-slate-400">
              Founder Score
            </div>
            <div className="text-base font-black font-display text-slate-900 mt-0.5">
              {founderScore} <span className="text-[10px] font-normal text-slate-400">/10</span>
            </div>
          </div>

          <div className="p-2 px-3.5 rounded-xl bg-[#191919] text-white text-center min-w-[95px] shadow-2xs">
            <div className="text-[9px] font-bold font-display uppercase tracking-wider text-[#9df5a9]">
              Analytics Score
            </div>
            <div className="text-base font-black font-display text-white mt-0.5">
              {analyticsScore} <span className="text-[10px] font-normal text-slate-400">/10</span>
            </div>
          </div>
        </div>
      </div>

      {/* 🧭 2 CORE EVALUATION OPTIONS TABS */}
      <div className="bg-white rounded-[20px] p-1.5 shadow-2xs border border-slate-200/90">
        <div className="grid grid-cols-2 gap-1.5">
          <button
            type="button"
            onClick={() => setActiveTab('founder')}
            className={`py-2.5 px-4 rounded-xl text-center transition-all cursor-pointer flex items-center justify-center gap-2 font-display ${
              activeTab === 'founder'
                ? 'bg-[#191919] text-white shadow-xs font-black ring-1 ring-emerald-500/30'
                : 'bg-[#f4f7f4] text-slate-700 font-bold hover:bg-[#eef5ee]'
            }`}
          >
            <User className={`w-4 h-4 ${activeTab === 'founder' ? 'text-[#9df5a9]' : 'text-slate-500'}`} />
            <span className="text-xs">1. Founder Meeting Score ({founderScore}/10)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('analytics')}
            className={`py-2.5 px-4 rounded-xl text-center transition-all cursor-pointer flex items-center justify-center gap-2 font-display ${
              activeTab === 'analytics'
                ? 'bg-[#191919] text-white shadow-xs font-black ring-1 ring-emerald-500/30'
                : 'bg-[#f4f7f4] text-slate-700 font-bold hover:bg-[#eef5ee]'
            }`}
          >
            <BarChart3 className={`w-4 h-4 ${activeTab === 'analytics' ? 'text-[#9df5a9]' : 'text-slate-500'}`} />
            <span className="text-xs">2. Analytics & Diligence Score ({analyticsScore}/10)</span>
          </button>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════════ */}
      {/* 🧑‍💼 OPTION 1: FOUNDER MEETING SCORE WORKSPACE */}
      {/* ═══════════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'founder' && (
        <div className="bg-white rounded-[24px] p-5 sm:p-6 shadow-xs border border-slate-200/90 space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-black font-display text-slate-900">
                Founder Meeting Diligence & Score
              </h2>
              <p className="text-[11px] text-slate-500 font-display">
                Record your impressions from the founder pitch meeting, tag key qualities, and assign the founder score.
              </p>
            </div>
            <span className="text-xs font-black font-display bg-[#f4f7f4] text-slate-900 px-2.5 py-1 rounded-lg border border-slate-200">
              Score: {founderScore} / 10
            </span>
          </div>

          {/* 1. Score Bar (1-10) */}
          <div className="p-3.5 rounded-2xl bg-[#f8faf8] border border-slate-200/70 space-y-1.5">
            <div className="text-[11px] font-black font-display text-slate-700">
              Rate Founder in Meeting (1–10):
            </div>
            <div className="grid grid-cols-10 gap-1">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setFounderScore(num)}
                  className={`py-2 rounded-xl text-xs font-black font-display transition-all ${
                    founderScore === num
                      ? 'bg-[#191919] text-[#9df5a9] shadow-2xs scale-102 ring-1 ring-emerald-500/30'
                      : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Key Qualities Observed in Meeting */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-black font-display text-slate-800">
              Key Founder Qualities Observed in Meeting (Click to tag):
            </label>
            <div className="flex flex-wrap gap-1.5">
              {FOUNDER_QUALITIES.map((quality) => {
                const isSelected = selectedQualities.includes(quality);
                return (
                  <button
                    key={quality}
                    type="button"
                    onClick={() => toggleQuality(quality)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold font-display transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#191919] text-[#9df5a9] shadow-2xs font-black'
                        : 'bg-[#f4f7f4] text-slate-600 hover:bg-slate-200 border border-slate-200/60'
                    }`}
                  >
                    {isSelected ? '✓ ' : '+ '}
                    {quality}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Meeting Experience & Diligence To-Dos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {/* Meeting Notes */}
            <div className="space-y-1">
              <label className="block text-[11px] font-black font-display text-slate-800">
                Meeting Experience & Impression Notes
              </label>
              <textarea
                rows={4}
                value={meetingExperience}
                onChange={(e) => setMeetingExperience(e.target.value)}
                placeholder="How did the founder articulate their vision? How effectively did they answer tough questions..."
                className="w-full px-3 py-2 rounded-xl bg-[#f8faf8] border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#9df5a9] resize-none leading-relaxed"
              />
            </div>

            {/* To-Dos */}
            <div className="space-y-2 p-3 rounded-xl bg-[#f8faf8] border border-slate-200/80 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1 text-[11px] font-black font-display text-slate-800 mb-1.5">
                  <ListTodo className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Post-Meeting Action Items / To-Dos</span>
                </div>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={founderTodoInput}
                    onChange={(e) => setFounderTodoInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addFounderTodo())}
                    placeholder="Add action item (e.g. Call previous lead investor)..."
                    className="flex-1 px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={addFounderTodo}
                    className="px-3 py-1.5 rounded-lg bg-[#191919] text-[#9df5a9] text-xs font-black hover:bg-slate-800"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div className="space-y-1 max-h-24 overflow-y-auto mt-1 pr-1">
                {founderTodos.length === 0 ? (
                  <div className="text-[10px] text-slate-400 py-1 text-center font-display">
                    No meeting action items logged.
                  </div>
                ) : (
                  founderTodos.map((todo) => (
                    <div key={todo.id} className="flex items-center justify-between p-1.5 rounded-lg bg-white border border-slate-200/60 text-xs font-display">
                      <label className="flex items-center gap-1.5 cursor-pointer truncate">
                        <input
                          type="checkbox"
                          checked={todo.done}
                          onChange={() => toggleFounderTodo(todo.id)}
                          className="rounded text-emerald-600"
                        />
                        <span className={todo.done ? 'line-through text-slate-400 text-[11px]' : 'text-slate-800 text-[11px] font-bold'}>
                          {todo.text}
                        </span>
                      </label>
                      <button type="button" onClick={() => removeFounderTodo(todo.id)} className="text-slate-400 hover:text-rose-600">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-display">
              Updates founder scorecard and meeting notes.
            </span>
            <button
              type="button"
              onClick={handleSaveFounder}
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-xs font-black font-display text-slate-950 bg-[#9df5a9] hover:bg-[#8ee59a] shadow-2xs cursor-pointer"
            >
              {saving ? <Spinner size="sm" /> : <Check className="w-3.5 h-3.5 stroke-[3]" />}
              <span>Save Founder Score</span>
            </button>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════════ */}
      {/* 📊 OPTION 2: ANALYTICS & DILIGENCE SCORE WORKSPACE */}
      {/* ═══════════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'analytics' && (
        <div className="bg-white rounded-[24px] p-5 sm:p-6 shadow-xs border border-slate-200/90 space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-black font-display text-slate-900">
                Analytics, Market & Financial Diligence
              </h2>
              <p className="text-[11px] text-slate-500 font-display">
                Analyze market opportunity, unit economics, defensible moat, and record committee decision.
              </p>
            </div>
            <span className="text-xs font-black font-display bg-[#f4f7f4] text-slate-900 px-2.5 py-1 rounded-lg border border-slate-200">
              Score: {analyticsScore} / 10
            </span>
          </div>

          {/* 1. Score Bar (1-10) */}
          <div className="p-3.5 rounded-2xl bg-[#f8faf8] border border-slate-200/70 space-y-1.5">
            <div className="text-[11px] font-black font-display text-slate-700">
              Assign Analytics & Deal Score (1–10):
            </div>
            <div className="grid grid-cols-10 gap-1">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setAnalyticsScore(num)}
                  className={`py-2 rounded-xl text-xs font-black font-display transition-all ${
                    analyticsScore === num
                      ? 'bg-[#191919] text-[#9df5a9] shadow-2xs scale-102 ring-1 ring-emerald-500/30'
                      : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Qualitative Diligence Fields (2x2 Grid) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-[11px] font-black font-display text-slate-800">
                Market Opportunity & TAM ($)
              </label>
              <textarea
                rows={2}
                value={marketOpportunity}
                onChange={(e) => setMarketOpportunity(e.target.value)}
                placeholder="TAM size, industry CAGR, expansion room..."
                className="w-full px-3 py-1.5 rounded-xl bg-[#f8faf8] border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#9df5a9] resize-none"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[11px] font-black font-display text-slate-800">
                Business Model & Margins (%)
              </label>
              <textarea
                rows={2}
                value={businessModel}
                onChange={(e) => setBusinessModel(e.target.value)}
                placeholder="Pricing power, unit economics, gross margins..."
                className="w-full px-3 py-1.5 rounded-xl bg-[#f8faf8] border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#9df5a9] resize-none"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[11px] font-black font-display text-slate-800">
                Growth & Traction (ARR / Retention)
              </label>
              <textarea
                rows={2}
                value={growthTraction}
                onChange={(e) => setGrowthTraction(e.target.value)}
                placeholder="Customer velocity, cohort net retention, ARR..."
                className="w-full px-3 py-1.5 rounded-xl bg-[#f8faf8] border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#9df5a9] resize-none"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[11px] font-black font-display text-slate-800">
                Defensibility & Risk Mitigation
              </label>
              <textarea
                rows={2}
                value={defensibilityMoat}
                onChange={(e) => setDefensibilityMoat(e.target.value)}
                placeholder="IP patents, network effects, risk mitigation..."
                className="w-full px-3 py-1.5 rounded-xl bg-[#f8faf8] border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#9df5a9] resize-none"
              />
            </div>
          </div>

          {/* 3. Analytics Diligence Action Items */}
          <div className="space-y-2 p-3 rounded-xl bg-[#f8faf8] border border-slate-200/80">
            <div className="flex items-center gap-1 text-[11px] font-black font-display text-slate-800">
              <ListTodo className="w-3.5 h-3.5 text-emerald-600" />
              <span>Financial & Market Diligence To-Dos</span>
            </div>
            <div className="flex gap-1.5">
              <input
                type="text"
                value={analyticsTodoInput}
                onChange={(e) => setAnalyticsTodoInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addAnalyticsTodo())}
                placeholder="Add diligence to-do (e.g. Audit cap table & convertibles)..."
                className="flex-1 px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none"
              />
              <button
                type="button"
                onClick={addAnalyticsTodo}
                className="px-3 py-1.5 rounded-lg bg-[#191919] text-[#9df5a9] text-xs font-black"
              >
                Add
              </button>
            </div>
            <div className="space-y-1 max-h-20 overflow-y-auto mt-1 pr-1">
              {analyticsTodos.map((todo) => (
                <div key={todo.id} className="flex items-center justify-between p-1.5 rounded-lg bg-white border border-slate-200/60 text-xs font-display">
                  <label className="flex items-center gap-1.5 cursor-pointer truncate">
                    <input
                      type="checkbox"
                      checked={todo.done}
                      onChange={() => toggleAnalyticsTodo(todo.id)}
                      className="rounded text-emerald-600"
                    />
                    <span className={todo.done ? 'line-through text-slate-400 text-[11px]' : 'text-slate-800 text-[11px] font-bold'}>
                      {todo.text}
                    </span>
                  </label>
                  <button type="button" onClick={() => removeAnalyticsTodo(todo.id)} className="text-slate-400 hover:text-rose-600">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 4. Decision & Thesis */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="space-y-1">
              <label className="block text-[11px] font-black font-display text-slate-800">
                Core Investment Thesis & Decision
              </label>
              <textarea
                rows={2}
                value={investmentThesis}
                onChange={(e) => setInvestmentThesis(e.target.value)}
                placeholder="Why this company wins and returns the fund..."
                className="w-full px-3 py-2 rounded-xl bg-[#f8faf8] border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#9df5a9] resize-none"
              />
            </div>

            {/* Decision Status Buttons */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'INVEST', label: 'Invest', bg: 'bg-[#9df5a9]' },
                { id: 'WATCHLIST', label: 'Watchlist', bg: 'bg-[#fedd89]' },
                { id: 'REJECT', label: 'Reject', bg: 'bg-[#ffbaba]' },
              ].map((btn) => {
                const isSelected = decisionStatus === btn.id;
                return (
                  <button
                    key={btn.id}
                    type="button"
                    onClick={() => setDecisionStatus(btn.id)}
                    className={`py-2 px-3 rounded-xl text-xs font-black font-display transition-all ${
                      isSelected
                        ? `${btn.bg} text-slate-950 shadow-xs scale-102 ring-1 ring-slate-900/10`
                        : 'bg-[#f4f7f4] text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {btn.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-display">
              Updates financial scorecard and records committee verdict.
            </span>
            <button
              type="button"
              onClick={handleSaveAnalytics}
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-xs font-black font-display text-slate-950 bg-[#9df5a9] hover:bg-[#8ee59a] shadow-2xs cursor-pointer"
            >
              {saving ? <Spinner size="sm" /> : <Check className="w-3.5 h-3.5 stroke-[3]" />}
              <span>Save Analytics Score & Decision</span>
            </button>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      <StartupModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSave={handleUpdate}
        startup={startup}
        loading={actionLoading}
      />

      {/* Delete Modal */}
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
