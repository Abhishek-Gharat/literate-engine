# ReactViz Demo Experience - Production Implementation Plan

## Executive Summary

This document provides the complete engineering plan for building the ReactViz Demo Experience, converting the approved UX design into production-ready code. The plan covers folder structure, component hierarchy, data schemas, styling strategy, and implementation order.

---

## 1. Folder Structure

```
src/
├── demo/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── DemoLayout.jsx          # Main layout wrapper
│   │   │   ├── DemoHeader.jsx          # Consistent header across screens
│   │   │   └── DemoFooter.jsx          # Footer with branding
│   │   ├── screens/
│   │   │   ├── DemoEntryHero.jsx       # Landing screen
│   │   │   ├── DemoLoadingState.jsx    # Loading screen
│   │   │   └── DemoProjectOverview.jsx # Overview with bento grid
│   │   ├── graph/
│   │   │   ├── GraphView.jsx           # Main graph container
│   │   │   ├── GraphToolbar.jsx        # Top toolbar
│   │   │   ├── GraphFilters.jsx        # Left filters panel
│   │   │   ├── GraphCanvas.jsx         # Canvas container (layout-ready)
│   │   │   ├── NodeInspector.jsx       # Right inspector panel
│   │   │   ├── IssuePanel.jsx          # Issues section
│   │   │   └── MobileBottomSheet.jsx   # Mobile sheet for filters/inspector
│   │   ├── cards/
│   │   │   ├── BentoCard.jsx           # Base card component
│   │   │   ├── AISummaryCard.jsx       # AI Summary card
│   │   │   ├── FindingsCard.jsx        # Findings card
│   │   │   ├── ArchitectureCard.jsx    # Architecture snapshot
│   │   │   └── NextActionCard.jsx      # Next actions CTA
│   │   ├── common/
│   │   │   ├── StatCard.jsx            # Stat display component
│   │   │   ├── StepItem.jsx            # Loading step item
│   │   │   ├── FindingItem.jsx         # Single finding row
│   │   │   ├── CategoryBar.jsx         # Progress bar for categories
│   │   │   └── Button.jsx              # Reusable button
│   │   └── index.js                    # Barrel exports
│   ├── hooks/
│   │   ├── useDemoState.js             # Demo state management
│   │   ├── useGraphFilters.js          # Filter state management
│   │   ├── useNodeSelection.js         # Node selection logic
│   │   ├── useMobileSheet.js           # Mobile sheet visibility
│   │   └── useResponsive.js            # Responsive breakpoints
│   ├── data/
│   │   ├── demoData.js                 # Mock data exports
│   │   ├── graphData.js                # Mock graph nodes/edges
│   │   └── constants.js                # Demo-specific constants
│   ├── styles/
│   │   ├── tokens.js                   # Design tokens (colors, spacing)
│   │   ├── animations.js               # CSS animations
│   │   └── utilities.js                # Style utilities
│   ├── DemoExperience.jsx              # Main controller
│   └── index.js                        # Public exports
├── demo-project/                       # Sample project files
│   └── ...
└── shared/                             # Shared components (if any)
```

---

## 2. React Component Tree

```
DemoExperience (Container)
├── DemoLayout
│   ├── DemoHeader
│   └── Router/Switch for screens:
│       ├── DemoEntryHero
│       │   ├── Badge
│       │   ├── Title
│       │   ├── Description
│       │   ├── ActionButtons
│       │   └── PreviewStrip
│       │
│       ├── DemoLoadingState
│       │   ├── ProgressBar
│       │   ├── StepList
│       │   │   └── StepItem (×4)
│       │   └── CancelButton
│       │
│       ├── DemoProjectOverview
│       │   ├── TitleSection
│       │   ├── StatsRow
│       │   │   └── StatCard (×5)
│       │   └── BentoGrid
│       │       ├── AISummaryCard
│       │       ├── FindingsCard
│       │       │   └── FindingItem (×4)
│       │       ├── ArchitectureCard
│       │       │   ├── EntryPoint
│       │       │   ├── MostConnected
│       │       │   └── CategoryBars
│       │       └── NextActionCard
│       │
│       └── GraphView
│           ├── GraphToolbar
│           │   ├── BackButton
│           │   ├── Title
│           │   ├── SearchInput
│           │   └── ToolbarActions
│           ├── SplitPane (3-column)
│           │   ├── GraphFilters (Left)
│           │   │   ├── NodeTypeFilters
│           │   │   ├── DepthFilter
│           │   │   └── IssuePanel
│           │   ├── GraphCanvas (Center)
│           │   │   └── ReactFlowWrapper
│           │   └── NodeInspector (Right)
│           │       ├── Header
│           │       ├── Metrics
│           │       ├── ImportsList
│           │       └── Actions
│           └── MobileBottomSheet (conditional)
│               ├── SheetHeader
│               └── SheetContent
│                   ├── FiltersContent OR
│                   └── InspectorContent
└── DemoFooter (optional)
```

---

## 3. Props Interface Definitions

### DemoExperience
```typescript
interface DemoExperienceProps {
  onBackToApp: () => void;
  initialView?: 'entry' | 'loading' | 'overview' | 'graph';
}
```

### DemoEntryHero
```typescript
interface DemoEntryHeroProps {
  onTryDemo: () => void;
  onUpload: () => void;
  onBack: () => void;
}
```

### DemoLoadingState
```typescript
interface DemoLoadingStateProps {
  onComplete: () => void;
  onCancel: () => void;
  steps?: LoadingStep[];
  estimatedTime?: string;
}

interface LoadingStep {
  id: string;
  label: string;
  duration: number;
}
```

### DemoProjectOverview
```typescript
interface DemoProjectOverviewProps {
  summary: AISummary;
  findings: Finding[];
  snapshot: ArchitectureSnapshot;
  stats: ProjectStats;
  onOpenGraph: () => void;
  onExplainProject: () => void;
  onInspect: () => void;
  onViewEntryPoints: () => void;
  onBackToApp: () => void;
}

interface AISummary {
  title: string;
  description: string;
  keyPoints: string[];
  architecturePattern: string;
}

interface Finding {
  id: string;
  type: 'positive' | 'warning' | 'error' | 'suggestion' | 'info';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  category: string;
}

interface ArchitectureSnapshot {
  entryPoints: EntryPoint[];
  mostConnectedComponent: {
    name: string;
    connectionCount: number;
    description: string;
  };
  dependencyDepth: {
    max: number;
    average: number;
  };
  fileCategories: FileCategory[];
}

interface ProjectStats {
  totalComponents: number;
  totalPages: number;
  totalHooks: number;
  totalContexts: number;
  entryPoint: string;
}
```

### GraphView
```typescript
interface GraphViewProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  findings: Finding[];
  onBack: () => void;
  onNodeSelect?: (node: GraphNode) => void;
}

interface GraphNode {
  id: string;
  label: string;
  nodeType: 'page' | 'component' | 'hook' | 'context' | 'util' | 'config' | 'root';
  filePath: string;
  imports: string[];
  importedBy: string[];
  isEntryPoint: boolean;
}

interface GraphEdge {
  id: string;
  source: string;
  target: string;
}
```

### GraphFilters
```typescript
interface GraphFiltersProps {
  nodeTypes: NodeTypeConfig[];
  filteredTypes: string[];
  onToggleType: (type: string) => void;
  depthFilter: string;
  onDepthChange: (depth: string) => void;
  issues: Finding[];
  showIssues: boolean;
  onToggleIssues: () => void;
}

interface NodeTypeConfig {
  type: string;
  label: string;
  icon: string;
  color: string;
  count: number;
}
```

### NodeInspector
```typescript
interface NodeInspectorProps {
  node: GraphNode | null;
  onClose: () => void;
  onViewCode?: () => void;
  onTracePath?: () => void;
  onAskAI?: () => void;
  onShowDependencies?: () => void;
}
```

### GraphToolbar
```typescript
interface GraphToolbarProps {
  title?: string;
  onBack: () => void;
  onSearch: (query: string) => void;
  onFitView: () => void;
  onReset: () => void;
  onExport: () => void;
  searchQuery: string;
}
```

### MobileBottomSheet
```typescript
interface MobileBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}
```

---

## 4. Sample Data Schema

### Mock Graph Data
```javascript
// demo/data/graphData.js

export const DEMO_NODES = [
  {
    id: 'main',
    label: 'main.jsx',
    nodeType: 'root',
    filePath: 'src/main.jsx',
    imports: ['App', 'CartProvider', 'AuthProvider'],
    importedBy: [],
    isEntryPoint: true,
    metadata: {
      linesOfCode: 23,
      lastModified: '2024-01-15'
    }
  },
  {
    id: 'home',
    label: 'Home.jsx',
    nodeType: 'page',
    filePath: 'src/pages/Home.jsx',
    imports: ['useProducts', 'ProductCard', 'SearchBar'],
    importedBy: ['App'],
    isEntryPoint: false,
    metadata: {
      linesOfCode: 45,
      lastModified: '2024-01-14'
    }
  }
  // ... more nodes
];

export const DEMO_EDGES = [
  { id: 'e1', source: 'main', target: 'app' },
  { id: 'e2', source: 'main', target: 'cartcontext' },
  { id: 'e3', source: 'main', target: 'authcontext' },
  { id: 'e4', source: 'app', target: 'navbar' },
  { id: 'e5', source: 'app', target: 'cartdrawer' }
  // ... more edges
];

export const NODE_TYPE_CONFIG = [
  { type: 'root', label: 'Entry', icon: '⚡', color: '#6366f1' },
  { type: 'page', label: 'Page', icon: '📄', color: '#0891b2' },
  { type: 'component', label: 'Component', icon: '🧩', color: '#059669' },
  { type: 'hook', label: 'Hook', icon: '🪝', color: '#d97706' },
  { type: 'context', label: 'Context', icon: '📦', color: '#7c3aed' },
  { type: 'util', label: 'Util', icon: '🔧', color: '#64748b' },
  { type: 'config', label: 'Config', icon: '⚙', color: '#475569' }
];

export const DEMO_ISSUES = [
  {
    id: 'issue-1',
    severity: 'info',
    title: 'Checkout page has high dependency count',
    description: 'Consider breaking into smaller components',
    nodeId: 'checkout'
  }
];
```

---

## 5. Tailwind Class Strategy

### Base Configuration
```javascript
// tailwind.config.js additions
{
  theme: {
    extend: {
      colors: {
        demo: {
          bg: {
            primary: '#0a0a0f',
            secondary: '#111118',
            tertiary: '#1a1a24',
            card: '#13131c',
            elevated: '#1c1c28',
            input: '#0d0d12'
          },
          border: {
            DEFAULT: '#232330',
            light: '#2a2a3d',
            subtle: '#1a1a28'
          },
          text: {
            primary: '#f1f5f9',
            secondary: '#94a3b8',
            muted: '#64748b',
            dark: '#475569'
          },
          accent: {
            DEFAULT: '#6366f1',
            light: '#818cf8',
            dark: '#4f46e5',
            muted: 'rgba(99, 102, 241, 0.1)'
          }
        }
      },
      spacing: {
        '4': '4px',
        '8': '8px',
        '12': '12px',
        '16': '16px',
        '20': '20px',
        '24': '24px',
        '32': '32px',
        '40': '40px',
        '48': '48px',
        '64': '64px'
      },
      borderRadius: {
        'sm': '6px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
        '2xl': '20px',
        'full': '9999px'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace']
      },
      fontSize: {
        'xs': ['12px', { lineHeight: '1.5' }],
        'sm': ['13px', { lineHeight: '1.5' }],
        'md': ['14px', { lineHeight: '1.5' }],
        'lg': ['15px', { lineHeight: '1.5' }],
        'xl': ['16px', { lineHeight: '1.5' }],
        '2xl': ['18px', { lineHeight: '1.3' }],
        '3xl': ['24px', { lineHeight: '1.3' }],
        '4xl': ['32px', { lineHeight: '1.2' }],
        '5xl': ['40px', { lineHeight: '1.1' }]
      }
    }
  }
}
```

### Utility Classes Pattern
```javascript
// Common patterns to use consistently

// Card base
const cardClasses = `
  bg-demo-bg-card 
  border border-demo-border-default 
  rounded-xl 
  p-20 
  transition-all duration-150
  hover:border-demo-border-light
`;

// Primary button
const primaryButtonClasses = `
  bg-demo-accent-DEFAULT 
  text-white 
  rounded-md 
  px-20 py-16 
  font-medium 
  transition-all duration-150
  hover:bg-demo-accent-dark
  active:scale-[0.98]
`;

// Secondary button
const secondaryButtonClasses = `
  bg-transparent 
  border border-demo-border-default 
  text-demo-text-secondary 
  rounded-md 
  px-20 py-16 
  font-medium 
  transition-all duration-150
  hover:border-demo-border-light 
  hover:text-demo-text-primary
`;

// Text hierarchy
const textPrimary = 'text-demo-text-primary font-semibold';
const textSecondary = 'text-demo-text-secondary';
const textMuted = 'text-demo-text-muted text-sm';

// Spacing patterns
const sectionGap = 'gap-24';
const cardGap = 'gap-16';
const elementGap = 'gap-12';
```

---

## 6. Responsive Breakpoints

| Breakpoint | Width | Behavior |
|------------|-------|----------|
| Mobile | < 640px | Single column, bottom sheets, stacked layout |
| Tablet | 640-1023px | 2-column grid, collapsible sidebar |
| Desktop | 1024-1279px | Full layout, 2-3 column bento |
| Large | ≥ 1280px | 4-column bento, all panels visible |

### Breakpoint-Specific Rules

```javascript
// Bento Grid
const bentoGridClasses = `
  grid 
  grid-cols-1                      // Mobile
  md:grid-cols-2                 // Tablet
  lg:grid-cols-4                 // Desktop
  gap-16
`;

// Graph Layout
const graphLayoutClasses = `
  flex flex-col                    // Mobile
  lg:flex-row                    // Desktop
  h-full
`;

// Stats Row
const statsRowClasses = `
  grid 
  grid-cols-2                      // Mobile
  sm:grid-cols-3                 // Small tablet
  md:grid-cols-5                 // Tablet+
  gap-16
`;

// Panels visibility
const leftPanelClasses = `
  hidden                           // Mobile
  lg:block                       // Desktop
  lg:w-280
`;

const rightPanelClasses = `
  hidden                           // Default
  lg:block                       // Desktop
  lg:w-320
`;
```

---

## 7. Implementation Order

### Phase 1: Foundation (Week 1)
**Priority: Critical**

1. **Setup & Configuration**
   - [ ] Create folder structure
   - [ ] Setup Tailwind config with demo theme
   - [ ] Create design tokens file
   - [ ] Setup barrel exports

2. **Core Layout Components**
   - [ ] DemoLayout.jsx
   - [ ] DemoHeader.jsx
   - [ ] DemoFooter.jsx (optional)

3. **Common/UI Components**
   - [ ] Button.jsx (primary, secondary, ghost)
   - [ ] Card.jsx (base card)
   - [ ] Badge.jsx
   - [ ] LoadingSpinner.jsx

4. **Data Layer**
   - [ ] demoData.js (mock data)
   - [ ] graphData.js (nodes/edges)
   - [ ] constants.js

5. **Hooks**
   - [ ] useDemoState.js
   - [ ] useResponsive.js

**Deliverable:** Foundation layer with working navigation between empty screens

---

### Phase 2: Entry & Loading Screens (Week 1-2)
**Priority: High**

1. **DemoEntryHero**
   - [ ] Layout & structure
   - [ ] Hero content (badge, title, description)
   - [ ] Action buttons with hover states
   - [ ] Preview strip with cards
   - [ ] Responsive behavior

2. **DemoLoadingState**
   - [ ] Centered card layout
   - [ ] Progress bar component
   - [ ] Step items with states
   - [ ] Animation for active step
   - [ ] Cancel button

**Deliverable:** Users can enter demo and see loading animation

---

### Phase 3: Overview Screen (Week 2)
**Priority: High**

1. **Stats Components**
   - [ ] StatCard.jsx
   - [ ] OverviewStatsRow.jsx

2. **Card Components**
   - [ ] BentoCard.jsx (base)
   - [ ] AISummaryCard.jsx
   - [ ] FindingsCard.jsx
   - [ ] ArchitectureCard.jsx
   - [ ] NextActionCard.jsx

3. **DemoProjectOverview**
   - [ ] Screen layout
   - [ ] Title section
   - [ ] Stats row integration
   - [ ] Bento grid integration
   - [ ] Back button functionality

**Deliverable:** Complete overview screen with all cards

---

### Phase 4: Graph View - Panels (Week 3)
**Priority: High**

1. **GraphToolbar**
   - [ ] Back button
   - [ ] Search input
   - [ ] Action buttons (fit, reset, export)

2. **GraphFilters (Left Panel)**
   - [ ] Node type filter list
   - [ ] Toggle buttons
   - [ ] Depth filter
   - [ ] Issue panel section

3. **NodeInspector (Right Panel)**
   - [ ] Header with type badge
   - [ ] Node name display
   - [ ] Metrics (imports, used by)
   - [ ] Action buttons

4. **MobileBottomSheet**
   - [ ] Sheet container
   - [ ] Header with close
   - [ ] Content switching (filters/inspector)

**Deliverable:** All panels functional with mock data

---

### Phase 5: Graph View - Canvas (Week 3-4)
**Priority: Medium-High**

1. **GraphCanvas**
   - [ ] ReactFlow wrapper
   - [ ] Node styling per type
   - [ ] Edge styling
   - [ ] Background grid
   - [ ] Controls (zoom, fit)

2. **Integration**
   - [ ] Connect filters to canvas
   - [ ] Connect node selection to inspector
   - [ ] Mobile sheet triggers

**Deliverable:** Functional graph view with all interactions

---

### Phase 6: Polish & Optimization (Week 4)
**Priority: Medium**

1. **Motion & Animation**
   - [ ] Page transitions
   - [ ] Card hover effects
   - [ ] Loading animations
   - [ ] Sheet slide animations

2. **Accessibility**
   - [ ] Keyboard navigation
   - [ ] Focus management
   - [ ] ARIA labels
   - [ ] Reduced motion support

3. **Performance**
   - [ ] Memoization
   - [ ] Lazy loading
   - [ ] Bundle optimization

4. **Testing**
   - [ ] Unit tests for hooks
   - [ ] Component tests
   - [ ] Integration tests

**Deliverable:** Production-ready demo experience

---

## 8. Component Implementation Priority

### What to Build First

1. **Design Tokens & Styles**
   - Why: Foundation for all components
   - Impact: High (affects everything)
   - Effort: Low

2. **Button Component**
   - Why: Used everywhere
   - Impact: High
   - Effort: Low

3. **Card Component**
   - Why: Base for all cards
   - Impact: High
   - Effort: Low

### What to Build Second

4. **DemoEntryHero**
   - Why: First user impression
   - Impact: High
   - Effort: Medium

5. **DemoLoadingState**
   - Why: Sets expectation for analysis
   - Impact: Medium
   - Effort: Low

6. **StatCard & StatsRow**
   - Why: Reusable across screens
   - Impact: Medium
   - Effort: Low

### What to Build Third

7. **Bento Cards (AI Summary, Findings, etc.)**
   - Why: Core value proposition
   - Impact: High
   - Effort: Medium

8. **Graph Panels (Filters, Inspector)**
   - Why: Complex UI, needs testing
   - Impact: High
   - Effort: High

9. **GraphCanvas**
   - Why: Integration point
   - Impact: High
   - Effort: High

---

## 9. File Dependencies

```
Build Order Dependencies:

Level 1 (No deps):
├── tokens.js
├── constants.js
├── demoData.js
└── graphData.js

Level 2 (Uses Level 1):
├── Button.jsx (uses tokens)
├── Card.jsx (uses tokens)
├── animations.js (uses tokens)
└── useResponsive.js

Level 3 (Uses Level 2):
├── DemoHeader.jsx
├── StatCard.jsx
├── StepItem.jsx
└── BentoCard.jsx

Level 4 (Uses Level 3):
├── DemoEntryHero.jsx
├── DemoLoadingState.jsx
├── OverviewStatsRow.jsx
└── AISummaryCard.jsx
├── FindingsCard.jsx
├── ArchitectureCard.jsx
└── NextActionCard.jsx

Level 5 (Uses Level 4):
├── DemoProjectOverview.jsx
├── GraphToolbar.jsx
├── GraphFilters.jsx
└── NodeInspector.jsx

Level 6 (Uses Level 5):
├── GraphView.jsx
└── MobileBottomSheet.jsx

Level 7 (Uses Level 6):
└── DemoExperience.jsx (Main)
```

---

## 10. Quality Checklist

### Before First Commit
- [ ] All components have PropTypes/TypeScript interfaces
- [ ] No console errors
- [ ] Responsive breakpoints working
- [ ] Dark mode colors correct
- [ ] Loading states visible

### Before Production
- [ ] All interactive elements keyboard accessible
- [ ] Focus states visible
- [ ] Reduced motion support
- [ ] ARIA labels present
- [ ] Performance audited (Lighthouse)
- [ ] Cross-browser tested
- [ ] Mobile touch targets ≥44px

---

## 11. Quick Start for Developers

```bash
# 1. Create folder structure
mkdir -p src/demo/{components/{layout,screens,graph,cards,common},hooks,data,styles}

# 2. Start with tokens
echo "export const tokens = {...}" > src/demo/styles/tokens.js

# 3. Create Button component
# 4. Create Card component
# 5. Build screens in order
# 6. Integrate into DemoExperience
# 7. Test responsive behavior
# 8. Add animations
# 9. Polish & ship
```

---

## Appendix: Naming Conventions

- **Components**: PascalCase (e.g., `DemoEntryHero`)
- **Hooks**: camelCase with 'use' prefix (e.g., `useDemoState`)
- **Files**: Match component name (e.g., `DemoEntryHero.jsx`)
- **CSS Classes**: kebab-case (e.g., `demo-card`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `DEMO_COLORS`)
- **Props**: camelCase (e.g., `onBackToApp`)

---

End of Implementation Plan
