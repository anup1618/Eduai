import React, { useState, useRef } from 'react';
import { useCampusData } from '../context/CampusDataContext';
import {
  DatasetCategory,
  CATEGORY_SCHEMAS,
  parseSpreadsheet,
  validateDataset,
  exportDatasetTemplate,
  ValidationResult,
  IngestionResult,
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
  Check,
  Sparkles,
  Server,
  UserPlus,
  Users,
  ShieldCheck,
  FileText,
} from 'lucide-react';

export const DataIntegrationPage: React.FC = () => {
  const {
    students,
    mergeDataRecords,
    dbStatus,
    dbHealth,
    isSyncing,
    refreshFromDatabase,
    uploadSpreadsheetToBackend,
    currentUser,
  } = useCampusData();

  // Category state (default to roster for adding complete new students)
  const [selectedCategory, setSelectedCategory] = useState<DatasetCategory>('roster');
  const [conflictMode, setConflictMode] = useState<'merge' | 'overwrite' | 'preserve'>('merge');

  // File & parsing state
  const [uploadedFileInfo, setUploadedFileInfo] = useState<{
    name: string;
    size: string;
    type: 'excel' | 'csv';
  } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCommitting, setIsCommitting] = useState(false);
  const [rawBase64, setRawBase64] = useState<string>('');

  const [parsedHeaders, setParsedHeaders] = useState<string[]>([]);
  const [parsedRows, setParsedRows] = useState<Record<string, string>[]>([]);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [ingestionResult, setIngestionResult] = useState<IngestionResult | null>(null);
  const [importStatus, setImportStatus] = useState<'idle' | 'validated' | 'success' | 'error'>('idle');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Format file size
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Process File buffer (Excel or CSV)
  const processSpreadsheetBuffer = (buffer: ArrayBuffer | string, fileName: string, fileSize: number) => {
    try {
      setIsProcessing(true);
      const isXlsx = fileName.endsWith('.xlsx') || fileName.endsWith('.xls');
      setUploadedFileInfo({
        name: fileName,
        size: formatBytes(fileSize),
        type: isXlsx ? 'excel' : 'csv',
      });

      // Convert ArrayBuffer to Base64 for secure backend transport
      if (typeof buffer !== 'string') {
        const bytes = new Uint8Array(buffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        setRawBase64(btoa(binary));
      } else {
        setRawBase64(buffer);
      }

      const { headers, rows } = parseSpreadsheet(buffer);
      setParsedHeaders(headers);
      setParsedRows(rows);

      const validated = validateDataset(selectedCategory, headers, rows);
      setValidationResult(validated);
      setImportStatus('validated');
      setIngestionResult(null);
    } catch (err: any) {
      console.error('Failed to parse spreadsheet file:', err);
      setImportStatus('error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle file input change
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      const arrayBuffer = event.target?.result as ArrayBuffer;
      if (arrayBuffer) {
        processSpreadsheetBuffer(arrayBuffer, file.name, file.size);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Handle Drag & Drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      const arrayBuffer = event.target?.result as ArrayBuffer;
      if (arrayBuffer) {
        processSpreadsheetBuffer(arrayBuffer, file.name, file.size);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Quick load of sample dataset for the selected category
  const loadSampleDataset = () => {
    const sample = CSV_TEMPLATES[selectedCategory]?.sample || '';
    setUploadedFileInfo({
      name: `${selectedCategory}_sample_dataset.csv`,
      size: `${sample.length} bytes`,
      type: 'csv',
    });
    processSpreadsheetBuffer(sample, `${selectedCategory}_sample_dataset.csv`, sample.length);
  };

  // Commit merged records into CampusDataContext & MongoDB Atlas (Secure Backend Ingestion)
  const executeMerge = async () => {
    if (!validationResult || validationResult.parsedRecords.length === 0) return;

    setIsCommitting(true);
    try {
      if (rawBase64 && uploadedFileInfo) {
        // Direct secure backend upload via authenticated endpoint
        const serverRes = await uploadSpreadsheetToBackend({
          fileName: uploadedFileInfo.name,
          fileData: rawBase64,
          format: uploadedFileInfo.type === 'excel' ? 'xlsx' : 'csv',
          conflictMode,
        });

        // Also update local validated records
        const localRes = await mergeDataRecords(selectedCategory, validationResult.parsedRecords, conflictMode);
        setIngestionResult({
          ...localRes,
          newStudentsAdded: serverRes?.result?.newStudentsAdded ?? localRes.newStudentsAdded,
          updatedStudents: serverRes?.result?.updatedStudents ?? localRes.updatedStudents,
          dbSync: {
            success: true,
            upserted: serverRes?.result?.newStudentsAdded ?? localRes.newStudentsAdded,
            modified: serverRes?.result?.updatedStudents ?? localRes.updatedStudents,
          },
        });
        setImportStatus('success');
      } else {
        const res = await mergeDataRecords(selectedCategory, validationResult.parsedRecords, conflictMode);
        setIngestionResult(res);
        setImportStatus('success');
      }
    } catch (err: any) {
      console.error('Error committing dataset:', err);
      setImportStatus('error');
    } finally {
      setIsCommitting(false);
    }
  };

  // Count how many records will be new students vs existing updates
  const newStudentCandidates = React.useMemo(() => {
    if (!validationResult) return 0;
    const existingIds = new Set(students.map(s => s.student_id.toUpperCase()));
    return validationResult.parsedRecords.filter(r => !existingIds.has(r.student_id.toUpperCase())).length;
  }, [validationResult, students]);

  return (
    <div className="space-y-6">
      {/* Top Banner: MongoDB Atlas Status & Campus Roster Health */}
      <div className="spec-card rounded-2xl p-5 border border-border bg-card shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
            <Server className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-text">Database & Bulk Integration Engine</h2>
              {dbStatus === 'connected' ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  MongoDB Atlas Connected
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  Local Sync Mode
                </span>
              )}
            </div>
            <p className="text-xs text-text-muted mt-0.5">
              Target Cluster: <code className="font-mono text-text font-medium">{dbHealth?.host || 'edupulse.qvemhsb.mongodb.net'}</code> &bull; Total records in MongoDB:{' '}
              <strong className="text-text">{dbHealth?.studentCount ?? students.length}</strong> students
            </p>
            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border/60 text-[11px] text-text-muted">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>
                <strong>Role-Based Access Protected:</strong> Only authorized Institutional Administrators can upload or write student data. Student accounts are restricted from accessing or querying other students' academic records.
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            onClick={() => refreshFromDatabase()}
            disabled={isSyncing}
            className="w-full md:w-auto px-3.5 py-2 rounded-xl text-xs font-semibold border border-border hover:bg-card-hover text-text transition flex items-center justify-center gap-2 disabled:opacity-50"
            title="Refresh latest student records from MongoDB Atlas"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-teal-600' : 'text-text-muted'}`} />
            <span>{isSyncing ? 'Syncing...' : 'Sync with MongoDB'}</span>
          </button>
        </div>
      </div>

      {/* Domain Category Selector Tabs */}
      <div className="spec-card rounded-2xl p-5 border border-border bg-card shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
          <div>
            <h3 className="text-sm font-bold text-text flex items-center gap-2">
              <Database className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              Select Ingestion Schema & Target
            </h3>
            <p className="text-xs text-text-muted mt-0.5">
              Choose <strong>Full Student Roster</strong> to add brand new students or select a domain metric to augment existing profiles.
            </p>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-text-muted bg-card-hover px-3 py-1.5 rounded-lg border border-border">
            <Users className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span>Active profiles: <strong className="text-text">{students.length}</strong></span>
          </div>
        </div>

        {/* Tab buttons */}
        <div className="flex flex-wrap gap-2 pt-1">
          {(Object.keys(CATEGORY_SCHEMAS) as DatasetCategory[]).map(cat => {
            const isRoster = cat === 'roster';
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  setImportStatus('idle');
                  setValidationResult(null);
                  setIngestionResult(null);
                  setUploadedFileInfo(null);
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold capitalize transition flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-teal-600 text-white shadow-md'
                    : 'bg-card-hover text-text hover:bg-muted border border-border/60'
                }`}
              >
                {isRoster && <Sparkles className="w-3.5 h-3.5 text-amber-300" />}
                {CATEGORY_SCHEMAS[cat].name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Upload Dropzone & Institutional Templates */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Upload Zone (Supports .xlsx, .xls, .csv) */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`lg:col-span-2 rounded-2xl border-2 border-dashed p-8 text-center flex flex-col items-center justify-center space-y-4 transition ${
            isDragging
              ? 'border-teal-500 bg-teal-500/10'
              : 'border-border bg-card hover:border-teal-500/70'
          }`}
        >
          <div className="p-4 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
            <UploadCloud className="w-8 h-8" />
          </div>

          <div className="max-w-md space-y-1">
            <h4 className="text-sm font-bold text-text">
              Upload {CATEGORY_SCHEMAS[selectedCategory].name}
            </h4>
            <p className="text-xs text-text-muted">
              Drag & drop your <strong>Excel (.xlsx, .xls)</strong> or <strong>CSV (.csv)</strong> file here, or browse from your computer.
            </p>
            <div className="flex items-center justify-center gap-2 pt-1 text-[11px] text-text-muted">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-medium">
                <FileSpreadsheet className="w-3 h-3" /> Excel (.xlsx, .xls)
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 font-medium">
                <FileText className="w-3 h-3" /> CSV (.csv)
              </span>
            </div>
          </div>

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"
            onChange={handleFileUpload}
            className="hidden"
          />

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md transition flex items-center gap-2"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Browse Spreadsheet File</span>
            </button>
            <button
              type="button"
              onClick={loadSampleDataset}
              className="px-4 py-2.5 rounded-xl border border-border hover:bg-card-hover text-text text-xs font-semibold transition flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Load Verified Sample</span>
            </button>
          </div>

          {uploadedFileInfo && (
            <div className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-teal-500/10 border border-teal-500/20 text-xs font-medium text-teal-700 dark:text-teal-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span>
                Loaded <strong>{uploadedFileInfo.name}</strong> ({uploadedFileInfo.size})
              </span>
            </div>
          )}
        </div>

        {/* Institutional Templates Download Card */}
        <div className="spec-card rounded-2xl border border-border p-5 bg-card shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
              Official Schemas
            </span>
            <h4 className="text-sm font-bold text-text">Institutional Format Templates</h4>
            <p className="text-xs text-text-muted leading-relaxed">
              Download standard formats for <strong>{CATEGORY_SCHEMAS[selectedCategory].name}</strong> formatted and ready for student data entry.
            </p>
          </div>

          {/* Download Buttons for Excel & CSV */}
          <div className="space-y-2.5">
            <div className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">
              Download Blank Templates
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => exportDatasetTemplate(selectedCategory, 'xlsx', 'template')}
                className="py-2 px-3 text-xs font-semibold rounded-xl border border-border hover:bg-card-hover text-text flex items-center justify-center gap-1.5 transition"
                title="Download blank Excel spreadsheet"
              >
                <Download className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Excel (.xlsx)</span>
              </button>
              <button
                onClick={() => exportDatasetTemplate(selectedCategory, 'csv', 'template')}
                className="py-2 px-3 text-xs font-semibold rounded-xl border border-border hover:bg-card-hover text-text flex items-center justify-center gap-1.5 transition"
                title="Download blank CSV spreadsheet"
              >
                <Download className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>CSV (.csv)</span>
              </button>
            </div>

            <div className="text-[11px] font-semibold text-text-muted uppercase tracking-wider pt-1">
              Download Sample Datasets
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => exportDatasetTemplate(selectedCategory, 'xlsx', 'sample')}
                className="py-2 px-3 text-xs font-semibold rounded-xl border border-border hover:bg-card-hover text-text flex items-center justify-center gap-1.5 transition"
                title="Download sample Excel with realistic student records"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Sample .xlsx</span>
              </button>
              <button
                onClick={() => exportDatasetTemplate(selectedCategory, 'csv', 'sample')}
                className="py-2 px-3 text-xs font-semibold rounded-xl border border-border hover:bg-card-hover text-text flex items-center justify-center gap-1.5 transition"
                title="Download sample CSV with realistic student records"
              >
                <FileText className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Sample .csv</span>
              </button>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-card-hover border border-border/80 text-[11px] text-text-muted flex items-start gap-2">
            <Info className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
            <span>
              Files support both new student creation and updates. Student matching key: <code className="font-mono text-text">student_id</code>.
            </span>
          </div>
        </div>
      </div>

      {/* Staging Validation & Audit Panel */}
      {validationResult && (
        <div className="spec-card rounded-2xl border border-border p-6 bg-card shadow-sm space-y-5 animate-in fade-in duration-200">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
            <div>
              <h4 className="text-sm font-bold text-text flex items-center gap-2">
                <span>Staging Ingestion Audit</span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-500/20">
                  {validationResult.totalRows} Rows Loaded
                </span>
                {uploadedFileInfo && (
                  <span className="text-xs font-mono text-text-muted">
                    ({uploadedFileInfo.name})
                  </span>
                )}
              </h4>
              <p className="text-xs text-text-muted mt-0.5">
                Evaluated against campus schemas, valid ranges, and duplicate student keys.
              </p>
            </div>

            {/* Conflict Resolution Mode */}
            <div className="flex items-center gap-2 text-xs">
              <span className="font-semibold text-text-muted">On Key Match:</span>
              <select
                value={conflictMode}
                onChange={e => setConflictMode(e.target.value as any)}
                className="bg-card border border-border rounded-xl px-3 py-1.5 text-text text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-teal-500"
              >
                <option value="merge">Merge (Fill Missing Fields Only)</option>
                <option value="overwrite">Overwrite Existing Values</option>
                <option value="preserve">Preserve Existing (Ignore Staging)</option>
              </select>
            </div>
          </div>

          {/* Validation Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <span className="text-[10px] font-bold uppercase text-emerald-600 dark:text-emerald-400">
                Valid Records
              </span>
              <div className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-300 mt-0.5">
                {validationResult.validRows}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <span className="text-[10px] font-bold uppercase text-blue-600 dark:text-blue-400 flex items-center gap-1">
                <UserPlus className="w-3 h-3" /> New Students
              </span>
              <div className="text-2xl font-extrabold text-blue-700 dark:text-blue-300 mt-0.5">
                {newStudentCandidates}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/20">
              <span className="text-[10px] font-bold uppercase text-purple-600 dark:text-purple-400">
                Existing Updates
              </span>
              <div className="text-2xl font-extrabold text-purple-700 dark:text-purple-300 mt-0.5">
                {validationResult.validRows - newStudentCandidates}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20">
              <span className="text-[10px] font-bold uppercase text-rose-600 dark:text-rose-400">
                Invalid Rows
              </span>
              <div className="text-2xl font-extrabold text-rose-700 dark:text-rose-300 mt-0.5">
                {validationResult.invalidRows}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <span className="text-[10px] font-bold uppercase text-amber-600 dark:text-amber-400">
                Duplicate IDs
              </span>
              <div className="text-2xl font-extrabold text-amber-700 dark:text-amber-300 mt-0.5">
                {validationResult.duplicateIds.length}
              </div>
            </div>
          </div>

          {/* Error Summary if any */}
          {validationResult.errors.length > 0 && (
            <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-500/10 space-y-2 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-rose-700 dark:text-rose-300">
                <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                <span>Validation Alerts & Range Violations ({validationResult.errors.length})</span>
              </div>
              <div className="max-h-36 overflow-y-auto space-y-1.5 pr-2">
                {validationResult.errors.map((err, i) => (
                  <div key={i} className="text-rose-600 dark:text-rose-300 text-[11px] leading-relaxed">
                    Row {err.row} [<strong>{err.student_id}</strong> &bull; {err.field}]: {err.message}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Staging Preview Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h5 className="text-xs font-bold text-text uppercase tracking-wider">
                Staging Preview (First 5 Rows)
              </h5>
              <span className="text-[11px] text-text-muted">
                Showing {Math.min(parsedRows.length, 5)} of {parsedRows.length} total rows
              </span>
            </div>
            <div className="border border-border rounded-xl overflow-x-auto bg-card">
              <table className="w-full text-left text-xs">
                <thead className="bg-card-hover text-text-muted border-b border-border">
                  <tr>
                    {parsedHeaders.map(h => (
                      <th key={h} className="py-2.5 px-3 font-semibold text-[11px] uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {parsedRows.slice(0, 5).map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-card-hover/60 transition">
                      {parsedHeaders.map(h => (
                        <td key={h} className="py-2.5 px-3 font-mono text-[11px] text-text">
                          {row[h] !== '' && row[h] !== undefined ? (
                            row[h]
                          ) : (
                            <span className="text-text-muted/50 italic">null</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Primary Action Button: Commit to MongoDB Atlas */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-border">
            <div className="text-xs text-text-muted flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span>
                All valid rows will be committed directly to MongoDB Atlas cluster and synced across the campus dashboard.
              </span>
            </div>

            <button
              onClick={executeMerge}
              disabled={validationResult.validRows === 0 || isCommitting}
              className="w-full sm:w-auto px-6 py-3 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md flex items-center justify-center gap-2 transition"
            >
              {isCommitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Committing to MongoDB Atlas...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    Commit & Save {validationResult.validRows} Records to MongoDB Atlas
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Ingestion & MongoDB Atlas Success Card */}
      {ingestionResult && importStatus === 'success' && (
        <div className="spec-card rounded-2xl p-6 border border-emerald-500/30 bg-emerald-500/10 shadow-sm space-y-4 animate-in fade-in duration-300">
          <div className="flex items-start gap-3.5">
            <div className="p-3 rounded-xl bg-emerald-500 text-white shadow-sm shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-bold text-emerald-800 dark:text-emerald-300">
                Dataset Ingested & Saved to MongoDB Atlas Successfully!
              </h4>
              <p className="text-xs text-emerald-700 dark:text-emerald-400 leading-relaxed">
                The spreadsheet data was parsed, validated, and persisted. All student risk profiles, intervention triggers, and telemetry are immediately updated.
              </p>
            </div>
          </div>

          {/* Sync Stats Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
            <div className="p-3 rounded-xl bg-card border border-emerald-500/20">
              <span className="text-[10px] font-bold uppercase text-text-muted">New Students Added</span>
              <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">
                {ingestionResult.newStudentsAdded}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-card border border-emerald-500/20">
              <span className="text-[10px] font-bold uppercase text-text-muted">Students Updated</span>
              <div className="text-xl font-extrabold text-teal-600 dark:text-teal-400 mt-0.5">
                {ingestionResult.updatedStudents}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-card border border-emerald-500/20">
              <span className="text-[10px] font-bold uppercase text-text-muted">Total Campus Roster</span>
              <div className="text-xl font-extrabold text-text mt-0.5">
                {ingestionResult.mergedStudents.length}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-card border border-emerald-500/20">
              <span className="text-[10px] font-bold uppercase text-text-muted">MongoDB Sync Status</span>
              <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                {ingestionResult.dbSync?.success ? 'Cluster Updated' : 'Local Saved'}
              </div>
            </div>
          </div>

          {ingestionResult.unmatchedRows.length > 0 && (
            <div className="text-[11px] text-text-muted pt-1">
              Notice: {ingestionResult.unmatchedRows.length} rows with unknown IDs could not be matched to existing profiles in this category.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DataIntegrationPage;
