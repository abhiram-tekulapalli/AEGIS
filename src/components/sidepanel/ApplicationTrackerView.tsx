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
    <div className="p-4 space-y-4">
      {/* Header & New Record Button */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-indigo-500" />
            Local Application Tracker
          </h3>
          <p className="text-[10px] text-slate-500 dark:text-slate-400">
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
          className="py-1.5 px-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-[11px] rounded-lg shadow-2xs transition-colors flex items-center gap-1"
        >
          <Plus className="w-3 h-3" /> Log Application
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex items-center gap-2 text-xs">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          <input
            type="text"
            placeholder="Search company or title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 text-xs"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg py-1.5 px-2 text-slate-900 dark:text-slate-100 text-xs"
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
          <div className="text-center py-8 text-xs text-slate-500">
            No application records match your filter criteria.
          </div>
        ) : (
          filteredRecords.map((rec) => (
            <div
              key={rec.id}
              className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs space-y-2 shadow-2xs"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-slate-100 leading-tight">
                    {rec.jobTitle}
                  </h4>
                  <p className="text-slate-600 dark:text-slate-300 font-medium text-[11px] mt-0.5">
                    {rec.company}
                  </p>
                </div>

                <div className="flex items-center gap-1.5">
                  <span
                    className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded font-mono ${
                      rec.status === 'submitted'
                        ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                        : rec.status === 'prepared'
                        ? 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-800'
                        : rec.status === 'rejected'
                        ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                        : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                    }`}
                  >
                    {rec.status}
                  </span>

                  <button
                    onClick={() => onDeleteRecord(rec.id)}
                    className="p-1 text-slate-400 hover:text-rose-500 rounded transition-colors"
                    title="Delete record"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono pt-1 border-t border-slate-100 dark:border-slate-800">
                <span>Match Score: {rec.matchScore}%</span>
                <span>Analyzed: {new Date(rec.dateAnalyzed).toLocaleDateString()}</span>
              </div>

              {rec.notes && (
                <p className="text-[11px] text-slate-600 dark:text-slate-400 italic bg-slate-50 dark:bg-slate-800/60 p-2 rounded-md">
                  "{rec.notes}"
                </p>
              )}
            </div>
          ))
        )}
      </div>

      {/* Edit / New Modal */}
      {editingRecord && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-sm w-full p-4 space-y-3">
            <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
              Log Application Record
            </h4>

            <div className="space-y-2 text-xs">
              <div>
                <label className="block text-slate-500 mb-0.5">Company Name</label>
                <input
                  type="text"
                  value={editingRecord.company || ''}
                  onChange={(e) => setEditingRecord({ ...editingRecord, company: e.target.value })}
                  placeholder="e.g. Acme AI Systems"
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-lg text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-500 mb-0.5">Job Title</label>
                <input
                  type="text"
                  value={editingRecord.jobTitle || ''}
                  onChange={(e) => setEditingRecord({ ...editingRecord, jobTitle: e.target.value })}
                  placeholder="e.g. Senior Full Stack Engineer"
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-lg text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-500 mb-0.5">Job Posting URL</label>
                <input
                  type="text"
                  value={editingRecord.jobUrl || ''}
                  onChange={(e) => setEditingRecord({ ...editingRecord, jobUrl: e.target.value })}
                  placeholder="https://company.com/careers/role"
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-lg font-mono text-[11px] text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-500 mb-0.5">Status</label>
                <select
                  value={editingRecord.status || 'prepared'}
                  onChange={(e) => setEditingRecord({ ...editingRecord, status: e.target.value as any })}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-lg text-slate-900 dark:text-slate-100"
                >
                  <option value="prepared">Prepared (Auto-filled / Ready)</option>
                  <option value="pending">Pending User Review</option>
                  <option value="submitted">Submitted Manually</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-500 mb-0.5">Notes</label>
                <textarea
                  rows={2}
                  value={editingRecord.notes || ''}
                  onChange={(e) => setEditingRecord({ ...editingRecord, notes: e.target.value })}
                  placeholder="Add custom notes..."
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-lg text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={handleSaveModal}
                className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium text-xs"
              >
                Save Record
              </button>
              <button
                onClick={() => setEditingRecord(null)}
                className="py-2 px-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-medium"
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
