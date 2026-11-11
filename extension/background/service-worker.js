/**
 * AEGIS Manifest V3 Background Service Worker
 * Manages sidepanel behavior, active tab tracking, state persistence,
 * and message dispatching between Side Panel, Content Script, and Local Agent Backend.
 */

const DEFAULT_STATE = {
  activeTabId: null,
  activeJobId: null,
  lastExtractedJob: null,
  lastPlan: null,
};

// Open Side Panel on extension icon click
if (typeof chrome !== 'undefined' && chrome.sidePanel && chrome.sidePanel.setPanelBehavior) {
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch((error) => {
    console.error('Failed to set side panel behavior:', error);
  });
}

// Restore or initialize extension state in chrome.storage.local
async function getStoredState() {
  if (typeof chrome === 'undefined' || !chrome.storage) {
    return DEFAULT_STATE;
  }
  return new Promise((resolve) => {
    chrome.storage.local.get(['aegis_state'], (result) => {
      resolve(result.aegis_state || DEFAULT_STATE);
    });
  });
}

async function updateState(partialState) {
  const current = await getStoredState();
  const updated = Object.assign({}, current, partialState);
  if (typeof chrome !== 'undefined' && chrome.storage) {
    await chrome.storage.local.set({ aegis_state: updated });
  }
}

// Listen for tab activation to update activeTabId
if (typeof chrome !== 'undefined' && chrome.tabs) {
  chrome.tabs.onActivated.addListener(async (activeInfo) => {
    await updateState({ activeTabId: activeInfo.tabId });
  });
}

// Message Listener for extension messaging
if (typeof chrome !== 'undefined' && chrome.runtime) {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    handleMessage(message, sender).then(sendResponse).catch((err) => {
      sendResponse({ status: 'error', error: err.message });
    });
    return true; // Keep channel open for async response
  });
}

async function handleMessage(message, sender) {
  switch (message.type) {
    case 'PING_BACKGROUND':
      return { status: 'ok', timestamp: new Date().toISOString() };

    case 'SAVE_JOB_STATE':
      await updateState({ lastExtractedJob: message.job });
      return { status: 'success' };

    case 'GET_STATE':
      const state = await getStoredState();
      return { status: 'success', state };

    case 'EXECUTE_CONTENT_SCRIPT':
      if (typeof chrome !== 'undefined' && chrome.tabs) {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab && tab.id) {
          const response = await chrome.tabs.sendMessage(tab.id, message.payload);
          return response;
        }
      }
      return { status: 'no_active_tab' };

    default:
      return { status: 'unknown_message_type' };
  }
}

console.log('[AEGIS Background Service Worker] Initialized and listening.');
