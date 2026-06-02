# ReactViz - Complete Folder Structure Reference

## 📁 ROOT LEVEL FILES

```
reactviz/
├── 📄 package.json
│   └─ NPM configuration
│      • Project name, version, type
│      • Scripts: dev, build, lint, preview
│      • Dependencies (React, @xyflow, dagre, etc.)
│      • Dev dependencies (Vite, ESLint, Tailwind, PostCSS)
│
├── 📄 vite.config.js
│   └─ Vite bundler configuration
│      • Entry point: index.html
│      • Plugin: @vitejs/plugin-react (React Fast Refresh)
│      • No custom build settings (uses defaults)
│
├── 📄 index.html
│   └─ HTML entry point
│      • Mounts React app to <div id="root">
│      • Imports main.jsx script
│
├── 📄 eslint.config.js
│   └─ ESLint linting rules
│      • JS language config
│      • React hooks best practices
│      • React refresh plugin support
│
├── 📄 tailwind.config.js
│   └─ Tailwind CSS configuration
│      • Dark mode settings (used in App.jsx)
│      • Custom theme colors
│      • Plugin configuration
│
├── 📄 README.md
│   └─ Original Vite + React template docs (can be ignored)
│
└── 📁 public/
    └─ Static assets (images, fonts, etc.)
       • Served as-is by Vite
       • Not bundled (for large files)
```

---

## 🎯 SRC/ DIRECTORY - APPLICATION CODE ROOT

```
src/
├── 📄 main.jsx
│   └─ Vite JavaScript entry point
│      • Imports React and ReactDOM
│      • Mounts <App /> to DOM element 'root'
│      • Called after index.html loads
│
├── 📄 App.jsx
│   └─ ROOT REACT COMPONENT (Main orchestrator)
│      • Size: ~150 lines
│      • State management for entire app:
│        ├─ graphReady (bool): show FileInput or GraphCanvas
│        ├─ selectedNode: currently inspected node
│        ├─ showInspector: visibility toggle
│        ├─ apiKey: OpenRouter API key
│        ├─ search: filter text
│        └─ messages: AI chat history
│      • Imports:
│        ├─ FileInput component
│        ├─ GraphCanvas component
│        ├─ NodeInspector component
│        ├─ useGraphBuilder hook
│        └─ useAIExplain hook
│      • Conditionally renders:
│        ├─ FileInput (if !graphReady)
│        └─ GraphCanvas + panels (if graphReady)
│      • Handles events:
│        ├─ onFilesReady() → calls buildGraph()
│        ├─ onNodeClick() → sets selectedNode
│        └─ onSendMessage() → calls sendMessage() from useAIExplain
│
├── 📄 index.css
│   └─ Global styles
│      • Reset CSS rules
│      • Tailwind directives (@tailwind base, components, utilities)
│      • May include custom global variables
│
├── 📄 App.css
│   └─ App-specific styles
│      • Animations (fade-in, slide-in, etc.)
│      • Component-specific overrides
│      • Dark theme adjustments
│
├── 📁 assets/
│   └─ Static image/icon files
│      • React logo, icons, illustrations
│      • Referenced by components
│
├── 📁 components/
│   └─ REUSABLE REACT COMPONENTS (UI layer)
│
├── 📁 hooks/
│   └─ CUSTOM REACT HOOKS (Logic layer)
│
└── 📁 utils/
    └─ UTILITY FUNCTIONS (Pure functions, algorithms)
```

---

## 🧩 SRC/COMPONENTS/ - USER INTERFACE COMPONENTS

### **Each component structure:**
```
ComponentName/
├── index.jsx ← Main component file
└── [optional: style.css]
```

### **All Components:**

```
src/components/

│
├── 📁 FileInput/
│   └── 📄 index.jsx
│       └─ UPLOAD INTERFACE
│          • Size: ~60 lines
│          • Purpose: Accept React files from user
│          • Props:
│            └─ onFilesReady: (files[]) => void
│          • Features:
│            ├─ Local file upload
│            ├─ GitHub URL input (optional)
│            ├─ File type filtering (.js, .jsx, .ts, .tsx)
│            ├─ Error messages (no files selected)
│            └─ Loading state during file processing
│          • Flow:
│            1. User selects files from disk
│            2. Component filters for valid JS/TS files
│            3. Reads file contents as text
│            4. Calls onFilesReady([{name, content}, ...])
│
├── 📁 GraphCanvas/
│   └── 📄 index.jsx
│       └─ GRAPH VISUALIZATION (Main view)
│          • Size: ~100 lines
│          • Purpose: Render interactive dependency graph
│          • Dependencies:
│            ├─ @xyflow/react (graph library)
│            ├─ dagre (layout algorithm)
│            ├─ ComponentNode (custom node type)
│            └─ AnimatedEdge (custom edge type)
│          • Props:
│            ├─ nodes: @xyflow node objects
│            ├─ edges: @xyflow edge objects
│            └─ onNodeClick: (nodeData) => void
│          • Features:
│            ├─ Pan and zoom controls
│            ├─ MiniMap (overview)
│            ├─ Customizable layout direction (TB, LR)
│            ├─ Click handling
│            └─ Keyboard shortcuts
│          • Uses Dagre layout to position nodes
│
├── 📁 NodeInspector/
│   └── 📄 index.jsx
│       └─ DETAIL PANEL (Right sidebar)
│          • Size: ~40 lines
│          • Purpose: Show details of selected node
│          • Props:
│            ├─ node: selected node data
│            └─ visible: bool (show/hide)
│          • Displays:
│            ├─ File name
│            ├─ Node type (component/hook/util/other)
│            ├─ Direct imports (what this file imports)
│            ├─ Imported by (what files import this)
│            └─ Total import count
│          • Interactivity:
│            ├─ Click on import → navigate to that node
│            └─ Copy file path button
│
├── 📁 NodeTypes/
│   └── 📄 ComponentNode.jsx
│       └─ CUSTOM NODE RENDERER (@xyflow extension)
│          • Size: ~50 lines
│          • Purpose: Style nodes based on type
│          • Props: Receives node data from @xyflow
│          • Styling by nodeType:
│            ├─ 'component' → Blue (#3b82f6)
│            ├─ 'hook' → Amber (#f59e0b)
│            ├─ 'util' → Purple (#8b5cf6)
│            └─ 'other' → Gray (#6b7280)
│          • Elements:
│            ├─ Handle (connection ports from @xyflow)
│            ├─ File icon/emoji based on type
│            ├─ File name (truncated if long)
│            └─ Import count badge
│
├── 📁 EdgeTypes/
│   └── 📄 AnimatedEdge.jsx
│       └─ CUSTOM EDGE RENDERER (@xyflow extension)
│          • Size: ~40 lines
│          • Purpose: Style edges (import connections)
│          • Props: Receives edge data from @xyflow
│          • Styling:
│            ├─ Red (#ef4444) if cyclic edge
│            ├─ Blue (#3b82f6) if normal edge
│            ├─ Stroke width: 2-2.5px
│            └─ Animated dash if cyclic
│          • Uses @xyflow helpers:
│            ├─ BaseEdge (base shape)
│            ├─ EdgeLabelRenderer (for labels)
│            └─ getBezierPath (curve calculation)
│
└── 📁 AIExplainPanel/
    └── 📄 index.jsx
        └─ CHAT INTERFACE (AI assistant)
           • Size: ~100 lines
           • Purpose: Chat with AI about codebase
           • Props:
             ├─ apiKey: OpenRouter API key
             ├─ selectedNode: current node
             ├─ depMap: dependency map
             └─ stats: project statistics
           • Features:
             ├─ Message display (bubbles)
             ├─ Input field for questions
             ├─ Loading spinner during API call
             ├─ Error display
             ├─ Clear chat button
             └─ Auto-scroll to latest message
           • Uses useAIExplain() hook for logic
```

---

## 🪝 SRC/HOOKS/ - CUSTOM REACT LOGIC HOOKS

```
src/hooks/

│
├── 📄 useGraphBuilder.js
│   └─ GRAPH BUILDING & PARSING (Core algorithm)
│      • Size: ~200 lines
│      • Purpose: Parse files → build graph → detect cycles
│      • Returns object:
│        ├─ nodes: [] (@xyflow node format)
│        ├─ edges: [] (@xyflow edge format)
│        ├─ depMap: {} (dependency mapping)
│        ├─ stats: {} (project statistics)
│        └─ buildGraph: (files) => void (trigger function)
│      • Pipeline:
│        1. parseImports() → Extract import statements
│        2. resolveImports() → Convert to absolute paths
│        3. getNodeType() → Classify file types
│        4. detectCycles() → Find circular deps
│        5. buildNodes() → Create @xyflow nodes
│        6. buildEdges() → Create @xyflow edges
│        7. getLayoutedElements() → Position with Dagre
│      • Memoization: Results cached, recompute on file change
│      • Error handling: Try-catch for parse errors
│
└── 📄 useAIExplain.js
    └─ AI CHAT INTEGRATION (OpenRouter API)
       • Size: ~100 lines
       • Purpose: Send code context to AI, get explanations
       • Returns object:
         ├─ messages: [] (chat history)
         ├─ loading: bool (API request status)
         ├─ error: string (error message)
         ├─ sendMessage: (text, apiKey, ...) => void
         └─ clearChat: () => void
       • API Integration:
         ├─ Endpoint: https://openrouter.ai/api/v1/chat/completions
         ├─ Auth: Bearer token (apiKey)
         ├─ Models: Llama 3.3 70B, Llama 4 Scout, etc (free)
       • Context Building:
         └─ buildContext() combines:
            ├─ Selected file info (name, type, imports)
            ├─ Project structure (full depMap)
            └─ Project stats (files, components, hooks, cycles)
       • System Prompt:
         └─ Instructs AI to act as friendly React mentor
            ├─ Casual tone (not robotic)
            ├─ Explain like senior to junior dev
            ├─ Reference file names naturally
            └─ Max 4-5 lines (unless user asks for more)
       • Storage:
         └─ API key persisted in localStorage
```

---

## 🔧 SRC/UTILS/ - PURE UTILITY FUNCTIONS

```
src/utils/

│
├── 📄 importParser.js
│   └─ IMPORT EXTRACTION & PATH RESOLUTION
│      • Size: ~80 lines
│      • No dependencies (pure utility)
│      • Functions:
│
│        1. parseImports(files[])
│           ├─ Input: [{name: 'App.jsx', content: 'import...'}, ...]
│           ├─ Algorithm: Regex-based import extraction
│           ├─ Regex: Matches import/require statements
│           ├─ Output: depMap object
│           │  └─ {
│           │      'App.jsx': ['./components/Navbar', '../hooks/useAuth'],
│           │      'Navbar.jsx': ['./Button'],
│           │      ...
│           │    }
│           └─ Catches:
│              ├─ ES6 imports: import X from './file'
│              ├─ Destructuring: import {A, B} from './file'
│              ├─ Namespace: import * as X from './file'
│              ├─ CSS: import './styles.css'
│              └─ CommonJS: const X = require('./file')
│
│        2. resolveImports(depMap, filesArray)
│           ├─ Input: depMap with relative paths
│           ├─ Algorithm: Path resolution
│           ├─ Converts:
│           │  └─ './components/Navbar' → 'src/components/Navbar.jsx'
│           ├─ Output: Updated depMap with absolute paths
│           └─ Handles:
│              ├─ Relative paths (./, ../)
│              ├─ No extension (adds .js/.jsx)
│              ├─ Index files (folder/ → folder/index.js)
│              └─ Non-existent files (marks as external)
│
│        3. getNodeType(filename)
│           ├─ Input: Filename string
│           ├─ Algorithm: Pattern matching
│           ├─ Output: 'component' | 'hook' | 'util' | 'other'
│           └─ Rules:
│              ├─ Starts with 'use' → 'hook'
│              ├─ In 'components/' folder → 'component'
│              ├─ In 'utils/' folder → 'util'
│              └─ Otherwise → 'other'
│
│        4. Additional helpers (internal)
│           ├─ normalizeImportPath(): Clean up import paths
│           ├─ findMatchingFile(): Find file by partial path
│           └─ getExtension(): Determine file extension
│
│      • Error Handling:
│        ├─ Missing files: Marked as external
│        ├─ Invalid syntax: Skipped
│        └─ Circular paths: Handled by cycleDetector
│
│
└── 📄 cycleDetector.jsx
    └─ CIRCULAR DEPENDENCY DETECTION (DFS Algorithm)
       • Size: ~50 lines
       • No dependencies (pure utility)
       • Functions:
│
│        1. detectCycles(depMap)
│           ├─ Input: Resolved depMap object
│           ├─ Algorithm: Depth-First Search (DFS)
│           ├─ Data structures:
│           │  ├─ visited: Set (nodes fully explored)
│           │  ├─ inStack: Set (nodes in current path)
│           │  ├─ path: Array (current traversal path)
│           │  └─ cyclicEdges: Array (all edges in cycles)
│           ├─ Process:
│           │  1. For each node not visited:
│           │  2. Start DFS traversal
│           │  3. Track current path & stack
│           │  4. If node in stack → Cycle found
│           │  5. Mark all edges in cycle
│           │  6. Return cyclicEdges array
│           ├─ Output: Array of edges
│           │  └─ [['A.jsx', 'B.jsx'], ['B.jsx', 'C.jsx'], ['C.jsx', 'A.jsx']]
│           ├─ Time Complexity: O(V + E)
│           └─ Space Complexity: O(V)
│
│        2. isCyclicEdge(edge, cyclicEdges)
│           ├─ Input: [source, target] edge, cyclicEdges[]
│           ├─ Algorithm: Linear search
│           ├─ Output: Boolean (true if edge is in cycle)
│           └─ Used by: GraphCanvas to color edges red
│
│       • Edge Cases:
│         ├─ Self-loop: A.jsx imports A.jsx
│         ├─ Multi-node cycle: A → B → C → A
│         ├─ Multiple cycles: May overlap
│         └─ No cycles: Returns empty array
```

---

## 📊 FILE DEPENDENCY GRAPH

```
main.jsx
  ↓
  imports React, ReactDOM
  ↓
  mounts App
  ↓

App.jsx (orchestrator)
  ├─ imports FileInput
  ├─ imports GraphCanvas
  ├─ imports NodeInspector
  ├─ imports AIExplainPanel
  ├─ imports useGraphBuilder
  ├─ imports useAIExplain
  └─ manages all state

     ↓

useGraphBuilder.js (logic)
  ├─ imports dagre
  ├─ imports importParser (utils)
  ├─ imports cycleDetector (utils)
  └─ returns: nodes, edges, depMap, stats

     ↓

FileInput → passes files → buildGraph() → processes files

GraphCanvas → renders → ComponentNode + AnimatedEdge

NodeInspector → displays → node data from selectedNode state

AIExplainPanel → sends context → useAIExplain → OpenRouter API
```

---

## 🗂️ COMPLETE TREE VIEW

```
reactviz/
│
├── package.json                          [NPM config]
├── vite.config.js                        [Vite bundler]
├── tailwind.config.js                    [Tailwind CSS]
├── eslint.config.js                      [ESLint rules]
├── index.html                            [HTML entry]
├── README.md                             [Template docs]
│
├── public/                               [Static assets]
│   └── [image files, favicons, etc]
│
└── src/                                  [APPLICATION CODE]
    │
    ├── main.jsx                          [React mount]
    ├── App.jsx                           [ROOT COMPONENT - State orchestrator]
    ├── index.css                         [Global styles]
    ├── App.css                           [App-specific styles]
    │
    ├── assets/                           [Images, icons]
    │   └── [static files]
    │
    ├── components/                       [UI COMPONENTS]
    │   │
    │   ├── FileInput/
    │   │   └── index.jsx                 [File upload interface]
    │   │
    │   ├── GraphCanvas/
    │   │   └── index.jsx                 [Graph visualization]
    │   │
    │   ├── NodeInspector/
    │   │   └── index.jsx                 [Detail panel]
    │   │
    │   ├── NodeTypes/
    │   │   └── ComponentNode.jsx         [Custom node renderer]
    │   │
    │   ├── EdgeTypes/
    │   │   └── AnimatedEdge.jsx          [Custom edge renderer]
    │   │
    │   └── AIExplainPanel/
    │       └── index.jsx                 [AI chat interface]
    │
    ├── hooks/                            [REACT LOGIC HOOKS]
    │   │
    │   ├── useGraphBuilder.js            [Parse files, build graph, detect cycles]
    │   │                                 [Returns: nodes, edges, depMap, stats]
    │   │
    │   └── useAIExplain.js              [AI chat integration]
    │                                     [Returns: messages, sendMessage, loading]
    │
    └── utils/                            [PURE UTILITY FUNCTIONS]
        │
        ├── importParser.js               [Extract & resolve imports]
        │   ├─ parseImports()            [Regex import extraction]
        │   ├─ resolveImports()          [Path resolution]
        │   └─ getNodeType()             [Classify files]
        │
        └── cycleDetector.jsx             [DFS circular dependency detection]
            ├─ detectCycles()            [Find all cycles]
            └─ isCyclicEdge()            [Check if edge is cyclic]
```

---

## 🔍 QUICK NAVIGATION FOR AI AGENTS

**To understand how code flows:**
1. Start → `src/App.jsx` (see main structure)
2. Upload files → `src/components/FileInput/index.jsx` (input handling)
3. Parse & build → `src/hooks/useGraphBuilder.js` (core algorithm)
4. Detect cycles → `src/utils/cycleDetector.jsx` (cycle detection)
5. Render graph → `src/components/GraphCanvas/index.jsx` (visualization)
6. Click node → `src/components/NodeInspector/index.jsx` (details)
7. Ask AI → `src/hooks/useAIExplain.js` (API integration)

**To fix import parsing issues:**
→ Edit `src/utils/importParser.js`

**To improve cycle detection:**
→ Edit `src/utils/cycleDetector.jsx`

**To change graph layout:**
→ Edit `src/hooks/useGraphBuilder.js` → `getLayoutedElements()` function

**To style nodes differently:**
→ Edit `src/components/NodeTypes/ComponentNode.jsx`

**To modify UI layout:**
→ Edit `src/App.jsx` or individual component files

---

## 📦 EXTERNAL DEPENDENCIES LOCATION

```
From package.json:

React ecosystem:
  └─ node_modules/react/
  └─ node_modules/react-dom/

Graph visualization:
  └─ node_modules/@xyflow/react/
     ├─ @xyflow/react/dist/style.css    (imported in GraphCanvas)
     └─ provides: ReactFlow, Handle, BaseEdge, etc components

Dagre (layout algorithm):
  └─ node_modules/dagre/

Build tools:
  └─ node_modules/vite/
  └─ node_modules/@vitejs/plugin-react/

Styling:
  └─ node_modules/tailwindcss/
  └─ node_modules/postcss/
  └─ node_modules/autoprefixer/

Code quality:
  └─ node_modules/eslint/
  └─ node_modules/eslint-plugin-react-hooks/
  └─ node_modules/eslint-plugin-react-refresh/

External API (no npm needed):
  └─ OpenRouter AI API
     └─ https://openrouter.ai/api/v1/chat/completions
```

