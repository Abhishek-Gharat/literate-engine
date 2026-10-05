# AGENTS.md — ReactViz Assistant Guidelines & Knowledge Base

This file is automatically indexed by the agent system. It provides immediate instructions, architectural shortcuts, and behavioral constraints so agents do not need to scan all source files when receiving tasks.

---

## ⚡ Quick Architecture Map

Full technical manual is available in [`PROJECT_CONTEXT.md`](file:///c:/Users/ASUS/project1/literate-engine/PROJECT_CONTEXT.md). Refer to it for deep implementation specifics.

### Where Code Lives:
| Feature / Domain | Primary Location | Key Files |
| :--- | :--- | :--- |
| **AST Parsing & Metrics** | `src/analysis/` & `src/utils/` | [`engine.js`](file:///c:/Users/ASUS/project1/literate-engine/src/analysis/engine.js), [`importParser.js`](file:///c:/Users/ASUS/project1/literate-engine/src/utils/importParser.js), [`healthScore.js`](file:///c:/Users/ASUS/project1/literate-engine/src/utils/healthScore.js) |
| **Cycle & Impact Analysis** | `src/utils/` | [`cycleDetector.js`](file:///c:/Users/ASUS/project1/literate-engine/src/utils/cycleDetector.js), [`impactAnalysis.js`](file:///c:/Users/ASUS/project1/literate-engine/src/utils/impactAnalysis.js), [`rerenderRisk.js`](file:///c:/Users/ASUS/project1/literate-engine/src/utils/rerenderRisk.js) |
| **Graph Adapter & Layout** | `src/utils/` | [`graphAdapter.js`](file:///c:/Users/ASUS/project1/literate-engine/src/utils/graphAdapter.js), [`elkLayout.js`](file:///c:/Users/ASUS/project1/literate-engine/src/utils/elkLayout.js) |
| **Interactive Canvas** | `src/components/GraphCanvas/` | [`GraphCanvas/index.jsx`](file:///c:/Users/ASUS/project1/literate-engine/src/components/GraphCanvas/index.jsx) (uses `@xyflow/react`) |
| **State Management** | `src/store.js` & `src/hooks/` | [`store.js`](file:///c:/Users/ASUS/project1/literate-engine/src/store.js) (Zustand), [`useGraphBuilder.js`](file:///c:/Users/ASUS/project1/literate-engine/src/hooks/useGraphBuilder.js) |
| **File / GitHub Upload** | `src/components/uploads/` & `src/hooks/` | [`UploadCenter.jsx`](file:///c:/Users/ASUS/project1/literate-engine/src/components/uploads/UploadCenter.jsx), [`useUpload.js`](file:///c:/Users/ASUS/project1/literate-engine/src/hooks/useUpload.js) |
| **Inspector & AI Chat** | `src/components/inspector/` & `src/hooks/` | [`NodeInspector/`](file:///c:/Users/ASUS/project1/literate-engine/src/components/NodeInspector/), [`useAIExplain.js`](file:///c:/Users/ASUS/project1/literate-engine/src/hooks/useAIExplain.js) |
| **1-Click AI Refactor** | `src/components/refactor/` & `src/hooks/` | [`RefactorModal.jsx`](file:///c:/Users/ASUS/project1/literate-engine/src/components/refactor/RefactorModal.jsx), [`useRefactorPlan.js`](file:///c:/Users/ASUS/project1/literate-engine/src/hooks/useRefactorPlan.js), [`refactorBuilder.js`](file:///c:/Users/ASUS/project1/literate-engine/src/utils/refactorBuilder.js) |
| **Backend & SQLite DB** | `server/` | [`app.js`](file:///c:/Users/ASUS/project1/literate-engine/server/app.js), [`db/init.js`](file:///c:/Users/ASUS/project1/literate-engine/server/db/init.js), [`db/queries.js`](file:///c:/Users/ASUS/project1/literate-engine/server/db/queries.js) |
| **Design Tokens** | `src/styles/` | [`constants.js`](file:///c:/Users/ASUS/project1/literate-engine/src/styles/constants.js) (single source of truth for colors/typography) |

---

## 🛠️ Key Conventions & Rules

1. **Dual Analysis Pipeline**:
   - The analysis engine (`src/analysis/engine.js`) is platform-agnostic and runs both in Node (via Express `/api/analysis`) and directly in the browser via `src/services/localAnalysisFallback.js`. Never introduce Node-only modules (like `fs` or `child_process`) into `src/analysis/` or `src/utils/`.
2. **Design System & Aesthetics**:
   - Colors, spacing, typography, and node colors must strictly come from `src/styles/constants.js` or matching CSS variables. Avoid hardcoded hex colors when modifying UI components.
3. **Graph Rendering (`@xyflow/react`)**:
   - React Flow v12 is used. Custom nodes are `componentNode`, custom edges are `animatedEdge`.
   - Node selection and focus mode are tracked in Zustand (`src/store.js`).
4. **GitHub Ingestion**:
   - Must use default branch detection before querying `raw.githubusercontent.com` (see [`GITHUB_FETCH_COMPLETE_ISSUE.md`](file:///c:/Users/ASUS/project1/literate-engine/GITHUB_FETCH_COMPLETE_ISSUE.md)).
