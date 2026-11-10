import React, { useState } from 'react';
import { 
  Briefcase, 
  MapPin, 
  DollarSign, 
  Sparkles, 
  CheckCircle, 
  XCircle, 
  ArrowRight,
  FileText,
  Loader2,
  Info
} from 'lucide-react';
import { JobPosting, TransparentJobMatchResult } from '@/shared/types';

interface JobInspectorProps {
  job: JobPosting | null;
  match: TransparentJobMatchResult | null;
  isAnalyzing: boolean;
  onAnalyzeJob: () => void;
  onGeneratePlan: () => void;
  onTailorResume: () => void;
}

export const JobInspector: React.FC<JobInspectorProps> = ({
  job,
  match,
  isAnalyzing,
  onAnalyzeJob,
  onGeneratePlan,
  onTailorResume,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'match_breakdown' | 'requirements'>('overview');

  if (!job) {
    return (
      <div className="p-6 text-center text-neutral-500">
        <div className="w-10 h-10 border border-neutral-300 dark:border-neutral-700 flex items-center justify-center mx-auto mb-3">
          <Briefcase className="w-5 h-5 text-neutral-400" />
        </div>
        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-black dark:text-white">
          No Job Listing Detected
        </h3>
        <p className="text-xs text-neutral-500 mt-1 max-w-xs mx-auto">
          Navigate to a job posting on Greenhouse, Lever, LinkedIn, or Workday, or select a test page in the simulator.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* Header Card */}
      <div className="p-3.5 bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 bg-black text-white dark:bg-white dark:text-black">
                {job.boardType}
              </span>
              <span className="text-[11px] font-mono text-neutral-500">
                {job.workType} · {job.employmentType}
              </span>
            </div>
            <h2 className="text-base font-bold text-black dark:text-white leading-tight">
              {job.title}
            </h2>
            <p className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 mt-0.5">
              {job.company}
            </p>
          </div>

          {/* Transparent Match Score Badge */}
          {match && (
            <div className="text-center p-2 bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 shrink-0">
              <span className="text-lg font-bold text-black dark:text-white leading-none block font-mono">
                {match.matchScore}%
              </span>
              <span className="text-[9px] text-neutral-500 uppercase font-mono font-semibold">
                Fit Score
              </span>
            </div>
          )}
        </div>

        {/* Metadata items */}
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-500 border-t border-neutral-200 dark:border-neutral-800 pt-2 font-mono">
          <div className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" />
            <span>{job.location}</span>
          </div>
          <div className="flex items-center gap-1">
            <DollarSign className="w-3.5 h-3.5" />
            <span>{job.salary}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-neutral-100 dark:bg-neutral-900 text-xs font-mono">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex-1 py-1.5 transition-colors ${
            activeTab === 'overview'
              ? 'bg-black text-white dark:bg-white dark:text-black font-semibold'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('match_breakdown')}
          className={`flex-1 py-1.5 transition-colors ${
            activeTab === 'match_breakdown'
              ? 'bg-black text-white dark:bg-white dark:text-black font-semibold'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white'
          }`}
        >
          Score Breakdown
        </button>
        <button
          onClick={() => setActiveTab('requirements')}
          className={`flex-1 py-1.5 transition-colors ${
            activeTab === 'requirements'
              ? 'bg-black text-white dark:bg-white dark:text-black font-semibold'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white'
          }`}
        >
          Requirements
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'overview' && (
        <div className="space-y-3">
          <div className="text-xs text-neutral-700 dark:text-neutral-300 bg-white dark:bg-black p-3 border border-neutral-200 dark:border-neutral-800 leading-relaxed">
            <h4 className="font-bold text-black dark:text-white mb-1">
              Sanitized Description
            </h4>
            <p className="line-clamp-6">{job.description}</p>
          </div>

          {!match && (
            <button
              onClick={onAnalyzeJob}
              disabled={isAnalyzing}
              className="w-full py-2.5 px-4 bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 font-mono font-semibold text-xs transition-colors flex items-center justify-center gap-2"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Calculating Match Score...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Evaluate Candidate Fit
                </>
              )}
            </button>
          )}
        </div>
      )}

      {activeTab === 'match_breakdown' && (
        <div className="space-y-3">
          {match ? (
            <>
              {/* Formula & Breakdown Box */}
              <div className="p-3 bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-black dark:text-white">
                    Score Component Breakdown
                  </span>
                  <span className="font-mono text-black dark:text-white font-bold">
                    {match.matchScore} / 100
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                  <div className="p-2 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                    <span className="text-neutral-500 block">Required Skills:</span>
                    <span className="font-bold text-black dark:text-white">
                      {match.scoreBreakdown.requiredSkillScore} / 40 pts
                    </span>
                  </div>
                  <div className="p-2 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                    <span className="text-neutral-500 block">Preferred Skills:</span>
                    <span className="font-bold text-black dark:text-white">
                      {match.scoreBreakdown.preferredSkillScore} / 15 pts
                    </span>
                  </div>
                  <div className="p-2 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                    <span className="text-neutral-500 block">Experience Fit:</span>
                    <span className="font-bold text-black dark:text-white">
                      {match.scoreBreakdown.experienceFitScore} / 25 pts
                    </span>
                  </div>
                  <div className="p-2 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                    <span className="text-neutral-500 block">Authorization & Location:</span>
                    <span className="font-bold text-black dark:text-white">
                      {match.scoreBreakdown.eligibilityEducationScore} / 20 pts
                    </span>
                  </div>
                </div>

                <p className="text-[10px] font-mono text-neutral-500 border-t border-neutral-200 dark:border-neutral-800 pt-1.5">
                  {match.scoreFormulaExplanation}
                </p>
              </div>

              {/* Skills Split */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800">
                  <span className="font-bold text-black dark:text-white flex items-center gap-1 mb-1.5">
                    <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                    Matched Skills ({match.skillsBreakdown.matchedRequired.length})
                  </span>
                  <ul className="space-y-1">
                    {match.skillsBreakdown.matchedRequired.map((s) => (
                      <li key={s} className="text-neutral-700 dark:text-neutral-300 font-mono text-[11px]">
                        · {s}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-2.5 bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800">
                  <span className="font-bold text-black dark:text-white flex items-center gap-1 mb-1.5">
                    <XCircle className="w-3.5 h-3.5 shrink-0" />
                    Missing Required ({match.skillsBreakdown.missingSkills.length})
                  </span>
                  <ul className="space-y-1">
                    {match.skillsBreakdown.missingSkills.map((s) => (
                      <li key={s} className="text-neutral-700 dark:text-neutral-300 font-mono text-[11px]">
                        · {s}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Disclaimer */}
              <div className="p-2 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-[10px] text-neutral-500 flex items-start gap-1.5 font-mono">
                <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>{match.disclaimerNotice}</span>
              </div>
            </>
          ) : (
            <div className="text-center py-6 text-xs text-neutral-500 font-mono">
              Click "Evaluate Candidate Fit" to view score breakdown.
            </div>
          )}
        </div>
      )}

      {activeTab === 'requirements' && (
        <div className="p-3 bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 text-xs space-y-2">
          <h4 className="font-bold text-black dark:text-white">
            Required Technical Skills
          </h4>
          <div className="flex flex-wrap gap-1">
            {job.requiredSkills.map((req) => (
              <span key={req} className="text-[11px] font-mono px-2 py-0.5 bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-black dark:text-white">
                {req}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800 grid grid-cols-2 gap-2">
        <button
          onClick={onGeneratePlan}
          className="py-2 px-3 bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 font-mono font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
        >
          <span>Auto-Fill Plan</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={onTailorResume}
          className="py-2 px-3 bg-neutral-100 text-black hover:bg-neutral-200 dark:bg-neutral-900 dark:text-white dark:hover:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 font-mono font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Tailor Resume</span>
        </button>
      </div>
    </div>
  );
};
