import { domReader } from './dom-reader.js';
import { formDetector } from './form-detector.js';
import { formFiller } from './form-filler.js';
import { pageObserver } from './page-observer.js';

/**
 * AEGIS Content Script Entry Point
 * Listens for extension messaging commands and executes DOM reading & form operations.
 */

console.log('[AEGIS Content Script] Loaded on active page:', window.location.href);

// Start observing page for multi-step form changes
pageObserver.startObserving(() => {
  if (typeof chrome !== 'undefined' && chrome.runtime) {
    chrome.runtime.sendMessage({ type: 'PAGE_FORM_MUTATED' });
  }
});

// Runtime Message Listener
if (typeof chrome !== 'undefined' && chrome.runtime) {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    handleContentMessage(message).then(sendResponse).catch((err) => {
      sendResponse({ status: 'error', error: err.message });
    });
    return true; // async response
  });
}

async function handleContentMessage(message) {
  switch (message.type) {
    case 'PING_CONTENT_SCRIPT':
      return { status: 'ok', url: window.location.href };

    case 'EXTRACT_JOB_DETAILS':
      const job = domReader.extractJobFromPage();
      return { status: 'success', job };

    case 'DETECT_FORM_FIELDS':
      const fields = formDetector.detectFormFields();
      return { status: 'success', fields };

    case 'HIGHLIGHT_FIELD':
      formFiller.highlightField(message.selector);
      return { status: 'success' };

    case 'FILL_APPROVED_FIELD':
      const result = await formFiller.fillApprovedField(message.action);
      return { status: 'success', result };

    default:
      return { status: 'unknown_command' };
  }
}
