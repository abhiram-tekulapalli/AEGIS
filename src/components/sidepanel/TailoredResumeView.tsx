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
      <div className="p-6 text-center text-zinc-500 font-sans">
        <div className="w-10 h-10 border border-zinc-300 dark:border-zinc-700 flex items-center justify-center mx-auto mb-3">
          <FileText className="w-5 h-5 text-zinc-400" />
        </div>
        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-black dark:text-white">
          No Tailored Documents Generated
        </h3>
        <p className="text-xs text-zinc-500 mt-1 max-w-xs mx-auto mb-4">
          Generate an ATS-optimized tailored resume and custom cover letter based strictly on your verified factual evidence.
        </p>
        <button
          onClick={onTailorResume}
          disabled={!job || isTailoring}
          className="py-2.5 px-4 bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 font-mono font-semibold text-xs transition-colors cursor-pointer disabled:opacity-50"
        >
          {isTailoring ? 'Generating Tailored Content...' : 'Generate Tailored Resume & Cover Letter'}
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 font-sans">
      {/* Header & Download Bar */}
      <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
        <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5 font-mono">
          <Sparkles className="w-3.5 h-3.5 text-zinc-900 dark:text-zinc-100" />
          Tailored Application Artifacts
        </h3>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadDocx}
            className="py-1 px-2.5 bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 rounded-lg text-xs font-mono font-medium transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
          >
            <Download className="w-3 h-3" /> Download DOCX
          </button>

          <button
            onClick={onTailorResume}
            disabled={isTailoring}
            className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 p-1 cursor-pointer"
            title="Regenerate"
          >
            <RefreshCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Tailored Professional Summary */}
      <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 font-mono">
            Tailored ATS Executive Summary
          </span>
          <button
            onClick={() => copyToClipboard(tailoredResume.summary, 'summary')}
            className="text-[11px] text-zinc-500 hover:text-black dark:hover:text-white flex items-center gap-1 font-mono cursor-pointer"
          >
            {copiedSection === 'summary' ? <Check className="w-3 h-3 text-black dark:text-white" /> : <Copy className="w-3 h-3" />}
            {copiedSection === 'summary' ? 'Copied' : 'Copy'}
          </button>
        </div>
        <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed font-sans">
          {tailoredResume.summary}
        </p>
      </div>

      {/* Highlighted Skills */}
      <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2">
        <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 block font-mono">
          Targeted Keyword Prioritization
        </span>
        <div className="flex flex-wrap gap-1">
          {tailoredResume.highlightedSkills.map((skill) => (
            <span
              key={skill}
              className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-300 dark:border-zinc-700"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Tailored Cover Letter */}
      <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 font-mono">
            Custom Cover Letter
          </span>
          <button
            onClick={() => copyToClipboard(tailoredResume.coverLetterText, 'coverLetter')}
            className="text-[11px] text-zinc-500 hover:text-black dark:hover:text-white flex items-center gap-1 font-mono cursor-pointer"
          >
            {copiedSection === 'coverLetter' ? <Check className="w-3 h-3 text-black dark:text-white" /> : <Copy className="w-3 h-3" />}
            {copiedSection === 'coverLetter' ? 'Copied Letter' : 'Copy Cover Letter'}
          </button>
        </div>
        <pre className="text-[11px] text-zinc-700 dark:text-zinc-300 font-sans whitespace-pre-wrap leading-relaxed bg-zinc-50 dark:bg-zinc-800/50 p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800">
          {tailoredResume.coverLetterText}
        </pre>
      </div>
    </div>
  );
};
