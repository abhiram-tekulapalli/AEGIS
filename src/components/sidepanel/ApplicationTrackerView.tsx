import React, { useState } from 'react';
import { 
  Building2, 
  Clock, 
  ExternalLink, 
  Trash2, 
  Plus, 
  Filter, 
  CheckCircle2, 
  AlertCircle, 
  Calendar,
  FileText,
  Search
} from 'lucide-react';
import { ApplicationTrackerRecord, ApplicationTrackerStatus } from '@/shared/types';

interface ApplicationTrackerViewProps {
  records: ApplicationTrackerRecord[];
  onSaveRecord: (record: ApplicationTrackerRecord) => void;
  onDeleteRecord: (recordId: string) => void;
}

export const ApplicationTrackerView: React.FC<ApplicationTrackerViewProps> = ({
  records,
  onSaveRecord,
  onDeleteRecord,
}) => {
  const [statusFilter, setStatusFilter] = useState<ApplicationTrackerStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingRecord, setEditingRecord] = useState<Partial<ApplicationTrackerRecord> | null>(null);

  const filteredRecords = records.filter((rec) => {
    const matchesStatus = statusFilter === 'all' || rec.status === statusFilter;
    const matchesQuery =
      rec.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.jobTitle.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesQuery;
  });

  const handleSaveModal = () => {
    if (!editingRecord?.company || !editingRecord?.jobTitle) return;

    const newRecord: ApplicationTrackerRecord = {
      id: editingRecord.id || `app-${Date.now()}`,
      company: editingRecord.company,
      jobTitle: editingRecord.jobTitle,
      jobUrl: editingRecord.jobUrl || '',
      jobDescriptionSnapshot: editingRecord.jobDescriptionSnapshot || '',
      matchScore: editingRecord.matchScore || 85,
      boardType: editingRecord.boardType || 'generic',
      status: editingRecord.status || 'prepared',
      dateAnalyzed: editingRecord.dateAnalyzed || new Date().toISOString(),
      submissionDate: editingRecord.submissionDate,
      notes: editingRecord.notes,
      filledActionsCount: editingRecord.filledActionsCount || 0,
    };

    onSaveRecord(newRecord);
    setEditingRecord(null);
  };

  return (
    <div className="p-4 space-y-4 font-sans">
      {/* Header & New Record Button */}
      <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5 font-mono">
            <Building2 className="w-3.5 h-3.5 text-zinc-900 dark:text-zinc-100" />
            Local Application Tracker
          </h3>
          <p className="text-[10px] text-zinc-500 font-mono">
            Audit history & duplicate detection stored in local SQLite
          </p>
        </div>

        <button
          onClick={() =>
            setEditingRecord({
              company: '',
              jobTitle: '',
              jobUrl: '',
              status: 'prepared',
              matchScore: 85,
            })
          }
          className="py-1.5 px-2.5 bg-black hover:bg-neutral-800 text-white dark:bg-white dark:text-black dark:hover:bg-neutral-200 font-mono font-semibold text-[11px] rounded-lg shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
        >
          <Plus className="w-3 h-3" /> Log Application
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex items-center gap-2 text-xs">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-2.5" />
          <input
            type="text"
            placeholder="Search company or title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-2 py-1.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 text-xs font-sans"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg py-1.5 px-2 text-zinc-900 dark:text-zinc-100 text-xs font-mono"
        >
          <option value="all">All Statuses</option>
          <option value="prepared">Prepared</option>
          <option value="pending">Pending Review</option>
          <option value="submitted">Submitted</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Tracker Records List */}
      <div className="space-y-2 max-h-[55vh] overflow-y-auto pr-1">
        {filteredRecords.length === 0 ? (
          <div className="text-center py-8 text-xs text-zinc-500 font-mono">
            No application records match your filter criteria.
          </div>
        ) : (
          filteredRecords.map((rec) => (
            <div
              key={rec.id}
              className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs space-y-2 shadow-xs"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-bold text-zinc-900 dark:text-zinc-100 leading-tight">
                    {rec.jobTitle}
                  </h4>
                  <p className="text-zinc-600 dark:text-zinc-300 font-mono text-[11px] mt-0.5">
                    {rec.company}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 font-mono">
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-300 dark:border-zinc-700">
                    {rec.status}
                  </span>

                  <button
                    onClick={() => onDeleteRecord(rec.id)}
                    className="p-1 text-zinc-400 hover:text-black dark:hover:text-white rounded transition-colors cursor-pointer"
                    title="Delete record"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-zinc-500 font-mono pt-1 border-t border-zinc-100 dark:border-zinc-800">
                <span>Match Score: {rec.matchScore}%</span>
                <span>Analyzed: {new Date(rec.dateAnalyzed).toLocaleDateString()}</span>
              </div>

              {rec.notes && (
                <p className="text-[11px] text-zinc-600 dark:text-zinc-400 italic bg-zinc-50 dark:bg-zinc-800/60 p-2 rounded-md font-sans">
                  "{rec.notes}"
                </p>
              )}
            </div>
          ))
        )}
      </div>

      {/* Edit / New Modal */}
      {editingRecord && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl max-w-sm w-full p-4 space-y-3 shadow-2xl">
            <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 font-mono">
              Log Application Record
            </h4>

            <div className="space-y-2 text-xs">
              <div>
                <label className="block text-zinc-500 mb-0.5 font-mono">Company Name</label>
                <input
                  type="text"
                  value={editingRecord.company || ''}
                  onChange={(e) => setEditingRecord({ ...editingRecord, company: e.target.value })}
                  placeholder="e.g. Acme AI Systems"
                  className="w-full p-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 font-sans"
                />
              </div>

              <div>
                <label className="block text-zinc-500 mb-0.5 font-mono">Job Title</label>
                <input
                  type="text"
                  value={editingRecord.jobTitle || ''}
                  onChange={(e) => setEditingRecord({ ...editingRecord, jobTitle: e.target.value })}
                  placeholder="e.g. Senior Full Stack Engineer"
                  className="w-full p-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 font-sans"
                />
              </div>

              <div>
                <label className="block text-zinc-500 mb-0.5 font-mono">Job Posting URL</label>
                <input
                  type="text"
                  value={editingRecord.jobUrl || ''}
                  onChange={(e) => setEditingRecord({ ...editingRecord, jobUrl: e.target.value })}
                  placeholder="https://company.com/careers/role"
                  className="w-full p-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg font-mono text-[11px] text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-zinc-500 mb-0.5 font-mono">Status</label>
                <select
                  value={editingRecord.status || 'prepared'}
                  onChange={(e) => setEditingRecord({ ...editingRecord, status: e.target.value as any })}
                  className="w-full p-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 font-mono"
                >
                  <option value="prepared">Prepared (Auto-filled / Ready)</option>
                  <option value="pending">Pending User Review</option>
                  <option value="submitted">Submitted Manually</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-500 mb-0.5 font-mono">Notes</label>
                <textarea
                  rows={2}
                  value={editingRecord.notes || ''}
                  onChange={(e) => setEditingRecord({ ...editingRecord, notes: e.target.value })}
                  placeholder="Add custom notes..."
                  className="w-full p-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 font-sans"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
              <button
                onClick={handleSaveModal}
                className="flex-1 py-2 bg-black hover:bg-neutral-800 text-white dark:bg-white dark:text-black dark:hover:bg-neutral-200 rounded-lg font-mono font-bold text-xs cursor-pointer"
              >
                Save Record
              </button>
              <button
                onClick={() => setEditingRecord(null)}
                className="py-2 px-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-lg text-xs font-mono cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
