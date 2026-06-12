// src/pages/OcrScanner.jsx
// HealthSync — Medical Report OCR Scanner
// Supports: JPG, JPEG, PNG images and PDF files
// Uses: Tesseract.js (CDN) for local OCR, Gemini AI for medical summary
// No local npm packages required for OCR/PDF — loaded from CDN at runtime

import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DocumentArrowUpIcon,
  DocumentTextIcon,
  ClipboardDocumentIcon,
  ArrowDownTrayIcon,
  SparklesIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  MagnifyingGlassIcon,
  BeakerIcon,
  ShieldExclamationIcon,
  InformationCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { ocrAiService } from '../services/ocrAiService';
import { useTranslation } from 'react-i18next';

// ─── constants ───────────────────────────────────────────────────────────────
const ACCEPTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
const ACCEPTED_EXT   = ['.jpg', '.jpeg', '.png', '.pdf'];
const MAX_SIZE_MB    = 20;
const TESSERACT_CDN  = 'https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.esm.min.js';
const PDFJS_VERSION  = '4.4.168';

// ─── helpers ─────────────────────────────────────────────────────────────────
function formatBytes(bytes) {
  if (bytes < 1024)           return `${bytes} B`;
  if (bytes < 1024 * 1024)   return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Dynamically load Tesseract.js from CDN and run OCR on an image File/Blob */
async function runTesseractOcr(imageInput, onProgress) {
  const mod = await import(/* @vite-ignore */ TESSERACT_CDN);
  // CDN ESM bundles expose exports on .default
  const Tesseract = mod.default || mod;

  if (typeof Tesseract.recognize !== 'function' && typeof Tesseract.createWorker !== 'function') {
    throw new Error('Tesseract.js failed to load from CDN. Please check your internet connection.');
  }

  // Use createWorker for progress tracking — corePath must be a directory URL, not a file
  const createWorker = Tesseract.createWorker;
  const worker = await createWorker('eng', 1, {
    workerPath: 'https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/worker.min.js',
    corePath:   'https://cdn.jsdelivr.net/npm/tesseract.js-core@5.1.1',
    langPath:   'https://tessdata.projectnaptha.com/4.0.0',
    logger: (m) => {
      if (m.status === 'recognizing text' && onProgress) {
        onProgress(Math.round(m.progress * 90));
      }
    },
  });

  try {
    const result = await worker.recognize(imageInput);
    return {
      text:       result.data.text       || '',
      confidence: result.data.confidence || 0,
    };
  } finally {
    // Always terminate worker — even on error — to prevent memory/crash leaks
    await worker.terminate().catch(() => {});
  }
}


/** Render first page of a PDF to a canvas Blob using pdf.js from CDN */
async function pdfToImageBlob(file) {
  const pdfjsLib = await import(
    /* @vite-ignore */
    `https://cdn.jsdelivr.net/npm/pdfjs-dist@${PDFJS_VERSION}/build/pdf.min.mjs`
  );
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    `https://cdn.jsdelivr.net/npm/pdfjs-dist@${PDFJS_VERSION}/build/pdf.worker.min.mjs`;

  const arrayBuffer = await file.arrayBuffer();
  const pdf         = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const page        = await pdf.getPage(1);
  const viewport    = page.getViewport({ scale: 2.0 }); // 2× for better OCR

  const canvas  = document.createElement('canvas');
  canvas.width  = viewport.width;
  canvas.height = viewport.height;
  await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;

  return new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
}

// ─── sub-components ──────────────────────────────────────────────────────────
function UploadZone({ onFileSelect, isDragging, setIsDragging }) {
  const { t } = useTranslation();
  const inputRef = useRef(null);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setIsDragging(false);
      const f = e.dataTransfer.files[0];
      if (f) onFileSelect(f);
    },
    [onFileSelect, setIsDragging]
  );

  return (
    <motion.div
      onDrop={handleDrop}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onClick={() => inputRef.current?.click()}
      animate={{
        borderColor:     isDragging ? '#2563eb' : '#94a3b8',
        backgroundColor: isDragging ? 'rgba(37,99,235,0.06)' : 'transparent',
        scale:           isDragging ? 1.01 : 1,
      }}
      transition={{ duration: 0.2 }}
      className="relative flex flex-col items-center justify-center gap-4 sm:gap-5 rounded-3xl border-2 border-dashed border-slate-300 dark:border-slate-600 p-6 sm:p-12 cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors duration-300 select-none"
    >
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_EXT.join(',')}
        className="hidden"
        onChange={(e) => e.target.files[0] && onFileSelect(e.target.files[0])}
      />

      <motion.div
        animate={{ y: isDragging ? -8 : 0 }}
        transition={{ duration: 0.3 }}
        className="h-20 w-20 rounded-2xl bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center shadow-soft-lg"
      >
        <DocumentArrowUpIcon className="h-10 w-10 text-white" />
      </motion.div>

      <div className="text-center space-y-2">
        <p className="text-lg font-semibold text-slate-800 dark:text-slate-200">
          {isDragging ? t('ocr.drop', { defaultValue: 'Drop your file here' }) : t('ocr.uploadTitle', { defaultValue: 'Upload Medical Report' })}
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-400">{t('ocr.dragDrop', { defaultValue: 'Drag & drop or click to browse' })}</p>
        <div className="flex flex-wrap justify-center gap-2 pt-1">
          {['JPG', 'JPEG', 'PNG', 'PDF'].map((ext) => (
            <span
              key={ext}
              className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
            >
              {ext}
            </span>
          ))}
        </div>
        <p className="text-xs text-slate-400 dark:text-slate-500 pt-1">Max {MAX_SIZE_MB} MB</p>
      </div>
    </motion.div>
  );
}

function FilePreview({ file, previewUrl, onClear }) {
  const { t } = useTranslation();
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-3xl p-5 space-y-4"
    >
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <DocumentTextIcon className="h-5 w-5 text-blue-500" />
          {t('ocr.filePreview', { defaultValue: 'File Preview' })}
        </h3>
        <button
          onClick={onClear}
          className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
          title="Remove file"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>

      <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center flex-shrink-0">
          <DocumentTextIcon className="h-5 w-5 text-white" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{file.name}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {formatBytes(file.size)} · {file.type.split('/')[1].toUpperCase()}
          </p>
        </div>
      </div>

      {previewUrl && (
        <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 max-h-72 flex items-center justify-center">
          <img
            src={previewUrl}
            alt="Document preview"
            className="max-h-72 w-auto object-contain"
          />
        </div>
      )}
    </motion.div>
  );
}

function ProgressBar({ progress, label }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-slate-600 dark:text-slate-400">{label}</span>
        <span className="font-semibold text-blue-600 dark:text-blue-400">{Math.round(progress)}%</span>
      </div>
      <div className="h-2.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-teal-500"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </div>
  );
}

function ExtractedText({ text, onCopy, onDownload, copied }) {
  const { t } = useTranslation();
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-3xl p-5 space-y-4"
    >
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h3 className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <DocumentTextIcon className="h-5 w-5 text-teal-500" />
          {t('ocr.extractedText', { defaultValue: 'Extracted Text' })}
          <span className="text-xs font-normal text-slate-400">({text.length} chars)</span>
        </h3>
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onCopy}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
              copied
                ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
            }`}
          >
            {copied ? <CheckCircleIcon className="h-4 w-4" /> : <ClipboardDocumentIcon className="h-4 w-4" />}
            {copied ? 'Copied!' : 'Copy'}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onDownload}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-all duration-200"
          >
            <ArrowDownTrayIcon className="h-4 w-4" />
            Download
          </motion.button>
        </div>
      </div>

      <div className="relative rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 p-4 max-h-64 overflow-y-auto">
        <pre className="text-sm text-slate-700 dark:text-slate-300 font-mono whitespace-pre-wrap leading-relaxed break-words">
          {text || '(No text detected)'}
        </pre>
      </div>
    </motion.div>
  );
}

function AiSummaryCard({ summary, isLoading, error, onRetry }) {
  const { t } = useTranslation();
  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-3xl p-5 space-y-4"
      >
        <h3 className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <SparklesIcon className="h-5 w-5 text-purple-500 animate-pulse" />
          {t('ocr.aiSummary', { defaultValue: 'AI Medical Summary' })}
        </h3>
        <div className="flex flex-col items-center gap-4 py-8">
          <div className="relative h-12 w-12">
            <div className="absolute inset-0 rounded-full border-4 border-purple-200 dark:border-purple-900" />
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-500 animate-spin" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Analyzing report with Gemini AI...</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Identifying key values and observations</p>
          </div>
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-3xl p-5 space-y-3"
      >
        <h3 className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <SparklesIcon className="h-5 w-5 text-purple-500" />
          {t('ocr.aiSummary', { defaultValue: 'AI Medical Summary' })}
        </h3>
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800">
          <XCircleIcon className="h-5 w-5 text-rose-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-rose-700 dark:text-rose-300 mb-1">AI Analysis Failed</p>
            <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>
          </div>
        </div>
        {onRetry && (
          <div className="flex justify-end">
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={onRetry}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-all duration-200"
            >
              <SparklesIcon className="h-4 w-4" />
              Retry AI Summary
            </motion.button>
          </div>
        )}
      </motion.div>
    );
  }


  if (!summary) return null;

  const sections = [
    { icon: MagnifyingGlassIcon, label: 'Key Observations',       color: 'blue',  items: summary.keyObservations,      emptyMessage: 'None found' },
    { icon: BeakerIcon,          label: 'Important Values',        color: 'teal',  items: summary.importantValues,      emptyMessage: 'None found' },
    { icon: ShieldExclamationIcon, label: 'Possible Abnormalities', color: 'amber', items: summary.possibleAbnormalities, emptyMessage: 'No abnormalities detected ✓' },
  ];

  const colorMap = {
    blue:  { icon: 'text-blue-500',  bg: 'bg-blue-50 dark:bg-blue-900/20',  border: 'border-blue-200 dark:border-blue-800',  dot: 'bg-blue-500'  },
    teal:  { icon: 'text-teal-500',  bg: 'bg-teal-50 dark:bg-teal-900/20',  border: 'border-teal-200 dark:border-teal-800',  dot: 'bg-teal-500'  },
    amber: { icon: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-amber-200 dark:border-amber-800', dot: 'bg-amber-500' },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-3xl p-5 space-y-5"
    >
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <SparklesIcon className="h-5 w-5 text-purple-500" />
          {t('ocr.aiSummary', { defaultValue: 'AI Medical Summary' })}
        </h3>
        {summary.documentType && (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
            {summary.documentType}
          </span>
        )}
      </div>

      {summary.overallSummary && (
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{summary.overallSummary}</p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-3">
        {sections.map((section) => {
          const c    = colorMap[section.color];
          const Icon = section.icon;
          return (
            <div key={section.label} className={`rounded-2xl border p-4 space-y-3 ${c.bg} ${c.border}`}>
              <div className="flex items-center gap-2">
                <Icon className={`h-4 w-4 ${c.icon} flex-shrink-0`} />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  {section.label}
                </span>
              </div>
              {section.items && section.items.length > 0 ? (
                <ul className="space-y-1.5">
                  {section.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                      <span className={`mt-1.5 h-1.5 w-1.5 rounded-full flex-shrink-0 ${c.dot}`} />
                      {item}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-slate-500 dark:text-slate-400 italic">{section.emptyMessage}</p>
              )}
            </div>
          );
        })}
      </div>

      {summary.disclaimer && (
        <div className="flex items-start gap-2 p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <InformationCircleIcon className="h-4 w-4 text-slate-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-slate-500 dark:text-slate-400 italic">{summary.disclaimer}</p>
        </div>
      )}
    </motion.div>
  );
}

// ─── main page ───────────────────────────────────────────────────────────────
export default function OcrScanner() {
  const { t } = useTranslation();
  const [file,       setFile]       = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const [ocrStatus,        setOcrStatus]        = useState('idle');
  const [ocrProgress,      setOcrProgress]      = useState(0);
  const [ocrProgressLabel, setOcrProgressLabel] = useState('');
  const [ocrText,          setOcrText]          = useState('');
  const [ocrError,         setOcrError]         = useState('');
  const [ocrConfidence,    setOcrConfidence]    = useState(null);

  const [aiStatus,  setAiStatus]  = useState('idle');
  const [aiSummary, setAiSummary] = useState(null);
  const [aiError,   setAiError]   = useState('');

  const [copied, setCopied] = useState(false);

  // ── file selection ────────────────────────────────────────────────────────
  const handleFileSelect = useCallback(async (selectedFile) => {
    if (!ACCEPTED_TYPES.includes(selectedFile.type)) {
      setOcrError('Unsupported file type. Please upload JPG, JPEG, PNG, or PDF.');
      setOcrStatus('error');
      return;
    }
    if (selectedFile.size > MAX_SIZE_MB * 1024 * 1024) {
      setOcrError(`File too large. Maximum size is ${MAX_SIZE_MB} MB.`);
      setOcrStatus('error');
      return;
    }

    setFile(selectedFile);
    setOcrText(''); setOcrError(''); setOcrStatus('idle');
    setAiSummary(null); setAiError(''); setAiStatus('idle');
    setOcrConfidence(null);

    if (selectedFile.type === 'application/pdf') {
      try {
        const blob = await pdfToImageBlob(selectedFile);
        setPreviewUrl(URL.createObjectURL(blob));
      } catch {
        setPreviewUrl(null);
      }
    } else {
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  }, []);

  const handleClear = () => {
    setFile(null); setPreviewUrl(null);
    setOcrText(''); setOcrError(''); setOcrStatus('idle'); setOcrProgress(0); setOcrConfidence(null);
    setAiSummary(null); setAiError(''); setAiStatus('idle');
  };

  // ── OCR extraction ────────────────────────────────────────────────────────
  const handleExtract = async () => {
    if (!file) return;
    setOcrStatus('loading'); setOcrProgress(5);
    setOcrProgressLabel('Loading OCR engine from CDN...');
    setOcrText(''); setOcrError('');
    setAiSummary(null); setAiError(''); setAiStatus('idle');

    try {
      let imageInput = file;
      if (file.type === 'application/pdf') {
        setOcrProgressLabel('Rendering PDF page...');
        setOcrProgress(10);
        imageInput = await pdfToImageBlob(file);
      }

      setOcrProgressLabel('Recognizing text...');
      const result = await runTesseractOcr(imageInput, (p) => {
        setOcrProgress(p);
        setOcrProgressLabel('Recognizing text...');
      });

      setOcrProgress(100);
      setOcrProgressLabel('Complete!');
      setOcrText(result.text || '');
      setOcrConfidence(result.confidence);
      setOcrStatus('done');

      if (result.text?.trim().length > 10) {
        handleAiSummary(result.text);
      }
    } catch (err) {
      console.error('OCR Error:', err);
      setOcrError(err.message || 'OCR failed. Please try a clearer image.');
      setOcrStatus('error');
    }
  };

  // ── AI summary ────────────────────────────────────────────────────────────
  const handleAiSummary = async (text = ocrText) => {
    if (!text?.trim()) return;
    setAiStatus('loading'); setAiSummary(null); setAiError('');
    try {
      const result = await ocrAiService.analyzeMedicalReport(text);
      setAiSummary(result);
      setAiStatus('done');
    } catch (err) {
      setAiError(err.message || 'AI analysis failed. Please try again.');
      setAiStatus('error');
    }
  };

  // ── clipboard & download ──────────────────────────────────────────────────
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(ocrText);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = ocrText;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    const blob = new Blob([ocrText], { type: 'text/plain' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `${file?.name?.replace(/\.[^.]+$/, '') || 'ocr-result'}_extracted.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen gradient-bg py-10 px-4">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-3"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-semibold mb-2">
            <MagnifyingGlassIcon className="h-4 w-4" />
            Medical Report OCR Scanner
          </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white mb-4">
              {t('ocr.title')}
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              {t('ocr.subtitle')}
            </p>
        </motion.div>

        {/* Upload zone */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-3xl p-6 space-y-4"
        >
          {!file ? (
            <UploadZone
              onFileSelect={handleFileSelect}
              isDragging={isDragging}
              setIsDragging={setIsDragging}
            />
          ) : (
            <FilePreview file={file} previewUrl={previewUrl} onClear={handleClear} />
          )}

          <AnimatePresence>
            {ocrStatus === 'error' && !file && (
              <motion.div
                key="error-no-file"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-start gap-3 p-4 rounded-2xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800"
              >
                <ExclamationTriangleIcon className="h-5 w-5 text-rose-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-rose-700 dark:text-rose-300">{ocrError}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {file && ocrStatus !== 'loading' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-center pt-1"
            >
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleExtract}
                className="btn-primary text-base px-8 py-3.5 gap-2"
              >
                <MagnifyingGlassIcon className="h-5 w-5" />
                {ocrStatus === 'done' ? t('ocr.rescanBtn', { defaultValue: 'Re-scan Document' }) : t('ocr.extractBtn', { defaultValue: 'Extract Text via OCR' })}
              </motion.button>
            </motion.div>
          )}
        </motion.div>

        {/* OCR Progress */}
        <AnimatePresence>
          {ocrStatus === 'loading' && (
            <motion.div
              key="loading-progress"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="glass rounded-3xl p-6 space-y-5"
            >
              <div className="flex items-center gap-3">
                <div className="relative h-8 w-8 flex-shrink-0">
                  <div className="absolute inset-0 rounded-full border-[3px] border-blue-200 dark:border-blue-900" />
                  <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-blue-500 animate-spin" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Processing Document</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Running local OCR — no files leave your device</p>
                </div>
              </div>
              <ProgressBar progress={ocrProgress} label={ocrProgressLabel} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* OCR Error */}
        <AnimatePresence>
          {ocrStatus === 'error' && file && (
            <motion.div
              key="error-with-file"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="glass rounded-3xl p-5"
            >
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800">
                <XCircleIcon className="h-5 w-5 text-rose-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-rose-700 dark:text-rose-300">OCR Failed</p>
                  <p className="text-sm text-rose-600 dark:text-rose-400 mt-1">{ocrError}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        <AnimatePresence>
          {ocrStatus === 'done' && (
            <motion.div key="results-done" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">

              {ocrConfidence !== null && (
                <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2">
                  <CheckCircleIcon className={`h-5 w-5 ${ocrConfidence > 70 ? 'text-emerald-500' : 'text-amber-500'}`} />
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    OCR Confidence:{' '}
                    <span className={`font-semibold ${ocrConfidence > 70 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                      {ocrConfidence.toFixed(1)}%
                    </span>
                    {ocrConfidence < 70 && (
                      <span className="text-amber-500 ml-2 text-xs">
                        — Low confidence. Try a higher resolution image.
                      </span>
                    )}
                  </span>
                </motion.div>
              )}

              <ExtractedText text={ocrText} onCopy={handleCopy} onDownload={handleDownload} copied={copied} />

              <AiSummaryCard
                summary={aiSummary}
                isLoading={aiStatus === 'loading'}
                error={aiStatus === 'error' ? aiError : null}
                onRetry={() => handleAiSummary()}
              />

              {aiStatus === 'done' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-center">
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleAiSummary()}
                    className="btn-secondary text-sm px-6 py-2.5 gap-2"
                  >
                    <SparklesIcon className="h-4 w-4" />
                    Regenerate AI Summary
                  </motion.button>
                </motion.div>
              )}

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-start gap-3 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800"
              >
                <CheckCircleIcon className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">{t('ocr.privacy', { defaultValue: 'Privacy First' })}</p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">
                    {t('ocr.privacyDesc', { defaultValue: 'OCR processing runs entirely in your browser. Your document files are never uploaded to any server. Only the extracted text is sent to Google Gemini for AI analysis.' })}
                  </p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
