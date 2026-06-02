# ReactViz - Project Analysis & Complete Documentation

**Project Name:** ReactViz  
**Type:** React + Vite Application  
**Purpose:** Interactive React project dependency visualization and analysis tool  
**Status:** Active Development  

---

## 🎯 PROBLEM STATEMENT - What Problems Does This Project Solve?

### **Primary Problems:**

1. **Code Dependency Visibility Problem**
   - Developers can't easily see how React components are interconnected
   - Manual dependency tracking is error-prone and time-consuming
   - Large projects become hard to understand without visualization

2. **Circular Dependency Detection**
   - Circular imports cause runtime errors and build issues
   - Hard to spot manually in complex codebases
   - Need automated detection and visual highlighting

3. **Project Structure Understanding**
   - New developers can't quickly grasp project architecture
   - No visual representation of component relationships
   - Documentation often outdated or missing

4. **Interactive Code Exploration**
   - Can't drill down into specific components to understand dependencies
   - No way to query "what imports this file?" or "what does this import?"
   - AI-powered explanation system for casual, friendly guidance

### **Solution Approach:**
- Upload React project files (.js, .jsx, .ts, .tsx)
- Parse all imports and build dependency graph
- Visualize as interactive graph with Dagre layout algorithm
- Detect and highlight circular dependencies in red
- Click nodes to inspect detailed import information
- Use AI (via OpenRouter API) to explain architecture conversationally

---

## 📁 COMPLETE FOLDER STRUCTURE

```
reactviz/
│
├── 📄 index.html                    # Entry HTML file
├── 📄 package.json                  # Dependencies & scripts
├── 📄 vite.config.js                # Vite bundler config
├── 📄 tailwind.config.js            # Tailwind CSS config
├── 📄 eslint.config.js              # ESLint rules
├── 📄 README.md                     # Original template docs
│
├── 📁 public/                       # Static assets
│   └── [public files]
│
└── 📁 src/                          # SOURCE CODE ROOT
    │
    ├── 📄 main.jsx                  # Vite entry point (mounts React app)
    ├── 📄 App.jsx                   # Main app component + layout
    ├── 📄 index.css                 # Global styles
    ├── 📄 App.css                   # App-specific styles
    │
    ├── 📁 components/               # REACT COMPONENTS
    │   │
    │   ├── 📁 FileInput/
    │   │   └── 📄 index.jsx         # File upload interface (local + GitHub)
    │   │                             # Filters for .js/.jsx/.ts/.tsx files
    │   │
    │   ├── 📁 GraphCanvas/
    │   │   └── 📄 index.jsx         # Main graph visualization canvas
    │   │                             # Uses @xyflow/react for rendering
    │   │                             # Handles layout, interactions, zoom/pan
    │   │
    │   ├── 📁 NodeInspector/
    │   │   └── 📄 index.jsx         # Detail panel for selected nodes
    │   │                             # Shows imports, importedBy, file type
    │   │
    │   ├── 📁 NodeTypes/
    │   │   └── 📄 ComponentNode.jsx # Custom node appearance in graph
    │   │                             # Renders based on nodeType (component/hook/util/other)
    │   │
    │   ├── 📁 EdgeTypes/
    │   │   └── 📄 AnimatedEdge.jsx  # Custom edge (connection) styling
    │   │                             # Red for cyclic edges, blue for normal
    │   │                             # Animated path effect
    │   │
    │   └── 📁 AIExplainPanel/
    │       └── 📄 index.jsx         # Chat interface for AI explanations
    │                                 # Sends context to OpenRouter API
    │
    ├── 📁 hooks/                    # CUSTOM REACT HOOKS
    │   │
    │   ├── 📄 useGraphBuilder.js    # Core dependency parsing & graph building
    │   │                             # Orchestrates: parseImports → resolveImports → detectCycles
    │   │                             # Outputs: nodes, edges, depMap, stats
    │   │                             # Layout calculation with Dagre algorithm
    │   │
    │   └── 📄 useAIExplain.js       # AI chat integration hook
    │                                 # Builds context from current node/depMap/stats
    │                                 # Sends to OpenRouter free models (Llama)
    │                                 # Maintains chat history, error handling
    │
    ├── 📁 assets/                   # Static images/media
    │   └── [icon files, etc]
    │
    └── 📁 utils/                    # UTILITY FUNCTIONS
        │
        ├── 📄 importParser.js       # Import extraction & resolution
        │   │
        │   ├─ parseImports()        # Regex-based import statement extraction
        │   │   │ Input: files array [{name, content}, ...]
        │   │   └ Output: depMap = {"App.jsx": ["./Navbar", "../hooks/useAuth"], ...}
        │   │
        │   ├─ resolveImports()      # Convert relative paths to absolute filenames
        │   │   │ Input: depMap with relative paths
        │   │   └ Output: normalized depMap with real filenames
        │   │
        │   └─ getNodeType()         # Classify file as component/hook/util/other
        │       └ Returns: 'component'|'hook'|'util'|'other'
        │
        └── 📄 cycleDetector.jsx     # Circular dependency detection
            │
            ├─ detectCycles()        # DFS-based cycle detection
            │   │ Input: resolved depMap
            │   └ Output: cyclicEdges = [["A.jsx", "B.jsx"], ...]
            │
            └─ isCyclicEdge()        # Check if specific edge is part of cycle
                └ Returns: boolean

```

---

## 🏗️ ARCHITECTURE & DATA FLOW

### **High-Level Flow:**

```
User uploads files
    ↓
FileInput component → onFilesReady()
    ↓
useGraphBuilder hook:
    • parseImports() extracts import statements
    • resolveImports() converts paths to filenames
    • getNodeType() classifies each file
    • detectCycles() finds circular deps
    • Dagre layout algorithm positions nodes
    ↓
Output: nodes[], edges[], depMap, stats
    ↓
GraphCanvas renders:
    • Nodes (ComponentNode) with visual styling
    • Edges (AnimatedEdge) - red if cyclic, blue otherwise
    • Interactive pan/zoom/minimap
    ↓
User clicks node → Node Inspector shows:
    • File name & type
    • Direct imports (dependencies)
    • Files that import this (dependents)
    ↓
Optional: Select AI Explain → Chat with AI about architecture
    • useAIExplain sends context to OpenRouter API
    • Llama 3.3 70B or similar free model responds
    • API key stored in localStorage
```

### **State Management:**
- **App.jsx:** Top-level state orchestration
  - `graphReady` - bool (show FileInput vs Graph)
  - `selectedNode` - current inspected node data
  - `showInspector` - visibility toggle
  - `apiKey` - OpenRouter API key (persisted)
  - `search` - search filter text
  - `messages` - AI chat history

- **useGraphBuilder:** Memoized graph data
  - `nodes`, `edges` - @xyflow data structures
  - `depMap` - dependency mapping
  - `stats` - project statistics

- **useAIExplain:** Chat state
  - `messages` - array of {role, content, id}
  - `loading` - API request in progress
  - `error` - error message display

---

## 📊 KEY COMPONENTS BREAKDOWN

| Component | Purpose | Key Props | Output |
|-----------|---------|-----------|--------|
| **FileInput** | Dual-mode file upload | `onFilesReady()` | Array of {name, content} |
| **GraphCanvas** | Main visualization | `nodes, edges, onNodeClick` | Interactive graph view |
| **NodeInspector** | Node detail panel | `node` (selected data) | Import/dependent info |
| **ComponentNode** | Custom node renderer | Data from @xyflow | Styled node in graph |
| **AnimatedEdge** | Custom edge renderer | Data from @xyflow | Animated line (red/blue) |
| **AIExplainPanel** | Chat interface | `apiKey, selectedNode, depMap` | Messages & responses |

---

## 🔧 UTILITY FUNCTIONS BREAKDOWN

### **importParser.js:**
```javascript
parseImports(files[]) 
  // Extracts all import/require statements
  // Returns depMap: {"App.jsx": ["./Navbar", "../utils/helpers"], ...}
  
resolveImports(depMap, fileIndex)
  // Converts relative paths to absolute filenames
  // "./Navbar" → "src/components/Navbar.jsx"
  
getNodeType(filename)
  // 'component' if contains component pattern
  // 'hook' if filename starts with "use"
  // 'util' if in utils/ folder
  // 'other' otherwise
```

### **cycleDetector.jsx:**
```javascript
detectCycles(depMap)
  // DFS traversal to find all circular dependencies
  // Returns array of cyclic edges for visualization
  
isCyclicEdge(edge, cyclicEdges)
  // Checks if edge is in cyclic set
  // Used to color edges red in graph
```

---

## 📦 DEPENDENCIES & TECH STACK

### **Core Framework:**
- `react@^19.2.4` - Component library
- `react-dom@^19.2.4` - DOM rendering

### **Graph Visualization:**
- `@xyflow/react@^12.10.1` - Interactive node-link graph
- `dagre@^0.8.5` - Graph layout algorithm (hierarchical positioning)

### **Build & Dev:**
- `vite@^8.0.0` - Fast bundler
- `@vitejs/plugin-react@^6.0.0` - React support

### **Styling:**
- `tailwindcss@^4.2.1` - Utility CSS framework
- `autoprefixer@^10.4.27` - CSS vendor prefixes
- `postcss@^8.5.8` - CSS processing

### **Code Quality:**
- `eslint@^9.39.4` - Linting
- `eslint-plugin-react-*` - React-specific rules

### **npm Scripts:**
```bash
npm run dev        # Start dev server (localhost:5173)
npm run build      # Production build to dist/
npm run lint       # Run ESLint
npm run preview    # Preview built version
```

---

## 🎨 STYLING APPROACH

- **Tailwind CSS** for utility-first styling
- **Inline styles** in App.jsx for dark theme (background: #0a0a12, text: #f1f5f9)
- **@xyflow/react/dist/style.css** for graph canvas styling
- **Custom CSS** in src/App.css and src/index.css

---

## 🔌 EXTERNAL INTEGRATIONS

### **OpenRouter API (Free Models):**
- Used by `useAIExplain` hook
- Free models available (Llama 3.3 70B, Llama 4 Scout, Llama 4 Maverick)
- Endpoint: `https://openrouter.ai/api/v1/chat/completions`
- System prompt: Friendly React mentor explaining codebases
- Context includes: current file, imports, dependents, project stats

---

## 🚨 CIRCULAR DEPENDENCY DETECTION

**How it works:**
1. `detectCycles()` does DFS on dependency graph
2. If node already in stack → cycle found
3. Marks all edges in that cycle
4. GraphCanvas renders cyclic edges in red (vs blue for normal)
5. NodeInspector can show if node is part of cycle

**Example:**
```
App.jsx imports Button.jsx
Button.jsx imports Card.jsx
Card.jsx imports App.jsx  ← CYCLE DETECTED
```
All 3 edges render red in graph.

---

## 📈 PROJECT STATISTICS

The `useGraphBuilder` hook generates:
- `totalFiles` - count of all parsed files
- `totalComponents` - files classified as components
- `totalHooks` - files classified as hooks
- `cyclesFound` - count of circular dependencies
- `avgImportsPerFile` - dependency density metric

---

## 🎯 USER WORKFLOW

1. **Start:** User sees FileInput page
2. **Upload:** Choose JS/JSX/TS/TSX files (local or GitHub URL)
3. **Parse:** Backend extracts imports, builds graph
4. **Visualize:** GraphCanvas shows interactive dependency diagram
5. **Inspect:** Click any node → NodeInspector shows details
6. **Ask AI:** (Optional) Add API key, ask AI about architecture
7. **Analyze:** Look for red edges (circular deps), high-degree nodes

---

## ⚠️ KNOWN LIMITATIONS

- Only parses static imports (dynamic requires not fully supported)
- Relative path resolution assumes standard React project structure
- AI responses depend on OpenRouter API availability
- No database persistence (graph data not saved between sessions)
- CSS/image imports not shown (only JS/TS modules)

---

## 🔮 EXTENSION OPPORTUNITIES

1. Export graph as JSON, PNG, SVG
2. Persist projects (save/load graph)
3. Git integration for live repo scanning
4. Plugin system for custom analysis rules
5. Performance metrics (large vs small nodes based on LOC)
6. Refactoring suggestions from AI
7. Multi-project comparison
8. API endpoint for programmatic access

---

## 📝 FILE ENCODING & FORMATS

- **Source:** JavaScript/JSX/TypeScript/TSX files (UTF-8)
- **Graph Data:** JSON-compatible objects (nodes[], edges[])
- **Visualization:** SVG rendering via @xyflow
- **API Calls:** JSON REST (OpenRouter)
- **Storage:** localStorage (API key only)

---

## 🔐 SECURITY NOTES

- API keys stored in localStorage (user's browser only)
- No backend server - fully client-side processing
- File uploads stay in browser memory (not sent to server)
- OpenRouter API key sent to OpenRouter servers only

---

## 🚀 QUICK START FOR AI AGENTS

**To understand this project:**

1. **Entry Point:** `src/App.jsx` - main orchestrator
2. **Graph Logic:** `src/hooks/useGraphBuilder.js` - core algorithm
3. **Parsing:** `src/utils/importParser.js` - dependency extraction
4. **Cycle Detect:** `src/utils/cycleDetector.jsx` - circular deps
5. **UI:** `src/components/GraphCanvas/index.jsx` - visualization
6. **AI:** `src/hooks/useAIExplain.js` - AI integration

**Key Concepts:**
- depMap = `{filename: [imports], ...}`
- cyclicEdges = array of [source, target] edges forming cycles
- nodes/edges = @xyflow data structures with position & styling
- Dagre = layout algorithm that positions nodes hierarchically

