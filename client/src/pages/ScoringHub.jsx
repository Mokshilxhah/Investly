import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Building2,
  User,
  BarChart2,
  CheckCircle2,
  Check,
  Plus,
  X,
  GitCompare,
  ArrowRight,
  ListTodo,
} from 'lucide-react';
import startupService from '../services/startupService';
import { PageLoader, Spinner } from '../components/common/Loader';

const DEFAULT_QUALITIES = [
  'Domain Depth',
  'Execution Speed',
  'Vision & Clarity',
  'Technical Mastery',
  'Team Leadership',
  'Transparency & Integrity',
];

export const ScoringHub = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [startups, setStartups] = useState([]);
  const [selectedStartupId, setSelectedStartupId] = useState('');
  const [selectedStartup, setSelectedStartup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Active Tab: 'founder' | 'analytics'
  const [activeTab, setActiveTab] = useState('founder');

  // Comparison tray
  const [compareList, setCompareList] = useState([]);

  // 1. Founder Evaluation State (Default null = Not Scored)
  const [founderScore, setFounderScore] = useState(null);
  const [meetingNotes, setMeetingNotes] = useState('');
  const [selectedQualities, setSelectedQualities] = useState([]);
  const [founderTodoInput, setFounderTodoInput] = useState('');
  const [founderTodos, setFounderTodos] = useState([]);

  // 2. Analytics Evaluation State (Default null = Not Scored)
  const [analyticsScore, setAnalyticsScore] = useState(null);
  const [analyticsNotes, setAnalyticsNotes] = useState('');
  const [analyticsTodoInput, setAnalyticsTodoInput] = useState('');
  const [analyticsTodos, setAnalyticsTodos] = useState([]);
  const [decision, setDecision] = useState('');

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Load Startups
  useEffect(() => {
    const fetchStartups = async () => {
      try {
        setLoading(true);
        const data = await startupService.getStartups();
        const list = data || [];
        setStartups(list);

        const queryId = searchParams.get('id');
        if (queryId && list.some((s) => s._id === queryId)) {
          setSelectedStartupId(queryId);
        } else if (list.length > 0) {
          setSelectedStartupId(list[0]._id);
        }
      } catch (err) {
        console.error('Error loading startups:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStartups();
  }, [searchParams]);

  // Sync selected startup data
  useEffect(() => {
    if (!selectedStartupId || startups.length === 0) return;
    const found = startups.find((s) => s._id === selectedStartupId);
    if (!found) return;

    setSelectedStartup(found);

    // Only populate founder score if actually saved in db, otherwise null (unscored)
    const savedFounder = found.evaluation?.overallScore ?? found.evaluation?.experience ?? null;
    setFounderScore(savedFounder !== null && savedFounder !== undefined ? savedFounder : null);
    setMeetingNotes(found.founder?.background || '');

    // Only populate analytics score if actually saved in db, otherwise null (unscored)
    const savedAnalytics = found.analysis?.marketScore ?? null;
    setAnalyticsScore(savedAnalytics !== null && savedAnalytics !== undefined ? savedAnalytics : null);
    setAnalyticsNotes(found.analysis?.marketOpportunity || found.analysis?.investmentThesis || '');

    // Decision
    setDecision(found.decision?.status || '');
  }, [selectedStartupId, startups]);

  // Quality Tag Toggle
  const toggleQuality = (q) => {
    if (selectedQualities.includes(q)) {
      setSelectedQualities(selectedQualities.filter((item) => item !== q));
    } else {
      setSelectedQualities([...selectedQualities, q]);
    }
  };

  // To-Do Handlers
  const addFounderTodo = () => {
    if (!founderTodoInput.trim()) return;
    setFounderTodos([...founderTodos, { id: Date.now(), text: founderTodoInput.trim(), done: false }]);
    setFounderTodoInput('');
  };

  const toggleFounderTodo = (id) => {
    setFounderTodos(founderTodos.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  };

  const removeFounderTodo = (id) => {
    setFounderTodos(founderTodos.filter((t) => t.id !== id));
  };

  const addAnalyticsTodo = () => {
    if (!analyticsTodoInput.trim()) return;
    setAnalyticsTodos([...analyticsTodos, { id: Date.now(), text: analyticsTodoInput.trim(), done: false }]);
    setAnalyticsTodoInput('');
  };

  const toggleAnalyticsTodo = (id) => {
    setAnalyticsTodos(analyticsTodos.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  };

  const removeAnalyticsTodo = (id) => {
    setAnalyticsTodos(analyticsTodos.filter((t) => t.id !== id));
  };

  // Compare Handler
  const toggleCompare = (item) => {
    if (!item) return;
    const exists = compareList.some((c) => c._id === item._id);
    if (exists) {
      setCompareList(compareList.filter((c) => c._id !== item._id));
      showToast(`Removed '${item.companyName}' from comparison.`);
    } else {
      if (compareList.length >= 3) {
        showToast('You can compare up to 3 startups at a time.');
        return;
      }
      setCompareList([...compareList, item]);
      showToast(`Added '${item.companyName}' to comparison!`);
    }
  };

  // Save Scores
  const handleSave = async () => {
    if (!selectedStartupId) return;
    try {
      setSaving(true);

      // Save Founder Score
      if (founderScore !== null) {
        await startupService.updateEvaluation(selectedStartupId, {
          experience: founderScore,
          domainExpertise: founderScore,
          execution: founderScore,
          vision: founderScore,
          teamStrength: founderScore,
        });
      }

      // Save Analytics Score
      const analysisRes = await startupService.updateAnalysis(selectedStartupId, {
        marketScore: analyticsScore !== null ? analyticsScore : 5,
        marketOpportunity: analyticsNotes,
        businessModelScore: analyticsScore !== null ? analyticsScore : 5,
        growthScore: analyticsScore !== null ? analyticsScore : 5,
        competitionScore: analyticsScore !== null ? analyticsScore : 5,
        riskScore: analyticsScore !== null ? analyticsScore : 5,
        investmentThesis: analyticsNotes,
      });

      // Save Decision
      if (decision) {
        await startupService.updateDecision(selectedStartupId, {
          status: decision,
          comment: '',
          decidedBy: 'Investment Analyst',
        });
      }

      setStartups(startups.map((s) => (s._id === selectedStartupId ? analysisRes.data : s)));
      setSelectedStartup(analysisRes.data);

      window.dispatchEvent(new CustomEvent('startup-created'));
      showToast('Scores saved successfully!');
    } catch (err) {
      console.error('Error saving:', err);
      showToast('Failed to save scores.');
    } finally {
      setSaving(false);
    }
  };

  const isInCompare = compareList.some((c) => c._id === selectedStartupId);

  if (loading) return <PageLoader />;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 text-slate-900 font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 text-xs font-bold bg-slate-900 text-white animate-in slide-in-from-bottom">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 🏢 1. COMPANY SELECTOR & HEADER */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-slate-900 text-white flex items-center justify-center font-extrabold text-base flex-shrink-0">
            {selectedStartup ? selectedStartup.companyName.charAt(0).toUpperCase() : <Building2 className="w-5 h-5" />}
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Active Company
            </span>
            <select
              value={selectedStartupId}
              onChange={(e) => setSelectedStartupId(e.target.value)}
              className="text-lg font-bold text-slate-900 bg-transparent cursor-pointer focus:outline-none pr-8 mt-0.5"
            >
              {startups.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.companyName} ({s.industry || 'General'} • {s.stage || 'Seed'})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {selectedStartup && (
            <button
              type="button"
              onClick={() => toggleCompare(selectedStartup)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer flex items-center gap-1.5 ${
                isInCompare
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
              }`}
            >
              <GitCompare className="w-3.5 h-3.5" />
              <span>{isInCompare ? 'In Compare ✓' : '+ Add to Compare'}</span>
            </button>
          )}

          {compareList.length > 0 && (
            <button
              type="button"
              onClick={() => {
                const ids = compareList.map((c) => c._id).join(',');
                navigate(`/compare?ids=${ids}`);
              }}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 text-white hover:bg-emerald-600 transition-all flex items-center gap-1.5 shadow-xs"
            >
              <span>View Comparison ({compareList.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {selectedStartup ? (
        <>
          {/* 📊 2. TWO CLEAN SCORE CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Founder Score Box */}
            <div
              onClick={() => setActiveTab('founder')}
              className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                activeTab === 'founder'
                  ? 'bg-white border-emerald-600 shadow-xs ring-2 ring-emerald-600/10'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                <span className="flex items-center gap-1.5">
                  <User className="w-4 h-4 text-emerald-600" />
                  1. Founder Score
                </span>
                <span className={`text-[11px] font-medium ${activeTab === 'founder' ? 'text-emerald-700 font-bold' : 'text-slate-400'}`}>
                  {activeTab === 'founder' ? '● Editing' : 'Click to score'}
                </span>
              </div>
              <div className="mt-3">
                {founderScore !== null ? (
                  <div className="text-3xl font-black text-slate-900">
                    {founderScore} <span className="text-base font-normal text-slate-400">/ 10</span>
                  </div>
                ) : (
                  <div className="text-sm font-semibold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg inline-block">
                    Not Scored Yet
                  </div>
                )}
              </div>
            </div>

            {/* Analytics Score Box */}
            <div
              onClick={() => setActiveTab('analytics')}
              className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                activeTab === 'analytics'
                  ? 'bg-white border-emerald-600 shadow-xs ring-2 ring-emerald-600/10'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                <span className="flex items-center gap-1.5">
                  <BarChart2 className="w-4 h-4 text-emerald-600" />
                  2. Analytics Score
                </span>
                <span className={`text-[11px] font-medium ${activeTab === 'analytics' ? 'text-emerald-700 font-bold' : 'text-slate-400'}`}>
                  {activeTab === 'analytics' ? '● Editing' : 'Click to score'}
                </span>
              </div>
              <div className="mt-3">
                {analyticsScore !== null ? (
                  <div className="text-3xl font-black text-slate-900">
                    {analyticsScore} <span className="text-base font-normal text-slate-400">/ 10</span>
                  </div>
                ) : (
                  <div className="text-sm font-semibold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg inline-block">
                    Not Scored Yet
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 🧑‍💼 3. TAB 1: FOUNDER EVALUATION FORM */}
          {activeTab === 'founder' && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6 animate-in fade-in">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Founder Meeting Evaluation
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Rate founder performance, tag key qualities observed in the meeting, and record notes.
                  </p>
                </div>
                {founderScore !== null && (
                  <span className="text-xs font-bold px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full border border-emerald-200">
                    Score: {founderScore}/10
                  </span>
                )}
              </div>

              {/* Founder Score Selector (1 to 10) */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 block">
                  Assign Founder Score:
                </label>
                <div className="grid grid-cols-10 gap-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setFounderScore(num)}
                      className={`py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        founderScore === num
                          ? 'bg-slate-900 text-white font-extrabold shadow-sm scale-105'
                          : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              {/* Qualities Observed */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 block">
                  Key Founder Qualities in Meeting (Click to tag):
                </label>
                <div className="flex flex-wrap gap-2">
                  {DEFAULT_QUALITIES.map((q) => {
                    const isSelected = selectedQualities.includes(q);
                    return (
                      <button
                        key={q}
                        type="button"
                        onClick={() => toggleQuality(q)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-slate-900 text-white font-bold'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200/60'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '}
                        {q}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Meeting Notes */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Meeting Experience & Notes:
                </label>
                <textarea
                  rows={4}
                  value={meetingNotes}
                  onChange={(e) => setMeetingNotes(e.target.value)}
                  placeholder="Record what was discussed in the meeting, founder clarity, domain depth..."
                  className="w-full p-3.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/10 resize-none leading-relaxed"
                />
              </div>

              {/* To-Dos Checklist */}
              <div className="space-y-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <ListTodo className="w-4 h-4 text-emerald-600" />
                  <span>Post-Meeting Action Items / To-Dos</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={founderTodoInput}
                    onChange={(e) => setFounderTodoInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addFounderTodo())}
                    placeholder="Add an action item (e.g. Request customer references)..."
                    className="flex-1 px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs text-slate-800 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={addFounderTodo}
                    className="px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 cursor-pointer"
                  >
                    Add
                  </button>
                </div>

                <div className="space-y-1.5 max-h-32 overflow-y-auto mt-2">
                  {founderTodos.length === 0 ? (
                    <div className="text-xs text-slate-400 py-1">No action items logged yet.</div>
                  ) : (
                    founderTodos.map((todo) => (
                      <div key={todo.id} className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 text-xs">
                        <label className="flex items-center gap-2 cursor-pointer truncate">
                          <input
                            type="checkbox"
                            checked={todo.done}
                            onChange={() => toggleFounderTodo(todo.id)}
                            className="rounded text-emerald-600 cursor-pointer"
                          />
                          <span className={todo.done ? 'line-through text-slate-400' : 'text-slate-800 font-medium'}>
                            {todo.text}
                          </span>
                        </label>
                        <button type="button" onClick={() => removeFounderTodo(todo.id)} className="text-slate-400 hover:text-rose-600">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 📊 4. TAB 2: ANALYTICS EVALUATION FORM */}
          {activeTab === 'analytics' && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6 animate-in fade-in">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Analytics & Market Diligence
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Score financial feasibility, market opportunity, and record committee decision.
                  </p>
                </div>
                {analyticsScore !== null && (
                  <span className="text-xs font-bold px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full border border-emerald-200">
                    Score: {analyticsScore}/10
                  </span>
                )}
              </div>

              {/* Analytics Score Selector (1 to 10) */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 block">
                  Assign Analytics Score:
                </label>
                <div className="grid grid-cols-10 gap-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setAnalyticsScore(num)}
                      className={`py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        analyticsScore === num
                          ? 'bg-slate-900 text-white font-extrabold shadow-sm scale-105'
                          : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              {/* Analytics Notes */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Analytics & Market Observations:
                </label>
                <textarea
                  rows={4}
                  value={analyticsNotes}
                  onChange={(e) => setAnalyticsNotes(e.target.value)}
                  placeholder="Record insights on TAM, unit economics, revenue traction, and defensibility..."
                  className="w-full p-3.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/10 resize-none leading-relaxed"
                />
              </div>

              {/* Diligence Action To-Dos */}
              <div className="space-y-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <ListTodo className="w-4 h-4 text-emerald-600" />
                  <span>Financial & Diligence To-Dos</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={analyticsTodoInput}
                    onChange={(e) => setAnalyticsTodoInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addAnalyticsTodo())}
                    placeholder="Add diligence to-do (e.g. Audit cap table)..."
                    className="flex-1 px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs text-slate-800 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={addAnalyticsTodo}
                    className="px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 cursor-pointer"
                  >
                    Add
                  </button>
                </div>

                <div className="space-y-1.5 max-h-32 overflow-y-auto mt-2">
                  {analyticsTodos.length === 0 ? (
                    <div className="text-xs text-slate-400 py-1">No diligence items logged yet.</div>
                  ) : (
                    analyticsTodos.map((todo) => (
                      <div key={todo.id} className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 text-xs">
                        <label className="flex items-center gap-2 cursor-pointer truncate">
                          <input
                            type="checkbox"
                            checked={todo.done}
                            onChange={() => toggleAnalyticsTodo(todo.id)}
                            className="rounded text-emerald-600 cursor-pointer"
                          />
                          <span className={todo.done ? 'line-through text-slate-400' : 'text-slate-800 font-medium'}>
                            {todo.text}
                          </span>
                        </label>
                        <button type="button" onClick={() => removeAnalyticsTodo(todo.id)} className="text-slate-400 hover:text-rose-600">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Committee Decision */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="text-xs font-bold text-slate-700 block">
                  Committee Decision:
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'INVEST', label: 'Invest', bg: 'bg-emerald-500 text-white' },
                    { id: 'WATCHLIST', label: 'Watchlist', bg: 'bg-amber-400 text-slate-950' },
                    { id: 'REJECT', label: 'Reject', bg: 'bg-rose-500 text-white' },
                  ].map((btn) => {
                    const isSelected = decision === btn.id;
                    return (
                      <button
                        key={btn.id}
                        type="button"
                        onClick={() => setDecision(btn.id)}
                        className={`py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isSelected
                            ? `${btn.bg} shadow-sm font-extrabold ring-2 ring-slate-900/20`
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {btn.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* 💾 5. CLEAN SAVE BUTTON */}
          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="px-8 py-3 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition-all shadow-sm cursor-pointer flex items-center gap-2 disabled:opacity-50"
            >
              {saving ? <Spinner size="sm" /> : <Check className="w-4 h-4 stroke-[2.5]" />}
              <span>Save Scores</span>
            </button>
          </div>
        </>
      ) : (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 text-slate-400 text-xs">
          No startups found in your pipeline.
        </div>
      )}
    </div>
  );
};

export default ScoringHub;
