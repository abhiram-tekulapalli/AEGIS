import React, { useState } from 'react';
import { Terminal, CheckCircle2, AlertTriangle, ShieldCheck, Zap, X, Lock, ExternalLink } from 'lucide-react';
import { apiClient } from '../../services/api-client';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  ollamaConnected: boolean;
  mockFallback: boolean;
  onEnableMock: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  ollamaConnected,
  mockFallback,
  onEnableMock,
}) => {
  const [cloudConsent, setCloudConsent] = useState<boolean>(true);
  const [isUpdatingConsent, setIsUpdatingConsent] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleToggleConsent = async () => {
    setIsUpdatingConsent(true);
    try {
      const nextState = !cloudConsent;
      await apiClient.updateCloudConsent(nextState);
      setCloudConsent(nextState);
      await apiClient.updateOllamaConfig({ cloudConsent: nextState });
    } catch (err) {
      console.warn('Failed to update consent:', err);
    } finally {
      setIsUpdatingConsent(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 font-sans">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl max-w-lg w-full p-5 shadow-2xl relative overflow-y-auto max-h-[92vh] space-y-4">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1 rounded-lg cursor-pointer transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3">
          <div className="p-2.5 border border-zinc-900 dark:border-zinc-100 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 rounded-lg">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
              AEGIS Cloud AI Connection & Privacy Guide
            </h2>
            <p className="text-[11px] text-zinc-500 font-mono">
              Powered by Google Gemini Developer API (Free-Tier Eligible)
            </p>
          </div>
        </div>

        {/* Status Box */}
        <div
          className={`p-3.5 border rounded-lg text-xs font-mono ${
            ollamaConnected && cloudConsent
              ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border-zinc-900 dark:border-zinc-100'
              : 'bg-zinc-100 dark:bg-zinc-800/80 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100'
          }`}
        >
          <div className="flex items-start gap-2.5">
            {ollamaConnected && cloudConsent ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            )}
            <div className="space-y-1">
              <span className="font-bold uppercase block tracking-wider text-[11px]">
                {ollamaConnected && cloudConsent
                  ? 'Gemini Cloud AI Service Connected'
                  : 'Cloud AI Inference Paused / Action Required'}
              </span>
              <p className="text-[11px] leading-relaxed font-sans opacity-90">
                {ollamaConnected && cloudConsent
                  ? 'AEGIS is connected to the Google Gemini Developer API (gemini-3.8-flash). Cloud AI inference is active.'
                  : 'Gemini API key is not detected or Cloud Privacy Consent is pending. Follow the setup steps below.'}
              </p>
            </div>
          </div>
        </div>

        {/* Privacy Disclosure & Consent Switch */}
        <div className="p-3.5 rounded-lg bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5 font-mono uppercase tracking-wider">
              <Lock className="w-3.5 h-3.5" />
              Cloud Data Privacy Consent
            </span>
            <button
              onClick={handleToggleConsent}
              disabled={isUpdatingConsent}
              className={`py-1 px-3 rounded-md text-[11px] font-mono font-bold transition-colors cursor-pointer border ${
                cloudConsent
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border-zinc-900 dark:border-zinc-100'
                  : 'bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700'
              }`}
            >
              {cloudConsent ? 'Consent Granted' : 'Grant Consent'}
            </button>
          </div>
          <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed font-sans">
            When enabled, relevant job descriptions and sanitized candidate qualifications are transmitted to Google Gemini Developer API for model reasoning. AEGIS never transmits passwords, credentials, or unapproved data.
          </p>
        </div>

        {/* Setup Instructions */}
        <div className="space-y-2.5">
          <h3 className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300 tracking-wider uppercase font-mono">
            Environment Setup (Free Tier):
          </h3>

          <div className="space-y-2 text-xs">
            <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-800 space-y-1">
              <span className="font-semibold text-zinc-900 dark:text-zinc-100 block">
                1. Get Free Gemini API Key
              </span>
              <p className="text-zinc-600 dark:text-zinc-400 text-[11px] leading-relaxed">
                Obtain a free API key from Google AI Studio (no credit card required):
              </p>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-zinc-900 dark:text-zinc-100 font-mono font-bold hover:underline"
              >
                https://aistudio.google.com/app/apikey <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-800 space-y-1">
              <span className="font-semibold text-zinc-900 dark:text-zinc-100 block">
                2. Configure Environment Variable
              </span>
              <p className="text-zinc-600 dark:text-zinc-400 text-[11px] leading-relaxed">
                Add your key to the backend environment or <code>.env</code> file:
              </p>
              <div className="bg-zinc-900 text-zinc-100 p-2 rounded-md font-mono text-[11px] border border-zinc-800 space-y-1">
                <div>AI_PROVIDER=gemini</div>
                <div>GEMINI_API_KEY=YOUR_FREE_GEMINI_API_KEY</div>
                <div>GEMINI_MODEL=gemini-3.8-flash</div>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-800 space-y-1">
              <span className="font-semibold text-zinc-900 dark:text-zinc-100 block">
                3. Zero-Cost Safeguard Guarantee
              </span>
              <p className="text-zinc-600 dark:text-zinc-400 text-[11px] leading-relaxed">
                AEGIS operates strictly within Gemini free-tier limits. It will never automatically switch to paid models or enable paid billing.
              </p>
            </div>
          </div>
        </div>

        {/* Local Test Engine & Close Buttons */}
        <div className="border-t border-zinc-200 dark:border-zinc-800 pt-3 flex flex-col gap-2">
          {!ollamaConnected && (
            <button
              onClick={() => {
                onEnableMock();
                onClose();
              }}
              className="w-full py-2.5 px-3 bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5" />
              Enable Local Deterministic Engine (Offline Testing Mode)
            </button>
          )}

          <button
            onClick={onClose}
            className="w-full py-2.5 px-3 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-semibold text-xs rounded-lg transition-colors cursor-pointer"
          >
            Close & Continue
          </button>
        </div>
      </div>
    </div>
  );
};
