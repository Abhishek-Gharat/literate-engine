# ReactViz — Comprehensive Codebase & Architecture Context

> **Quick Reference for AI Agents & Developers**  
> Read this document first before inspecting source files. This file contains the complete architectural blueprint, data flow, component maps, state management schema, analysis algorithms, API contracts, and troubleshooting guides for the ReactViz project.

---

## 1. Project Overview & Mission

- **Project Name:** ReactViz (`reactviz` in `package.json`, repository `Abhishek-Gharat/literate-engine`)
- **Domain:** Developer tooling / React static analysis & codebase visualizer.
- **Core Purpose:** Parses React codebases (JS, JSX, TS, TSX) using Babel AST parsing, resolves import/export module dependency graphs, detects circular dependencies, computes architectural health scores (0-100), identifies re-render hotspots and dead exports, visualizes the graph interactively using React Flow (`@xyflow/react`), and provides AI-driven architectural reviews and file-level explanations via OpenRouter.
- **Dual Execution Mode:**
  1. **Full-Stack Mode:** React 19 frontend + Express 5 backend with Better-SQLite3 for saving projects and historical analysis runs.
  2. **Client-Only / Static Hosting Mode (Vercel):** The frontend contains a `localAnalysisFallback.js` that dynamically imports `@babel/parser` and runs the complete AST analysis engine directly inside the browser.

---

## 2. Technology Stack & Key Dependencies

| Layer | Technologies / Libraries | Purpose |
| :--- | :--- | :--- |
| **Frontend Framework** | React 19 (`react`, `react-dom` 19.2.4), Vite 8 | UI rendering and lightning-fast modern bundling |
| **Styling & Design System** | Tailwind CSS v4, PostCSS, Vanilla CSS tokens (`src/styles/constants.js`) | Dark-themed, sleek glassmorphism UI |
| **Graph Visualization** | `@xyflow/react` (React Flow v12.10.1), `dagre` | Interactive directed graph canvas, auto-layout (TB/LR), custom nodes/edges |
| **AST & Analysis Engine** | `@babel/parser` (v7.29.7) | Client-side and server-side static AST parsing of JSX/TSX |
| **State Management** | Zustand (v5.x in `src/store.js`) + Custom Hooks | Centralized UI, graph, selection, navigation history, and AI chat state |
| **Backend Service** | Express 5.2.1, Node.js (>=20.19.0) | REST API for project management, run history, and analysis execution |
| **Database** | `better-sqlite3` (v11.0.0) | Embedded SQLite DB with WAL mode (`data/reactviz.db`) |
| **Backend Security & Infra**| `helmet`, `cors`, `express-rate-limit`, `uuid` | Security headers, CORS whitelisting, IP rate limiting |
| **AI Integration** | OpenRouter API (client-side or server-proxied) | LLM-based file explanations and 1-click architecture review reports |
| **Testing** | Playwright (E2E), Vitest (unit), Node test runner (`node --test`) | Multi-tier test suite |

---

## 3. Directory Structure & File Manifest

```
literate-engine/
├── server/                             # Express 5 Backend
│   ├── __tests__/                      # Server integration & unit tests
│   ├── controllers/
│   │   └── analysisController.js       # Handles POST /api/analysis, snapshot persistence
│   ├── db/
│   │   ├── init.js                     # Better-SQLite3 init, table schema, WAL mode
│   │   └── queries.js                  # CRUD for projects & analysis_runs
│   ├── errors/
│   │   └── ApiError.js                 # Custom HTTP error hierarchy (400, 404, 500, etc.)
│   ├── middleware/
│   │   ├── analysisRateLimit.js        # IP rate limiting for analysis endpoints
│   │   ├── errorHandler.js             # Centralized express error handler + 404 handler
│   │   └── requestContext.js           # Request ID tagging and logging
│   ├── routes/
│   │   ├── analysisRoutes.js           # /api/analysis
│   │   ├── projectsRoutes.js           # /api/projects CRUD
│   │   └── runsRoutes.js               # /api/runs & /api/projects/:projectId/runs
│   ├── services/
│   │   └── analysisService.js          # Invokes src/analysis/engine.js from Node environment
│   ├── validation/
│   │   ├── analysisRequest.js          # Payload validation for analysis request
│   │   └── fileNormalizer.js           # Sanitizes uploaded files and names
│   ├── app.js                          # Express app factory (middleware, CORS, routes)
│   └── index.js                        # HTTP server bootstrap (port 3001 default)
│
├── src/                                # React 19 Frontend
│   ├── analysis/                       # Static Analysis Engine (shared browser/server)
│   │   ├── engine.js                   # Main orchestrator: parse -> resolve -> graph -> metrics
│   │   └── *.test.js                   # Tests for dead exports, health score, cycles, risks
│   ├── components/                     # React UI Components
│   │   ├── AIExplainPanel/             # Chat UI for file-level AI analysis
│   │   ├── EdgeTypes/                  # Custom React Flow edges (animated cyclic arrows)
│   │   ├── FileInput/                  # File/folder upload landing interface
│   │   ├── GraphCanvas/                # React Flow canvas, Dagre layout, export PNG/SVG/JSON
│   │   ├── IssuesPanel.jsx             # Collapsible drawer for cycles, orphans, god components
│   │   ├── NodeCard/                   # Card renderer for node details and import lists
│   │   ├── NodeInspector/              # Right drawer inspector (file metrics, blast radius, AI)
│   │   ├── NodeTypes/                  # Custom React Flow node components
│   │   ├── NodesLegend/                # Graph color/type legend
│   │   ├── RunDetailPanel/             # Snapshot summary & metrics inspection
│   │   ├── RunHistoryList/             # History list of past analysis runs
│   │   ├── SearchBar/                  # Search input with node autocomplete / filtering
│   │   ├── StatBadge/                  # Header metric counters (files, components, cycles, etc.)
│   │   ├── feedback/                   # Loading, error, and empty states
│   │   ├── inspector/                  # Inspector tabs (InfoTab, ChatTab, ApiKeyInput)
│   │   ├── modals/                     # CreateProjectModal, etc.
│   │   ├── projects/                   # Project list and sidebar
│   │   ├── refactor/                   # RefactorModal for 1-click AI decoupling & patch generator
│   │   ├── review/                     # ReviewModal for AI architecture audit report
│   │   ├── runs/                       # RunComparisonPanel, EvolutionModal, GraphDiffModal
│   │   ├── share/                      # ShareViewer for shared snapshot URLs
│   │   └── uploads/                    # UploadCenter (drag & drop, folder, GitHub repo URL, ZIP)
│   ├── demo/                           # Pre-packaged Interactive Demo
│   │   ├── demoData.js                 # 24-file mock e-commerce app AST data
│   │   └── DemoExperience.jsx          # Guided interactive showcase mode
│   ├── hooks/                          # Custom React Hooks
│   │   ├── useAIExplain.js             # Manages OpenRouter chat messages and responses
│   │   ├── useApiKey.js                # OpenRouter API key management (stored in localStorage)
│   │   ├── useArchReview.js            # Architecture review generation hook
│   │   ├── useCreateProject.js         # Modal and API helper for creating projects
│   │   ├── useFileInput.js             # File picker and GitHub repo fetcher
│   │   ├── useGraphBuilder.js          # Analysis pipeline caller + graph state builder
│   │   ├── useNodeSelection.js         # Node selection and 50-item history stack
│   │   ├── useProjects.js              # Projects CRUD fetcher
│   │   ├── useRefactorPlan.js          # 1-Click AI refactoring proposal & patch generator hook
│   │   ├── useRuns.js                  # Runs fetcher and comparison
│   │   └── useUpload.js                # Upload state machine and GitHub tree downloader
│   ├── services/                       # API Client Layer
│   │   ├── analysisApi.js              # Fetch client for /api/analysis
│   │   ├── localAnalysisFallback.js    # Client-side dynamic fallback using engine.js
│   │   ├── projectsApi.js              # Fetch client for /api/projects
│   │   └── runsApi.js                  # Fetch client for /api/runs
│   ├── styles/                         # Design System
│   │   └── constants.js                # JS tokens: COLORS, TYPOGRAPHY, SPACING, LAYOUT, CSS_VARS
│   ├── utils/                          # Analysis & Graph Algorithms
│   │   ├── cycleDetector.js            # DFS cycle detection on dependency map
│   │   ├── elkLayout.js                # ELK layout worker & layout helper
│   │   ├── evolution.js                # Cross-run metric trend calculations
│   │   ├── exportUtils.js              # PNG, SVG, and JSON export utilities
│   │   ├── graphAdapter.js             # Converts raw analysis output into React Flow nodes/edges
│   │   ├── graphDiff.js                # Calculates added/removed nodes & edges between two runs
│   │   ├── healthScore.js              # 0-100 architectural health score calculator & grade
│   │   ├── impactAnalysis.js           # Transitive dependent BFS calculator ("blast radius")
│   │   ├── importParser.js             # Babel AST parser for imports, exports, and re-exports
│   │   ├── nodeColors.js               # Color mapping for node types
│   │   ├── nodeTypeClassifier.js       # Classifies files (component, hook, page, context, etc.)
│   │   ├── refactorBuilder.js          # AI refactoring prompt synthesizer, offline engine & patch builder
│   │   ├── rerenderRisk.js             # Context consumption & unmemoized wide fan-in detector
│   │   ├── reviewBuilder.js            # Synthesizes codebase digest for AI prompt
│   │   └── runComparison.js            # Compares metrics across 2 runs (deltas)
│   ├── store.js                        # Central Zustand store (React Flow state, UI, history)
│   ├── App.jsx                         # Main dashboard view orchestrator
│   └── main.jsx                        # Application root
```

---

## 4. Architectural Data Flow

```
[User Input] (Local Files / Folder / Zip / GitHub URL)
        │
        ▼
[UploadCenter / useFileInput / useUpload]
        │
        ├───> Check VITE_REACTVIZ_API_URL
        │        │
        │        ├── [Configured & Server Up] ──> POST /api/analysis ──> Express backend
        │        │                                                      │
        │        │                                                      ▼
        │        └── [Not configured or Failed] ───────────────> localAnalysisFallback.js
        │                                                               │
        ▼                                                               ▼
[Static Analysis Engine: src/analysis/engine.js]
        │
        ├── 1. Babel AST Parsing (`importParser.js`):
        │      Extracts ESM imports, dynamic imports, require(), exports, re-export chains.
        │
        ├── 2. Path Resolution (`resolveImportRecords`):
        │      Maps relative specifiers (`./App`, `../components/Button`) to real project files.
        │
        ├── 3. React Signal Extraction (`extractReactSignals`):
        │      Regex scan for `useContext`, `useState`, `memo`, `useMemo`, `createContext`.
        │
        ├── 4. Cycle Detection (`cycleDetector.js`):
        │      DFS cycle search producing directed loop edge pairs.
        │
        ├── 5. Dead Export Detection (`buildExportUsageIndex`):
        │      Traces re-export barrel fixpoints and flags exported identifiers never imported.
        │
        ├── 6. Health Score Calculation (`healthScore.js`):
        │      Scores 0-100 (Grade A-F) deducting for cycles, orphans, god components, dead exports.
        │
        └── 7. Output Envelope:
               { nodes, edges, depMap, cyclicEdges, stats, unresolvedImports, analysisErrors }
        │
        ▼
[Graph Adapter: src/utils/graphAdapter.js]
        │
        ├── Decorates nodes with types (entry, component, hook, page, context, ghost).
        ├── Flags cyclic edges with animated danger styles.
        └── Runs Dagre layout engine (Rankdir: 'TB', Ranksep: 100, Nodesep: 60)
        │
        ▼
[React Flow Canvas: src/components/GraphCanvas/index.jsx]
        ├── Interactive Node Graph with Pan / Zoom / Minimap
        ├── Focus Mode (1-hop neighbor isolation)
        ├── ⚛ Re-render Risk Heatmap Mode
        ├── Blast Radius Highlight Overlay
        └── Export Engine (PNG, SVG, JSON)
```

---

## 5. Core Subsystems & Key Files

### 5.1 Static Analysis Engine (`src/analysis/engine.js` & `src/utils/`)
- **`importParser.js`**: Parses AST using `@babel/parser` with plugins: `jsx`, `typescript`, `classProperties`, `dynamicImport`, `exportDefaultFrom`.
- **`nodeTypeClassifier.js`**:
  - `root`: App entry (`main.jsx`, `index.js`, `App.jsx`).
  - `page`: Files matching `/pages/`, `/views/`, `/routes/`, or `*Page.jsx`.
  - `hook`: Files matching `/hooks/` or `use*.js`.
  - `context`: Files matching `/context/` or `*Context.jsx`.
  - `component`: Any standard JSX component.
  - `ghost`: Referenced external or unparsed dependency.
- **`healthScore.js`**:
  - Baseline score: 100.
  - Cycle penalty: `Math.min(cycles * 8, 32)`
  - Orphan penalty: `Math.min(Math.round(orphanRatio * 20), 20)`
  - God component penalty: `Math.min(godComponents * 6, 18)` (Fan-in ≥ 8 or Fan-out ≥ 15)
  - Coupling penalty: `avgCoupling > 3 ? Math.min((avgCoupling - 3) * 4, 10) : 0`
  - Dead export penalty: `Math.min(deadExportCount * 2, 10)`
  - Unresolved imports penalty: `Math.min(unresolvedImports, 10)`
- **`impactAnalysis.js` (Blast Radius)**:
  - BFS traversal of `importedBy` pointers.
  - Identifies everything that transitively breaks if a given file is modified.
- **`rerenderRisk.js`**:
  - Highlights components consuming wide contexts (top 8).
  - Flags unmemoized components with high fan-in (`fanIn >= 6`).

### 5.2 State Management (`src/store.js`)
Centralized Zustand store with slices:
1. **Graph Slice**: `nodes`, `edges`, `depMap`, `cyclicEdges`, `stats`, `unresolvedImports`, `analysisErrors`, `runId`.
2. **App UI Slice**: `graphReady`, `search`, `searchResults` (via Fuse.js), `selectedProject`, `runs`, `selectedRun`, `demoMode`, `activeTab`, `issuesPanelOpen`.
3. **Node Selection & History Slice**:
   - `selectedNode`, `selectedNodeId`, `showInspector`.
   - `nodeHistory`: Array of visited node IDs (up to 50 entries).
   - `historyIndex`: Supports browser-like Back and Forward node navigation (`goBack()`, `goForward()`).
   - `focusNodeId`: Dim all nodes except the active node and its 1-hop neighbors (`toggleFocus()`).
4. **AI & API Key Slice**: `apiKey` (persisted in `localStorage['reactviz_api_key']`), `messages`, `aiLoading`, `aiError`.

### 5.3 Backend Server & Database (`server/`)
- **Database**: SQLite file stored at `data/reactviz.db` (configurable via `DATA_DIR` environment variable).
- **Tables**:
  - `projects`: `(id TEXT PRIMARY KEY, name TEXT UNIQUE, created_at TEXT, updated_at TEXT, description TEXT)`
  - `analysis_runs`: `(id TEXT PRIMARY KEY, project_id TEXT FK, created_at TEXT, snapshot TEXT, stats TEXT, unresolved_imports TEXT, analysis_errors TEXT)`
- **Endpoints**:
  - `POST /api/analysis`: Runs analysis on payload `{ files, projectId? }`. If `projectId` is provided, automatically saves a run snapshot to the database.
  - `GET /api/projects`: Lists projects with aggregate run counts.
  - `POST /api/projects`: Creates a project `{ name, description? }`.
  - `GET /api/projects/:projectId/runs`: Lists historical runs (stats only) for a project.
  - `GET /api/runs/:id`: Fetches complete snapshot and metadata for a specific run.

---

## 6. Known Edge Cases, Gotchas & Historical Fixes

1. **GitHub Repository Fetching (`GITHUB_FETCH_COMPLETE_ISSUE.md`)**:
   - Strips `.git` suffixes and trailing slashes from pasted URLs.
   - Does NOT use `HEAD` in `raw.githubusercontent.com` URLs; fetches the repository info from `https://api.github.com/repos/${owner}/${repo}` to find the true `default_branch` (`main`, `master`, etc.).
   - Handles unauthenticated GitHub rate limits (60 req/hr) gracefully by reporting 403 vs 404.
2. **Barrel / Re-export Chains Dead Export False Positives**:
   - Re-exports (`export { x } from './y'`) are propagated through a fixpoint loop in `buildExportUsageIndex` in `src/analysis/engine.js`.
3. **Vercel Deployment Compatibility**:
   - The backend server is not hosted on Vercel. Frontend defaults to `localAnalysisFallback.js` if `VITE_REACTVIZ_API_URL` is empty.
4. **Node Navigation Duplicate Avoidance**:
   - Clicking the same node multiple times does not add duplicate entries to `nodeHistory` in `src/store.js`.
5. **Auto-open Issues Panel**:
   - In `src/App.jsx`, if a project is loaded and has circular dependencies or orphan files, the issues drawer automatically opens once on initial load.

---

## 7. Development & Testing Commands

```bash
# Start frontend Vite dev server (http://localhost:5173)
npm run dev

# Start Express API server (http://localhost:3001)
npm run dev:api
# Or production server
npm start

# Run unit tests (Vitest)
npm run test:unit

# Run Node test runner for engine & backend
npm run test:api

# Run Playwright End-to-End tests
npm run test:e2e
npm run test:e2e:ui

# Lint codebase
npm run lint

# Build production frontend bundle
npm run build
```

---

## 8. Styling & Design Tokens Reference

All design tokens are strictly centralized in `src/styles/constants.js`:
- **Dark Theme Palette**:
  - Main background: `#000000` / `#0a0a0a`
  - Cards & Elevated Panels: `#111111`
  - Borders: `rgba(255, 255, 255, 0.10)`
  - Text Primary: `#ededed`, Secondary: `#a1a1a1`, Muted: `#71717a`
- **Node Colors**:
  - Component: `#5a9e6f` (Green)
  - Hook: `#b07a8a` (Rose)
  - Page / Entry: `#4a7c9b` (Blue)
  - Index: `#8b6fb0` (Purple)
  - Ghost / External: `#8a8a8a` (Gray)
  - Root: `#ffffff` (White)
  - Cycle Warning: `#ff5c5c` (Red)
