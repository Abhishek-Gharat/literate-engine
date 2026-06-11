import React, { useState, useEffect } from 'react'
import { 
  DEMO_COLORS, 
  DEMO_SPACING, 
  DEMO_TYPOGRAPHY, 
  DEMO_RADIUS,
  DEMO_SHADOWS,
  DEMO_TRANSITIONS 
} from '../styles.js'

const STEPS = [
  { id: 'parse', label: 'Parsing files', duration: 800 },
  { id: 'detect', label: 'Detecting entry points', duration: 600 },
  { id: 'build', label: 'Building dependency graph', duration: 1200 },
  { id: 'generate', label: 'Generating insights', duration: 900 }
]

export function DemoLoadingState({ onComplete, onCancel }) {
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState([])
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const totalDuration = STEPS.reduce((sum, step) => sum + step.duration, 0)
    let elapsed = 0
    
    const interval = setInterval(() => {
      elapsed += 50
      const newProgress = Math.min((elapsed / totalDuration) * 100, 100)
      setProgress(newProgress)
      
      // Update current step based on elapsed time
      let timeAccumulator = 0
      let activeStep = 0
      
      for (let i = 0; i < STEPS.length; i++) {
        timeAccumulator += STEPS[i].duration
        if (elapsed >= timeAccumulator - 200) {
          activeStep = i + 1
        }
      }
      
      if (activeStep > currentStep && activeStep <= STEPS.length) {
        setCompletedSteps(prev => [...prev, STEPS[currentStep]?.id].filter(Boolean))
        setCurrentStep(activeStep)
      }
      
      if (elapsed >= totalDuration) {
        clearInterval(interval)
        setTimeout(() => onComplete?.(), 300)
      }
    }, 50)
    
    return () => clearInterval(interval)
  }, [onComplete, currentStep])

  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    background: DEMO_COLORS.bg.primary,
    padding: DEMO_SPACING.xl,
    color: DEMO_COLORS.text.primary
  }

  const cardStyle = {
    width: '100%',
    maxWidth: '480px',
    background: DEMO_COLORS.bg.card,
    border: `1px solid ${DEMO_COLORS.border.DEFAULT}`,
    borderRadius: DEMO_RADIUS.xl,
    padding: DEMO_SPACING['3xl'],
    boxShadow: DEMO_SHADOWS.lg
  }

  const headerStyle = {
    textAlign: 'center',
    marginBottom: DEMO_SPACING['2xl']
  }

  const titleStyle = {
    fontSize: DEMO_TYPOGRAPHY.sizes['2xl'],
    fontWeight: DEMO_TYPOGRAPHY.weights.bold,
    margin: `0 0 ${DEMO_SPACING.md} 0`
  }

  const subtitleStyle = {
    fontSize: DEMO_TYPOGRAPHY.sizes.base,
    color: DEMO_COLORS.text.secondary,
    margin: 0
  }

  const progressBarStyle = {
    width: '100%',
    height: '4px',
    background: DEMO_COLORS.bg.elevated,
    borderRadius: DEMO_RADIUS.full,
    overflow: 'hidden',
    marginBottom: DEMO_SPACING['2xl']
  }

  const progressFillStyle = {
    height: '100%',
    background: `linear-gradient(90deg, ${DEMO_COLORS.accent.DEFAULT}, ${DEMO_COLORS.accent.light})`,
    borderRadius: DEMO_RADIUS.full,
    transition: `width ${DEMO_TRANSITIONS.normal}`,
    width: `${progress}%`
  }

  const stepsStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: DEMO_SPACING.lg
  }

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={headerStyle}>
          <h1 style={titleStyle}>Analyzing Demo Project</h1>
          <p style={subtitleStyle}>This will take about 3 seconds</p>
        </div>

        <div style={progressBarStyle}>
          <div style={progressFillStyle} />
        </div>

        <div style={stepsStyle}>
          {STEPS.map((step, index) => (
            <StepItem 
              key={step.id}
              step={step}
              index={index}
              isCompleted={completedSteps.includes(step.id)}
              isActive={currentStep === index}
            />
          ))}
        </div>

        <div style={{
          marginTop: DEMO_SPACING['2xl'],
          textAlign: 'center',
          fontSize: DEMO_TYPOGRAPHY.sizes.xs,
          color: DEMO_COLORS.text.muted
        }}>
          ReactViz Demo v1.0
        </div>

        <button
          onClick={onCancel}
          style={{
            marginTop: DEMO_SPACING.xl,
            width: '100%',
            padding: `${DEMO_SPACING.md} ${DEMO_SPACING.lg}`,
            background: 'transparent',
            border: `1px solid ${DEMO_COLORS.border.DEFAULT}`,
            borderRadius: DEMO_RADIUS.md,
            color: DEMO_COLORS.text.secondary,
            fontSize: DEMO_TYPOGRAPHY.sizes.sm,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: DEMO_SPACING.sm,
            transition: `all ${DEMO_TRANSITIONS.fast}`
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = DEMO_COLORS.border.light
            e.currentTarget.style.color = DEMO_COLORS.text.primary
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = DEMO_COLORS.border.DEFAULT
            e.currentTarget.style.color = DEMO_COLORS.text.secondary
          }}
        >
          <span>←</span>
          Cancel and Go Back
        </button>
      </div>
    </div>
  )
}

function StepItem({ step, index, isCompleted, isActive }) {
  const [showSpinner, setShowSpinner] = useState(isActive)
  
  useEffect(() => {
    setShowSpinner(isActive)
  }, [isActive])

  const containerStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: DEMO_SPACING.lg,
    padding: DEMO_SPACING.md,
    borderRadius: DEMO_RADIUS.md,
    background: isActive ? DEMO_COLORS.accent.muted : 'transparent',
    transition: `background ${DEMO_TRANSITIONS.fast}`
  }

  const numberStyle = {
    width: '28px',
    height: '28px',
    borderRadius: DEMO_RADIUS.full,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: DEMO_TYPOGRAPHY.sizes.sm,
    fontWeight: DEMO_TYPOGRAPHY.weights.semibold,
    background: isCompleted 
      ? DEMO_COLORS.status.success 
      : isActive 
        ? DEMO_COLORS.accent.DEFAULT 
        : DEMO_COLORS.bg.elevated,
    color: isCompleted || isActive ? '#fff' : DEMO_COLORS.text.muted
  }

  const labelStyle = {
    flex: 1,
    fontSize: DEMO_TYPOGRAPHY.sizes.base,
    color: isActive ? DEMO_COLORS.text.primary : DEMO_COLORS.text.secondary,
    fontWeight: isActive ? DEMO_TYPOGRAPHY.weights.medium : DEMO_TYPOGRAPHY.weights.normal
  }

  const statusStyle = {
    fontSize: DEMO_TYPOGRAPHY.sizes.xs,
    color: isCompleted 
      ? DEMO_COLORS.status.success 
      : isActive 
        ? DEMO_COLORS.accent.light 
        : DEMO_COLORS.text.muted
  }

  return (
    <div style={containerStyle}>
      <div style={numberStyle}>
        {isCompleted ? '✓' : index + 1}
      </div>
      <span style={labelStyle}>{step.label}</span>
      <span style={statusStyle}>
        {isCompleted ? 'Done' : isActive ? (
          <span style={{
            display: 'inline-block',
            animation: 'spin 1s linear infinite'
          }}>⟳</span>
        ) : 'Waiting'}
      </span>
    </div>
  )
}

// Add spin animation
const style = document.createElement('style')
style.textContent = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`
document.head.appendChild(style)
