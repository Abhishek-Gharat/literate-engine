/**
 * Demo Experience - UX Plan and Documentation
 * 
 * SCREEN-BY-SCREEN UX PLAN
 * =======================
 * 
 * 1. LANDING / UPLOAD ENTRY
 * ------------------------
 * Purpose: Let user choose between Upload Project and Try Demo Project
 * 
 * Sections:
 *   - Header with ReactViz logo
 *   - Badge: "Try the demo — no setup required"
 *   - Title: "Understand your React architecture visually"
 *   - Description explaining ReactViz value
 *   - Primary CTA: "Try Demo Project" with play icon
 *   - Secondary CTA: "Upload Your Project"
 *   - Note: "No setup needed for demo • Works with React/Next.js projects"
 *   - Preview strip showing simplified UI (AI Summary, Dependency Graph, Architecture View)
 * 
 * Key Message: Answer "Why should I care?" - Visual architecture understanding, dependency analysis, AI insights
 * 
 * 2. DEMO LOADING STATE
 * --------------------
 * Purpose: Build trust during analysis with step-based progress
 * 
 * Progress Steps:
 *   1. Parsing files
 *   2. Detecting entry points  
 *   3. Building dependency graph
 *   4. Generating insights
 * 
 * Visual: Progress bar + numbered steps with completion states
 * Time Estimate: "This will take about 3 seconds"
 * Branding: ReactViz Demo v1.0
 * 
 * 3. DEMO PROJECT OVERVIEW (BENTO GRID)
 * ------------------------------------
 * This is the MOST IMPORTANT screen - shows value before graph
 * 
 * Header:
 *   - Title: "Demo Project Loaded"
 *   - Subtitle: "E-commerce React demo with shared state and multi-page flow"
 *   - Breadcrumb: Demo / Overview
 * 
 * Top Stats Row:
 *   - Components: 6 (with icon)
 *   - Pages: 4 (with icon)
 *   - Hooks: 3 (with icon)
 *   - Contexts: 2 (with icon)
 *   - Entry Point: main.jsx (with icon)
 * 
 * Bento Grid Cards:
 *   A. AI Summary (spans 2 columns, 2 rows)
 *      - Project description
 *      - 4 key bullet points
 *      - CTA: "Explain this project" button
 *   
 *   B. Interesting Findings (spans 2 columns)
 *      - List of 4 findings with icons
 *      - Types: positive (green check), info (blue), suggestion (lightbulb)
 *      - Shows: circular deps, complexity, data flow, performance suggestions
 *   
 *   C. Architecture Snapshot (spans 1 column)
 *      - Entry point
 *      - Most connected component (CartContext)
 *      - File categories with bar charts
 *   
 *   D. Next Action (spans 1 column, highlighted)
 *      - Primary CTA: "Open Graph" (purple button)
 *      - Secondary: "Inspect Key Components"
 *      - Secondary: "View Entry Points"
 * 
 * 4. GRAPH VIEW
 * ------------
 * Purpose: Guided exploration of dependency graph
 * 
 * Layout:
 *   - Left panel: 280px filters
 *   - Center: Graph canvas (flexible)
 *   - Right panel: Inspector (320px, slide-in)
 * 
 * Top Toolbar:
 *   - Back button
 *   - Title: "Dependency Graph"
 *   - Search input
 *   - Actions: Fit, Reset, Export
 * 
 * Left Panel:
 *   - Node Types filter (toggleable)
 *   - Findings section (issues)
 *   - Legend
 * 
 * Center Canvas:
 *   - ReactFlow graph with custom nodes
 *   - Highlighted entry point
 *   - Animated edges
 *   - Click nodes to inspect
 * 
 * Right Panel (Inspector):
 *   - Node type badge
 *   - File name
 *   - Metrics: Imports count, Used by count, Entry point yes/no
 *   - Imports list
 *   - Actions: "Ask AI", "Trace Path"
 * 
 * Responsive Behavior:
 *   Desktop (>=1280px):
 *     - Sidebar visible at 240px
 *     - Bento grid: 4 columns
 *     - Graph: 3-panel layout
 *   
 *   Tablet (768px-1279px):
 *     - Sidebar collapsible to icons
 *     - Bento grid: 2 columns
 *     - Graph: Inspector as slide-over
 *   
 *   Mobile (<768px):
 *     - Single column layout
 *     - Sticky header with back button
 *     - Sticky CTA at bottom
 *     - Inspector as bottom sheet
 *     - Filters in modal/bottom sheet
 * 
 * COMPONENT LIST
 * ==============
 * 
 * Core Components:
 *   - DemoExperience (main controller)
 *   - DemoEntryHero (landing screen)
 *   - DemoLoadingState (loading screen)
 *   - DemoProjectOverview (bento grid overview)
 *   - DemoGraphView (graph exploration)
 * 
 * Card Components:
 *   - BentoCard (reusable card container)
 *   - AISummaryCard
 *   - FindingsCard
 *   - ArchitectureSnapshotCard
 *   - NextActionCard
 * 
 * UI Components:
 *   - OverviewStatsRow
 *   - StatCard
 *   - NodeInspectorPanel
 *   - MobileHeader
 *   - StickyMobileCTA
 *   - BottomSheet
 *   - TouchFriendlyButton
 * 
 * Data Layer:
 *   - demoData.js (all demo data exports)
 *   - styles.js (design tokens)
 * 
 * TAILWIND/CSS STRUCTURE
 * ======================
 * 
 * Design System:
 *   - Colors: Defined in styles.js
 *     - bg.primary: '#0a0a0f'
 *     - bg.secondary: '#111118'
 *     - accent.DEFAULT: '#6366f1'
 *     - All status colors (success, warning, error, info)
 *     - Node type colors (page, component, hook, context, etc.)
 *   
 *   - Spacing: 4px base scale
 *     - xs: 4px, sm: 8px, md: 12px, lg: 16px
 *     - xl: 20px, 2xl: 24px, 3xl: 32px, 4xl: 40px
 *   
 *   - Typography: Inter font family
 *     - sizes: xs (12px) to 5xl (40px)
 *     - weights: 400, 500, 600, 700
 *   
 *   - Border Radius: sm (6px), md (8px), lg (12px), xl (16px), full
 *   
 *   - Shadows: Subtle, not neon
 *     - sm: '0 1px 2px rgba(0, 0, 0, 0.3)'
 *     - md: '0 4px 6px -1px rgba(0, 0, 0, 0.3)'
 *     - lg: '0 10px 15px -3px rgba(0, 0, 0, 0.4)'
 * 
 * Styling Approach:
 *   - Inline styles for dynamic values
 *   - CSS-in-JS for component-specific styles
 *   - No Tailwind classes in demo components (using design tokens)
 * 
 * IMPLEMENTATION NOTES
 * ====================
 * 
 * State Management:
 *   - DemoExperience manages view state: ENTRY -> LOADING -> OVERVIEW -> GRAPH
 *   - Each view is a separate component
 *   - Props passed down for callbacks
 * 
 * Data Flow:
 *   - Demo data imported from demoData.js
 *   - Pre-computed analyzer output (no actual file parsing)
 *   - Realistic but mock data
 * 
 * Graph Visualization:
 *   - Uses @xyflow/react (ReactFlow)
 *   - Custom node styling based on node type
 *   - Animated edges
 *   - MiniMap and Controls included
 * 
 * Accessibility:
 *   - Semantic HTML
 *   - Keyboard navigation
 *   - Focus states
 *   - 44px minimum touch targets
 *   - Reduced motion support
 * 
 * Performance:
 *   - Lazy load graph view
 *   - Memoize filtered nodes/edges
 *   - CSS transitions instead of JS animations
 * 
 * KEY PRINCIPLES FOLLOWED
 * =======================
 * 
 * ✓ Value-first: Overview screen shows insights before graph
 * ✓ Guided flow: Clear progression from entry → loading → overview → graph
 * ✓ Dark-first: Professional dark UI with soft elevated surfaces
 * ✓ Single accent: Indigo (#6366f1) only, no neon
 * ✓ Real patterns: Actual SaaS UI patterns, not marketing
 * ✓ Mobile-first: Responsive design with touch-friendly targets
 * ✓ Data-driven: UI powered by analyzer data structure
 * ✓ Minimal chrome: Product-focused, minimal navigation
 */

export default {}
ReactViz Demo Experience - Design Specification
Overview
Three screens: Landing, Demo Loading, Demo Project Overview
Focus: Precise layout, spacing, hierarchy, and responsive design.
Screen 1: Landing (DemoEntryHero)
Layout Structure
┌─────────────────────────────────────────────────────────────┐
│ Header (64px)                                               │
│ ┌───────────────────────────────────────────────────────┐   │
│ │ Logo                        [Back]  [Documentation]   │   │
│ └───────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│ Main Content (centered, max-width: 720px)                   │
│                                                             │
│                    ┌─────────────────┐                     │
│                    │  Badge: Demo    │                     │
│                    └─────────────────┘                     │
│                                                             │
│              ┌───────────────────────────┐                  │
│              │     Title (40px)          │                  │
│              │  "Understand your React   │                  │
│              │   architecture visually"  │                  │
│              └───────────────────────────┘                  │
│                                                             │
│              ┌───────────────────────────┐                  │
│              │   Description (16px)      │                  │
│              │   max-width: 560px      │                  │
│              └───────────────────────────┘                  │
│                                                             │
│              ┌─────────────────────┐                       │
│              │ [▶ Try Demo]        │                       │
│              │                     │                       │
│              │ [Upload Project]    │                       │
│              └─────────────────────┘                       │
│                                                             │
│              Note text (13px)                              │
│                                                             │
│    ┌─────────────────────────────────────────────┐         │
│    │         Preview Strip (600px max)           │         │
│    │  ┌────────┐  ┌────────┐  ┌────────┐         │         │
│    │  │ Card 1 │  │ Card 2 │  │ Card 3 │         │         │
│    │  └────────┘  └────────┘  └────────┘         │         │
│    └─────────────────────────────────────────────┘         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
Exact Spacing & Measurements
Element	Property	Value
Header	Height	64px
Header	Padding	0 24px
Logo Icon	Size	32×32px
Logo Icon	Border Radius	8px
Main Content	Padding	32px
Main Content	Max Width	720px
Badge	Padding	6px 12px
Badge	Border Radius	9999px (full)
Badge	Margin Bottom	20px
Title	Font Size	40px (5xl)
Title	Margin Bottom	20px
Description	Font Size	16px
Description	Margin Bottom	32px
Description	Max Width	560px
Actions Container	Width	100%
Actions Container	Max Width	360px
Actions Container	Gap	12px
Primary Button	Padding	16px 20px
Primary Button	Border Radius	8px
Note	Margin Top	16px
Preview Strip	Margin Top	32px
Preview Strip	Padding	16px
Preview Strip	Border Radius	16px
Preview Cards	Height	60px
Preview Cards	Gap	12px
CTA Placement
Primary CTA (Try Demo Project):
- Full width within container (max 360px)
- Height: 52px (padding + content)
- Background: Indigo (#6366f1)
- White text, medium weight
- Play icon (▶) on left
- Hover: Darken to #4f46e5, translateY(-1px)
Secondary CTA (Upload Your Project):
- Same width as primary
- Bordered style (1px solid #232330)
- Transparent background
- Hover: Lighten border, brighten text
Responsive Behavior
Desktop (≥1024px):
- Centered layout with 720px max-width
- Horizontal preview strip (3 columns)
Tablet (768-1023px):
- Same structure, slightly reduced padding
- Preview strip maintains 3 columns
Mobile (<768px):
- Header: Logo left, menu right
- Title: 32px font size
- Description: 14px
- Preview strip: Stack vertically (1 column)
- Buttons: Full width with 44px min height
Screen 2: Demo Loading (DemoLoadingState)
Layout Structure
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│     ┌─────────────────────────────────────────────┐        │
│     │                                             │        │
│     │              Card (480px max)                 │        │
│     │                                             │        │
│     │  ┌─────────────────────────────────────┐   │        │
│     │  │    Analyzing Demo Project           │   │        │
│     │  │    This will take about 3 seconds   │   │        │
│     │  └─────────────────────────────────────┘   │        │
│     │                                             │        │
│     │  ████████████████████████████░░░░░░░░░     │        │
│     │  Progress Bar (4px height)                  │        │
│     │                                             │        │
│     │  ┌─────────────────────────────────────┐   │        │
│     │  │ ① Parsing files          [Done]    │   │        │
│     │  │ ② Detecting entry points [Active]  │   │        │
│     │  │ ③ Building dependency    [Waiting] │   │        │
│     │  │ ④ Generating insights    [Waiting] │   │        │
│     │  └─────────────────────────────────────┘   │        │
│     │                                             │        │
│     │  ReactViz Demo v1.0                         │        │
│     │                                             │        │
│     │  [Cancel and Go Back]                      │        │
│     │                                             │        │
│     └─────────────────────────────────────────────┘        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
Exact Spacing & Measurements
Element	Property	Value
Container	Min Height	100vh
Container	Padding	16px
Card	Max Width	480px
Card	Padding	32px
Card	Border Radius	16px
Header	Text Align	Center
Header	Margin Bottom	24px
Title	Font Size	20px
Title	Margin Bottom	8px
Progress Bar	Height	4px
Progress Bar	Border Radius	9999px
Progress Bar	Margin Bottom	24px
Steps Container	Gap	12px
Step Item	Padding	12px
Step Item	Border Radius	8px
Step Number	Size	28×28px
Step Number	Border Radius	9999px
Footer Text	Margin Top	24px
Footer Text	Font Size	12px
Cancel Button	Margin Top	16px
Cancel Button	Padding	10px 16px
Step Visual States
Completed Step:
- Number circle: Green background (#22c55e)
- Icon: Checkmark (✓)
- Status text: "Done" in green
Active Step:
- Row background: Indigo muted (#6366f122)
- Number circle: Indigo background
- Spinner animation (⟳)
- Status text: "Processing" in indigo-light
Waiting Step:
- Number circle: Elevated background (#1c1c28)
- Text: Muted color (#64748b)
- Status: "Waiting"
Screen 3: Demo Project Overview (DemoProjectOverview)
Layout Structure
┌─────────────────────────────────────────────────────────────┐
│ Header (64px)                                               │
│ ┌───────────────────────────────────────────────────────┐   │
│ │ Logo  [Demo / Overview]          [Back] [Help]        │   │
│ └───────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Main Content (max-width: 1440px, padding: 24px)          │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Demo Project Loaded                                 │   │
│  │ E-commerce React demo with shared state...          │   │
│  └─────────────────────────────────────────────────────┘   │
│  margin-bottom: 24px                                         │
│                                                             │
│  Stats Row (5-column grid, gap: 16px)                       │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐   │
│  │Comp: 6 │ │Pages: 4│ │Hooks: 3│ │Ctxt: 2 │ │main.jsx│   │
│  └────────┘ └────────┘ └────────┘ └────────┘ └────────┘   │
│  margin-bottom: 24px                                         │
│                                                             │
│  Bento Grid (4-column, gap: 16px)                           │
│  ┌──────────────────────┬──────────────────────┐           │
│  │                      │                      │           │
│  │    AI Summary        │   Findings          │           │
│  │    (2×2 span)        │   (2×1 span)        │           │
│  │                      │                      │           │
│  │                      │                      │           │
│  │                      │                      │           │
│  │                      │                      │           │
│  ├──────────────────────┼──────────┬──────────┤           │
│  │                      │          │          │           │
│  │  Architecture        │  Next    │          │           │
│  │  Snapshot            │  Actions │          │           │
│  │  (1×1 span)          │  (1×1)   │          │           │
│  │                      │          │          │           │
│  └──────────────────────┴──────────┴──────────┘           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
Exact Spacing & Measurements
Element	Property	Value
Header	Height	64px
Header	Padding	0 24px
Header	Border Bottom	1px solid #232330
Main	Padding	24px
Main	Max Width	1440px
Title Section	Margin Bottom	24px
Title	Font Size	24px
Title	Margin Bottom	8px
Subtitle	Font Size	14px
Stats Row	Display	Grid
Stats Row	Columns	repeat(auto-fit, minmax(140px, 1fr))
Stats Row	Gap	16px
Stats Row	Margin Bottom	24px
Stat Card	Padding	16px
Stat Card	Border Radius	12px
Bento Grid	Display	Grid
Bento Grid	Columns	repeat(4, 1fr)
Bento Grid	Gap	16px
Bento Card	Padding	20px
Bento Card	Border Radius	12px
Bento Card	Gap	16px
Card Specifications
AI Summary Card (2×2):
- Grid column: span 2
- Grid row: span 2
- Icon: 🤖 (robot)
- Title: "AI Summary"
- Content: Description + 4 bullet points + CTA button
- Bullet points: Indigo dot (6px) + text
Findings Card (2×1):
- Grid column: span 2
- Icon: 🔍 (magnifying glass)
- Content: 4 finding items
- Each finding: Icon (24px circle) + title + description
- Icons: ✓ green, ℹ blue, 💡 indigo
Architecture Snapshot Card (1×1):
- Grid column: span 1
- Icon: 🏗 (building)
- Sections: Entry Point, Most Connected, File Categories
- Entry point: Code block style
- Categories: Label + progress bar + count
Next Actions Card (1×1):
- Grid column: span 1
- Background: Subtle gradient with accent muted
- Icon: ▶ (play)
- Primary CTA: "Open Graph" (full width)
- Secondary CTAs: 2 bordered buttons
Responsive Breakpoints
Desktop (≥1280px):
- 4-column bento grid
- AI Summary: 2×2
- Findings: 2×1
- Architecture + Next Actions: 1×1 each
Tablet (768-1279px):
- 2-column bento grid
- AI Summary: 2×2 (full width)
- Findings: 2×1 (full width)
- Architecture + Next Actions: 1×1 each
Mobile (<768px):
- 1-column layout
- All cards: full width
- Stats row: 2 columns then wrap
- Sticky header with back button
Design Tokens Reference
Colors
// Background
bg.primary:   '#0a0a0f'    // Main background
bg.secondary: '#111118'    // Header, panels
bg.tertiary:  '#1a1a24'    // Elevated surfaces
bg.card:      '#13131c'    // Cards
bg.elevated:  '#1c1c28'    // Hover states

// Border
border.DEFAULT: '#232330'  // Card borders
border.light:   '#2a2a3d'  // Hover borders
border.subtle:  '#1a1a28'  // Dividers

// Text
text.primary:   '#f1f5f9'  // Headlines
text.secondary: '#94a3b8'  // Body text
text.muted:     '#64748b'  // Captions

// Accent (Indigo only)
accent.DEFAULT: '#6366f1'
accent.light:   '#818cf8'
accent.dark:    '#4f46e5'
accent.muted:   '#6366f122'

// Status
status.success: '#22c55e'
status.warning: '#f59e0b'
status.error:   '#ef4444'
status.info:    '#3b82f6'
Typography
fontFamily.sans: 'Inter, system-ui, -apple-system, sans-serif'
fontFamily.mono: 'JetBrains Mono, ui-monospace, monospace'

sizes.xs:  '12px'
sizes.sm:  '13px'
sizes.md:  '14px'
sizes.lg:  '15px'
sizes.xl:  '16px'
sizes['2xl']: '18px'
sizes['3xl']: '24px'
sizes['4xl']: '32px'
sizes['5xl']: '40px'

weights.normal:   '400'
weights.medium:   '500'
weights.semibold: '600'
weights.bold:     '700'
Spacing
xs:   '4px'
sm:   '8px'
md:   '12px'
lg:   '16px'
xl:   '20px'
'2xl': '24px'
'3xl': '32px'
'4xl': '40px'
Border Radius
sm: '6px'
md: '8px'
lg: '12px'
xl: '16px'
full: '9999px'
Shadows
sm: '0 1px 2px rgba(0, 0, 0, 0.3)'
md: '0 4px 6px -1px rgba(0, 0, 0, 0.3)'
lg: '0 10px 15px -3px rgba(0, 0, 0, 0.4)'
Styling Approach
1. Inline Styles: All components use inline styles with design tokens
2. No CSS-in-JS: Pure inline styles for React compatibility
/agents      3. Hover States: Inline event handlers for border/color changesSwitch agent
/compact     4. Responsive: CSS media queries in <style> tags where neededCompact session
/connect     5. Animations: CSS keyframes for spinners/transitionsConnect provider
/copy        Copy session transcript
/diff        The demo experience is complete with these three screens, focusing on a clean, professional dark-mode SaaS UI that guides users from entry through loading to the project overview before revealing the graph.Open diff viewer
/editor      Open editor
▣  Build · Kimi K2.5 · 2m 12s