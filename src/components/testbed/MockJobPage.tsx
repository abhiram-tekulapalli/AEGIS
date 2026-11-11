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
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm font-sans">
      {/* Board Switcher Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800 mb-5">
        <div className="flex items-center gap-2">
          <Building2 className="w-5 h-5 text-zinc-900 dark:text-zinc-100" />
          <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
            Interactive Application Form Simulator
          </span>
        </div>

        <div className="flex items-center gap-1 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-xs font-mono">
          <button
            onClick={() => setActiveBoard('greenhouse')}
            className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
              activeBoard === 'greenhouse'
                ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs font-bold'
                : 'text-zinc-600 dark:text-zinc-400'
            }`}
          >
            Greenhouse Board
          </button>
          <button
            onClick={() => setActiveBoard('lever')}
            className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
              activeBoard === 'lever'
                ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs font-bold'
                : 'text-zinc-600 dark:text-zinc-400'
            }`}
          >
            Lever Board
          </button>
          <button
            onClick={() => setActiveBoard('generic')}
            className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
              activeBoard === 'generic'
                ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs font-bold'
                : 'text-zinc-600 dark:text-zinc-400'
            }`}
          >
            Generic Form
          </button>
        </div>
      </div>

      {/* Simulated Job Listing Banner */}
      <div className="mb-6 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/60">
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="text-xs font-mono uppercase text-zinc-900 dark:text-zinc-100 font-bold">
              {currentJob.company} • {currentJob.boardType.toUpperCase()}
            </span>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">
              {currentJob.title}
            </h2>
            <div className="flex items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400 mt-2 font-mono">
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
            className="text-xs font-mono text-zinc-900 dark:text-zinc-100 bg-white dark:bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700"
          >
            {currentJob.url.split('/')[2]}
          </a>
        </div>

        <p className="text-xs text-zinc-600 dark:text-zinc-300 mt-3 leading-relaxed font-sans">
          {currentJob.description}
        </p>
      </div>

      {/* Simulated Application Form */}
      <form onSubmit={handleManualSubmit} className="space-y-4 font-sans">
        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 border-b border-zinc-200 dark:border-zinc-800 pb-2 font-mono">
          Application Form ({activeBoard.toUpperCase()} Format)
        </h3>

        {submitNotice && (
          <div className="p-3 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border border-zinc-900 dark:border-zinc-100 rounded-xl text-xs font-mono font-bold">
            {submitNotice}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1 font-mono" htmlFor="first_name">
              First Name <span className="text-zinc-900 dark:text-zinc-100 font-bold">*</span>
            </label>
            <input
              id="first_name"
              name="first_name"
              type="text"
              placeholder="First Name"
              required
              className="w-full p-2.5 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:border-zinc-900 dark:focus:border-zinc-100 font-sans"
            />
          </div>

          <div>
            <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1 font-mono" htmlFor="last_name">
              Last Name <span className="text-zinc-900 dark:text-zinc-100 font-bold">*</span>
            </label>
            <input
              id="last_name"
              name="last_name"
              type="text"
              placeholder="Last Name"
              required
              className="w-full p-2.5 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:border-zinc-900 dark:focus:border-zinc-100 font-sans"
            />
          </div>

          <div>
            <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1 font-mono" htmlFor="email">
              Email Address <span className="text-zinc-900 dark:text-zinc-100 font-bold">*</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="your.email@domain.com"
              required
              className="w-full p-2.5 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:border-zinc-900 dark:focus:border-zinc-100 font-mono"
            />
          </div>

          <div>
            <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1 font-mono" htmlFor="phone">
              Phone Number <span className="text-zinc-900 dark:text-zinc-100 font-bold">*</span>
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              placeholder="+1 (555) 000-0000"
              required
              className="w-full p-2.5 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:border-zinc-900 dark:focus:border-zinc-100 font-mono"
            />
          </div>

          <div>
            <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1 font-mono" htmlFor="linkedin_url">
              LinkedIn Profile URL
            </label>
            <input
              id="linkedin_url"
              name="linkedin_url"
              type="text"
              placeholder="https://linkedin.com/in/username"
              className="w-full p-2.5 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:border-zinc-900 dark:focus:border-zinc-100 font-mono"
            />
          </div>

          <div>
            <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1 font-mono" htmlFor="github_url">
              GitHub or Portfolio URL
            </label>
            <input
              id="github_url"
              name="github_url"
              type="text"
              placeholder="https://github.com/username"
              className="w-full p-2.5 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:border-zinc-900 dark:focus:border-zinc-100 font-mono"
            />
          </div>

          <div>
            <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1 font-mono" htmlFor="work_authorization">
              Are you legally authorized to work in the US?
            </label>
            <select
              id="work_authorization"
              name="work_authorization"
              className="w-full p-2.5 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:border-zinc-900 dark:focus:border-zinc-100 font-mono"
            >
              <option value="">Select option...</option>
              <option value="US Citizen">US Citizen</option>
              <option value="Green Card">Green Card Permanent Resident</option>
              <option value="H1B Visa">H1B Visa Holder</option>
              <option value="Need Sponsorship">Require Visa Sponsorship</option>
            </select>
          </div>

          <div>
            <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1 font-mono" htmlFor="desired_salary">
              Desired Salary Expectations
            </label>
            <input
              id="desired_salary"
              name="desired_salary"
              type="text"
              placeholder="e.g. $165,000 USD"
              className="w-full p-2.5 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:border-zinc-900 dark:focus:border-zinc-100 font-mono"
            />
          </div>
        </div>

        <div>
          <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1 font-mono" htmlFor="cover_letter">
            Cover Letter / Additional Notes
          </label>
          <textarea
            id="cover_letter"
            name="cover_letter"
            rows={4}
            placeholder="Introduce yourself and explain why you're a great fit for this role..."
            className="w-full p-2.5 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:border-zinc-900 dark:focus:border-zinc-100 font-sans"
          />
        </div>

        {/* Submit Button */}
        <div className="pt-2 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400 font-mono">
            <Info className="w-4 h-4 shrink-0" />
            <span>AEGIS agent will populate fields above but will NEVER click Submit automatically.</span>
          </div>

          <button
            type="submit"
            className="py-2.5 px-5 bg-black hover:bg-neutral-800 text-white dark:bg-white dark:text-black dark:hover:bg-neutral-200 font-mono font-bold text-xs rounded-xl transition-colors flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            Submit Application Manually
          </button>
        </div>
      </form>
    </div>
  );
};
