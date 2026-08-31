import React, { useState, useEffect } from 'react';
import {
  X,
  Building2,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
  Edit2,
  Check,
} from 'lucide-react';
import { Spinner } from '../common/Loader';

const INDUSTRIES = [
  'Fintech',
  'AI/ML',
  'SaaS',
  'Healthtech',
  'CleanTech',
  'Cybersecurity',
  'E-commerce',
  'EdTech',
  'Logistics',
  'BioTech',
];

const STAGES = ['Idea', 'Pre-seed', 'Seed', 'Series A', 'Series B+'];

const PIPELINE_STAGES = [
  { id: 'DISCOVERED', label: 'Discovered' },
  { id: 'UNDER_REVIEW', label: 'Review' },
  { id: 'EVALUATION', label: 'Evaluation' },
  { id: 'COMMITTEE', label: 'Committee' },
  { id: 'CLOSED', label: 'Closed' },
];

export const StartupModal = ({
  isOpen,
  onClose,
  onSave,
  startup = null,
  loading = false,
}) => {
  const isEdit = Boolean(startup?._id);
  const [currentStep, setCurrentStep] = useState(1);

  const initialFormState = {
    companyName: '',
    industry: 'Fintech',
    stage: 'Seed',
    website: '',
    location: '',
    founderName: '',
    founderBackground: '',
    description: '',
    pipelineStage: 'DISCOVERED',
  };

  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (startup) {
      setFormData({
        companyName: startup.companyName || '',
        industry: startup.industry || 'Fintech',
        stage: startup.stage || 'Seed',
        website: startup.website || '',
        location: startup.location || '',
        founderName: startup.founder?.name || '',
        founderBackground: startup.founder?.background || '',
        description: startup.description || '',
        pipelineStage: startup.pipelineStage || 'DISCOVERED',
      });
    } else {
      setFormData(initialFormState);
    }
    setCurrentStep(1);
    setErrors({});
  }, [startup, isOpen]);

  if (!isOpen) return null;

  // Validation Logic per step
  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.companyName.trim()) {
        newErrors.companyName = 'Company name is required';
      }
      if (!formData.industry) {
        newErrors.industry = 'Industry is required';
      }
      if (!formData.stage) {
        newErrors.stage = 'Stage is required';
      }
      if (!formData.location.trim()) {
        newErrors.location = 'Location is required';
      }
      if (
        formData.website &&
        !formData.website.startsWith('http://') &&
        !formData.website.startsWith('https://')
      ) {
        newErrors.website = 'Must start with http:// or https://';
      }
    } else if (step === 2) {
      if (!formData.founderName.trim()) {
        newErrors.founderName = 'Founder name is required';
      }
      if (!formData.founderBackground.trim()) {
        newErrors.founderBackground = 'Founder background is required (1-2 sentences)';
      }
    } else if (step === 3) {
      if (!formData.description.trim()) {
        newErrors.description = 'Company description is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Is Current Step Valid (Controls Disabled State of Next Button)
  const isCurrentStepValid = () => {
    if (currentStep === 1) {
      return (
        formData.companyName.trim() !== '' &&
        formData.industry !== '' &&
        formData.stage !== '' &&
        formData.location.trim() !== '' &&
        (!formData.website ||
          formData.website.startsWith('http://') ||
          formData.website.startsWith('https://'))
      );
    }
    if (currentStep === 2) {
      return (
        formData.founderName.trim() !== '' &&
        formData.founderBackground.trim() !== ''
      );
    }
    if (currentStep === 3) {
      return formData.description.trim() !== '';
    }
    return true;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSelectField = (field, val) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleNext = (e) => {
    if (e) e.preventDefault();
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 3));
    }
  };

  const handleBack = (e) => {
    if (e) e.preventDefault();
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleJumpToStep = (targetStep) => {
    setCurrentStep(targetStep);
  };

  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (currentStep < 3 && isCurrentStepValid()) {
        handleNext(e);
      } else if (currentStep === 3 && isCurrentStepValid()) {
        handleSubmit(e);
      }
    }
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();

    if (currentStep < 3) {
      handleNext(e);
      return;
    }

    if (!validateStep(1) || !validateStep(2) || !validateStep(3)) {
      if (!validateStep(1)) setCurrentStep(1);
      else if (!validateStep(2)) setCurrentStep(2);
      return;
    }

    const payload = {
      companyName: formData.companyName.trim(),
      industry: formData.industry,
      stage: formData.stage,
      founder: {
        name: formData.founderName.trim(),
        background: formData.founderBackground.trim(),
      },
      website: formData.website.trim(),
      location: formData.location.trim(),
      description: formData.description.trim(),
      pipelineStage: formData.pipelineStage,
    };

    onSave(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl bg-white rounded-[32px] shadow-2xl border border-slate-200/80 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 🏷️ Top Header: Title, Pure Graphical Indicators & Close Button */}
        <div className="p-6 sm:p-7 pb-5 border-b border-slate-100 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#191919] text-white flex items-center justify-center shadow-xs">
              <Building2 className="w-5 h-5 text-[#9df5a9]" />
            </div>
            <h2 className="text-lg font-extrabold font-display text-slate-900 leading-tight">
              {isEdit ? 'Edit Startup' : 'Add Startup'}
            </h2>
          </div>

          {/* 🚀 Pure Graphical Step Indicators (No Numbers / No Text) */}
          <div className="flex items-center gap-2">
            {[1, 2, 3].map((stepIdx) => {
              const isCompleted = currentStep > stepIdx;
              const isCurrent = currentStep === stepIdx;

              return (
                <button
                  key={stepIdx}
                  type="button"
                  onClick={() => {
                    if (stepIdx < currentStep || validateStep(currentStep)) {
                      setCurrentStep(stepIdx);
                    }
                  }}
                  className={`h-2.5 rounded-full transition-all duration-200 cursor-pointer ${
                    isCurrent
                      ? 'w-10 bg-[#191919] shadow-xs'
                      : isCompleted
                      ? 'w-5 bg-[#9df5a9]'
                      : 'w-3 bg-slate-200 hover:bg-slate-300'
                  }`}
                  title={`Go to step ${stepIdx}`}
                />
              );
            })}
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="w-8 h-8 rounded-full bg-[#f4f7f4] hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body (Scrollable) */}
        <div className="p-6 sm:p-7 overflow-y-auto flex-1">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Step Error Banner */}
            {Object.keys(errors).length > 0 && (
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-2 text-rose-700 text-xs font-bold font-display">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>Please fill in the required fields marked below.</span>
              </div>
            )}

            {/* STEP 1: Company Fundamentals */}
            {currentStep === 1 && (
              <div className="space-y-4 animate-in fade-in duration-150">
                {/* Company Name (Required) */}
                <div>
                  <label className="flex items-center justify-between text-xs font-bold font-display text-slate-800 mb-1.5">
                    <span>Company Name</span>
                    <span className="text-[10px] text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full font-bold">Required</span>
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    onKeyDown={handleInputKeyDown}
                    placeholder="e.g. Acme Health"
                    className={`w-full px-4 py-2.5 rounded-2xl bg-[#f4f7f4] border border-slate-200/80 text-slate-900 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#9df5a9] ${
                      errors.companyName ? 'border-rose-400 bg-rose-50/50' : ''
                    }`}
                  />
                  {errors.companyName && (
                    <p className="text-[11px] text-rose-600 font-bold mt-1">{errors.companyName}</p>
                  )}
                </div>

                {/* Industry Sector (Required) */}
                <div>
                  <label className="flex items-center justify-between text-xs font-bold font-display text-slate-800 mb-1.5">
                    <span>Industry Sector</span>
                    <span className="text-[10px] text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full font-bold">Required</span>
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {INDUSTRIES.map((ind) => {
                      const isSelected = formData.industry === ind;
                      return (
                        <button
                          key={ind}
                          type="button"
                          onClick={() => handleSelectField('industry', ind)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-display font-bold transition-all ${
                            isSelected
                              ? 'bg-[#191919] text-white shadow-xs'
                              : 'bg-[#f4f7f4] text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          {ind}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Funding Stage (Required) */}
                <div>
                  <label className="flex items-center justify-between text-xs font-bold font-display text-slate-800 mb-1.5">
                    <span>Funding Stage</span>
                    <span className="text-[10px] text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full font-bold">Required</span>
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {STAGES.map((stg) => {
                      const isSelected = formData.stage === stg;
                      return (
                        <button
                          key={stg}
                          type="button"
                          onClick={() => handleSelectField('stage', stg)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-display font-bold transition-all ${
                            isSelected
                              ? 'bg-[#9df5a9] text-slate-950 shadow-xs'
                              : 'bg-[#f4f7f4] text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          {stg}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Location (Required) & Website (Optional) Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="flex items-center justify-between text-xs font-bold font-display text-slate-800 mb-1.5">
                      <span>Location / HQ</span>
                      <span className="text-[10px] text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full font-bold">Required</span>
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      onKeyDown={handleInputKeyDown}
                      placeholder="e.g. Austin, TX"
                      className={`w-full px-3.5 py-2.5 rounded-xl bg-[#f4f7f4] border border-slate-200/80 text-slate-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#9df5a9] ${
                        errors.location ? 'border-rose-400 bg-rose-50/50' : ''
                      }`}
                    />
                    {errors.location && (
                      <p className="text-[11px] text-rose-600 font-bold mt-1">{errors.location}</p>
                    )}
                  </div>
                  <div>
                    <label className="flex items-center justify-between text-xs font-bold font-display text-slate-800 mb-1.5">
                      <span>Website</span>
                      <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full font-bold">Optional</span>
                    </label>
                    <input
                      type="text"
                      name="website"
                      value={formData.website}
                      onChange={handleChange}
                      onKeyDown={handleInputKeyDown}
                      placeholder="https://acme.com"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#f4f7f4] border border-slate-200/80 text-slate-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#9df5a9]"
                    />
                    {errors.website && (
                      <p className="text-[11px] text-rose-600 font-bold mt-1">{errors.website}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Founder & Team */}
            {currentStep === 2 && (
              <div className="space-y-4 animate-in fade-in duration-150">
                {/* Founder Name (Required) */}
                <div>
                  <label className="flex items-center justify-between text-xs font-bold font-display text-slate-800 mb-1.5">
                    <span>Founder Name</span>
                    <span className="text-[10px] text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full font-bold">Required</span>
                  </label>
                  <input
                    type="text"
                    name="founderName"
                    value={formData.founderName}
                    onChange={handleChange}
                    onKeyDown={handleInputKeyDown}
                    placeholder="e.g. Alex Rivera"
                    className={`w-full px-4 py-3 rounded-2xl bg-[#f4f7f4] border border-slate-200/80 text-slate-900 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#9df5a9] ${
                      errors.founderName ? 'border-rose-400 bg-rose-50/50' : ''
                    }`}
                  />
                  {errors.founderName && (
                    <p className="text-[11px] text-rose-600 font-bold mt-1">{errors.founderName}</p>
                  )}
                </div>

                {/* Founder Background (Required) */}
                <div>
                  <label className="flex items-center justify-between text-xs font-bold font-display text-slate-800 mb-1.5">
                    <span>Founder Background & Track Record</span>
                    <span className="text-[10px] text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full font-bold">Required</span>
                  </label>
                  <textarea
                    name="founderBackground"
                    value={formData.founderBackground}
                    onChange={handleChange}
                    rows={4}
                    placeholder="1-2 sentences on previous exits, domain expertise, past tech companies..."
                    className={`w-full px-4 py-3 rounded-2xl bg-[#f4f7f4] border border-slate-200/80 text-slate-900 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#9df5a9] resize-none leading-relaxed ${
                      errors.founderBackground ? 'border-rose-400 bg-rose-50/50' : ''
                    }`}
                  />
                  {errors.founderBackground && (
                    <p className="text-[11px] text-rose-600 font-bold mt-1">{errors.founderBackground}</p>
                  )}
                </div>
              </div>
            )}

            {/* STEP 3: Overview & Clickable Review Block */}
            {currentStep === 3 && (
              <div className="space-y-4 animate-in fade-in duration-150">
                {/* Description (Required) */}
                <div>
                  <label className="flex items-center justify-between text-xs font-bold font-display text-slate-800 mb-1.5">
                    <span>Company Description & Value Proposition</span>
                    <span className="text-[10px] text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full font-bold">Required</span>
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Concise summary of the core product and market opportunity..."
                    className={`w-full px-4 py-3 rounded-2xl bg-[#f4f7f4] border border-slate-200/80 text-slate-900 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#9df5a9] resize-none leading-relaxed ${
                      errors.description ? 'border-rose-400 bg-rose-50/50' : ''
                    }`}
                  />
                  {errors.description && (
                    <p className="text-[11px] text-rose-600 font-bold mt-1">{errors.description}</p>
                  )}
                </div>

                {/* Pipeline Stage Chips */}
                <div>
                  <label className="block text-xs font-bold font-display text-slate-800 mb-1.5">
                    Initial Pipeline Status
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {PIPELINE_STAGES.map((pstg) => {
                      const isSelected = formData.pipelineStage === pstg.id;
                      return (
                        <button
                          key={pstg.id}
                          type="button"
                          onClick={() => handleSelectField('pipelineStage', pstg.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-display font-bold transition-all ${
                            isSelected
                              ? 'bg-[#191919] text-white shadow-xs'
                              : 'bg-[#f4f7f4] text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          {pstg.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 🔍 Clickable / Editable Review Summary Box */}
                <div className="p-3.5 rounded-2xl bg-[#f4f7f4] border border-slate-200/80 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-[11px] font-extrabold uppercase tracking-wider text-slate-500 font-display">
                    <span>Review Summary (Click to edit)</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {/* Step 1 Jump Target */}
                    <button
                      type="button"
                      onClick={() => handleJumpToStep(1)}
                      className="p-2.5 rounded-xl bg-white text-left hover:bg-slate-50 border border-slate-200/60 transition-colors flex items-start justify-between gap-2 group"
                    >
                      <div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase font-display">Company</div>
                        <div className="font-extrabold text-slate-900 truncate max-w-[160px]">
                          {formData.companyName || '—'}
                        </div>
                        <div className="text-[11px] text-slate-500 font-medium">
                          {formData.industry} • {formData.stage} • {formData.location || 'No HQ'}
                        </div>
                      </div>
                      <Edit2 className="w-3 h-3 text-slate-400 group-hover:text-emerald-700 flex-shrink-0 mt-1" />
                    </button>

                    {/* Step 2 Jump Target */}
                    <button
                      type="button"
                      onClick={() => handleJumpToStep(2)}
                      className="p-2.5 rounded-xl bg-white text-left hover:bg-slate-50 border border-slate-200/60 transition-colors flex items-start justify-between gap-2 group"
                    >
                      <div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase font-display">Founder</div>
                        <div className="font-extrabold text-slate-900 truncate max-w-[160px]">
                          {formData.founderName || '—'}
                        </div>
                        <div className="text-[11px] text-slate-500 font-medium truncate max-w-[160px]">
                          {formData.founderBackground || 'No background'}
                        </div>
                      </div>
                      <Edit2 className="w-3 h-3 text-slate-400 group-hover:text-emerald-700 flex-shrink-0 mt-1" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Bottom Actions Footer */}
        <div className="p-6 sm:p-7 pt-4 border-t border-slate-100 flex items-center justify-between bg-[#fafbfa]">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              disabled={loading}
              className="inline-flex items-center gap-1 px-4 py-2.5 rounded-2xl text-xs font-extrabold font-display text-slate-700 bg-white hover:bg-slate-100 border border-slate-200/80 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 rounded-2xl text-xs font-bold font-display text-slate-500 hover:text-slate-800 transition-colors"
            >
              Cancel
            </button>
          )}

          <div>
            {currentStep < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={loading || !isCurrentStepValid()}
                className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-2xl text-xs font-black font-display text-slate-950 bg-[#9df5a9] hover:bg-[#8ee59a] shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <span>Next Step</span>
                <ChevronRight className="w-4 h-4 stroke-[3]" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading || !isCurrentStepValid()}
                className="inline-flex items-center gap-2 px-7 py-2.5 rounded-2xl text-xs font-black font-display text-slate-950 bg-[#9df5a9] hover:bg-[#8ee59a] shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {loading ? (
                  <>
                    <Spinner size="sm" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>{isEdit ? 'Update Startup' : 'Complete Intake'}</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StartupModal;
