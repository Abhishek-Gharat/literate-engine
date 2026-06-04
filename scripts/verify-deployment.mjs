#!/usr/bin/env node
/**
 * Deployment Health Check Script
 * Verifies that all deployment requirements are met
 */

import http from 'http'
import { promisify } from 'util'

const sleep = promisify(setTimeout)

const HEALTH_CHECK_ENDPOINT = process.env.HEALTH_CHECK_URL || 'http://localhost:4000'
const MAX_RETRIES = 10
const RETRY_DELAY = 1000

async function checkHealth(attempt = 1) {
  if (attempt > MAX_RETRIES) {
    console.error('[CHECK] ✗ Health check failed after', MAX_RETRIES, 'attempts')
    return false
  }

  return new Promise((resolve) => {
    const timeoutId = setTimeout(() => {
      console.error(`[CHECK] Timeout on attempt ${attempt}/${MAX_RETRIES}`)
      resolve(false)
    }, 5000)

    http
      .get(`${HEALTH_CHECK_ENDPOINT}/health`, (res) => {
        clearTimeout(timeoutId)

        if (res.statusCode === 200) {
          console.log(`[CHECK] ✓ Health endpoint responding (${res.statusCode})`)
          resolve(true)
          return
        }

        if (res.statusCode === 503) {
          console.warn(`[CHECK] ⚠ Server degraded (${res.statusCode}) - Attempt ${attempt}/${MAX_RETRIES}`)
          sleep(RETRY_DELAY).then(() => {
            resolve(checkHealth(attempt + 1))
          })
          return
        }

        console.error(`[CHECK] ✗ Unexpected status: ${res.statusCode}`)
        resolve(false)
      })
      .on('error', (error) => {
        clearTimeout(timeoutId)
        if (attempt < MAX_RETRIES) {
          console.log(`[CHECK] Connection attempt ${attempt}/${MAX_RETRIES} - retrying...`)
          sleep(RETRY_DELAY).then(() => {
            resolve(checkHealth(attempt + 1))
          })
        } else {
          console.error('[CHECK] ✗ Connection error:', error.message)
          resolve(false)
        }
      })
  })
}

async function checkEndpoint(path, method = 'GET') {
  return new Promise((resolve) => {
    const url = new URL(path, HEALTH_CHECK_ENDPOINT)
    const timeoutId = setTimeout(() => {
      console.error(`[CHECK] Timeout checking ${path}`)
      resolve(false)
    }, 5000)

    http
      .request(url, { method }, (res) => {
        clearTimeout(timeoutId)
        const statusOk = res.statusCode >= 200 && res.statusCode < 300

        if (statusOk) {
          console.log(`[CHECK] ✓ ${method} ${path} (${res.statusCode})`)
        } else if (res.statusCode === 404) {
          console.warn(`[CHECK] ⚠ ${method} ${path} not found (${res.statusCode})`)
        } else {
          console.error(`[CHECK] ✗ ${method} ${path} (${res.statusCode})`)
        }
        resolve(statusOk)
      })
      .on('error', (error) => {
        clearTimeout(timeoutId)
        console.error(`[CHECK] ✗ Error on ${method} ${path}:`, error.message)
        resolve(false)
      })
      .end()
  })
}

async function runHealthChecks() {
  console.log('[CHECK] ═══════════════════════════════════════')
  console.log('[CHECK] Deployment Verification Starting')
  console.log('[CHECK] Checking:', HEALTH_CHECK_ENDPOINT)
  console.log('[CHECK] ═══════════════════════════════════════')

  const healthOk = await checkHealth()
  if (!healthOk) {
    console.error('[CHECK] ✗ Health check failed - deployment not ready')
    process.exit(1)
  }

  const checks = [
    { path: '/', method: 'GET' },
    { path: '/health', method: 'GET' },
    { path: '/api/projects', method: 'GET' },
    { path: '/api/runs', method: 'GET' },
    { path: '/api/analysis', method: 'POST' },
  ]

  const results = await Promise.all(checks.map(({ path, method }) => checkEndpoint(path, method)))

  const passed = results.filter(Boolean).length
  console.log('[CHECK] ═══════════════════════════════════════')
  console.log(`[CHECK] Results: ${passed}/${results.length} checks passed`)
  console.log('[CHECK] ═══════════════════════════════════════')

  return results.every(Boolean)
}

const success = await runHealthChecks()
process.exit(success ? 0 : 1)
