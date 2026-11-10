import React, { useState } from 'react';
import { 
  ShieldCheck, 
  CheckSquare, 
  Square, 
  Eye, 
  Play, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw,
  Zap,
  Info
} from 'lucide-react';
import { ApplicationPlan, FormFillAction } from '@/shared/types';

interface ApplicationPlannerViewProps {
  plan: ApplicationPlan | null;
  isGenerating: boolean;
  isFilling: boolean;
  onGeneratePlan: () => void;
  onExecuteApprovedActions: (approvedActions: FormFillAction[]) => void;
  onHighlightField: (selector: string) => void;
}

export const ApplicationPlannerView: React.FC<ApplicationPlannerViewProps> = ({
  plan,
  isGenerating,
  isFilling,
  onGeneratePlan,
  onExecuteApprovedActions,
  onHighlightField,
}) => {
  const [actions, setActions] = useState<FormFillAction[]>(plan?.actions || []);

  React.useEffect(() => {
    if (plan?.actions) {
      setActions(
        plan.actions.map((a) => ({
          ...a,
          userApproved: a.confidence >= 0.85,
        }))
      );
    }
  }, [plan]);

  const toggleApproval = (fieldId: string) => {
    setActions((prev) =>
      prev.map((a) =>
        a.fieldId === fieldId ? { ...a, userApproved: !a.userApproved } : a
      )
    );
  };

  const handleValueChange = (fieldId: string, newValue: string) => {
    setActions((prev) =>
      prev.map((a) =>
        a.fieldId === fieldId ? { ...a, proposedValue: newValue } : a
      )
    );
  };

  const selectAll = () => {
    setActions((prev) => prev.map((a) => ({ ...a, userApproved: true })));
  };

  const deselectAll = () => {
    setActions((prev) => prev.map((a) => ({ ...a, userApproved: false })));
  };

  const approvedCount = actions.filter((a) => a.userApproved).length;

  if (!plan) {
    return (
      <div className="p-6 text-center text-neutral-500">
        <div className="w-10 h-10 border border-neutral-300 dark:border-neutral-700 flex items-center justify-center mx-auto mb-3">
          <Zap className="w-5 h-5 text-neutral-400" />
        </div>
        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-black dark:text-white">
          No Application Plan Generated Yet
        </h3>
        <p className="text-xs text-neutral-500 mt-1 max-w-xs mx-auto mb-4">
          Click below to scan the active page form and generate an AI form filling action plan.
        </p>
        <button
          onClick={onGeneratePlan}
          disabled={isGenerating}
          className="py-2.5 px-4 bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 font-mono font-semibold text-xs transition-colors"
        >
          {isGenerating ? 'Scanning Page & Generating Plan...' : 'Detect Form & Generate Plan'}
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* Safety Banner */}
      <div className="p-3 bg-black text-white dark:bg-white dark:text-black text-xs font-mono flex items-start gap-2 border border-black dark:border-white">
        <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold block uppercase tracking-wider">AEGIS Safety Guarantee</span>
          <p className="text-[11px] opacity-90 leading-tight mt-0.5 font-sans">
            Every field requires your explicit checkbox approval. AEGIS will <strong>never</strong> automatically submit applications.
          </p>
        </div>
      </div>

      {/* Control bar */}
      <div className="flex items-center justify-between text-xs font-mono">
        <div>
          <span className="font-bold text-black dark:text-white">
            Field Actions ({approvedCount}/{actions.length} Approved)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={selectAll}
            className="text-[11px] text-black dark:text-white hover:underline font-bold"
          >
            Select All
          </button>
          <span className="text-neutral-400">·</span>
          <button
            onClick={deselectAll}
            className="text-[11px] text-neutral-500 hover:underline"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Actions List */}
      <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
        {actions.map((action) => {
          const isFilled = action.status === 'verified_success';
          const isFailed = action.status === 'verified_failed';

          return (
            <div
              key={action.fieldId}
              className={`p-3 border text-xs transition-all ${
                isFilled
                  ? 'bg-neutral-100 dark:bg-neutral-900 border-black dark:border-white'
                  : isFailed
                  ? 'bg-neutral-100 dark:bg-neutral-900 border-neutral-400 dark:border-neutral-600'
                  : action.userApproved
                  ? 'bg-white dark:bg-black border-black dark:border-white'
                  : 'bg-neutral-50 dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800 opacity-80'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleApproval(action.fieldId)}
                    className="text-black dark:text-white focus:outline-hidden"
                  >
                    {action.userApproved ? (
                      <CheckSquare className="w-4 h-4" />
                    ) : (
                      <Square className="w-4 h-4 text-neutral-400" />
                    )}
                  </button>
                  <span className="font-bold text-black dark:text-white">
                    {action.fieldLabel}
                  </span>
                  <span className="text-[10px] font-mono text-neutral-500 uppercase">
                    ({action.fieldType})
                  </span>
                </div>

                <div className="flex items-center gap-1.5 font-mono text-[10px]">
                  <button
                    onClick={() => onHighlightField(action.selector)}
                    className="p-1 text-neutral-400 hover:text-black dark:hover:text-white transition-colors"
                    title="Highlight field on page"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>

                  <span
                    className={`px-1.5 py-0.5 border font-semibold ${
                      action.riskClassification === 'high' || action.riskClassification === 'sensitive'
                        ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white'
                        : 'bg-neutral-100 text-black dark:bg-neutral-900 dark:text-white border-neutral-300 dark:border-neutral-700'
                    }`}
                  >
                    {action.riskClassification.toUpperCase()} RISK
                  </span>
                </div>
              </div>

              {/* Editable Proposed Value */}
              <div className="mt-2 pl-6">
                <input
                  type="text"
                  value={action.proposedValue}
                  onChange={(e) => handleValueChange(action.fieldId, e.target.value)}
                  placeholder="No value proposed..."
                  className="w-full p-1.5 text-xs bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 font-mono text-black dark:text-white focus:outline-hidden focus:border-black dark:focus:border-white"
                />

                <div className="mt-1 flex items-center justify-between text-[11px] text-neutral-500 font-mono">
                  <span className="truncate pr-2">{action.reasoning}</span>
                  {isFilled && (
                    <span className="text-black dark:text-white font-bold shrink-0 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Verified
                    </span>
                  )}
                  {isFailed && (
                    <span className="text-neutral-500 font-bold shrink-0 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Failed
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Primary Action Button */}
      <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800 space-y-2">
        <button
          onClick={() => onExecuteApprovedActions(actions.filter((a) => a.userApproved))}
          disabled={approvedCount === 0 || isFilling}
          className="w-full py-2.5 px-4 bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 disabled:bg-neutral-300 dark:disabled:bg-neutral-800 font-mono font-bold text-xs transition-colors flex items-center justify-center gap-2"
        >
          {isFilling ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" /> Populating Approved Fields & Verifying...
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" /> Fill {approvedCount} Approved Field{approvedCount === 1 ? '' : 's'}
            </>
          )}
        </button>
      </div>
    </div>
  );
};
