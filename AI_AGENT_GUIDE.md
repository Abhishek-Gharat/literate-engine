# ReactViz - Quick Reference for AI Agents

## 🎯 PROJECT ESSENCE IN 30 SECONDS

**ReactViz** is a React dependency visualization tool that:
1. Takes JavaScript/TypeScript files as input
2. Parses import statements to build a dependency graph
3. Detects circular dependencies automatically
4. Visualizes everything as an interactive graph
5. Provides AI-powered casual explanations via chat

**Problem it solves:** Developers can't easily see how their React components interconnect. This tool visualizes the entire project structure including circular dependencies.

---

## 📊 DATA FLOW DIAGRAM

```
INPUT FILES
    ↓
parseImports() → Extract import statements
    ↓
resolveImports() → Convert relative paths to absolute filenames
    ↓
getNodeType() → Classify each file (component/hook/util/other)
    ↓
detectCycles() → Find circular dependencies
    ↓
Dagre Layout → Calculate x,y positions for graph
    ↓
RENDER: GraphCanvas displays interactive visualization
    ↓
USER INTERACTION:
  • Click node → Shows imports/dependents
  • Ask AI → Sends context to OpenRouter API
  • Red edges → Cyclic dependencies
  • Blue edges → Normal dependencies
```

---

## 🔑 KEY FILES FOR AI AGENTS (In Order of Importance)

| Priority | File | Why | Size |
|----------|------|-----|------|
| 🔴 **1** | `src/hooks/useGraphBuilder.js` | Core algorithm - extracts & analyzes deps | ~200 lines |
| 🔴 **1** | `src/App.jsx` | Main orchestrator - state management | ~150 lines |
| 🟡 **2** | `src/utils/importParser.js` | Dependency extraction logic | ~80 lines |
| 🟡 **2** | `src/utils/cycleDetector.jsx` | Circular dep detection (DFS algorithm) | ~50 lines |
| 🟡 **2** | `src/components/GraphCanvas/index.jsx` | Visualization rendering | ~100 lines |
| 🟢 **3** | `src/hooks/useAIExplain.js` | Chat/AI integration | ~100 lines |
| 🟢 **3** | `src/components/FileInput/index.jsx` | File upload interface | ~60 lines |

---

## 💾 CRITICAL DATA STRUCTURES

### **depMap** (Dependency Map)
```javascript
// Example output from parseImports() and resolveImports()
{
  "src/App.jsx": ["src/components/GraphCanvas", "src/hooks/useGraphBuilder"],
  "src/components/GraphCanvas/index.jsx": ["@xyflow/react", "dagre"],
  "src/hooks/useGraphBuilder.js": ["src/utils/importParser", "src/utils/cycleDetector"],
  ...
}
```
- Key = filename (absolute)
- Value = array of filenames it imports

### **nodes** (for @xyflow)
```javascript
[
  {
    id: "src/App.jsx",
    data: { 
      label: "App.jsx",
      nodeType: "component",
      imports: ["GraphCanvas", "useGraphBuilder"],
      importedBy: ["main.jsx"]
    },
    position: { x: 100, y: 200 },  // Set by Dagre
    sourcePosition: "bottom",
    targetPosition: "top"
  },
  ...
]
```

### **edges** (for @xyflow)
```javascript
[
  {
    id: "edge-1",
    source: "src/App.jsx",
    target: "src/components/GraphCanvas/index.jsx",
    animated: false,
    style: { stroke: '#3b82f6' }  // Blue for normal, red for cyclic
  },
  ...
]
```

### **cyclicEdges** (from detectCycles)
```javascript
[
  ["A.jsx", "B.jsx"],  // A imports B
  ["B.jsx", "C.jsx"],  // B imports C
  ["C.jsx", "A.jsx"],  // C imports A (completes cycle!)
]
```

### **stats** (Project Statistics)
```javascript
{
  totalFiles: 12,
  totalComponents: 5,
  totalHooks: 3,
  cyclesFound: 2,
  avgImportsPerFile: 2.4
}
```

---

## 🔄 CORE ALGORITHMS

### **1. Import Parsing (importParser.js)**
```
REGEX: /(?:import\s+(?:[\w*{}\s,]+\s+from\s+)?['"](.+?)['"]|require\s*\(\s*['"](.+?)['"]\s*\))/g

INPUT:  File content (string)
OUTPUT: Array of import paths (strings)

Catches:
✓ import X from './file'
✓ import { A, B } from '../file'
✓ import * as X from './file'
✓ import './styles.css'
✓ const X = require('./file')
```

### **2. Cycle Detection (cycleDetector.jsx)**
```
ALGORITHM: Depth-First Search (DFS) with stack
INPUT:     depMap {filename: [imports], ...}
OUTPUT:    Array of cyclic edges

HOW IT WORKS:
1. Maintain: visited set, inStack set, path array
2. For each unvisited node, start DFS
3. When visiting a node:
   - If already in stack → CYCLE FOUND
   - Mark all edges from current cycle
4. Return all marked edges

TIME:  O(V + E) where V=files, E=imports
SPACE: O(V)
```

### **3. Layout (Dagre)**
```
INPUT:  nodes[], edges[]
OUTPUT: Updated nodes with position {x, y}

PARAMETERS:
- rankdir: 'TB' (top-bottom) or 'LR' (left-right)
- ranksep: vertical spacing between ranks
- nodesep: horizontal spacing between nodes
- acyclicer: 'greedy' (handles cycles automatically)
- ranker: 'tight-tree' (compact layout)

RESULT: Hierarchical graph layout (like org chart)
```

---

## 🎨 COMPONENT ARCHITECTURE

```
App.jsx (ORCHESTRATOR)
├── State: graphReady, selectedNode, apiKey, search, messages
├── Handlers: handleFilesReady, handleNodeClick, handleSendMessage
│
├── FileInput (if !graphReady)
│   ├── Local file upload + filtering
│   ├── GitHub URL input (optional)
│   └── onFilesReady → triggers buildGraph()
│
└── GraphContainer (if graphReady)
    ├── GraphCanvas
    │   ├── Renders nodes (ComponentNode)
    │   ├── Renders edges (AnimatedEdge)
    │   ├── Pan/zoom/minimap controls
    │   └── onNodeClick → setSelectedNode()
    │
    ├── NodeInspector (if showInspector)
    │   ├── Shows: imports, importedBy, nodeType
    │   └── Toggle visibility
    │
    └── AIExplainPanel (if apiKey)
        ├── Chat messages display
        ├── Input field for questions
        └── API calls to OpenRouter

HOOKS:
useGraphBuilder()
├── Calls: parseImports → resolveImports → detectCycles
├── Returns: {nodes, edges, depMap, stats, buildGraph()}
└── Uses: Dagre for layout

useAIExplain()
├── Calls: OpenRouter API with context
├── Returns: {messages, loading, error, sendMessage(), clearChat()}
└── Models: Llama 3.3 70B, Llama 4 Scout, etc (free)
```

---

## 🚦 STATE TRANSITIONS

```
INITIAL STATE: graphReady = false
    ↓
USER UPLOADS FILES → onFilesReady()
    ↓
BUILDING: buildGraph() runs (parsing, layout, cycle detection)
    ↓
SUCCESS: graphReady = true, render GraphCanvas
    ↓
USER CLICKS NODE → selectedNode = node.data, showInspector = true
    ↓
INSPECTOR SHOWS: imports, importedBy, nodeType
    ↓
USER ASKS AI (optional) → sendMessage() → API call → messages updated
    ↓
Red edges in graph = cyclic deps (visual alert)
```

---

## 🔧 HOW TO EXTEND THIS PROJECT

### **Add a new analysis feature:**
1. Create function in utils/ (e.g., `dependencyDepthCalculator.js`)
2. Call it from `useGraphBuilder.js`
3. Store result in `stats` object
4. Display in `NodeInspector` or pass to AI

### **Add a new visualization type:**
1. Create component in `components/`
2. Import in `App.jsx`
3. Add toggle in UI
4. Receive `nodes`, `edges`, `depMap` as props

### **Add custom node styling:**
1. Edit `ComponentNode.jsx` based on `nodeData.nodeType`
2. Different colors for components vs hooks vs utils
3. Node size based on import count (degree)

### **Improve cycle detection:**
1. Currently finds cycles, but doesn't measure severity
2. Could add: number of cycles, longest cycle path
3. Suggest refactoring targets

---

## 📋 ENVIRONMENT & SETUP

```bash
Node: >= 16
Package Manager: npm or pnpm

Dependencies:
- React 19.2.4 (UI framework)
- @xyflow/react 12.10.1 (graph visualization)
- dagre 0.8.5 (graph layout algorithm)
- vite 8.0.0 (build tool)
- tailwindcss 4.2.1 (styling)

External API:
- OpenRouter AI API (free Llama models)
  Endpoint: https://openrouter.ai/api/v1/chat/completions
  Auth: Bearer token (user-provided API key)

Storage:
- localStorage: API key (client-side only)
- No backend database
```

---

## ⚡ PERFORMANCE CONSIDERATIONS

| Metric | Limit | Impact |
|--------|-------|--------|
| Files | ~1000 | Parsing becomes slow (O(n)) |
| Imports per file | ~50 | High complexity, slow layout |
| Cyclic deps | ~10 | DFS traversal OK, visual clutter |
| Graph render | 500+ nodes | @xyflow may stutter on zoom |

**Optimization opportunities:**
- Memoize depMap and stats
- Virtualize node rendering for 100+ nodes
- Lazy-load AI responses
- Add progress indicator during parsing

---

## 🎯 TESTING CHECKLIST FOR AI AGENTS

If you modify code, verify:

1. **Import Parsing:**
   - ✓ Detects ES6 imports
   - ✓ Detects CommonJS requires
   - ✓ Handles relative & absolute paths
   - ✓ Ignores CSS imports

2. **Cycle Detection:**
   - ✓ Finds simple 2-node cycles
   - ✓ Finds complex multi-node cycles
   - ✓ Marks correct edges as cyclic
   - ✓ No false positives

3. **Graph Rendering:**
   - ✓ Nodes positioned correctly
   - ✓ Edges connect right nodes
   - ✓ Red edges only for cyclic
   - ✓ Pan/zoom works smoothly

4. **AI Chat:**
   - ✓ Context sent correctly
   - ✓ API key validated
   - ✓ Error handling for API failures
   - ✓ Chat history persists

---

## 🔗 IMPORT MAP (What Imports What)

```
App.jsx
├── imports: FileInput, GraphCanvas, NodeInspector, useGraphBuilder, useAIExplain
│
useGraphBuilder.js
├── imports: dagre, importParser, cycleDetector
│
importParser.js
├── imports: nothing (pure utility)
│
cycleDetector.jsx
├── imports: nothing (pure utility)
│
GraphCanvas/index.jsx
├── imports: @xyflow/react, dagre, ComponentNode, AnimatedEdge
│
FileInput/index.jsx
├── imports: react (useState, useRef)
│
NodeInspector/index.jsx
├── imports: react (useState)
│
AIExplainPanel/index.jsx
├── imports: react (useState, useCallback), useAIExplain
│
ComponentNode.jsx
├── imports: react, Handle (from @xyflow)
│
AnimatedEdge.jsx
├── imports: react, BaseEdge, EdgeLabelRenderer, getBezierPath (from @xyflow)
```

---

## 💡 QUICK TIPS FOR AI AGENTS

1. **To understand flow:** Start with App.jsx, then useGraphBuilder.js
2. **To debug parsing:** Add console logs in importParser.js
3. **To debug cycles:** Check cycleDetector.jsx DFS logic
4. **To improve layout:** Adjust Dagre parameters in getLayoutedElements()
5. **To style nodes:** Edit ComponentNode.jsx based on nodeData.nodeType
6. **To optimize:** Memoize useGraphBuilder results, virtualize rendering
7. **To extend:** Each layer (parse → detect → layout → render) is independent

---

## 📞 COMMON QUESTIONS FOR AI AGENTS

**Q: Why are my cycles not detected?**
A: Check if resolveImports() correctly mapped relative paths to filenames. DFS needs exact filename matches.

**Q: Why is the graph layout weird?**
A: Adjust Dagre parameters (rankdir, ranksep, nodesep). Some graphs are inherently hard to layout. Try 'LR' instead of 'TB'.

**Q: How do I add a new file type?**
A: Create new nodeType in getNodeType(), style it in ComponentNode.jsx, use different colors in CSS.

**Q: Can I detect dynamic imports?**
A: Current regex won't catch `import(variable)`. Would need AST parsing (e.g., Babel parser).

**Q: How do I make it faster for large projects?**
A: Implement chunked parsing, memoize heavy operations, virtualize node rendering, add debouncing to search.

