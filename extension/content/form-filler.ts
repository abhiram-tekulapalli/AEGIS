import { FormFillAction } from '../../shared/types';

/**
 * Form Filler & Field Verification Module
 * Safety guarantees:
 * - Requires explicit user approval prior to populating any value.
 * - Highlights active field in DOM during edit.
 * - Dispatches React/DOM synthetic events (input, change, blur).
 * - Verifies value after populating.
 * - STRICT SAFETY RULE: NEVER clicks final application submit buttons.
 */

export class FormFiller {
  /**
   * Highlights target field in page DOM
   */
  public highlightField(selector: string, durationMs = 3000): void {
    const el = document.querySelector<HTMLElement>(selector);
    if (!el) return;

    const originalOutline = el.style.outline;
    const originalBoxShadow = el.style.boxShadow;
    const originalTransition = el.style.transition;

    el.style.transition = 'all 0.2s ease-in-out';
    el.style.outline = '3px solid #6366f1';
    el.style.boxShadow = '0 0 12px rgba(99, 102, 241, 0.5)';
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });

    setTimeout(() => {
      el.style.outline = originalOutline;
      el.style.boxShadow = originalBoxShadow;
      el.style.transition = originalTransition;
    }, durationMs);
  }

  /**
   * Safely fills approved field and verifies value post-fill
   */
  public async fillApprovedField(action: FormFillAction): Promise<FormFillAction> {
    // Security check: Must have explicit user approval
    if (!action.userApproved) {
      return {
        ...action,
        status: 'rejected',
        reasoning: 'Security check: Cannot fill field without explicit user approval.',
      };
    }

    const el = document.querySelector<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(action.selector);
    if (!el) {
      return {
        ...action,
        status: 'verified_failed',
        reasoning: `Field element not found in DOM with selector ${action.selector}`,
      };
    }

    try {
      this.highlightField(action.selector, 1500);

      // Focus field
      el.focus();

      // Populate based on tag/type
      if (el.tagName === 'SELECT') {
        const selectEl = el as HTMLSelectElement;
        let matchedIndex = -1;
        for (let i = 0; i < selectEl.options.length; i++) {
          if (selectEl.options[i].text.toLowerCase().includes(action.proposedValue.toLowerCase())) {
            matchedIndex = i;
            break;
          }
        }
        if (matchedIndex >= 0) {
          selectEl.selectedIndex = matchedIndex;
        } else {
          selectEl.value = action.proposedValue;
        }
      } else {
        // Handle input / textarea values
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
          window.HTMLInputElement.prototype,
          'value'
        )?.set;
        const nativeTextAreaValueSetter = Object.getOwnPropertyDescriptor(
          window.HTMLTextAreaElement.prototype,
          'value'
        )?.set;

        if (el.tagName === 'TEXTAREA' && nativeTextAreaValueSetter) {
          nativeTextAreaValueSetter.call(el, action.proposedValue);
        } else if (nativeInputValueSetter) {
          nativeInputValueSetter.call(el, action.proposedValue);
        } else {
          el.value = action.proposedValue;
        }
      }

      // Dispatch synthetic input/change events for modern frameworks (React/Vue/Angular)
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
      el.dispatchEvent(new Event('blur', { bubbles: true }));

      // Wait 100ms and verify filled value
      await new Promise((resolve) => setTimeout(resolve, 100));

      const actualVerifiedValue = el.value || '';
      const isVerified = actualVerifiedValue.length > 0;

      return {
        ...action,
        status: isVerified ? 'verified_success' : 'verified_failed',
        verifiedValue: actualVerifiedValue,
        reasoning: isVerified
          ? `Successfully filled and verified field value ("${actualVerifiedValue.slice(0, 30)}${actualVerifiedValue.length > 30 ? '...' : ''}")`
          : 'Value population succeeded but verification failed.',
      };
    } catch (err: any) {
      return {
        ...action,
        status: 'verified_failed',
        reasoning: `Error populating field: ${err.message}`,
      };
    }
  }

  /**
   * Safeguard check: Strictly verifies that action is NOT a submit button
   */
  public static isForbiddenSubmitButton(el: HTMLElement): boolean {
    const text = (el.textContent || el.getAttribute('value') || '').toLowerCase();
    const isSubmitType = el.getAttribute('type') === 'submit';
    const matchesForbiddenText = ['submit', 'apply now', 'complete application', 'send application'].some(t => text.includes(t));
    return isSubmitType || matchesForbiddenText;
  }
}

export const formFiller = new FormFiller();
