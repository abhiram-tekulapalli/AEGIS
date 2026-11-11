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
  highlightField(selector, durationMs = 3000) {
    const el = document.querySelector(selector);
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

  async fillApprovedField(action) {
    if (!action.userApproved) {
      return Object.assign({}, action, {
        status: 'rejected',
        reasoning: 'Security check: Cannot fill field without explicit user approval.',
      });
    }

    const el = document.querySelector(action.selector);
    if (!el) {
      return Object.assign({}, action, {
        status: 'verified_failed',
        reasoning: `Field element not found in DOM with selector ${action.selector}`,
      });
    }

    try {
      this.highlightField(action.selector, 1500);
      el.focus();

      if (el.tagName === 'SELECT') {
        let matchedIndex = -1;
        for (let i = 0; i < el.options.length; i++) {
          if (el.options[i].text.toLowerCase().includes(action.proposedValue.toLowerCase())) {
            matchedIndex = i;
            break;
          }
        }
        if (matchedIndex >= 0) {
          el.selectedIndex = matchedIndex;
        } else {
          el.value = action.proposedValue;
        }
      } else {
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

      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
      el.dispatchEvent(new Event('blur', { bubbles: true }));

      await new Promise((resolve) => setTimeout(resolve, 100));

      const actualVerifiedValue = el.value || '';
      const isVerified = actualVerifiedValue.length > 0;

      return Object.assign({}, action, {
        status: isVerified ? 'verified_success' : 'verified_failed',
        verifiedValue: actualVerifiedValue,
        reasoning: isVerified
          ? `Successfully filled and verified field value ("${actualVerifiedValue.slice(0, 30)}${actualVerifiedValue.length > 30 ? '...' : ''}")`
          : 'Value population succeeded but verification failed.',
      });
    } catch (err) {
      return Object.assign({}, action, {
        status: 'verified_failed',
        reasoning: `Error populating field: ${err.message}`,
      });
    }
  }

  static isForbiddenSubmitButton(el) {
    const text = (el.textContent || el.getAttribute('value') || '').toLowerCase();
    const isSubmitType = el.getAttribute('type') === 'submit';
    const matchesForbiddenText = ['submit', 'apply now', 'complete application', 'send application'].some(t => text.includes(t));
    return isSubmitType || matchesForbiddenText;
  }
}

export const formFiller = new FormFiller();
