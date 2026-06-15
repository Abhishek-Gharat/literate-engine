import React from 'react'
import { ComponentA } from './A'

export function ComponentB() {
  return (
    <div className="component-b">
      <h2>Component B</h2>
      <ComponentA />
    </div>
  )
}
