import { getSmoothStepPath } from '@xyflow/react'

export default function AnimatedEdge({
  id, sourceX, sourceY, targetX, targetY,
  sourcePosition, targetPosition, data,
}) {
  const isCyclic = data?.cyclic || false
  const isImpact = data?.impact || false
  const isDimmed = data?.dimmed || false
  const dotColor = isImpact
    ? '#f5a623'
    : isDimmed
      ? 'rgba(255,255,255,0.12)'
      : isCyclic ? '#b07a8a' : 'rgba(255,255,255,0.5)'
  const lineColor = isImpact
    ? '#f5a62388'
    : isDimmed
      ? 'rgba(255,255,255,0.05)'
      : isCyclic ? '#b07a8a33' : 'rgba(255,255,255,0.15)'
  const glowColor = isImpact
    ? '#f5a62322'
    : isDimmed
      ? 'transparent'
      : isCyclic ? '#b07a8a22' : 'rgba(255,255,255,0.08)'
const duration = isCyclic ? '6s' : '10s'
  const uid = `edge-${id}`.replace(/[^a-zA-Z0-9-]/g, '-')

  const [edgePath] = getSmoothStepPath({
    sourceX, sourceY, sourcePosition,
    targetX, targetY, targetPosition,
  })

  return (
    <>
      <defs>
        {/* Glow filter */}
        <filter id={`glow-${uid}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Soft glow filter for outer ring */}
        <filter id={`softglow-${uid}`} x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
          </feMerge>
        </filter>
      </defs>

      {/* Base edge path */}
      <path
        id={uid}
        d={edgePath}
        fill="none"
        stroke={lineColor}
        strokeWidth={2.5}
        strokeLinecap="round"
      />

      {/* Outer glow ring — large, soft, fades */}
      <circle r="8" fill={glowColor} filter={`url(#softglow-${uid})`}>
        <animateMotion dur={duration} repeatCount="indefinite" rotate="auto">
          <mpath href={`#${uid}`} />
        </animateMotion>
        <animate
          attributeName="opacity"
          values="0;0.6;0.8;0.6;0"
          dur={duration}
          repeatCount="indefinite"
        />
      </circle>

      {/* Mid glow ring */}
      <circle r="4" fill={dotColor} opacity="0.25" filter={`url(#glow-${uid})`}>
        <animateMotion dur={duration} repeatCount="indefinite" rotate="auto">
          <mpath href={`#${uid}`} />
        </animateMotion>
      </circle>

      {/* Core dot — sharp bright center */}
      <circle r="2.5" fill={dotColor} filter={`url(#glow-${uid})`}>
        <animateMotion dur={duration} repeatCount="indefinite" rotate="auto">
          <mpath href={`#${uid}`} />
        </animateMotion>
        <animate
          attributeName="opacity"
          values="0.7;1;1;1;0.7"
          dur={duration}
          repeatCount="indefinite"
        />
      </circle>

      {/* Trailing fade — dot behind main dot */}
      <circle r="1.5" fill={dotColor} opacity="0.3">
        <animateMotion
          dur={duration}
          repeatCount="indefinite"
          rotate="auto"
          keyPoints="0;0.85"
          keyTimes="0;1"
          calcMode="linear"
        >
          <mpath href={`#${uid}`} />
        </animateMotion>
      </circle>
    </>
  )
}