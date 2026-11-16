# ReactViz — Interactive React Codebase & Component Visualizer

[![Live Demo](https://img.shields.io/badge/Live_Demo-Vercel-success?style=for-the-badge&logo=vercel)](https://literate-engine-chi.vercel.app)
[![Tech Stack](https://img.shields.io/badge/Stack-React_19_|_React_Flow_|_AST_Parsing-blue?style=for-the-badge)](https://github.com/Abhishek-Gharat/literate-engine)

ReactViz is a developer tool designed to analyze React applications through static AST parsing, visualizing component hierarchies, import/export dependency networks, and potential rendering bottlenecks.

---

## Key Features

- **Interactive Component Dependency Graph**: Visualizes components, hooks, and external modules as a directed graph powered by `@xyflow/react` (React Flow v12) and Dagre auto-layout.
- **Static AST Parsing**: Analyzes JSX hierarchies, imported/exported symbols, props, and custom hooks using `@babel/parser`.
- **Rerender Risk & Hotspot Detection**: Inspects prop passing and state signal chains to highlight component subtrees with high rerender probability.
- **Dead Export Analysis**: Scans source directories to flag unused exports and modular coupling.
- **Local Analysis Backend**: Node.js and Express 5 API with SQLite caching for quick retrieval of analyzed repository graphs.

---

## Tech Stack

- **Frontend**: React 19, `@xyflow/react` (React Flow v12), `dagre` (graph layout), Tailwind CSS v4, Vite 8
- **AST & Analysis Engine**: `@babel/parser`, custom static analysis modules (`src/analysis/`)
- **Backend Service**: Node.js, Express 5, Better-SQLite3, Helmet, CORS, Express Rate Limit
- **Testing**: Playwright (E2E testing), Vitest, Node test runner

---

## Architecture Overview

```
[React/JSX Source Files]
         │
         ▼
[AST Parser (@babel/parser)]
         │
         ├───> [Component Extractor] ───> [Hierarchy Graph]
         ├───> [Dependency Analysis] ───> [Import/Export Matrix]
         └───> [Risk Evaluator]      ───> [Rerender Hotspots]
                                                 │
                                                 ▼
[Interactive Graph Canvas (@xyflow/react + Dagre Layout Engine)]
```

---

## Getting Started

### Prerequisites
- Node.js >= 20.19.0
- npm >= 10.0.0

### Installation
```bash
# Clone the repository
git clone https://github.com/Abhishek-Gharat/literate-engine.git
cd literate-engine

# Install dependencies
npm install
```

### Running Locally
```bash
# Start the frontend dev server
npm run dev

# Start the analysis API server (optional)
npm run dev:api
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Running Tests
```bash
# Run unit and analysis tests
npm run test:unit

# Run Playwright end-to-end tests
npm run test:e2e
```

---

## Live Demo
Check out the live interactive application deployed at:
[https://literate-engine-chi.vercel.app](https://literate-engine-chi.vercel.app)
