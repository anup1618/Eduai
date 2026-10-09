import React, { useState } from 'react';
import { useCampusData } from '../context/CampusDataContext';
import {
  DatasetCategory,
  CATEGORY_SCHEMAS,
  parseCSV,
  validateDataset,
  ValidationResult,
  MergeResult,
} from '../engine/dataValidator';
import { CSV_TEMPLATES } from '../data/sampleCsvs';
import {
  UploadCloud,
  FileSpreadsheet,
  Download,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Database,
  ArrowRight,
  Info,
} from 'lucide-react';

export const DataIntegrationPage: React.FC = () => {
  const { students, mergeDataRecords } = useCampusData();

  const [selectedCategory, setSelectedCategory] = useState<DatasetCategory>('academic');
  const [conflictMode, setConflictMode] = useState<'merge' | 'overwrite' | 'preserve'>('merge');

  // CSV parsing state
  const [rawCsvText, setRawCsvText] = useState('');
  const [parsedHeaders, setParsedHeaders] = useState<string[]>([]);
  const [parsedRows, setParsedRows] = useState<Record<string, string>[]>([]);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [mergeResult, setMergeResult] = useState<MergeResult | null>(null);
  const [importStatus, setImportStatus] = useState<'idle' | 'validated' | 'success' | 'error'>('idle');

  // Handle CSV file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      const text = event.target?.result as string;
      setRawCsvText(text);
      processCSVContent(text);
    };
    reader.readAsText(file);
  };

  const processCSVContent = (content: string) => {
    const { headers, rows } = parseCSV(content);
    setParsedHeaders(headers);
    setParsedRows(rows);

    const validated = validateDataset(selectedCategory, headers, rows);
    setValidationResult(validated);
    setImportStatus('validated');
    setMergeResult(null);
  };

  const loadSampleDataset = () => {
    const sample = CSV_TEMPLATES[selectedCategory]?.sample || '';
    setRawCsvText(sample);
    processCSVContent(sample);
  };

  const downloadTemplate = (type: 'template' | 'sample') => {
    const templateData = CSV_TEMPLATES[selectedCategory];
    if (!templateData) return;

    const content = type === 'template' ? templateData.template : templateData.sample;
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${type}_${selectedCategory}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const executeMerge = () => {
    if (!validationResult || validationResult.parsedRecords.length === 0) return;

    const res = mergeDataRecords(selectedCategory, validationResult.parsedRecords, conflictMode);
    setMergeResult(res);
    setImportStatus('success');
  };

  return (
    <div className="space-y-6">
      {/* Category Selector Tabs */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
            <Database className="w-4 h-4 text-teal-600" />
            Select Domain Dataset to Ingest
          </h3>
          <span className="text-xs text-slate-500">
            Current campus database: <strong className="text-slate-900">{students.length}</strong> student profiles
          </span>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          {(Object.keys(CATEGORY_SCHEMAS) as DatasetCategory[]).map(cat => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                setImportStatus('idle');
                setValidationResult(null);
                setMergeResult(null);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition ${
                selectedCategory === cat
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {CATEGORY_SCHEMAS[cat].name}
            </button>
          ))}
        </div>
      </div>

      {/* Upload & Template Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Dropzone */}
        <div className="md:col-span-2 bg-white rounded-xl border-2 border-dashed border-slate-300 p-6 text-center flex flex-col items-center justify-center space-y-3 hover:border-teal-500 transition">
          <div className="p-3 rounded-full bg-teal-50 text-teal-600">
            <UploadCloud className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">
              Upload {CATEGORY_SCHEMAS[selectedCategory].name} CSV
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Must include primary matching key <code>student_id</code>
            </p>
          </div>

          <label className="cursor-pointer px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-sm transition">
            <span>Browse CSV File</span>
            <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>

        {/* Templates & Quick Sample Ingest */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm flex flex-col justify-between space-y-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Institutional Templates
            </span>
            <h4 className="text-sm font-bold text-slate-900 mt-1">Verified Format Schemas</h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Download standard schemas or load verified sample records into the staging preview.
            </p>
          </div>

          <div className="space-y-2 pt-2">
            <button
              onClick={() => downloadTemplate('template')}
              className="w-full py-1.5 px-3 text-xs font-semibold rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Blank Template</span>
            </button>
            <button
              onClick={() => downloadTemplate('sample')}
              className="w-full py-1.5 px-3 text-xs font-semibold rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-1.5"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Download Sample CSV</span>
            </button>
            <button
              onClick={loadSampleDataset}
              className="w-full py-2 px-3 text-xs font-bold rounded-lg bg-teal-50 text-teal-800 border border-teal-200 hover:bg-teal-100 flex items-center justify-center gap-1.5 shadow-sm"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Load Verified Sample Demo</span>
            </button>
          </div>
        </div>
      </div>

      {/* Validation & Conflict Configuration Bar */}
      {validationResult && (
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span>Staging Ingestion Audit</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                  {validationResult.totalRows} Rows Ingested
                </span>
              </h4>
              <p className="text-xs text-slate-500">
                Validated against institutional range rules (CGPA 0–10, marks 0–100, attendance 0–100).
              </p>
            </div>

            {/* Conflict resolution select */}
            <div className="flex items-center gap-2 text-xs">
              <span className="font-semibold text-slate-600">On Conflict:</span>
              <select
                value={conflictMode}
                onChange={e => setConflictMode(e.target.value as any)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-800 font-semibold focus:outline-none"
              >
                <option value="merge">Merge (Fill missing only)</option>
                <option value="overwrite">Overwrite existing records</option>
                <option value="preserve">Preserve existing</option>
              </select>
            </div>
          </div>

          {/* Validation Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200/80">
              <span className="text-[10px] font-bold uppercase text-emerald-700">Valid Rows</span>
              <div className="text-xl font-extrabold text-emerald-900 mt-0.5">
                {validationResult.validRows}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200/80">
              <span className="text-[10px] font-bold uppercase text-rose-700">Invalid Rows</span>
              <div className="text-xl font-extrabold text-rose-900 mt-0.5">
                {validationResult.invalidRows}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200/80">
              <span className="text-[10px] font-bold uppercase text-amber-700">Duplicate IDs</span>
              <div className="text-xl font-extrabold text-amber-900 mt-0.5">
                {validationResult.duplicateIds.length}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] font-bold uppercase text-slate-700">Missing Key Fields</span>
              <div className="text-xl font-extrabold text-slate-900 mt-0.5">
                {validationResult.missingRequiredFields.length}
              </div>
            </div>
          </div>

          {/* Validation Warnings & Errors */}
          {validationResult.errors.length > 0 && (
            <div className="p-3.5 rounded-xl border border-rose-200 bg-rose-50/50 space-y-2 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-rose-900">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Range & Schema Audit Discrepancies ({validationResult.errors.length})</span>
              </div>
              <div className="max-h-36 overflow-y-auto space-y-1">
                {validationResult.errors.map((err, i) => (
                  <div key={i} className="text-rose-800 text-[11px]">
                    Row {err.row} [<strong>{err.student_id}</strong>]: {err.message}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Dataset Preview Table */}
          <div className="space-y-2">
            <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Staging Preview (First 5 Rows)
            </h5>
            <div className="border border-slate-200 rounded-xl overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                  <tr>
                    {parsedHeaders.map(h => (
                      <th key={h} className="py-2 px-3 font-semibold">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {parsedRows.slice(0, 5).map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-slate-50/60">
                      {parsedHeaders.map(h => (
                        <td key={h} className="py-2 px-3 font-mono text-[11px] text-slate-700">
                          {row[h] || <span className="text-slate-300 italic">null</span>}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Action Button: Execute Ingestion */}
          <div className="flex justify-end pt-2">
            <button
              onClick={executeMerge}
              disabled={validationResult.validRows === 0}
              className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-2 transition"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Commit & Merge {validationResult.validRows} Records Into Platform</span>
            </button>
          </div>
        </div>
      )}

      {/* Success Notification */}
      {mergeResult && importStatus === 'success' && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <h5 className="font-bold text-emerald-900">Ingestion Committed Successfully!</h5>
            <p className="text-emerald-800 leading-relaxed">
              Updated <strong>{mergeResult.updatedStudents}</strong> student profiles with verified {selectedCategory} telemetry.
              {mergeResult.newStudentsAdded > 0 && ` Added ${mergeResult.newStudentsAdded} newly registered students.`}
              {mergeResult.unmatchedRows.length > 0 && ` Note: ${mergeResult.unmatchedRows.length} unmatched student IDs were safely bypassed.`}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
