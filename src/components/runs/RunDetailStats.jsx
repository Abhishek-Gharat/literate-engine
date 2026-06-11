import React from 'react'
import { formatStat } from '../../utils/format.js'
import StatRow from './StatRow'

/**
 * RunDetailStats - Detailed statistics section
 * 
 * @param {Object} props
 * @param {Object} props.stats - Run statistics
 */
export default function RunDetailStats({ stats }) {
  const totalFiles = stats?.totalFiles || 0
  const totalComponents = stats?.totalComponents || 0

  return (
    <div style={{ marginBottom: '24px' }}>
      <div
        style={{
          fontSize: '11px',
          color: '#64748b',
          fontWeight: '600',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          marginBottom: '12px'
        }}
      >
        Detailed Statistics
      </div>
      <StatRow
        label="Files Analyzed"
        value={formatStat(totalFiles, 'file')}
        testId="run-detail-files"
      />
      <StatRow
        label="Components Found"
        value={formatStat(totalComponents, 'component')}
        testId="run-detail-components"
      />
    </div>
  )
}
