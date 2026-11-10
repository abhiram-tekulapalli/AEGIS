import React, { useState } from 'react';
import { 
  User, 
  Upload, 
  FileText, 
  AlertTriangle, 
  CheckCircle2, 
  Edit3, 
  Save, 
  Plus, 
  Trash2,
  ShieldCheck,
  Loader2
} from 'lucide-react';
import { CandidateProfile } from '@/shared/types';
import { ProfileReadiness } from '../../backend/services/profile-analyzer';
import { apiClient } from '../../services/api-client';

interface ProfileReadinessProps {
  profile: CandidateProfile;
  readiness: ProfileReadiness | null;
  onSaveProfile: (updated: CandidateProfile) => void;
}

export const ProfileReadinessView: React.FC<ProfileReadinessProps> = ({
  profile,
  readiness,
  onSaveProfile,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<CandidateProfile>(profile);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadWarning, setUploadWarning] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadWarning(null);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(',')[1];
        const res = await apiClient.uploadResumeFile(file.name, file.type, base64);

        if (res.record.extractionWarning) {
          setUploadWarning(res.record.extractionWarning);
        }

        onSaveProfile(res.profile);
        setFormData(res.profile);
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      alert('Upload failed: ' + err.message);
      setIsUploading(false);
    }
  };

  const handleSave = () => {
    onSaveProfile(formData);
    setIsEditing(false);
  };

  const score = readiness?.score ?? 85;

  return (
    <div className="p-4 space-y-4">
      {/* Score Header Card */}
      <div className="p-4 rounded-xl bg-slate-900 text-white dark:bg-slate-900 border border-slate-800 shadow-2xs">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-400">
              Verified Candidate Profile
            </span>
            <h2 className="text-base font-bold leading-tight">
              {profile.firstName} {profile.lastName}
            </h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              {profile.email}
            </p>
          </div>

          <div className="text-right">
            <span className="text-2xl font-bold font-mono text-emerald-400">
              {score}%
            </span>
            <span className="text-[9px] uppercase block text-slate-400 font-medium">
              Readiness Score
            </span>
          </div>
        </div>

        {/* Readiness Bar */}
        <div className="mt-3 bg-slate-800 rounded-full h-2 overflow-hidden">
          <div
            className="bg-emerald-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${score}%` }}
          />
        </div>
      </div>

      {/* Resume File Uploader Box */}
      <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-indigo-500" />
            Local Resume Documents ({profile.resumeDocuments?.length || 0})
          </h3>

          <label className="cursor-pointer py-1 px-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium transition-colors inline-flex items-center gap-1">
            {isUploading ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin" /> Parsing...
              </>
            ) : (
              <>
                <Upload className="w-3 h-3" /> Upload PDF / DOCX
              </>
            )}
            <input
              type="file"
              accept=".pdf,.docx,.txt"
              onChange={handleFileUpload}
              className="hidden"
              disabled={isUploading}
            />
          </label>
        </div>

        {uploadWarning && (
          <div className="p-2.5 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-300 rounded-lg text-[11px] flex items-start gap-1.5">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
            <span>{uploadWarning}</span>
          </div>
        )}

        {/* Documents list */}
        {profile.resumeDocuments && profile.resumeDocuments.length > 0 && (
          <div className="space-y-1.5">
            {profile.resumeDocuments.map((doc) => (
              <div
                key={doc.id}
                className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="w-4 h-4 text-indigo-500 shrink-0" />
                  <div className="truncate">
                    <span className="font-medium text-slate-900 dark:text-slate-100 block truncate">
                      {doc.fileName}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {(doc.fileSize / 1024).toFixed(1)} KB • {new Date(doc.uploadedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                  {doc.extractionStatus}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Editor or Read View */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-3.5 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
          <h3 className="text-xs font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-indigo-500" />
            Factual Candidate Evidence
          </h3>

          <button
            onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
            className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium flex items-center gap-1"
          >
            {isEditing ? (
              <>
                <Save className="w-3.5 h-3.5" /> Save Profile
              </>
            ) : (
              <>
                <Edit3 className="w-3.5 h-3.5" /> Edit Profile
              </>
            )}
          </button>
        </div>

        {isEditing ? (
          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">First Name</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-lg text-slate-900 dark:text-slate-100"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Last Name</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-lg text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-lg font-mono text-slate-900 dark:text-slate-100"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Phone</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-lg font-mono text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] text-slate-500 mb-1">Professional Headline</label>
              <input
                type="text"
                value={formData.headline}
                onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-lg text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-[11px] text-slate-500 mb-1">Professional Summary</label>
              <textarea
                rows={3}
                value={formData.summary}
                onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-lg text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-2 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px]">Professional Summary:</span>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-[11px]">
                {profile.summary}
              </p>
            </div>

            <div>
              <span className="text-slate-400 block text-[11px] mb-1">Verified Technical Skills:</span>
              <div className="flex flex-wrap gap-1">
                {profile.skills.map((skill) => (
                  <span
                    key={skill}
                    className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] space-y-1 font-mono text-slate-500">
              <div>Work Authorization: {profile.workAuthorization}</div>
              <div>Target Salary: {profile.desiredSalary}</div>
              <div>LinkedIn: {profile.linkedIn}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
