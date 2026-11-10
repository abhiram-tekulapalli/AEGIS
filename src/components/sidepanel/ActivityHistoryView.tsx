import React from 'react';
import { History, CheckCircle2, Clock, ExternalLink } from 'lucide-react';
import { ApplicationTrackerRecord } from '@/shared/types';

interface ActivityHistoryViewProps {
  history: ApplicationTrackerRecord[];
}

export const ActivityHistoryView: React.FC<ActivityHistoryViewProps> = ({ history }) => {
  if (history.length === 0) {
    return (
      <div className="p-6 text-center text-slate-500 dark:text-slate-400">
        <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3">
          <History className="w-6 h-6 text-slate-400" />
        </div>
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
          No Activity Audit Logs Recorded
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
          When you execute form auto-fill plans, application audit logs will be stored in your local SQLite database.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800 text-xs">
        <h3 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
          <History className="w-3.5 h-3.5 text-indigo-500" />
          Local Activity Audit Log
        </h3>
        <span className="font-mono text-[11px] text-slate-500">
          {history.length} Record{history.length === 1 ? '' : 's'}
        </span>
      </div>

      <div className="space-y-2">
        {history.map((item) => (
          <div
            key={item.id}
            className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs space-y-1.5"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-slate-100 leading-tight">
                  {item.jobTitle}
                </h4>
                <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                  {item.company} • <span className="uppercase font-mono text-[10px]">{item.boardType}</span>
                </p>
              </div>

              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60">
                <CheckCircle2 className="w-3 h-3" />
                {item.filledActionsCount || 0} Fields Verified
              </span>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800/60 text-[10px] text-slate-400">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {new Date(item.dateAnalyzed).toLocaleDateString()}
              </span>
              {item.jobUrl && (
                <a
                  href={item.jobUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-indigo-500 flex items-center gap-1"
                >
                  View Job <ExternalLink className="w-2.5 h-2.5" />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
