import React, { useState } from 'react';
import { Building2, MapPin, DollarSign, Send, Info } from 'lucide-react';
import { JobPosting, DetectedFormField } from '@/shared/types';

interface MockJobPageProps {
  onFormFieldsDetected: (fields: DetectedFormField[], job: JobPosting) => void;
}

export const MockJobPage: React.FC<MockJobPageProps> = ({ onFormFieldsDetected }) => {
  const [activeBoard, setActiveBoard] = useState<'greenhouse' | 'lever' | 'generic'>('greenhouse');
  const [submitNotice, setSubmitNotice] = useState<string | null>(null);

  const mockJobs: Record<'greenhouse' | 'lever' | 'generic', JobPosting> = {
    greenhouse: {
      id: 'job-gh-101',
      url: 'https://boards.greenhouse.io/acmetech/jobs/4829102',
      title: 'Senior Full-Stack Engineer',
      company: 'Acme AI Systems',
      location: 'San Francisco, CA (Hybrid)',
      workType: 'Hybrid',
      employmentType: 'Full-time',
      salary: '$165,000 - $190,000 USD',
      boardType: 'greenhouse',
      description: 'Acme AI Systems is building privacy-focused autonomous agents. We are seeking a Senior Full-Stack Engineer to own our core web architecture, TypeScript client SDKs, and local LLM execution pipelines.',
      responsibilities: [
        'Design and deploy scalable frontend components and Express microservices.',
        'Collaborate with AI researchers to optimize local model response latency.',
        'Mentor junior engineers and champion security best practices.'
      ],
      requiredSkills: ['TypeScript', 'React', 'Node.js', 'Express', 'Ollama'],
      preferredSkills: ['SQLite', 'Zod', 'Vite'],
      educationalQualifications: ['BS Computer Science or equivalent'],
      experienceRequirements: '5+ years experience',
      eligibilityNotes: [],
      otherRequirements: [],
      extractedAt: new Date().toISOString(),
      untrustedContentSanitized: true,
    },
    lever: {
      id: 'job-lev-202',
      url: 'https://jobs.lever.co/vanguard/8f921a-staff-engineer',
      title: 'Staff AI Agent Architect',
      company: 'Vanguard Cybernetics',
      location: 'Remote (US / Canada)',
      workType: 'Remote',
      employmentType: 'Full-time',
      salary: '$180,000 - $215,000 USD',
      boardType: 'lever',
      description: 'Vanguard Cybernetics builds local-first developer productivity software. We need a Staff Architect to lead our agent infrastructure team and design high-speed offline workflow assistants.',
      responsibilities: [
        'Lead the technical vision for our local agent runtime.',
        'Drive technical design reviews and benchmark local LLM inference speeds.'
      ],
      requiredSkills: ['TypeScript', 'SQLite', 'System Architecture', 'Ollama'],
      preferredSkills: ['Electron', 'WebGPU'],
      educationalQualifications: ['BS or MS in CS'],
      experienceRequirements: '7+ years experience',
      eligibilityNotes: [],
      otherRequirements: [],
      extractedAt: new Date().toISOString(),
      untrustedContentSanitized: true,
    },
    generic: {
      id: 'job-gen-303',
      url: 'https://careers.apex-industrial.com/openings/engineer',
      title: 'Full Stack Engineer - Developer Experience',
      company: 'Apex Industrial',
      location: 'New York, NY (On-site)',
      workType: 'On-site',
      employmentType: 'Full-time',
      salary: '$150,000 - $175,000 USD',
      boardType: 'generic',
      description: 'Apex Industrial creates modern enterprise tools. Join our Developer Experience team to build web clients, internal tooling, and automated workflows.',
      responsibilities: [
        'Build and maintain internal developer platforms.',
        'Automate routine engineering workflows.'
      ],
      requiredSkills: ['TypeScript', 'React', 'Express'],
      preferredSkills: ['PostgreSQL'],
      educationalQualifications: ['BS in Computer Science'],
      experienceRequirements: '3+ years experience',
      eligibilityNotes: [],
      otherRequirements: [],
      extractedAt: new Date().toISOString(),
      untrustedContentSanitized: true,
    },
  };

  const currentJob = mockJobs[activeBoard];

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitNotice('Manual Application Submitted Successfully! (User Clicked)');
    setTimeout(() => setSubmitNotice(null), 4000);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
      {/* Board Switcher Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 mb-5">
        <div className="flex items-center gap-2">
          <Building2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
            Interactive Application Form Simulator
          </span>
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-medium">
          <button
            onClick={() => setActiveBoard('greenhouse')}
            className={`px-3 py-1 rounded-md transition-colors ${
              activeBoard === 'greenhouse'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-2xs font-semibold'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Greenhouse Board
          </button>
          <button
            onClick={() => setActiveBoard('lever')}
            className={`px-3 py-1 rounded-md transition-colors ${
              activeBoard === 'lever'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-2xs font-semibold'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Lever Board
          </button>
          <button
            onClick={() => setActiveBoard('generic')}
            className={`px-3 py-1 rounded-md transition-colors ${
              activeBoard === 'generic'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-2xs font-semibold'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Generic Form
          </button>
        </div>
      </div>

      {/* Simulated Job Listing Banner */}
      <div className="mb-6 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="text-xs font-mono uppercase text-indigo-600 dark:text-indigo-400 font-semibold">
              {currentJob.company} • {currentJob.boardType.toUpperCase()}
            </span>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-0.5">
              {currentJob.title}
            </h2>
            <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mt-2">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" /> {currentJob.location}
              </span>
              <span className="flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5" /> {currentJob.salary}
              </span>
            </div>
          </div>

          <a
            href={currentJob.url}
            target="_blank"
            rel="noreferrer"
            className="text-xs font-mono text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700"
          >
            {currentJob.url.split('/')[2]}
          </a>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-300 mt-3 leading-relaxed">
          {currentJob.description}
        </p>
      </div>

      {/* Simulated Application Form */}
      <form onSubmit={handleManualSubmit} className="space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-800 pb-2">
          Application Form ({activeBoard.toUpperCase()} Format)
        </h3>

        {submitNotice && (
          <div className="p-3 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 rounded-xl text-xs font-medium">
            {submitNotice}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1" htmlFor="first_name">
              First Name <span className="text-rose-500">*</span>
            </label>
            <input
              id="first_name"
              name="first_name"
              type="text"
              placeholder="e.g. Jane"
              required
              className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 font-sans"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1" htmlFor="last_name">
              Last Name <span className="text-rose-500">*</span>
            </label>
            <input
              id="last_name"
              name="last_name"
              type="text"
              placeholder="e.g. Doe"
              required
              className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 font-sans"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1" htmlFor="email">
              Email Address <span className="text-rose-500">*</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="jane.doe@example.com"
              required
              className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 font-mono"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1" htmlFor="phone">
              Phone Number <span className="text-rose-500">*</span>
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              placeholder="+1 (555) 000-0000"
              required
              className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 font-mono"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1" htmlFor="linkedin_url">
              LinkedIn Profile URL
            </label>
            <input
              id="linkedin_url"
              name="linkedin_url"
              type="text"
              placeholder="https://linkedin.com/in/username"
              className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 font-mono"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1" htmlFor="github_url">
              GitHub or Portfolio URL
            </label>
            <input
              id="github_url"
              name="github_url"
              type="text"
              placeholder="https://github.com/username"
              className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 font-mono"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1" htmlFor="work_authorization">
              Are you legally authorized to work in the US?
            </label>
            <select
              id="work_authorization"
              name="work_authorization"
              className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 font-sans"
            >
              <option value="">Select option...</option>
              <option value="US Citizen">US Citizen</option>
              <option value="Green Card">Green Card Permanent Resident</option>
              <option value="H1B Visa">H1B Visa Holder</option>
              <option value="Need Sponsorship">Require Visa Sponsorship</option>
            </select>
          </div>

          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1" htmlFor="desired_salary">
              Desired Salary Expectations
            </label>
            <input
              id="desired_salary"
              name="desired_salary"
              type="text"
              placeholder="e.g. $165,000 USD"
              className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 font-sans"
            />
          </div>
        </div>

        <div>
          <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1" htmlFor="cover_letter">
            Cover Letter / Additional Notes
          </label>
          <textarea
            id="cover_letter"
            name="cover_letter"
            rows={4}
            placeholder="Introduce yourself and explain why you're a great fit for this role..."
            className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 font-sans"
          />
        </div>

        {/* Submit Button */}
        <div className="pt-2 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-medium">
            <Info className="w-4 h-4 shrink-0" />
            <span>AEGIS agent will populate fields above but will NEVER click Submit automatically.</span>
          </div>

          <button
            type="submit"
            className="py-2.5 px-5 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded-xl transition-colors flex items-center gap-2 shadow-xs"
          >
            <Send className="w-3.5 h-3.5" />
            Submit Application Manually
          </button>
        </div>
      </form>
    </div>
  );
};
