import React, { useState } from 'react'
import { 
  DEMO_COLORS, 
  DEMO_SPACING, 
  DEMO_TYPOGRAPHY, 
  DEMO_RADIUS,
  DEMO_TRANSITIONS 
} from './styles.js'
import { DemoEntryHero } from './components/DemoEntryHero.jsx'
import { DemoLoadingState } from './components/DemoLoadingState.jsx'
import { DemoProjectOverview } from './components/DemoProjectOverview.jsx'
import { GraphView } from './components/graph/GraphView.jsx'
import { 
  DEMO_PROJECT_SUMMARY,
  DEMO_AI_SUMMARY,
  DEMO_FINDINGS,
  DEMO_ARCHITECTURE_SNAPSHOT,
  DEMO_NODES,
  DEMO_EDGES,
  DEMO_ANALYSIS_RESULT
} from './demoData.js'

// View states
const VIEWS = {
  ENTRY: 'entry',
  LOADING: 'loading',
  OVERVIEW: 'overview',
  GRAPH: 'graph'
}

/**
 * DemoExperience - Main demo flow controller
 * Orchestrates: Entry -> Loading -> Overview -> Graph
 */
export function DemoExperience({ onBackToApp }) {
  const [currentView, setCurrentView] = useState(VIEWS.ENTRY)
  const [analysisResult, setAnalysisResult] = useState(null)

  const handleTryDemo = () => {
    setCurrentView(VIEWS.LOADING)
  }

  const handleLoadingComplete = () => {
    // Simulate loading complete
    setAnalysisResult(DEMO_ANALYSIS_RESULT)
    setCurrentView(VIEWS.OVERVIEW)
  }

  const handleOpenGraph = () => {
    setCurrentView(VIEWS.GRAPH)
  }

  const handleBackToOverview = () => {
    setCurrentView(VIEWS.OVERVIEW)
  }

  const handleExplainProject = () => {
    // Could open AI explanation modal
    console.log('Explain project requested')
  }

  const handleInspect = () => {
    // Could navigate to specific components
    setCurrentView(VIEWS.GRAPH)
  }

  const handleViewEntryPoints = () => {
    // Could filter to entry points in graph
    setCurrentView(VIEWS.GRAPH)
  }



  switch (currentView) {
    case VIEWS.ENTRY:
      return (
        <DemoEntryHero 
          onTryDemo={handleTryDemo}
          onUpload={onBackToApp}
          onBack={onBackToApp}
        />
      )

    case VIEWS.LOADING:
      return (
        <DemoLoadingState 
          onComplete={handleLoadingComplete}
          onCancel={onBackToApp}
        />
      )

    case VIEWS.OVERVIEW:
      return (
        <DemoProjectOverview
          summary={DEMO_AI_SUMMARY}
          findings={DEMO_FINDINGS}
          snapshot={DEMO_ARCHITECTURE_SNAPSHOT}
          stats={{
            ...DEMO_PROJECT_SUMMARY,
            entryPoint: DEMO_PROJECT_SUMMARY.entryPoint.split('/').pop()
          }}
          onOpenGraph={handleOpenGraph}
          onExplainProject={handleExplainProject}
          onInspect={handleInspect}
          onViewEntryPoints={handleViewEntryPoints}
          onBackToApp={onBackToApp}
        />
      )

    case VIEWS.GRAPH:
      return (
        <GraphView
          onBack={handleBackToOverview}
        />
      )

    default:
      return <DemoEntryHero onTryDemo={handleTryDemo} onUpload={onBackToApp} />
  }
}

export default DemoExperience
