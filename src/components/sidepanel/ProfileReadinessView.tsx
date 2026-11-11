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

  const score = readiness?.score ?? 0;
  const fullName = `${profile.firstName} ${profile.lastName}`.trim() || 'Candidate Profile';

  return (
    <div className="p-4 space-y-4 font-sans">
      {/* Score Header Card */}
      <div className="p-4 rounded-xl bg-black text-white dark:bg-zinc-900 border border-zinc-800 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
              Verified Candidate Profile
            </span>
            <h2 className="text-base font-bold leading-tight">
              {fullName}
            </h2>
            <p className="text-xs text-zinc-400 font-mono mt-0.5">
              {profile.email || 'No email configured'}
            </p>
          </div>

          <div className="text-right">
            <span className="text-2xl font-bold font-mono text-white">
              {score}%
            </span>
            <span className="text-[9px] uppercase block text-zinc-400 font-medium">
              Readiness Score
            </span>
          </div>
        </div>

        {/* Readiness Bar */}
        <div className="mt-3 bg-zinc-800 rounded-full h-2 overflow-hidden border border-zinc-700">
          <div
            className="bg-white dark:bg-zinc-100 h-full rounded-full transition-all duration-500"
            style={{ width: `${score}%` }}
          />
        </div>
      </div>

      {/* Resume File Uploader Box */}
      <div className="p-3.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5 font-mono">
            <FileText className="w-3.5 h-3.5 text-zinc-900 dark:text-zinc-100" />
            Local Resume Documents ({profile.resumeDocuments?.length || 0})
          </h3>

          <label className="cursor-pointer py-1 px-2.5 bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 rounded-lg text-xs font-medium font-mono transition-colors inline-flex items-center gap-1">
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
          <div className="p-2.5 bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 rounded-lg text-[11px] flex items-start gap-1.5 font-mono">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{uploadWarning}</span>
          </div>
        )}

        {/* Documents list */}
        {profile.resumeDocuments && profile.resumeDocuments.length > 0 ? (
          <div className="space-y-1.5">
            {profile.resumeDocuments.map((doc) => (
              <div
                key={doc.id}
                className="p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/60 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="w-4 h-4 text-zinc-700 dark:text-zinc-300 shrink-0" />
                  <div className="truncate">
                    <span className="font-medium text-zinc-900 dark:text-zinc-100 block truncate">
                      {doc.fileName}
                    </span>
                    <span className="text-[10px] text-zinc-400 font-mono">
                      {(doc.fileSize / 1024).toFixed(1)} KB • {new Date(doc.uploadedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-200 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-700 uppercase">
                  {doc.extractionStatus}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-3 text-[11px] text-zinc-500 font-mono border border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg">
            No resume uploaded yet. Upload a PDF or DOCX to automatically parse candidate facts.
          </div>
        )}
      </div>

      {/* Editor or Read View */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-3.5 space-y-3">
        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-2">
          <h3 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5 font-mono">
            <User className="w-3.5 h-3.5 text-zinc-900 dark:text-zinc-100" />
            Factual Candidate Evidence
          </h3>

          <button
            onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
            className="text-xs font-mono text-zinc-900 dark:text-zinc-100 hover:underline font-bold flex items-center gap-1 cursor-pointer"
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
                <label className="block text-[11px] text-zinc-500 mb-1 font-mono">First Name</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  placeholder="Enter first name..."
                  className="w-full p-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100"
                />
              </div>
              <div>
                <label className="block text-[11px] text-zinc-500 mb-1 font-mono">Last Name</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  placeholder="Enter last name..."
                  className="w-full p-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] text-zinc-500 mb-1 font-mono">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="name@domain.com"
                  className="w-full p-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg font-mono text-zinc-900 dark:text-zinc-100"
                />
              </div>
              <div>
                <label className="block text-[11px] text-zinc-500 mb-1 font-mono">Phone</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1 (555) 000-0000"
                  className="w-full p-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg font-mono text-zinc-900 dark:text-zinc-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] text-zinc-500 mb-1 font-mono">Professional Headline</label>
              <input
                type="text"
                value={formData.headline}
                onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                placeholder="e.g. Senior Software Engineer"
                className="w-full p-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label className="block text-[11px] text-zinc-500 mb-1 font-mono">Professional Summary</label>
              <textarea
                rows={3}
                value={formData.summary}
                onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                placeholder="Write or upload a professional summary..."
                className="w-full p-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-3 text-xs">
            <div>
              <span className="text-zinc-400 block text-[11px] font-mono">Professional Summary:</span>
              <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed text-[11px] mt-0.5 font-sans">
                {profile.summary || 'No summary provided. Edit profile or upload resume to populate.'}
              </p>
            </div>

            <div>
              <span className="text-zinc-400 block text-[11px] mb-1 font-mono">Verified Technical Skills:</span>
              {profile.skills.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {profile.skills.map((skill) => (
                    <span
                      key={skill}
                      className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-300 dark:border-zinc-700"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-zinc-500 text-[11px] font-mono italic">No skills listed yet</span>
              )}
            </div>

            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 text-[11px] space-y-1 font-mono text-zinc-500">
              <div>Work Authorization: {profile.workAuthorization || 'Unspecified'}</div>
              <div>Target Salary: {profile.desiredSalary || 'Unspecified'}</div>
              <div>LinkedIn: {profile.linkedIn || 'Unspecified'}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
