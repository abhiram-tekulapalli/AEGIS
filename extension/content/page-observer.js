/**
 * Page Observer Module
 * Uses MutationObserver to detect dynamic form step transitions
 * (e.g. Greenhouse / Lever multi-step applications).
 */

export class PageObserver {
  constructor() {
    this.observer = null;
    this.onChangeCallback = null;
  }

  startObserving(onChange) {
    this.stopObserving();
    this.onChangeCallback = onChange;

    this.observer = new MutationObserver((mutations) => {
      const formAdded = mutations.some((m) =>
        Array.from(m.addedNodes).some(
          (node) =>
            node instanceof HTMLElement &&
            (node.tagName === 'FORM' || node.querySelector('input, textarea, select'))
        )
      );

      if (formAdded && this.onChangeCallback) {
        this.onChangeCallback();
      }
    });

    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  stopObserving() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }
}

export const pageObserver = new PageObserver();
