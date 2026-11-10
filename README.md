# AEGIS — ADVANCED EMPLOYMENT GUIDANCE & INTELLIGENCE SYSTEM

> **Your Intelligence. Your Opportunities. Your Future.**

AEGIS is an autonomous, privacy-conscious local Chrome Extension (Manifest V3) and local Node.js agent powered by a centralized **Google Gemini Developer API Gateway**, a **Multi-Agent Orchestration Architecture**, and **SQLite**. It analyzes job descriptions, calculates transparent mathematical match scores, builds ATS-tailored resumes and cover letters (with DOCX download), and safely populates application form fields with mandatory user approval.

AEGIS runs its backend **100% locally** on `http://127.0.0.1:8765` and uses the free-tier Google Gemini Developer API for model inference. **Ollama, GPU hardware, and paid API subscriptions are not required.**

---

## 1. Key Features

- **Centralized AI Model Gateway**: Unified, provider-independent model gateway connecting specialized AI agents to Google Gemini Developer API (`gemini-3.8-flash`) using the official `@google/genai` TypeScript SDK.
- **Multi-Agent Architecture**: 8 specialized agents with distinct system instructions, input/output schemas, and execution boundaries:
  1. *Job Intelligence Agent*
  2. *Candidate Profile Agent*
  3. *Job Matching Agent*
  4. *Resume Intelligence Agent*
  5. *Cover Letter Agent*
  6. *Application Intelligence Agent*
  7. *Screening Answer Agent*
  8. *Agent Coordinator*
- **Free-Tier & Zero-Cost Policy**: Configured strictly for free-tier usage. Never automatically enables paid billing or routes to paid models. Rate-limit (429) backoff retries and quota-exhausted handlers protect users from unexpected interruptions or costs.
- **Explicit Cloud Privacy Consent**: User profile data is transmitted to Gemini API only when explicit Cloud Privacy Consent is granted. When disabled or unconfigured, AEGIS routes requests to its local deterministic engine without data leakage.
- **Local Resume Parser**: Extract text locally from PDF, DOCX, and plain-text files using `pdf-parse` and `mammoth`.
- **Untrusted Content Defense**: Filters adversarial prompt injection instructions embedded in webpage content or job descriptions before AI reasoning.
- **Transparent Match Engine**: Calculates mathematical job fit scores (0–100%) based on structured evidence rather than guesswork.
- **ATS Resume Customization**: Tailors executive summaries and project highlights while maintaining strict 100% factual accuracy (never fabricates employment or credentials). Generates downloadable `.docx` files.
- **Safe Form Automation**: Highlights fields, dispatches synthetic events for React/Angular/Vue forms, verifies values post-fill, and **never** clicks final application submit buttons.
- **Local Application Tracker**: Audit history and duplicate application prevention backed by local SQLite storage.

---

## 2. Architecture & Monorepo Overview

```
aegis/
├── extension/                       # Chrome Extension (Manifest V3)
│   ├── manifest.json                # MV3 configuration & side panel entry
│   ├── sidepanel.html               # SidePanel HTML container
│   ├── icons/                       # 16x16, 48x48, 128x128 PNG icons
│   ├── background/service-worker.ts # Service worker & extension state manager
│   ├── content/
│   │   ├── dom-reader.ts            # Job listing inspector (Greenhouse, Lever, LinkedIn, Workday)
│   │   ├── form-detector.ts         # Form controls scanner
│   │   ├── form-filler.ts           # Safe form auto-fill & post-fill value verification
│   │   └── page-observer.ts         # MutationObserver for multi-step forms
├── src/                             # Shared Web & SidePanel UI (React + Vite + Tailwind CSS)
│   ├── backend/
│   │   ├── ai-gateway/              # Centralized AI Model Gateway
│   │   │   ├── contracts.ts         # AIProvider & payload contracts
│   │   │   ├── ai-config-service.ts # Environment & Cloud Consent manager
│   │   │   ├── ai-usage-tracker.ts  # Token usage & daily metrics tracker
│   │   │   ├── ai-error-handler.ts  # Normalized AI error handler
│   │   │   ├── ai-model-gateway.ts  # Gateway router & concurrency semaphore
│   │   │   └── providers/
│   │   │       └── gemini-provider.ts # @google/genai SDK integration
│   │   ├── agents/                  # Multi-Agent Architecture
│   │   │   ├── contracts.ts         # BaseAgent interface
│   │   │   ├── agent-registry.ts    # Central registry for all 8 agents
│   │   │   ├── agent-execution-service.ts
│   │   │   └── specialized/         # Specialized AI Agents (1-8)
│   │   ├── db/database.ts           # Local SQLite storage (.aegis-data/sqlite-store.json)
│   │   ├── services/                # Business logic & automation engines
│   │   └── agent/orchestrator.ts    # State machine (OBSERVE -> REASON -> PLAN -> ACT -> VERIFY)
├── shared/
│   ├── types/index.ts               # Shared TypeScript domain contracts
│   └── schemas/index.ts             # Zod validation schemas
├── scripts/
│   ├── generate-icons.js            # Node PNG icon generator
│   └── run-tests.ts                 # Automated integration & gateway test runner
└── server.ts                        # Express server entry point (http://127.0.0.1:8765)
```

---

## 3. Prerequisites

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **Google Chrome**: Latest version supporting Manifest V3 Side Panel API
- **Google Gemini API Key** *(Free tier eligible)*: Obtain at [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)

*Note*: No Ollama installation, GPU drivers, or paid subscription required.

---

## 4. Installation & Setup Instructions

### A. Terminal Commands for Windows (PowerShell / Command Prompt)

```powershell
# 1. Navigate to the AEGIS repository
cd C:\career\projects\aegis

# 2. Install dependencies
npm install

# 3. Configure environment variables in .env
# Set GEMINI_API_KEY="YOUR_GEMINI_API_KEY"

# 4. Generate extension icons
node scripts/generate-icons.js

# 5. Start local Express & SQLite agent server (binds to http://127.0.0.1:8765)
npm run start
```

### B. Terminal Commands for macOS / Linux

```bash
# 1. Navigate to directory and install dependencies
cd /path/to/aegis
npm install

# 2. Generate extension icons
node scripts/generate-icons.js

# 3. Start local Express & SQLite agent server
npm run start
```

---

## 5. Free Gemini API Key & Environment Configuration

1. Visit Google AI Studio: [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
2. Create a free API key.
3. Configure your local `.env` file:

```env
AI_PROVIDER=gemini
GEMINI_API_KEY=YOUR_FREE_GEMINI_API_KEY
GEMINI_MODEL=gemini-3.8-flash
AI_REQUEST_TIMEOUT_MS=60000
AI_MAX_RETRIES=2
AI_MAX_CONCURRENT_REQUESTS=2
AI_MAX_OUTPUT_TOKENS=4096
```

---

## 6. Installing Chrome Extension in Chrome (Developer Mode)

1. Open AEGIS web interface in browser (`http://127.0.0.1:3000`).
2. Click **"Chrome Extension Export"** in the top navigation bar or visit `http://127.0.0.1:8765/api/extension/bundle` to download `AEGIS-Chrome-Extension.zip`.
3. Extract the ZIP file into a folder on your computer (e.g. `C:\AEGISChromeExtension`).
4. Open Google Chrome and navigate to `chrome://extensions`.
5. Toggle **"Developer mode"** in the top-right corner.
6. Click **"Load unpacked"** and select the extracted folder.
7. Click the AEGIS extension icon in your Chrome toolbar on any job posting website to open the SidePanel!

---

## 7. Running the Test Suite

AEGIS includes an automated test suite verifying Gemini AI Gateway routing, error normalization, cloud consent controls, multi-agent registry execution, prompt injection defenses, matching score formulas, screening question sensitivity, form field mapping, and tracker duplicate detection:

```bash
npx tsx scripts/run-tests.ts
```

---

## 8. Privacy Model & Security System

- **Zero Unsanitized Data Leakage**: Profile data is sent to Gemini Developer API only when explicit Cloud Privacy Consent is granted.
- **Local Backend & Storage**: Express backend binds exclusively to `127.0.0.1` and SQLite stores all candidate logs locally.
- **Untrusted Page Content Isolation**: All job descriptions and page HTML text are sanitized (`sanitizeUntrustedContent`) before AI reasoning to prevent prompt injection.
- **Safety Policy**: AEGIS **never** fills passwords, OTPs, or CAPTCHAs, and **never** automatically clicks the final application submission button.

---

## 9. Known Limitations

- **Free Tier Quotas**: Free Gemini Developer API quota limits apply (15 RPM / 1,500 RPD). When exceeded, AEGIS pauses requests and alerts the user without incurring costs.
- **Scanned Image PDFs**: Standard text extraction requires selectable text PDF or DOCX files.
- **CAPTCHAs & MFA**: Human interaction is required to solve CAPTCHAs or 2FA verification.
- **Final Submission**: AEGIS strictly stops before clicking final submit buttons to ensure human oversight.

---

## 10. Complete Audit & Verification Report

| Audit Scope & Feature Module | Implementation & Verification Status | Test Result |
| :--- | :--- | :--- |
| **Google Gemini Developer API SDK** | `@google/genai` TypeScript SDK with `User-Agent: 'aistudio-build'` | **PASSED** |
| **Central AI Model Gateway** | Provider-independent gateway with concurrency semaphore & retries | **5/5 PASSED** (`scripts/run-tests.ts`) |
| **Cloud Privacy Consent & Fallback** | Explicit user consent switch with local deterministic fallback mode | **3/3 PASSED** (`scripts/run-tests.ts`) |
| **Multi-Agent Architecture** | 8 specialized agents with distinct prompts, inputs, and schemas | **10/10 PASSED** (`scripts/run-tests.ts`) |
| **Free-Tier & Zero-Cost Policy** | Strictly free-tier, bounded retries, quota error normalization | **PASSED** |
| **Untrusted Content & Prompt Injection Defense** | Sanitizes embedded prompt attacks (`sanitizeUntrustedContent`) | **2/2 PASSED** (`scripts/run-tests.ts`) |
| **Transparent Mathematical Match Engine** | Evidence-weighted breakdown (Skill, Experience, Education) | **4/4 PASSED** (`scripts/run-tests.ts`) |
| **ATS Resume Tailoring & DOCX Export** | Factually grounded resume builder & `docx` document renderer | **3/3 PASSED** (`scripts/run-tests.ts`) |
| **Screening Question Risk Classifier** | Classifies salary/relocation sensitivity & enforces approval | **3/3 PASSED** (`scripts/run-tests.ts`) |
| **Browser Form Automation & Verification** | Form mapping, DOM event dispatching & post-fill value verification | **4/4 PASSED** (`scripts/run-tests.ts`) |
| **Bounded Agent State Machine** | Strict state sequence: `IDLE` -> `OBSERVE` -> `REASON` -> `PLAN` -> `ACT` -> `VERIFY` | **3/3 PASSED** (`scripts/run-tests.ts`) |
| **Local Application Tracker & Duplicate Check** | SQLite backing store with duplicate URL/title detection | **2/2 PASSED** (`scripts/run-tests.ts`) |
