import React, { useState } from 'react';
import { FileText, Copy, Check, Sparkles, Download, RefreshCcw } from 'lucide-react';
import { TailoredResume, JobPosting } from '@/shared/types';
import { apiClient } from '../../services/api-client';

interface TailoredResumeViewProps {
  tailoredResume: TailoredResume | null;
  job: JobPosting | null;
  isTailoring: boolean;
  onTailorResume: () => void;
}

export const TailoredResumeView: React.FC<TailoredResumeViewProps> = ({
  tailoredResume,
  job,
  isTailoring,
  onTailorResume,
}) => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const copyToClipboard = (text: string, sectionName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionName);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const handleDownloadDocx = () => {
    if (!job) return;
    window.open(apiClient.getDocxDownloadUrl(job.id), '_blank');
  };

  if (!tailoredResume) {
    return (
      <div className="p-6 text-center text-slate-500 dark:text-slate-400">
        <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3">
          <FileText className="w-6 h-6 text-slate-400" />
        </div>
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
          No Tailored Documents Generated
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto mb-4">
          Generate an ATS-optimized tailored resume and custom cover letter based strictly on your verified factual evidence.
        </p>
        <button
          onClick={onTailorResume}
          disabled={!job || isTailoring}
          className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs rounded-xl shadow-2xs transition-colors"
        >
          {isTailoring ? 'Generating Tailored Content...' : 'Generate Tailored Resume & Cover Letter'}
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* Header & Download Bar */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
        <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          Tailored Application Artifacts
        </h3>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadDocx}
            className="py-1 px-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-1 shadow-2xs"
          >
            <Download className="w-3 h-3" /> Download DOCX
          </button>

          <button
            onClick={onTailorResume}
            disabled={isTailoring}
            className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 p-1"
            title="Regenerate"
          >
            <RefreshCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Tailored Professional Summary */}
      <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
            Tailored ATS Executive Summary
          </span>
          <button
            onClick={() => copyToClipboard(tailoredResume.summary, 'summary')}
            className="text-[11px] text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1 font-mono"
          >
            {copiedSection === 'summary' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
            {copiedSection === 'summary' ? 'Copied' : 'Copy'}
          </button>
        </div>
        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
          {tailoredResume.summary}
        </p>
      </div>

      {/* Highlighted Skills */}
      <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
        <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 block">
          Targeted Keyword Prioritization
        </span>
        <div className="flex flex-wrap gap-1">
          {tailoredResume.highlightedSkills.map((skill) => (
            <span
              key={skill}
              className="text-[11px] font-mono px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Tailored Cover Letter */}
      <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
            Custom Cover Letter
          </span>
          <button
            onClick={() => copyToClipboard(tailoredResume.coverLetterText, 'coverLetter')}
            className="text-[11px] text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1 font-mono"
          >
            {copiedSection === 'coverLetter' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
            {copiedSection === 'coverLetter' ? 'Copied Letter' : 'Copy Cover Letter'}
          </button>
        </div>
        <pre className="text-[11px] text-slate-700 dark:text-slate-300 font-sans whitespace-pre-wrap leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-lg border border-slate-200/60 dark:border-slate-800">
          {tailoredResume.coverLetterText}
        </pre>
      </div>
    </div>
  );
};
