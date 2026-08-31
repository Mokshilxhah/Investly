import React, { useState, useRef } from 'react';
import {
  X,
  FileSpreadsheet,
  Upload,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Trash2,
  Download,
  Check,
  RefreshCw,
  SlidersHorizontal,
  ArrowRight,
} from 'lucide-react';
import { Spinner } from '../common/Loader';
import startupService from '../../services/startupService';

const VALID_INDUSTRIES = [
  'Fintech',
  'Healthtech',
  'AI/ML',
  'SaaS',
  'CleanTech',
  'Cybersecurity',
  'E-commerce',
  'EdTech',
  'Logistics',
  'BioTech',
];

const VALID_STAGES = ['Idea', 'Pre-seed', 'Seed', 'Series A', 'Series B+'];

// 🧠 Smart Normalizers & Fuzzy Matchers
const normalizeIndustry = (val = '') => {
  const clean = val.toString().trim().toLowerCase();
  if (!clean) return 'Fintech';

  if (clean.includes('fin') || clean.includes('pay') || clean.includes('bank') || clean.includes('money') || clean.includes('crypto')) return 'Fintech';
  if (clean.includes('health') || clean.includes('med') || clean.includes('care') || clean.includes('clinic') || clean.includes('bio')) return 'Healthtech';
  if (clean.includes('ai') || clean.includes('ml') || clean.includes('learn') || clean.includes('gpt') || clean.includes('model') || clean.includes('data')) return 'AI/ML';
  if (clean.includes('saas') || clean.includes('soft') || clean.includes('cloud') || clean.includes('b2b') || clean.includes('app')) return 'SaaS';
  if (clean.includes('clean') || clean.includes('climate') || clean.includes('green') || clean.includes('energy') || clean.includes('solar')) return 'CleanTech';
  if (clean.includes('sec') || clean.includes('cyber') || clean.includes('auth') || clean.includes('protect')) return 'Cybersecurity';
  if (clean.includes('com') || clean.includes('shop') || clean.includes('retail') || clean.includes('store') || clean.includes('market')) return 'E-commerce';
  if (clean.includes('ed') || clean.includes('learn') || clean.includes('teach') || clean.includes('school') || clean.includes('course')) return 'EdTech';
  if (clean.includes('log') || clean.includes('supply') || clean.includes('freight') || clean.includes('ship') || clean.includes('ware')) return 'Logistics';
  if (clean.includes('bio') || clean.includes('gene') || clean.includes('pharma') || clean.includes('drug')) return 'BioTech';

  const exact = VALID_INDUSTRIES.find((i) => i.toLowerCase() === clean);
  return exact || 'Fintech';
};

const normalizeStage = (val = '') => {
  const clean = val.toString().trim().toLowerCase();
  if (!clean) return 'Seed';

  if (clean.includes('pre') || clean.includes('pre-seed')) return 'Pre-seed';
  if (clean.includes('idea') || clean.includes('concept') || clean.includes('stealth')) return 'Idea';
  if (clean.includes('series a') || clean === 'a') return 'Series A';
  if (clean.includes('series b') || clean.includes('series c') || clean.includes('growth') || clean === 'b') return 'Series B+';
  if (clean.includes('seed')) return 'Seed';

  const exact = VALID_STAGES.find((s) => s.toLowerCase() === clean);
  return exact || 'Seed';
};

// URL detector
const isUrlLike = (str = '') => {
  const s = str.trim().toLowerCase();
  return (
    s.startsWith('http://') ||
    s.startsWith('https://') ||
    s.startsWith('www.') ||
    s.includes('.com') ||
    s.includes('.io') ||
    s.includes('.ai') ||
    s.includes('.co') ||
    s.includes('.org') ||
    s.includes('.net') ||
    s.includes('.app') ||
    s.includes('.tech')
  );
};

const formatUrl = (str = '') => {
  const clean = str.trim();
  if (!clean) return '';
  if (clean.startsWith('http://') || clean.startsWith('https://')) return clean;
  return `https://${clean}`;
};

export const ExcelUploadModal = ({ isOpen, onClose, onImportSuccess }) => {
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [rawHeaders, setRawHeaders] = useState([]);
  const [rawMatrix, setRawMatrix] = useState([]);
  const [columnMapping, setColumnMapping] = useState({
    nameCol: 'auto',
    websiteCol: 'auto',
    industryCol: 'auto',
    stageCol: 'auto',
    founderCol: 'auto',
    locationCol: 'auto',
  });
  const [parsedData, setParsedData] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [importResult, setImportResult] = useState(null);

  if (!isOpen) return null;

  // Split line supporting quotes
  const splitLine = (str, delimiter = ',') => {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < str.length; i++) {
      const char = str[i];
      if (char === '"' || char === "'") {
        inQuotes = !inQuotes;
      } else if (char === delimiter && !inQuotes) {
        result.push(current.trim().replace(/^["']|["']$/g, ''));
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim().replace(/^["']|["']$/g, ''));
    return result;
  };

  const processRawFile = (selectedFile) => {
    setFile(selectedFile);
    setIsProcessing(true);
    setImportResult(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const text = evt.target.result;
        const lines = text
          .split(/\r\n|\n|\r/)
          .map((l) => l.trim())
          .filter((l) => l.length > 0);

        if (lines.length === 0) {
          setIsProcessing(false);
          return;
        }

        // Auto-detect delimiter
        const sample = lines.slice(0, 5).join('\n');
        const commaCount = (sample.match(/,/g) || []).length;
        const tabCount = (sample.match(/\t/g) || []).length;
        const semiCount = (sample.match(/;/g) || []).length;

        let delimiter = ',';
        if (tabCount > commaCount && tabCount > semiCount) delimiter = '\t';
        else if (semiCount > commaCount && semiCount > tabCount) delimiter = ';';

        const matrix = lines.map((line) => splitLine(line, delimiter));

        // Skip banner / metadata rows at the top if any
        let headerRowIndex = 0;
        for (let i = 0; i < Math.min(matrix.length, 3); i++) {
          const row = matrix[i];
          const hasLikelyHeaders = row.some((c) => {
            const low = c.toLowerCase();
            return (
              low.includes('name') ||
              low.includes('company') ||
              low.includes('website') ||
              low.includes('startup') ||
              low.includes('url') ||
              low.includes('org') ||
              low.includes('domain')
            );
          });
          if (hasLikelyHeaders) {
            headerRowIndex = i;
            break;
          }
        }

        const headers = matrix[headerRowIndex].map((h, idx) => h.trim() || `Column ${idx + 1}`);
        const dataRows = matrix.slice(headerRowIndex + 1).filter((r) => r.some((cell) => cell.trim() !== ''));

        setRawHeaders(headers);
        setRawMatrix(dataRows);

        // Auto-guess column indices
        const findCol = (aliases) => {
          const idx = headers.findIndex((h) => aliases.some((a) => h.toLowerCase().includes(a)));
          return idx !== -1 ? `${idx}` : 'none';
        };

        const initialMapping = {
          nameCol: findCol(['name', 'company', 'startup', 'org', 'firm', 'vendor', 'title', 'account']) || '0',
          websiteCol: findCol(['web', 'url', 'site', 'link', 'domain', 'page', 'homepage']),
          industryCol: findCol(['ind', 'sec', 'cat', 'domain', 'vertical', 'type']),
          stageCol: findCol(['stage', 'round', 'series', 'funding']),
          founderCol: findCol(['founder', 'ceo', 'lead', 'creator', 'person', 'contact', 'owner']),
          locationCol: findCol(['loc', 'city', 'country', 'hq', 'state', 'region', 'address']),
        };

        // Fallback: If nameCol is none, pick column 0
        if (initialMapping.nameCol === 'none' && headers.length > 0) initialMapping.nameCol = '0';

        setColumnMapping(initialMapping);
        synthesizeRows(dataRows, headers, initialMapping);
      } catch (err) {
        console.error('File parsing error:', err);
      } finally {
        setIsProcessing(false);
      }
    };

    reader.onerror = () => setIsProcessing(false);
    reader.readAsText(selectedFile);
  };

  // Convert raw matrix into structured startup profiles based on columnMapping
  const synthesizeRows = (matrix, headers, mapping) => {
    const nameIdx = mapping.nameCol !== 'none' ? parseInt(mapping.nameCol, 10) : -1;
    const webIdx = mapping.websiteCol !== 'none' ? parseInt(mapping.websiteCol, 10) : -1;
    const indIdx = mapping.industryCol !== 'none' ? parseInt(mapping.industryCol, 10) : -1;
    const stgIdx = mapping.stageCol !== 'none' ? parseInt(mapping.stageCol, 10) : -1;
    const fndIdx = mapping.founderCol !== 'none' ? parseInt(mapping.founderCol, 10) : -1;
    const locIdx = mapping.locationCol !== 'none' ? parseInt(mapping.locationCol, 10) : -1;

    const rows = [];

    matrix.forEach((cols, idx) => {
      let companyName = nameIdx !== -1 ? cols[nameIdx] || '' : cols[0] || '';
      let website = webIdx !== -1 ? cols[webIdx] || '' : '';
      let industryRaw = indIdx !== -1 ? cols[indIdx] || '' : '';
      let stageRaw = stgIdx !== -1 ? cols[stgIdx] || '' : '';
      let founderName = fndIdx !== -1 ? cols[fndIdx] || '' : '';
      let location = locIdx !== -1 ? cols[locIdx] || '' : '';

      // If website wasn't mapped, scan row for any cell that looks like a URL
      if (!website) {
        const detectedUrl = cols.find((c, cIdx) => cIdx !== nameIdx && isUrlLike(c));
        if (detectedUrl) website = detectedUrl;
      }

      // If companyName looks like a URL and another column exists, swap them
      if (isUrlLike(companyName) && !website) {
        website = companyName;
        companyName = cols.find((c, cIdx) => cIdx !== nameIdx && !isUrlLike(c) && c.trim()) || 'Unnamed Startup';
      }

      const cleanName = companyName.trim();
      if (!cleanName || cleanName.toLowerCase() === 'company name' || cleanName.toLowerCase() === 'name') return;

      const resolvedFounder = founderName.trim() || `Founding Team at ${cleanName}`;
      const resolvedLocation = location.trim() || 'Location Not Specified';
      const formattedWeb = website ? formatUrl(website) : undefined;

      rows.push({
        id: idx + 1,
        companyName: cleanName,
        industry: normalizeIndustry(industryRaw),
        stage: normalizeStage(stageRaw),
        founder: {
          name: resolvedFounder,
          background: `Core leadership team developing ${cleanName}.`,
        },
        location: resolvedLocation,
        website: formattedWeb,
        description: `${cleanName} — Early-stage innovative solution.`,
        pipelineStage: 'DISCOVERED',
        isValid: true,
      });
    });

    setParsedData(rows);
  };

  const handleMappingChange = (field, newColIdx) => {
    const updated = { ...columnMapping, [field]: newColIdx };
    setColumnMapping(updated);
    synthesizeRows(rawMatrix, rawHeaders, updated);
  };

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (selected) processRawFile(selected);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) processRawFile(dropped);
  };

  const handleRowFieldChange = (id, field, value) => {
    setParsedData((prev) =>
      prev.map((row) => {
        if (row.id !== id) return row;
        const updated = { ...row };
        if (field.startsWith('founder.')) {
          const subField = field.split('.')[1];
          updated.founder = { ...updated.founder, [subField]: value };
        } else {
          updated[field] = value;
        }
        return updated;
      })
    );
  };

  const handleDeleteRow = (id) => {
    setParsedData((prev) => prev.filter((r) => r.id !== id));
  };

  const handleCommitImport = async () => {
    const validRows = parsedData.filter((r) => r.isValid && r.companyName.trim());
    if (validRows.length === 0) return;

    try {
      setImportLoading(true);
      const res = await startupService.bulkCreateStartups(validRows);
      setImportResult(res);
      window.dispatchEvent(new CustomEvent('startup-created'));
      if (onImportSuccess) onImportSuccess(res.importedCount);
    } catch (err) {
      console.error('Bulk import error:', err);
      setImportResult({ success: false, message: err.message || 'Import failed' });
    } finally {
      setImportLoading(false);
    }
  };

  const validCount = parsedData.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-4xl bg-white rounded-[32px] shadow-2xl border border-slate-200/80 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-6 pb-4 border-b border-slate-100 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-[#191919] text-[#9df5a9] flex items-center justify-center shadow-xs">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-extrabold font-display text-slate-900 leading-tight">
                Import Startups (Excel / CSV)
              </h2>
              <p className="text-[11px] text-slate-500 font-display font-medium">
                Upload any raw spreadsheet — columns are auto-detected and customizable below.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-[#f4f7f4] hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {importResult ? (
            /* Success / Final Result Screen */
            <div className="py-10 text-center space-y-3 max-w-md mx-auto">
              <div className="w-14 h-14 rounded-2xl bg-[#9df5a9] text-slate-950 flex items-center justify-center mx-auto shadow-xs">
                <Check className="w-7 h-7 stroke-[3]" />
              </div>
              <div>
                <h3 className="text-lg font-black font-display text-slate-900">
                  Import Successful!
                </h3>
                <p className="text-[11px] text-slate-600 font-medium mt-0.5">
                  Successfully imported{' '}
                  <span className="font-extrabold text-slate-950">
                    {importResult.importedCount} startups
                  </span>{' '}
                  into your database.
                </p>
              </div>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-2xl text-xs font-black font-display text-slate-950 bg-[#9df5a9] hover:bg-[#8ee59a] shadow-xs transition-all"
                >
                  Close & View Startups
                </button>
              </div>
            </div>
          ) : parsedData.length === 0 ? (
            /* Dropzone Area */
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 hover:border-[#10b981] bg-[#f8faf8] hover:bg-[#f0f7f0] rounded-[24px] p-9 text-center cursor-pointer transition-all duration-200 space-y-2.5"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.tsv,.txt,.xlsx"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="w-12 h-12 rounded-xl bg-white text-[#10b981] flex items-center justify-center mx-auto shadow-xs border border-slate-200/80">
                <Upload className="w-6 h-6" />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-extrabold font-display text-slate-900">
                  Drag and drop any spreadsheet or export list here
                </p>
                <p className="text-[11px] text-slate-500 font-display font-medium">
                  Works on ANY sheet format (even messy data, scrapings, or just 2 columns).
                </p>
              </div>
              <div className="pt-1">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[11px] font-bold font-display text-slate-800 bg-white border border-slate-200 shadow-xs">
                  <FileText className="w-3 h-3 text-emerald-600" />
                  <span>Choose File from Computer</span>
                </span>
              </div>
            </div>
          ) : (
            /* Active File View + Smart Column Mapping Bar */
            <div className="space-y-4">
              {/* 🎛️ SMART COLUMN MAPPER RIBBON */}
              <div className="p-3.5 rounded-2xl bg-[#f8faf8] border border-slate-200/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-extrabold font-display text-slate-900">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Auto-Detected Column Mapping</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setParsedData([]);
                      setRawMatrix([]);
                      setRawHeaders([]);
                      setFile(null);
                    }}
                    className="inline-flex items-center gap-1 text-[11px] font-bold font-display text-slate-500 hover:text-slate-900 transition-colors"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Choose Different File</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-[11px] font-display">
                  {/* Company Name Col */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Company Name:</span>
                    <select
                      value={columnMapping.nameCol}
                      onChange={(e) => handleMappingChange('nameCol', e.target.value)}
                      className="w-full px-2 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-900 focus:outline-none"
                    >
                      {rawHeaders.map((h, i) => (
                        <option key={i} value={`${i}`}>
                          {h}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Website Col */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Website / URL:</span>
                    <select
                      value={columnMapping.websiteCol}
                      onChange={(e) => handleMappingChange('websiteCol', e.target.value)}
                      className="w-full px-2 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-900 focus:outline-none"
                    >
                      <option value="none">Auto / None</option>
                      {rawHeaders.map((h, i) => (
                        <option key={i} value={`${i}`}>
                          {h}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Industry Col */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Industry:</span>
                    <select
                      value={columnMapping.industryCol}
                      onChange={(e) => handleMappingChange('industryCol', e.target.value)}
                      className="w-full px-2 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-900 focus:outline-none"
                    >
                      <option value="none">Default (Fintech)</option>
                      {rawHeaders.map((h, i) => (
                        <option key={i} value={`${i}`}>
                          {h}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Stage Col */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Funding Stage:</span>
                    <select
                      value={columnMapping.stageCol}
                      onChange={(e) => handleMappingChange('stageCol', e.target.value)}
                      className="w-full px-2 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-900 focus:outline-none"
                    >
                      <option value="none">Default (Seed)</option>
                      {rawHeaders.map((h, i) => (
                        <option key={i} value={`${i}`}>
                          {h}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Founder Col */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Founder Name:</span>
                    <select
                      value={columnMapping.founderCol}
                      onChange={(e) => handleMappingChange('founderCol', e.target.value)}
                      className="w-full px-2 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-900 focus:outline-none"
                    >
                      <option value="none">Auto (Founding Team)</option>
                      {rawHeaders.map((h, i) => (
                        <option key={i} value={`${i}`}>
                          {h}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Location Col */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">HQ Location:</span>
                    <select
                      value={columnMapping.locationCol}
                      onChange={(e) => handleMappingChange('locationCol', e.target.value)}
                      className="w-full px-2 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-900 focus:outline-none"
                    >
                      <option value="none">Auto (Not Specified)</option>
                      {rawHeaders.map((h, i) => (
                        <option key={i} value={`${i}`}>
                          {h}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Data Table */}
              <div className="border border-slate-200/80 rounded-2xl overflow-hidden bg-white shadow-xs">
                <div className="overflow-x-auto max-h-60">
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-[#f4f7f4] text-[10px] font-extrabold font-display uppercase tracking-wider text-slate-600 sticky top-0 border-b border-slate-200 z-10">
                      <tr>
                        <th className="px-3.5 py-2.5">Status</th>
                        <th className="px-3.5 py-2.5">Company Name</th>
                        <th className="px-3.5 py-2.5">Website</th>
                        <th className="px-3.5 py-2.5">Industry</th>
                        <th className="px-3.5 py-2.5">Stage</th>
                        <th className="px-3.5 py-2.5">Founder</th>
                        <th className="px-3.5 py-2.5">Location</th>
                        <th className="px-2.5 py-2.5 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-display">
                      {parsedData.map((row) => (
                        <tr
                          key={row.id}
                          className="hover:bg-slate-50 transition-colors"
                        >
                          {/* Status */}
                          <td className="px-3.5 py-2 whitespace-nowrap">
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-[#9df5a9] text-slate-950">
                              Ready
                            </span>
                          </td>

                          {/* Company Name (Editable) */}
                          <td className="px-3.5 py-2">
                            <input
                              type="text"
                              value={row.companyName}
                              onChange={(e) => handleRowFieldChange(row.id, 'companyName', e.target.value)}
                              placeholder="Company Name"
                              className="w-28 px-2 py-1 rounded-lg border border-slate-200 text-[11px] font-bold text-slate-900 bg-white"
                            />
                          </td>

                          {/* Website (Editable) */}
                          <td className="px-3.5 py-2">
                            <input
                              type="text"
                              value={row.website || ''}
                              onChange={(e) => handleRowFieldChange(row.id, 'website', e.target.value)}
                              placeholder="https://..."
                              className="w-28 px-2 py-1 rounded-lg border border-slate-200 text-[11px] text-emerald-700 bg-white font-medium"
                            />
                          </td>

                          {/* Industry */}
                          <td className="px-3.5 py-2">
                            <select
                              value={row.industry}
                              onChange={(e) => handleRowFieldChange(row.id, 'industry', e.target.value)}
                              className="px-2 py-1 rounded-lg border border-slate-200 text-[11px] font-semibold bg-white text-slate-800"
                            >
                              {VALID_INDUSTRIES.map((ind) => (
                                <option key={ind} value={ind}>
                                  {ind}
                                </option>
                              ))}
                            </select>
                          </td>

                          {/* Stage */}
                          <td className="px-3.5 py-2">
                            <select
                              value={row.stage}
                              onChange={(e) => handleRowFieldChange(row.id, 'stage', e.target.value)}
                              className="px-2 py-1 rounded-lg border border-slate-200 text-[11px] font-semibold bg-white text-slate-800"
                            >
                              {VALID_STAGES.map((stg) => (
                                <option key={stg} value={stg}>
                                  {stg}
                                </option>
                              ))}
                            </select>
                          </td>

                          {/* Founder Name (Editable) */}
                          <td className="px-3.5 py-2">
                            <input
                              type="text"
                              value={row.founder?.name}
                              onChange={(e) => handleRowFieldChange(row.id, 'founder.name', e.target.value)}
                              placeholder="Founder Name"
                              className="w-24 px-2 py-1 rounded-lg border border-slate-200 text-[11px] font-bold text-slate-900 bg-white"
                            />
                          </td>

                          {/* Location (Editable) */}
                          <td className="px-3.5 py-2">
                            <input
                              type="text"
                              value={row.location}
                              onChange={(e) => handleRowFieldChange(row.id, 'location', e.target.value)}
                              placeholder="Location"
                              className="w-24 px-2 py-1 rounded-lg border border-slate-200 text-[11px] text-slate-800 bg-white font-medium"
                            />
                          </td>

                          {/* Delete Row */}
                          <td className="px-2.5 py-2 text-right whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => handleDeleteRow(row.id)}
                              className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                              title="Remove Row"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Action Footer */}
        {!importResult && parsedData.length > 0 && (
          <div className="p-5 sm:p-6 pt-3.5 border-t border-slate-100 flex items-center justify-between bg-[#fafbfa]">
            <button
              type="button"
              onClick={() => {
                setParsedData([]);
                setRawMatrix([]);
                setRawHeaders([]);
                setFile(null);
              }}
              className="px-4 py-2 rounded-2xl text-[11px] font-bold font-display text-slate-600 hover:text-slate-900 transition-colors"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleCommitImport}
              disabled={importLoading || validCount === 0}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-2xl text-xs font-black font-display text-slate-950 bg-[#9df5a9] hover:bg-[#8ee59a] shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {importLoading ? (
                <>
                  <Spinner size="sm" />
                  <span>Importing Startups...</span>
                </>
              ) : (
                <>
                  <Upload className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Import {validCount} Startups to Database</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExcelUploadModal;
