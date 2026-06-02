// Test setup for Vitest
import React from 'react'
import { expect } from 'vitest'
import * as matchers from '@testing-library/jest-dom/matchers'

// Add jest-dom matchers
expect.extend(matchers)
