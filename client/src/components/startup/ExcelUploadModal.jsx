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
  Sparkles,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
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

// 🧠 Smart Normalizers & High-Precision Matchers
const normalizeIndustry = (val = '', context = '') => {
  const clean = String(val || '').trim();
  const lower = clean.toLowerCase();
  const ctxLower = String(context || '').toLowerCase();

  // 1. Direct exact match against supported industries
  const exact = VALID_INDUSTRIES.find((i) => i.toLowerCase() === lower);
  if (exact) return exact;

  // 2. High-precision keyword & boundary matching
  // BioTech (must precede general health to prevent misclassification)
  if (
    /\b(biotech|biotechnology|genomics|gene|crispr|therapeutics|pharma|pharmaceutical|cellular|epigenetic|life\s*sciences|biology)\b/i.test(lower) ||
    (!clean && /\b(crispr|genomics|cellular|senescence|therapeutics|epigenetic)\b/i.test(ctxLower))
  ) {
    return 'BioTech';
  }

  // Fintech
  if (
    /\b(fintech|finance|financial|payment|payments|banking|bank|treasury|crypto|blockchain|defi|wealthtech|insurtech|lending|neobank|paytech|arbitrage)\b/i.test(lower) ||
    (!clean && /\b(payment|treasury|financial|anomaly detection|arbitrage)\b/i.test(ctxLower))
  ) {
    return 'Fintech';
  }

  // AI / ML
  if (
    /\b(ai\/ml|ai|ml|artificial\s*intelligence|machine\s*learning|deep\s*learning|genai|generative\s*ai|llm|gpt|neural|nlp|computer\s*vision|vector\s*db)\b/i.test(lower) ||
    (!clean && /\b(llm|gpt|multimodal|neural|deep learning)\b/i.test(ctxLower))
  ) {
    return 'AI/ML';
  }

  // Healthtech
  if (
    /\b(healthtech|health\s*tech|healthcare|health|medical|medtech|digital\s*health|telehealth|clinical|diagnostics|patient|hospital|biomarker)\b/i.test(lower) ||
    (!clean && /\b(headset|diagnostics|biomarker|clinical|alzheimer)\b/i.test(ctxLower))
  ) {
    return 'Healthtech';
  }

  // CleanTech
  if (
    /\b(cleantech|clean\s*tech|climate\s*tech|climatetech|climate|green\s*energy|clean\s*energy|renewable|sustainability|solar|wind|carbon|microgrid|ev|battery|agritech)\b/i.test(lower) ||
    (!clean && /\b(microgrid|solar|clean energy|renewable|climate)\b/i.test(ctxLower))
  ) {
    return 'CleanTech';
  }

  // Cybersecurity
  if (
    /\b(cybersecurity|cyber\s*security|infosec|security|zero\s*trust|threat|intrusion|firewall|confidential\s*computing|encryption|endpoint\s*protection|kernel)\b/i.test(lower) ||
    (!clean && /\b(zero-trust|intrusion|endpoint protection|confidential computing)\b/i.test(ctxLower))
  ) {
    return 'Cybersecurity';
  }

  // E-commerce
  if (
    /\b(e-commerce|ecommerce|e\s*commerce|retail|marketplace|dtc|d2c|online\s*store|shopping|merchandising|markdown)\b/i.test(lower) ||
    (!clean && /\b(retail|supply chain forecasting|markdown engine)\b/i.test(ctxLower))
  ) {
    return 'E-commerce';
  }

  // EdTech
  if (
    /\b(edtech|ed\s*tech|education|educational|e-learning|elearning|learning\s*platform|tutor|curriculum|stem|k-12|school|university)\b/i.test(lower) ||
    (!clean && /\b(tutor|stem mastery|curriculum|personalized learning)\b/i.test(ctxLower))
  ) {
    return 'EdTech';
  }

  // Logistics
  if (
    /\b(logistics|supply\s*chain|freight|shipping|fleet|transportation|mobility|warehouse|warehousing|delivery|cargo|dispatch)\b/i.test(lower) ||
    (!clean && /\b(freight|fleet|re-dispatch|route allocation)\b/i.test(ctxLower))
  ) {
    return 'Logistics';
  }

  // SaaS
  if (
    /\b(saas|software\s*as\s*a\s*service|b2b\s*software|enterprise\s*software|cloud\s*software|cloud|devops|infrastructure|database|db|platform)\b/i.test(lower) ||
    (!clean && /\b(vector database|serverless|b2b saas|cloud)\b/i.test(ctxLower))
  ) {
    return 'SaaS';
  }

  // 3. Fallback partial substring checks
  if (lower.includes('fin') || lower.includes('pay') || lower.includes('bank')) return 'Fintech';
  if (lower.includes('health') || lower.includes('med') || lower.includes('clinic')) return 'Healthtech';
  if (lower.includes('ai') || lower.includes('gpt') || lower.includes('data')) return 'AI/ML';
  if (lower.includes('saas') || lower.includes('soft') || lower.includes('cloud')) return 'SaaS';
  if (lower.includes('clean') || lower.includes('green') || lower.includes('solar') || lower.includes('energy')) return 'CleanTech';
  if (lower.includes('cyber') || lower.includes('threat') || lower.includes('shield') || lower.includes('sec')) return 'Cybersecurity';
  if (lower.includes('commerce') || lower.includes('retail') || lower.includes('shop') || lower.includes('market')) return 'E-commerce';
  if (lower.includes('edu') || lower.includes('teach') || lower.includes('learn')) return 'EdTech';
  if (lower.includes('log') || lower.includes('freight') || lower.includes('ship') || lower.includes('fleet')) return 'Logistics';
  if (lower.includes('bio') || lower.includes('gene') || lower.includes('pharma')) return 'BioTech';

  return 'SaaS';
};

const normalizeStage = (val = '', context = '') => {
  const clean = String(val || '').trim();
  const lower = clean.toLowerCase();
  const ctxLower = String(context || '').toLowerCase();

  // 1. Direct exact match
  const exact = VALID_STAGES.find((s) => s.toLowerCase() === lower);
  if (exact) return exact;

  // 2. High precision stage pattern matching
  if (/\b(idea|concept|stealth|pre-product|ideation|prototype|discovery)\b/i.test(lower)) {
    return 'Idea';
  }
  if (/\b(pre-seed|pre\s*seed|preseed|angel|incubator|accelerator|friends\s*&\s*family|f&f|safe)\b/i.test(lower)) {
    return 'Pre-seed';
  }
  if (/\b(series\s*a|series-a|round\s*a|\bstage\s*a\b|\bseries\s*1\b)\b/i.test(lower) || lower === 'a') {
    return 'Series A';
  }
  if (
    /\b(series\s*[b-z]|series-[b-z]|round\s*[b-z]|growth|late\s*stage|expansion|series\s*b\+|ipo|pre-ipo)\b/i.test(lower) ||
    lower === 'b' ||
    lower === 'c'
  ) {
    return 'Series B+';
  }
  if (/\b(seed|seed\s*round|seed\s*stage|early\s*stage)\b/i.test(lower)) {
    return 'Seed';
  }

  // Fallback context checks
  if (ctxLower.includes('pre-seed') || ctxLower.includes('pre seed') || ctxLower.includes('angel')) return 'Pre-seed';
  if (ctxLower.includes('series a') || ctxLower.includes('round a')) return 'Series A';
  if (ctxLower.includes('series b') || ctxLower.includes('series c') || ctxLower.includes('growth')) return 'Series B+';
  if (ctxLower.includes('seed')) return 'Seed';
  if (ctxLower.includes('idea') || ctxLower.includes('stealth')) return 'Idea';

  return 'Seed';
};

// URL detector & normalizer
const isUrlLike = (str = '') => {
  if (!str || typeof str !== 'string') return false;
  const s = str.trim().toLowerCase();
  return (
    s.startsWith('http://') ||
    s.startsWith('https://') ||
    s.startsWith('www.') ||
    /\.(com|io|ai|co|org|net|app|tech|dev|energy|bio|learn|security|xyz|so|me|gg)(\/.*)?$/i.test(s) ||
    /https?:\/\/[^\s]+/i.test(s)
  );
};

const formatUrl = (str = '') => {
  const clean = String(str || '').trim();
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
    founderBackgroundCol: 'auto',
    locationCol: 'auto',
    descriptionCol: 'auto',
  });
  const [parsedData, setParsedData] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [importResult, setImportResult] = useState(null);

  if (!isOpen) return null;

  const processFileMatrix = (matrix) => {
    if (!matrix || matrix.length === 0) {
      setIsProcessing(false);
      return;
    }

    // Clean all cells
    const cleanMatrix = matrix
      .map((row) => (Array.isArray(row) ? row.map((c) => (c !== null && c !== undefined ? String(c).trim() : '')) : []))
      .filter((row) => row.some((c) => c !== ''));

    if (cleanMatrix.length === 0) {
      setIsProcessing(false);
      return;
    }

    // 1. Detect Header Row (search first 5 rows)
    let headerRowIndex = -1;
    const headerKeywords = [
      'name', 'company', 'startup', 'industry', 'stage', 'round', 'founder',
      'background', 'website', 'url', 'location', 'description', 'about', 'city'
    ];

    for (let i = 0; i < Math.min(cleanMatrix.length, 5); i++) {
      const row = cleanMatrix[i];
      const matchCount = row.filter((cell) => {
        const low = cell.toLowerCase().trim();
        return headerKeywords.some((kw) => low === kw || low.includes(kw));
      }).length;

      if (matchCount >= 2 || (row.length <= 3 && matchCount >= 1)) {
        headerRowIndex = i;
        break;
      }
    }

    let headers = [];
    let dataRows = [];

    if (headerRowIndex !== -1) {
      headers = cleanMatrix[headerRowIndex].map((h, idx) => h.trim() || `Column ${idx + 1}`);
      dataRows = cleanMatrix.slice(headerRowIndex + 1).filter((r) => r.some((cell) => cell.trim() !== ''));
    } else {
      // Headerless Dataset: Generate Column 1, Column 2... and include all data rows
      const colCount = Math.max(...cleanMatrix.map((r) => r.length), 1);
      headers = Array.from({ length: colCount }, (_, idx) => `Column ${idx + 1}`);
      dataRows = cleanMatrix.filter((r) => r.some((cell) => cell.trim() !== ''));
    }

    setRawHeaders(headers);
    setRawMatrix(dataRows);

    // 2. Intelligent Multi-Alias Header Finder
    const findColByAliases = (aliases, exactOnly = false) => {
      // First pass: exact matches
      const exactIdx = headers.findIndex((h) => {
        const cleanH = h.toLowerCase().trim();
        return aliases.some((a) => cleanH === a.toLowerCase());
      });
      if (exactIdx !== -1) return `${exactIdx}`;

      if (exactOnly) return 'none';

      // Second pass: word boundary / inclusion
      const partialIdx = headers.findIndex((h) => {
        const cleanH = h.toLowerCase().trim();
        return aliases.some((a) => cleanH.includes(a.toLowerCase()));
      });
      return partialIdx !== -1 ? `${partialIdx}` : 'none';
    };

    const initialMapping = {
      nameCol: findColByAliases([
        'company name', 'startup name', 'company', 'startup', 'organization',
        'org', 'firm', 'business name', 'vendor', 'name', 'account', 'title'
      ]),
      industryCol: findColByAliases([
        'industry', 'industry vertical', 'vertical', 'sector', 'business category',
        'market sector', 'market category', 'category', 'segment', 'domain'
      ]),
      stageCol: findColByAliases([
        'funding stage', 'investment stage', 'financing stage', 'stage', 'round',
        'current round', 'funding round', 'series', 'funding', 'capital stage'
      ]),
      founderCol: findColByAliases([
        'founder name', 'founders', 'founder(s)', 'founder', 'ceo', 'co-founder',
        'lead founder', 'executive', 'team lead', 'contact person', 'creator', 'person', 'owner'
      ]),
      founderBackgroundCol: findColByAliases([
        'founder background', 'founder bio', 'founders background', 'founder profile',
        'pedigree', 'founder history', 'founder experience', 'leadership background', 'background', 'bio'
      ]),
      websiteCol: findColByAliases([
        'website', 'website url', 'url', 'web', 'site', 'homepage', 'link', 'domain', 'landing page'
      ]),
      locationCol: findColByAliases([
        'location', 'headquarters', 'hq location', 'hq', 'city', 'country',
        'region', 'state', 'office location', 'address', 'city / state', 'geo'
      ]),
      descriptionCol: findColByAliases([
        'description', 'company description', 'about', 'about company', 'summary',
        'overview', 'business overview', 'pitch', 'product description', 'value prop', 'notes', 'details'
      ]),
    };

    // 3. Smart Column Sniffing for Ambiguous / Missing Columns
    if (dataRows.length > 0) {
      const sampleRows = dataRows.slice(0, Math.min(dataRows.length, 10));

      // Sniff URL Column if website is unmapped
      if (initialMapping.websiteCol === 'none') {
        for (let cIdx = 0; cIdx < headers.length; cIdx++) {
          const isUrlCol = sampleRows.filter((r) => isUrlLike(r[cIdx])).length >= Math.max(1, Math.floor(sampleRows.length * 0.4));
          if (isUrlCol) {
            initialMapping.websiteCol = `${cIdx}`;
            break;
          }
        }
      }

      // Sniff Stage Column if stage is unmapped
      if (initialMapping.stageCol === 'none') {
        for (let cIdx = 0; cIdx < headers.length; cIdx++) {
          const isStageCol = sampleRows.some((r) => {
            const val = (r[cIdx] || '').toLowerCase();
            return ['seed', 'series a', 'series b', 'pre-seed', 'idea', 'growth'].some((stg) => val.includes(stg));
          });
          if (isStageCol) {
            initialMapping.stageCol = `${cIdx}`;
            break;
          }
        }
      }

      // Sniff Industry Column if industry is unmapped
      if (initialMapping.industryCol === 'none') {
        for (let cIdx = 0; cIdx < headers.length; cIdx++) {
          const isIndCol = sampleRows.some((r) => {
            const val = (r[cIdx] || '').toLowerCase();
            return ['fintech', 'healthtech', 'saas', 'ai', 'cleantech', 'cybersecurity', 'biotech', 'logistics', 'edtech'].some((ind) => val.includes(ind));
          });
          if (isIndCol) {
            initialMapping.industryCol = `${cIdx}`;
            break;
          }
        }
      }

      // Fallback for Name column
      if (initialMapping.nameCol === 'none' && headers.length > 0) {
        initialMapping.nameCol = '0';
      }
    }

    setColumnMapping(initialMapping);
    synthesizeRows(dataRows, headers, initialMapping);
  };

  const processRawFile = (selectedFile) => {
    setFile(selectedFile);
    setIsProcessing(true);
    setImportResult(null);

    const fileName = selectedFile.name.toLowerCase();

    // Check if Excel Binary (.xlsx, .xls)
    if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const jsonMatrix = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
          processFileMatrix(jsonMatrix);
        } catch (err) {
          console.error('XLSX parsing error:', err);
        } finally {
          setIsProcessing(false);
        }
      };
      reader.onerror = () => setIsProcessing(false);
      reader.readAsArrayBuffer(selectedFile);
    } else {
      // CSV / TSV / Text parsing via PapaParse
      Papa.parse(selectedFile, {
        skipEmptyLines: 'greedy',
        complete: (results) => {
          try {
            processFileMatrix(results.data);
          } catch (err) {
            console.error('CSV parsing error:', err);
          } finally {
            setIsProcessing(false);
          }
        },
        error: (err) => {
          console.error('Papa parse error:', err);
          setIsProcessing(false);
        },
      });
    }
  };

  // Convert raw matrix into structured startup profiles based on columnMapping
  const synthesizeRows = (matrix, headers, mapping) => {
    const nameIdx = mapping.nameCol !== 'none' ? parseInt(mapping.nameCol, 10) : -1;
    const webIdx = mapping.websiteCol !== 'none' ? parseInt(mapping.websiteCol, 10) : -1;
    const indIdx = mapping.industryCol !== 'none' ? parseInt(mapping.industryCol, 10) : -1;
    const stgIdx = mapping.stageCol !== 'none' ? parseInt(mapping.stageCol, 10) : -1;
    const fndIdx = mapping.founderCol !== 'none' ? parseInt(mapping.founderCol, 10) : -1;
    const bgIdx = mapping.founderBackgroundCol !== 'none' ? parseInt(mapping.founderBackgroundCol, 10) : -1;
    const locIdx = mapping.locationCol !== 'none' ? parseInt(mapping.locationCol, 10) : -1;
    const descIdx = mapping.descriptionCol !== 'none' ? parseInt(mapping.descriptionCol, 10) : -1;

    const rows = [];

    matrix.forEach((cols, idx) => {
      let companyName = nameIdx !== -1 ? cols[nameIdx] || '' : cols[0] || '';
      let website = webIdx !== -1 ? cols[webIdx] || '' : '';
      let industryRaw = indIdx !== -1 ? cols[indIdx] || '' : '';
      let stageRaw = stgIdx !== -1 ? cols[stgIdx] || '' : '';
      let founderName = fndIdx !== -1 ? cols[fndIdx] || '' : '';
      let founderBackground = bgIdx !== -1 ? cols[bgIdx] || '' : '';
      let location = locIdx !== -1 ? cols[locIdx] || '' : '';
      let description = descIdx !== -1 ? cols[descIdx] || '' : '';

      // If website wasn't mapped, scan row for any cell that looks like a URL
      if (!website) {
        const detectedUrl = cols.find((c, cIdx) => cIdx !== nameIdx && isUrlLike(c));
        if (detectedUrl) website = detectedUrl;
      }

      // If companyName looks like a URL and another text column exists, swap them
      if (isUrlLike(companyName) && !website) {
        website = companyName;
        companyName = cols.find((c, cIdx) => cIdx !== nameIdx && !isUrlLike(c) && c.trim()) || 'Unnamed Startup';
      }

      const cleanName = companyName.trim();
      if (!cleanName || cleanName.toLowerCase() === 'company name' || cleanName.toLowerCase() === 'name') return;

      const combinedContext = `${cleanName} ${description} ${founderBackground}`;
      const resolvedIndustry = normalizeIndustry(industryRaw, combinedContext);
      const resolvedStage = normalizeStage(stageRaw, combinedContext);

      const resolvedFounder = founderName.trim() || `Founding Team at ${cleanName}`;
      const resolvedBg =
        founderBackground.trim() ||
        `Core leadership team with domain experience building ${cleanName}.`;
      const resolvedLocation = location.trim() || 'Location Not Specified';
      const resolvedDesc =
        description.trim() ||
        `${cleanName} — Next-generation ${resolvedIndustry} platform in ${resolvedStage} stage.`;
      const formattedWeb = website ? formatUrl(website) : '';

      rows.push({
        id: idx + 1,
        companyName: cleanName,
        industry: resolvedIndustry,
        stage: resolvedStage,
        founder: {
          name: resolvedFounder,
          background: resolvedBg,
        },
        location: resolvedLocation,
        website: formattedWeb,
        description: resolvedDesc,
        pipelineStage: 'Discovered',
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
      const count = res.count || res.importedCount || validRows.length;
      setImportResult({ ...res, importedCount: count });
      window.dispatchEvent(new CustomEvent('startup-created'));
      if (onImportSuccess) onImportSuccess(count);
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
        className="relative w-full max-w-5xl bg-white rounded-[32px] shadow-2xl border border-slate-200/80 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-6 pb-4 border-b border-slate-100 flex items-center justify-between gap-4 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#191919] text-[#9df5a9] flex items-center justify-center shadow-xs">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold font-display text-slate-900 leading-tight">
                Import Startups
              </h2>
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
                  into your database with full profiles.
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
                accept=".csv,.tsv,.txt,.xlsx,.xls"
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
                  Supports Excel (.xlsx, .xls), CSV, TSV — complete with automatic column mapping, founder details, and industry detection.
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
              <div className="p-4 rounded-2xl bg-[#f8faf8] border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-extrabold font-display text-slate-900">
                    <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
                    <span>Auto-Detected Column Mapping</span>
                    <span className="text-[10px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded-lg border border-slate-200">
                      {rawHeaders.length} columns detected
                    </span>
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

                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 text-[11px] font-display">
                  {/* Company Name Col */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Name:</span>
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

                  {/* Industry Col */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Industry:</span>
                    <select
                      value={columnMapping.industryCol}
                      onChange={(e) => handleMappingChange('industryCol', e.target.value)}
                      className="w-full px-2 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-900 focus:outline-none"
                    >
                      <option value="none">Auto-Infer</option>
                      {rawHeaders.map((h, i) => (
                        <option key={i} value={`${i}`}>
                          {h}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Stage Col */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Stage:</span>
                    <select
                      value={columnMapping.stageCol}
                      onChange={(e) => handleMappingChange('stageCol', e.target.value)}
                      className="w-full px-2 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-900 focus:outline-none"
                    >
                      <option value="none">Auto-Infer</option>
                      {rawHeaders.map((h, i) => (
                        <option key={i} value={`${i}`}>
                          {h}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Founder Name Col */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Founder:</span>
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

                  {/* Founder Background Col */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Founder Bio:</span>
                    <select
                      value={columnMapping.founderBackgroundCol}
                      onChange={(e) => handleMappingChange('founderBackgroundCol', e.target.value)}
                      className="w-full px-2 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-900 focus:outline-none"
                    >
                      <option value="none">Auto-Generate</option>
                      {rawHeaders.map((h, i) => (
                        <option key={i} value={`${i}`}>
                          {h}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Website Col */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Website:</span>
                    <select
                      value={columnMapping.websiteCol}
                      onChange={(e) => handleMappingChange('websiteCol', e.target.value)}
                      className="w-full px-2 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-900 focus:outline-none"
                    >
                      <option value="none">Auto-Detect</option>
                      {rawHeaders.map((h, i) => (
                        <option key={i} value={`${i}`}>
                          {h}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Location Col */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Location:</span>
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

                  {/* Description Col */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Description:</span>
                    <select
                      value={columnMapping.descriptionCol}
                      onChange={(e) => handleMappingChange('descriptionCol', e.target.value)}
                      className="w-full px-2 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-900 focus:outline-none"
                    >
                      <option value="none">Auto-Generate</option>
                      {rawHeaders.map((h, i) => (
                        <option key={i} value={`${i}`}>
                          {h}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Data Table Preview */}
              <div className="border border-slate-200/80 rounded-2xl overflow-hidden bg-white shadow-xs">
                <div className="overflow-x-auto max-h-72">
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-[#f4f7f4] text-[10px] font-extrabold font-display uppercase tracking-wider text-slate-600 sticky top-0 border-b border-slate-200 z-10">
                      <tr>
                        <th className="px-3 py-2.5">Status</th>
                        <th className="px-3 py-2.5">Company Name</th>
                        <th className="px-3 py-2.5">Industry</th>
                        <th className="px-3 py-2.5">Stage</th>
                        <th className="px-3 py-2.5">Founder</th>
                        <th className="px-3 py-2.5">Founder Bio</th>
                        <th className="px-3 py-2.5">Website</th>
                        <th className="px-3 py-2.5">Location</th>
                        <th className="px-3 py-2.5">Description</th>
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
                          <td className="px-3 py-2 whitespace-nowrap">
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-[#9df5a9] text-slate-950">
                              Ready
                            </span>
                          </td>

                          {/* Company Name (Editable) */}
                          <td className="px-3 py-2">
                            <input
                              type="text"
                              value={row.companyName}
                              onChange={(e) => handleRowFieldChange(row.id, 'companyName', e.target.value)}
                              placeholder="Company Name"
                              className="w-28 px-2 py-1 rounded-lg border border-slate-200 text-[11px] font-bold text-slate-900 bg-white"
                            />
                          </td>

                          {/* Industry */}
                          <td className="px-3 py-2">
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
                          <td className="px-3 py-2">
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
                          <td className="px-3 py-2">
                            <input
                              type="text"
                              value={row.founder?.name || ''}
                              onChange={(e) => handleRowFieldChange(row.id, 'founder.name', e.target.value)}
                              placeholder="Founder Name"
                              className="w-24 px-2 py-1 rounded-lg border border-slate-200 text-[11px] font-bold text-slate-900 bg-white"
                            />
                          </td>

                          {/* Founder Bio (Editable) */}
                          <td className="px-3 py-2">
                            <input
                              type="text"
                              value={row.founder?.background || ''}
                              onChange={(e) => handleRowFieldChange(row.id, 'founder.background', e.target.value)}
                              placeholder="Founder Bio / Background"
                              className="w-36 px-2 py-1 rounded-lg border border-slate-200 text-[11px] text-slate-700 bg-white truncate"
                              title={row.founder?.background}
                            />
                          </td>

                          {/* Website (Editable) */}
                          <td className="px-3 py-2">
                            <input
                              type="text"
                              value={row.website || ''}
                              onChange={(e) => handleRowFieldChange(row.id, 'website', e.target.value)}
                              placeholder="https://..."
                              className="w-28 px-2 py-1 rounded-lg border border-slate-200 text-[11px] text-emerald-700 bg-white font-medium"
                            />
                          </td>

                          {/* Location (Editable) */}
                          <td className="px-3 py-2">
                            <input
                              type="text"
                              value={row.location || ''}
                              onChange={(e) => handleRowFieldChange(row.id, 'location', e.target.value)}
                              placeholder="Location"
                              className="w-24 px-2 py-1 rounded-lg border border-slate-200 text-[11px] text-slate-800 bg-white font-medium"
                            />
                          </td>

                          {/* Description (Editable) */}
                          <td className="px-3 py-2">
                            <input
                              type="text"
                              value={row.description || ''}
                              onChange={(e) => handleRowFieldChange(row.id, 'description', e.target.value)}
                              placeholder="Description"
                              className="w-40 px-2 py-1 rounded-lg border border-slate-200 text-[11px] text-slate-700 bg-white truncate"
                              title={row.description}
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
                              <Trash2 className="w-3.5 h-3.5" />
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
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-2xl text-xs font-black font-display text-slate-950 bg-[#9df5a9] hover:bg-[#8ee59a] shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
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
