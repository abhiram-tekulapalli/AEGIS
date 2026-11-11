import React, { useState, useEffect } from 'react';
import { Key, CheckCircle2, AlertTriangle, ShieldCheck, Zap, X, Lock, ExternalLink, Save } from 'lucide-react';
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
  const [apiKeyInput, setApiKeyInput] = useState<string>('');
  const [apiKeyMasked, setApiKeyMasked] = useState<string | null>(null);
  const [isUpdatingConsent, setIsUpdatingConsent] = useState<boolean>(false);
  const [isSavingKey, setIsSavingKey] = useState<boolean>(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadConfig();
    }
  }, [isOpen]);

  const loadConfig = async () => {
    try {
      const cfg = await apiClient.getOllamaModels();
      setCloudConsent(cfg.cloudConsentGranted ?? true);
      setApiKeyMasked(cfg.apiKeyMasked || null);
    } catch (err) {
      console.warn('Failed to load AI config:', err);
    }
  };

  if (!isOpen) return null;

  const handleSaveApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKeyInput.trim()) return;

    setIsSavingKey(true);
    setSaveMessage(null);
    try {
      const res = await apiClient.updateOllamaConfig({ apiKey: apiKeyInput.trim() });
      setApiKeyMasked(res.apiKeyMasked || 'Configured');
      setApiKeyInput('');
      setSaveMessage('Gemini API key saved & verified successfully!');
      setTimeout(() => setSaveMessage(null), 4000);
    } catch (err: any) {
      setSaveMessage('Error saving API key: ' + err.message);
    } finally {
      setIsSavingKey(false);
    }
  };

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
              AEGIS Settings & Gemini API Key
            </h2>
            <p className="text-[11px] text-zinc-500 font-mono">
              Configure your Google Gemini Developer API key directly
            </p>
          </div>
        </div>

        {/* Connection Status Box */}
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
                  : 'API Key or Cloud Consent Required'}
              </span>
              <p className="text-[11px] leading-relaxed font-sans opacity-90">
                {ollamaConnected && cloudConsent
                  ? `Active key: ${apiKeyMasked || 'Configured'}. AEGIS is connected to Google Gemini API (gemini-3.8-flash).`
                  : 'Enter your Gemini API key below to connect AEGIS to cloud AI inference.'}
              </p>
            </div>
          </div>
        </div>

        {/* Direct API Key Settings Input */}
        <form onSubmit={handleSaveApiKey} className="p-4 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5 font-mono uppercase tracking-wider">
              <Key className="w-4 h-4 text-zinc-900 dark:text-zinc-100" />
              Gemini API Key
            </label>
            {apiKeyMasked && (
              <span className="text-[10px] font-mono text-zinc-500 bg-zinc-200 dark:bg-zinc-700 px-2 py-0.5 rounded">
                Active: {apiKeyMasked}
              </span>
            )}
          </div>

          <div className="flex gap-2">
            <input
              type="password"
              placeholder="Paste your Gemini API Key here (e.g. AIzaSy...)"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              className="flex-1 px-3 py-2 text-xs font-mono bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:border-zinc-900 dark:focus:border-zinc-100"
            />
            <button
              type="submit"
              disabled={isSavingKey || !apiKeyInput.trim()}
              className="px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold text-xs rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              {isSavingKey ? 'Saving...' : 'Save Key'}
            </button>
          </div>

          {saveMessage && (
            <p className={`text-[11px] font-mono ${saveMessage.includes('Error') ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
              {saveMessage}
            </p>
          )}

          <p className="text-[11px] text-zinc-500 leading-relaxed font-sans">
            Need a free API key? Obtain one instantly from{' '}
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-zinc-900 dark:text-zinc-100 font-bold underline font-mono"
            >
              Google AI Studio <ExternalLink className="w-3 h-3 inline" />
            </a>
          </p>
        </form>

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
