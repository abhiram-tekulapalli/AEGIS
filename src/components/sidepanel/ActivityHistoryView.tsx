import React from 'react';
import { History, CheckCircle2, Clock, ExternalLink } from 'lucide-react';
import { ApplicationTrackerRecord } from '@/shared/types';

interface ActivityHistoryViewProps {
  history: ApplicationTrackerRecord[];
}

export const ActivityHistoryView: React.FC<ActivityHistoryViewProps> = ({ history }) => {
  if (history.length === 0) {
    return (
      <div className="p-6 text-center text-zinc-500 font-sans">
        <div className="w-10 h-10 border border-zinc-300 dark:border-zinc-700 flex items-center justify-center mx-auto mb-3">
          <History className="w-5 h-5 text-zinc-400" />
        </div>
        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-black dark:text-white">
          No Activity Audit Logs Recorded
        </h3>
        <p className="text-xs text-zinc-500 mt-1 max-w-xs mx-auto">
          When you execute form auto-fill plans, application audit logs will be stored in your local SQLite database.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-3 font-sans">
      <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800 text-xs font-mono">
        <h3 className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
          <History className="w-3.5 h-3.5 text-zinc-900 dark:text-zinc-100" />
          Local Activity Audit Log
        </h3>
        <span className="text-[11px] text-zinc-500">
          {history.length} Record{history.length === 1 ? '' : 's'}
        </span>
      </div>

      <div className="space-y-2">
        {history.map((item) => (
          <div
            key={item.id}
            className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs space-y-1.5"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 leading-tight">
                  {item.jobTitle}
                </h4>
                <p className="text-zinc-500 dark:text-zinc-400 text-[11px] font-mono mt-0.5">
                  {item.company} • <span className="uppercase text-[10px]">{item.boardType}</span>
                </p>
              </div>

              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 border border-zinc-300 dark:border-zinc-700">
                <CheckCircle2 className="w-3 h-3" />
                {item.filledActionsCount || 0} Fields Verified
              </span>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-zinc-100 dark:border-zinc-800 text-[10px] text-zinc-400 font-mono">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {new Date(item.dateAnalyzed).toLocaleDateString()}
              </span>
              {item.jobUrl && (
                <a
                  href={item.jobUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-black dark:hover:text-white flex items-center gap-1 underline"
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
