import React from 'react';
import { Cpu, Moon, Sun, RefreshCw, ShieldCheck, AlertCircle, Settings } from 'lucide-react';
import { SystemHealth } from '@/shared/types';

interface HeaderProps {
  health: SystemHealth | null;
  models: any[];
  selectedModel: string | null;
  mockFallback: boolean;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onSelectModel: (model: string) => void;
  onToggleMockFallback: (enable: boolean) => void;
  onRefreshHealth: () => void;
  onOpenOnboarding: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  health,
  models,
  selectedModel,
  mockFallback,
  theme,
  onToggleTheme,
  onSelectModel,
  onToggleMockFallback,
  onRefreshHealth,
  onOpenOnboarding,
}) => {
  const isConnected = health?.geminiConnected ?? false;
  const cloudConsent = health?.cloudConsentGranted ?? false;

  return (
    <header className="border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black px-4 py-3 shrink-0">
      <div className="flex items-center justify-between gap-3">
        {/* Brand identity */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-black text-white dark:bg-white dark:text-black flex items-center justify-center font-black text-xs tracking-widest">
            AE
          </div>
          <div>
            <h1 className="text-sm font-extrabold text-black dark:text-white leading-none tracking-tight uppercase">
              AEGIS
            </h1>
            <span className="text-[10px] text-neutral-500 dark:text-neutral-400 font-mono">
              v2.0 Gemini Cloud Agent
            </span>
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2">
          {/* Connection status badge */}
          <button
            onClick={onOpenOnboarding}
            className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-mono font-semibold uppercase tracking-wider border cursor-pointer ${
              isConnected && cloudConsent
                ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white'
                : mockFallback
                ? 'bg-neutral-100 text-neutral-900 dark:bg-neutral-900 dark:text-neutral-100 border-neutral-300 dark:border-neutral-700'
                : 'bg-neutral-200 text-neutral-700 dark:bg-neutral-900 dark:text-neutral-400 border-neutral-300 dark:border-neutral-800'
            }`}
            title="Click for Gemini Cloud AI connection and consent settings"
          >
            <span
              className={`w-1.5 h-1.5 ${
                isConnected && cloudConsent ? 'bg-white dark:bg-black' : mockFallback ? 'bg-neutral-700 dark:bg-neutral-300' : 'bg-neutral-400'
              }`}
            />
            {isConnected && cloudConsent ? 'Gemini 3.8 Flash' : mockFallback ? 'Local Engine' : 'Setup Required'}
          </button>

          {/* Refresh connection */}
          <button
            onClick={onRefreshHealth}
            className="p-1 text-neutral-500 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
            title="Refresh AI connection status"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          {/* Settings / API Key button */}
          <button
            onClick={onOpenOnboarding}
            className="p-1 text-neutral-500 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
            title="Open API Key Settings"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>

          {/* Dark / Light Mode Toggle */}
          <button
            onClick={onToggleTheme}
            className="p-1 text-neutral-500 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
          >
            {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Model & Privacy Bar */}
      <div className="mt-2.5 flex items-center justify-between gap-2 pt-2 border-t border-neutral-200 dark:border-neutral-800 text-xs">
        <div className="flex items-center gap-1.5 text-neutral-600 dark:text-neutral-400 font-mono text-[11px]">
          <Cpu className="w-3.5 h-3.5 shrink-0 text-black dark:text-white" />
          <span>Model: <strong className="text-black dark:text-white font-bold">{health?.geminiModel || 'gemini-3.8-flash'}</strong></span>
        </div>

        <button
          onClick={onOpenOnboarding}
          className="text-[11px] font-mono text-neutral-700 dark:text-neutral-300 hover:underline flex items-center gap-1 cursor-pointer"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-black dark:text-white" />
          <span>Privacy Consent: <strong className={cloudConsent ? 'text-black dark:text-white font-bold' : 'text-zinc-500 font-bold'}>{cloudConsent ? 'Granted' : 'Pending'}</strong></span>
        </button>
      </div>
    </header>
  );
};
