import React from 'react';
import { Download, Code2, ShieldAlert, Terminal, FileCheck } from 'lucide-react';
import { apiClient } from '../../services/api-client';

export const ExtensionExporter: React.FC = () => {
  const handleDownloadZip = () => {
    window.open(apiClient.getExtensionDownloadUrl(), '_blank');
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-xs space-y-5">
      <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700">
            <Code2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              AEGIS Chrome Extension Package (Manifest V3)
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Export unpacked extension bundle for Google Chrome developer mode
            </p>
          </div>
        </div>

        <button
          onClick={handleDownloadZip}
          className="py-2 px-4 bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 font-semibold text-xs rounded-lg shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
        >
          <Download className="w-4 h-4" />
          Download AEGIS Extension ZIP
        </button>
      </div>

      {/* Security & Permissions Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 space-y-2">
          <span className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-zinc-900 dark:text-zinc-100" />
            Minimum Necessary Permissions (MV3)
          </span>
          <ul className="space-y-1 font-mono text-[11px] text-zinc-600 dark:text-zinc-400">
            <li>• activeTab (Inspect current tab on user click)</li>
            <li>• scripting (Inject form-detector & form-filler)</li>
            <li>• storage (Persist local state & rules)</li>
            <li>• sidePanel (Compact extension UI panel)</li>
            <li>• Host: http://127.0.0.1:8765/* (Local backend)</li>
          </ul>
        </div>

        <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 space-y-2">
          <span className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
            <FileCheck className="w-4 h-4 text-zinc-900 dark:text-zinc-100" />
            Local Agent Backend Bindings
          </span>
          <ul className="space-y-1 font-mono text-[11px] text-zinc-600 dark:text-zinc-400">
            <li>• Local Endpoint: http://127.0.0.1:8765</li>
            <li>• Ollama Inference: http://127.0.0.1:11434</li>
            <li>• SQLite Store: .aegis-data/sqlite-store.json</li>
            <li>• Network: Bound strictly to 127.0.0.1</li>
          </ul>
        </div>
      </div>

      {/* Manifest Preview */}
      <div className="space-y-2">
        <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
          Generated extension/manifest.json
        </span>
        <pre className="p-3.5 rounded-xl bg-zinc-950 text-zinc-200 font-mono text-[11px] overflow-x-auto leading-relaxed border border-zinc-800">
{`{
  "manifest_version": 3,
  "name": "AEGIS — Advanced Employment Guidance & Intelligence System",
  "version": "1.0.0",
  "description": "Your Intelligence. Your Opportunities. Your Future. Privacy-first local AI assistant for job applications.",
  "action": { "default_title": "AEGIS Agent" },
  "side_panel": { "default_path": "sidepanel.html" },
  "icons": {
    "16": "icons/icon-16.png",
    "48": "icons/icon-48.png",
    "128": "icons/icon-128.png"
  },
  "permissions": ["activeTab", "scripting", "storage", "sidePanel"],
  "host_permissions": ["http://127.0.0.1:8765/*", "http://localhost:8765/*"],
  "background": { "service_worker": "background/service-worker.js", "type": "module" }
}`}
        </pre>
      </div>
    </div>
  );
};
