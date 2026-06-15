import React from 'react'
import { ComponentB } from './B'

export function ComponentA() {
  return (
    <div className="component-a">
      <h2>Component A</h2>
      <ComponentB />
    </div>
  )
}
