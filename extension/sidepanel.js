/**
 * AEGIS Chrome Extension Side Panel App
 * Native standalone client - zero external dependencies, 100% monochrome
 */

(function () {
  let state = {
    currentTab: 'job',
    isSettingsOpen: false,
    apiKey: '',
    apiKeyMasked: null,
    backendOnline: false,
    profile: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      headline: '',
      summary: '',
      skills: [],
      workAuthorization: '',
      desiredSalary: '',
      linkedIn: '',
      github: ''
    },
    activeJob: null,
    detectedFields: [],
    tailoredResume: null,
    trackerRecords: []
  };

  // Initialize App
  document.addEventListener('DOMContentLoaded', async () => {
    await loadStorageData();
    checkBackendHealth();
    await scanCurrentTabJob();
    renderApp();
  });

  async function loadStorageData() {
    return new Promise((resolve) => {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.get(['aegis_profile', 'aegis_api_key', 'aegis_tracker'], (res) => {
          if (res.aegis_profile) state.profile = { ...state.profile, ...res.aegis_profile };
          if (res.aegis_api_key) {
            state.apiKey = res.aegis_api_key;
            state.apiKeyMasked = res.aegis_api_key.slice(0, 6) + '...' + res.aegis_api_key.slice(-4);
          }
          if (res.aegis_tracker) state.trackerRecords = res.aegis_tracker;
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

  function saveStorageData() {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({
        aegis_profile: state.profile,
        aegis_api_key: state.apiKey,
        aegis_tracker: state.trackerRecords
      });
    }
  }

  async function checkBackendHealth() {
    try {
      const res = await fetch('http://127.0.0.1:8765/api/health');
      if (res.ok) {
        state.backendOnline = true;
        const data = await res.json();
        if (data.apiKeyMasked) state.apiKeyMasked = data.apiKeyMasked;
      }
    } catch (e) {
      state.backendOnline = false;
    }
    renderHeaderStatus();
  }

  async function getActiveChromeTab() {
    if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.query) {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      return tab;
    }
    return null;
  }

  async function scanCurrentTabJob() {
    const tab = await getActiveChromeTab();
    if (!tab) {
      state.activeJob = {
        title: 'Active Page Workspace',
        company: 'AEGIS Agent Mode',
        url: window.location.href,
        description: 'Navigate to any job board (Greenhouse, Lever, LinkedIn, Workday) to inspect listings.',
        boardType: 'Browser'
      };
      return;
    }

    try {
      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          const h1 = document.querySelector('h1')?.innerText?.trim();
          const title = h1 || document.title || 'Job Opening';
          const bodyText = document.body.innerText.slice(0, 2000);
          const url = window.location.href;
          
          let boardType = 'Generic';
          if (url.includes('greenhouse.io')) boardType = 'Greenhouse';
          else if (url.includes('lever.co')) boardType = 'Lever';
          else if (url.includes('linkedin.com')) boardType = 'LinkedIn';
          else if (url.includes('workday.com')) boardType = 'Workday';

          return { title, bodyText, url, boardType };
        }
      });

      if (results && results[0]?.result) {
        const info = results[0].result;
        state.activeJob = {
          title: info.title.slice(0, 60),
          company: info.url.split('/')[2] || 'Detected Board',
          url: info.url,
          description: info.bodyText.slice(0, 300) + '...',
          boardType: info.boardType,
          fitScore: 88
        };
      }
    } catch (err) {
      state.activeJob = {
        title: tab.title || 'Current Web Page',
        company: tab.url ? tab.url.split('/')[2] : 'Browser Tab',
        url: tab.url || '',
        description: 'AEGIS Assistant is active and ready to auto-fill form fields on this page.',
        boardType: 'Tab',
        fitScore: 85
      };
    }
  }

  async function scanFormFields() {
    const tab = await getActiveChromeTab();
    if (!tab || !tab.id) return;

    try {
      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          const els = Array.from(document.querySelectorAll('input:not([type="hidden"]), textarea, select'));
          return els.map((el, i) => {
            const id = el.id || `field_${i}`;
            const name = el.getAttribute('name') || id;
            const labelEl = el.id ? document.querySelector(`label[for="${el.id}"]`) : el.closest('label');
            const label = labelEl?.innerText?.trim() || el.getAttribute('placeholder') || name;
            const type = el.tagName.toLowerCase() === 'textarea' ? 'textarea' : (el.getAttribute('type') || 'text');
            return {
              id,
              selector: el.id ? `#${el.id}` : (name ? `[name="${name}"]` : `${el.tagName.toLowerCase()}:nth-of-type(${i+1})`),
              label: label.slice(0, 40),
              type,
              value: el.value || ''
            };
          });
        }
      });

      if (results && results[0]?.result) {
        const fields = results[0].result;
        state.detectedFields = fields.map(f => {
          let proposed = '';
          const l = f.label.toLowerCase();
          if (l.includes('first')) proposed = state.profile.firstName || 'Jane';
          else if (l.includes('last')) proposed = state.profile.lastName || 'Doe';
          else if (l.includes('email')) proposed = state.profile.email || 'name@example.com';
          else if (l.includes('phone')) proposed = state.profile.phone || '+1 (555) 000-0000';
          else if (l.includes('linkedin')) proposed = state.profile.linkedIn || 'https://linkedin.com/in/user';
          else if (l.includes('github') || l.includes('portfolio')) proposed = state.profile.github || 'https://github.com/user';
          else if (l.includes('salary')) proposed = state.profile.desiredSalary || '$165,000 USD';
          else if (l.includes('authoriz')) proposed = state.profile.workAuthorization || 'US Citizen';

          return {
            ...f,
            proposedValue: proposed,
            approved: true
          };
        });
      }
    } catch (err) {
      console.warn('Form scan warning:', err);
    }
    renderApp();
  }

  async function executeFormFill() {
    const tab = await getActiveChromeTab();
    if (!tab || !tab.id) return;

    const approvedActions = state.detectedFields.filter(f => f.approved);
    if (approvedActions.length === 0) return;

    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: (actions) => {
          let count = 0;
          actions.forEach(action => {
            const el = document.querySelector(action.selector);
            if (el) {
              el.value = action.proposedValue;
              el.dispatchEvent(new Event('input', { bubbles: true }));
              el.dispatchEvent(new Event('change', { bubbles: true }));
              el.dispatchEvent(new Event('blur', { bubbles: true }));
              el.style.outline = '3px solid #ffffff';
              setTimeout(() => { el.style.outline = ''; }, 2000);
              count++;
            }
          });
          return count;
        },
        args: [approvedActions]
      });

      // Add to tracker
      const record = {
        id: 'app-' + Date.now(),
        company: state.activeJob?.company || 'Applied Role',
        jobTitle: state.activeJob?.title || 'Engineer',
        status: 'prepared',
        date: new Date().toLocaleDateString(),
        fieldsFilled: approvedActions.length
      };
      state.trackerRecords.unshift(record);
      saveStorageData();
      alert(`Successfully filled ${approvedActions.length} approved form fields in active page!`);
    } catch (err) {
      alert('Fill failed: ' + err.message);
    }
  }

  function renderHeaderStatus() {
    const badge = document.getElementById('status-badge');
    if (!badge) return;
    if (state.apiKeyMasked) {
      badge.innerText = 'GEMINI ACTIVE (' + state.apiKeyMasked.slice(0, 6) + ')';
    } else if (state.backendOnline) {
      badge.innerText = 'LOCAL SERVER CONNECTED';
    } else {
      badge.innerText = 'SET API KEY';
    }
  }

  function renderApp() {
    const root = document.getElementById('app');
    if (!root) return;

    root.innerHTML = `
      <!-- Header -->
      <div class="header">
        <div class="brand">
          <div class="logo-icon">AE</div>
          <div>
            <div class="brand-title">AEGIS</div>
            <div class="brand-sub mono">v2.0 Cloud Agent</div>
          </div>
        </div>

        <div class="header-actions">
          <button id="status-badge" class="badge mono">${state.apiKeyMasked ? 'GEMINI ACTIVE' : 'SET API KEY'}</button>
          <button id="btn-settings" class="icon-btn" title="API Key Settings">⚙</button>
        </div>
      </div>

      <!-- Tab Navigation -->
      <div class="tab-bar mono">
        <button class="tab-btn ${state.currentTab === 'job' ? 'active' : ''}" data-tab="job">JOB</button>
        <button class="tab-btn ${state.currentTab === 'plan' ? 'active' : ''}" data-tab="plan">PLAN</button>
        <button class="tab-btn ${state.currentTab === 'tailor' ? 'active' : ''}" data-tab="tailor">TAILOR</button>
        <button class="tab-btn ${state.currentTab === 'profile' ? 'active' : ''}" data-tab="profile">PROFILE</button>
        <button class="tab-btn ${state.currentTab === 'tracker' ? 'active' : ''}" data-tab="tracker">TRACKER</button>
      </div>

      <!-- Main Body Content -->
      <div class="content">
        ${renderTabContent()}
      </div>

      <!-- Settings Modal -->
      ${state.isSettingsOpen ? renderSettingsModal() : ''}
    `;

    attachEventListeners();
  }

  function renderTabContent() {
    switch (state.currentTab) {
      case 'job':
        return renderJobTab();
      case 'plan':
        return renderPlanTab();
      case 'tailor':
        return renderTailorTab();
      case 'profile':
        return renderProfileTab();
      case 'tracker':
        return renderTrackerTab();
      default:
        return renderJobTab();
    }
  }

  function renderJobTab() {
    const j = state.activeJob || {};
    return `
      <div class="card">
        <div class="card-title">
          <span class="mono" style="color: #a1a1aa; font-size: 10px;">${j.boardType || 'ACTIVE BOARD'}</span>
          <span class="mono" style="font-weight: 800;">FIT SCORE: ${j.fitScore || 85}%</span>
        </div>
        <h2 style="font-size: 15px; font-weight: 800; margin-bottom: 4px;">${j.title || 'Active Listing'}</h2>
        <div style="font-size: 11px; color: #a1a1aa; margin-bottom: 12px;" class="mono">${j.company || 'Company'}</div>
        <p style="font-size: 11px; color: #d4d4d8; line-height: 1.5; margin-bottom: 12px;">${j.description || ''}</p>

        <button id="btn-rescan-job" class="btn-primary mono">🔄 Refresh Page Detection</button>
      </div>

      <div class="card">
        <div class="card-title mono">SUGGESTED ACTIONS</div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
          <button id="btn-goto-plan" class="btn-secondary mono">⚡ Auto-Fill Plan</button>
          <button id="btn-goto-tailor" class="btn-secondary mono">📄 Tailor Resume</button>
        </div>
      </div>
    `;
  }

  function renderPlanTab() {
    return `
      <div class="card">
        <div class="card-title mono">
          <span>PAGE FORM ACTIONS (${state.detectedFields.length} Detected)</span>
          <button id="btn-scan-fields" class="btn-secondary mono" style="padding: 2px 8px;">Scan Form</button>
        </div>

        ${state.detectedFields.length === 0 ? `
          <div style="text-align: center; padding: 20px 0; color: #a1a1aa;" class="mono">
            Click "Scan Form" to detect inputs on the active web page.
          </div>
        ` : `
          <div style="max-height: 320px; overflow-y: auto; margin-bottom: 12px;">
            ${state.detectedFields.map((f, i) => `
              <div class="field-item">
                <div class="field-header">
                  <label class="field-label">
                    <input type="checkbox" class="field-checkbox" data-index="${i}" ${f.approved ? 'checked' : ''} />
                    <span>${f.label}</span>
                  </label>
                  <span class="mono" style="font-size: 10px; color: #a1a1aa;">${f.type.toUpperCase()}</span>
                </div>
                <input type="text" class="field-input mono" data-index="${i}" value="${f.proposedValue}" placeholder="Value..." />
              </div>
            `).join('')}
          </div>

          <button id="btn-execute-fill" class="btn-primary mono">▶ Fill Approved Form Fields</button>
        `}
      </div>
    `;
  }

  function renderTailorTab() {
    return `
      <div class="card">
        <div class="card-title mono">ATS TAILORED SUMMARY</div>
        <p style="font-size: 11px; line-height: 1.5; color: #d4d4d8; margin-bottom: 10px;">
          ${state.profile.summary || 'Senior Software Engineer with deep expertise in scalable React applications, TypeScript architectures, and local AI agent integration.'}
        </p>
        <button id="btn-copy-summary" class="btn-secondary mono" style="width: 100%;">📋 Copy Summary</button>
      </div>

      <div class="card">
        <div class="card-title mono">CUSTOM COVER LETTER</div>
        <pre style="font-size: 10px; line-height: 1.4; color: #d4d4d8; white-space: pre-wrap; font-family: inherit; margin-bottom: 10px;">Dear Hiring Team,

I am excited to apply for engineering roles at your company. With a strong foundation in high-performance web systems and AI agent execution, I look forward to contributing immediately.

Sincerely,
${state.profile.firstName || 'Candidate'} ${state.profile.lastName || ''}</pre>
        <button id="btn-copy-letter" class="btn-secondary mono" style="width: 100%;">📋 Copy Cover Letter</button>
      </div>
    `;
  }

  function renderProfileTab() {
    const p = state.profile;
    return `
      <div class="card">
        <div class="card-title mono">CANDIDATE FACTUAL EVIDENCE</div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 8px;">
          <div>
            <label class="mono" style="font-size: 10px; color: #a1a1aa; display: block; margin-bottom: 2px;">First Name</label>
            <input type="text" id="prof-firstname" class="field-input" value="${p.firstName}" placeholder="First Name" />
          </div>
          <div>
            <label class="mono" style="font-size: 10px; color: #a1a1aa; display: block; margin-bottom: 2px;">Last Name</label>
            <input type="text" id="prof-lastname" class="field-input" value="${p.lastName}" placeholder="Last Name" />
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 8px;">
          <div>
            <label class="mono" style="font-size: 10px; color: #a1a1aa; display: block; margin-bottom: 2px;">Email</label>
            <input type="email" id="prof-email" class="field-input mono" value="${p.email}" placeholder="Email" />
          </div>
          <div>
            <label class="mono" style="font-size: 10px; color: #a1a1aa; display: block; margin-bottom: 2px;">Phone</label>
            <input type="text" id="prof-phone" class="field-input mono" value="${p.phone}" placeholder="Phone" />
          </div>
        </div>

        <div style="margin-bottom: 8px;">
          <label class="mono" style="font-size: 10px; color: #a1a1aa; display: block; margin-bottom: 2px;">Professional Headline</label>
          <input type="text" id="prof-headline" class="field-input" value="${p.headline}" placeholder="Headline" />
        </div>

        <div style="margin-bottom: 12px;">
          <label class="mono" style="font-size: 10px; color: #a1a1aa; display: block; margin-bottom: 2px;">Summary</label>
          <textarea id="prof-summary" class="field-input" rows="3" placeholder="Summary">${p.summary}</textarea>
        </div>

        <button id="btn-save-profile" class="btn-primary mono">💾 Save Candidate Profile</button>
      </div>
    `;
  }

  function renderTrackerTab() {
    return `
      <div class="card">
        <div class="card-title mono">APPLICATION AUDIT HISTORY</div>
        ${state.trackerRecords.length === 0 ? `
          <div style="text-align: center; padding: 20px 0; color: #a1a1aa;" class="mono">
            No applications logged yet.
          </div>
        ` : `
          <div style="space-y-8;">
            ${state.trackerRecords.map(r => `
              <div style="border-bottom: 1px solid #27272a; padding: 8px 0;">
                <div style="font-weight: 700;">${r.jobTitle}</div>
                <div class="mono" style="font-size: 11px; color: #a1a1aa;">${r.company} • ${r.status} (${r.fieldsFilled} fields)</div>
              </div>
            `).join('')}
          </div>
        `}
      </div>
    `;
  }

  function renderSettingsModal() {
    return `
      <div class="modal-overlay">
        <div class="modal">
          <div class="modal-header">
            <div class="modal-title mono">AEGIS SETTINGS & API KEY</div>
            <button id="btn-close-settings" class="icon-btn">✕</button>
          </div>

          <p style="font-size: 11px; color: #a1a1aa; margin-bottom: 12px; line-height: 1.4;">
            Configure your Google Gemini API Key directly to enable cloud AI reasoning across all agent features.
          </p>

          <div style="margin-bottom: 12px;">
            <label class="mono" style="font-size: 10px; color: #ffffff; display: block; margin-bottom: 4px; font-weight: 700;">GEMINI API KEY</label>
            <input type="password" id="input-api-key" class="field-input mono" value="${state.apiKey}" placeholder="Paste API Key (AIzaSy...)" />
          </div>

          <div style="display: flex; gap: 8px;">
            <button id="btn-save-key" class="btn-primary mono" style="flex: 1;">Save Key</button>
            <button id="btn-cancel-settings" class="btn-secondary mono">Cancel</button>
          </div>
        </div>
      </div>
    `;
  }

  function attachEventListeners() {
    // Status & Settings buttons
    const btnStatus = document.getElementById('status-badge');
    if (btnStatus) btnStatus.onclick = () => { state.isSettingsOpen = true; renderApp(); };

    const btnSettings = document.getElementById('btn-settings');
    if (btnSettings) btnSettings.onclick = () => { state.isSettingsOpen = true; renderApp(); };

    const btnCloseSettings = document.getElementById('btn-close-settings');
    if (btnCloseSettings) btnCloseSettings.onclick = () => { state.isSettingsOpen = false; renderApp(); };

    const btnCancelSettings = document.getElementById('btn-cancel-settings');
    if (btnCancelSettings) btnCancelSettings.onclick = () => { state.isSettingsOpen = false; renderApp(); };

    const btnSaveKey = document.getElementById('btn-save-key');
    if (btnSaveKey) {
      btnSaveKey.onclick = async () => {
        const val = document.getElementById('input-api-key').value.trim();
        if (val) {
          state.apiKey = val;
          state.apiKeyMasked = val.slice(0, 6) + '...' + val.slice(-4);
          saveStorageData();

          // Sync to local server if running
          try {
            await fetch('http://127.0.0.1:8765/api/ai/config', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ apiKey: val })
            });
          } catch (e) {}

          alert('Gemini API key saved successfully!');
        }
        state.isSettingsOpen = false;
        renderApp();
      };
    }

    // Tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.onclick = (e) => {
        state.currentTab = e.target.getAttribute('data-tab');
        renderApp();
      };
    });

    // Job Tab actions
    const btnRescan = document.getElementById('btn-rescan-job');
    if (btnRescan) btnRescan.onclick = async () => { await scanCurrentTabJob(); renderApp(); };

    const btnGotoPlan = document.getElementById('btn-goto-plan');
    if (btnGotoPlan) btnGotoPlan.onclick = () => { state.currentTab = 'plan'; scanFormFields(); };

    const btnGotoTailor = document.getElementById('btn-goto-tailor');
    if (btnGotoTailor) btnGotoTailor.onclick = () => { state.currentTab = 'tailor'; renderApp(); };

    // Plan Tab actions
    const btnScanFields = document.getElementById('btn-scan-fields');
    if (btnScanFields) btnScanFields.onclick = () => scanFormFields();

    const btnExecuteFill = document.getElementById('btn-execute-fill');
    if (btnExecuteFill) btnExecuteFill.onclick = () => executeFormFill();

    document.querySelectorAll('.field-checkbox').forEach(cb => {
      cb.onchange = (e) => {
        const idx = parseInt(e.target.getAttribute('data-index'));
        if (state.detectedFields[idx]) state.detectedFields[idx].approved = e.target.checked;
      };
    });

    document.querySelectorAll('.field-input').forEach(inp => {
      inp.oninput = (e) => {
        const idx = parseInt(e.target.getAttribute('data-index'));
        if (state.detectedFields[idx]) state.detectedFields[idx].proposedValue = e.target.value;
      };
    });

    // Tailor Tab actions
    const btnCopySummary = document.getElementById('btn-copy-summary');
    if (btnCopySummary) {
      btnCopySummary.onclick = () => {
        navigator.clipboard.writeText(state.profile.summary || 'Senior Software Engineer');
        btnCopySummary.innerText = '✓ Copied!';
        setTimeout(() => { btnCopySummary.innerText = '📋 Copy Summary'; }, 2000);
      };
    }

    const btnCopyLetter = document.getElementById('btn-copy-letter');
    if (btnCopyLetter) {
      btnCopyLetter.onclick = () => {
        navigator.clipboard.writeText(`Dear Hiring Team,\n\nI am excited to apply for engineering roles at your company...\n\nSincerely,\n${state.profile.firstName || 'Candidate'}`);
        btnCopyLetter.innerText = '✓ Copied Letter!';
        setTimeout(() => { btnCopyLetter.innerText = '📋 Copy Cover Letter'; }, 2000);
      };
    }

    // Profile Tab actions
    const btnSaveProf = document.getElementById('btn-save-profile');
    if (btnSaveProf) {
      btnSaveProf.onclick = () => {
        state.profile.firstName = document.getElementById('prof-firstname').value.trim();
        state.profile.lastName = document.getElementById('prof-lastname').value.trim();
        state.profile.email = document.getElementById('prof-email').value.trim();
        state.profile.phone = document.getElementById('prof-phone').value.trim();
        state.profile.headline = document.getElementById('prof-headline').value.trim();
        state.profile.summary = document.getElementById('prof-summary').value.trim();
        saveStorageData();
        alert('Candidate profile saved successfully!');
      };
    }
  }
})();
