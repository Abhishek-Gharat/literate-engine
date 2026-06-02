import { test, expect } from '@playwright/test'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

test.describe('Persistence Happy Path', () => {
  test('create project, upload files, analyze, verify run appears, reload run', async ({ page }) => {
    // Navigate to app
    await page.goto('/')

    // Wait for app to load
    await page.waitForSelector('text=ReactViz')

    // Step 1: Create a new project
    await page.click('[data-testid="new-project-button"]')
    
    // Modal should appear
    await expect(page.locator('text=Create New Project')).toBeVisible()
    
    // Fill in project name
    await page.fill('[data-testid="project-name-input"]', 'Test Project E2E')
    
    // Click create
    await page.click('[data-testid="create-project-submit"]')
    
    // Wait for project to be created and modal to close
    await expect(page.locator('text=Create New Project')).not.toBeVisible()
    
    // Verify project appears in list
await expect(page.getByTestId('project-item-...')).toBeVisible()

    // Step 2: Verify no project warning is gone
    await expect(page.locator('[data-testid="no-project-warning"]')).not.toBeVisible()

    // Step 3: Upload test files
    const fileInput = page.locator('[data-testid="file-input"]')
    const testFile = path.join(__dirname, 'fixtures', 'test-component.jsx')
    
    await fileInput.setInputFiles(testFile)

    // Step 4: Wait for analysis to complete
    // Should see analyzing indicator
    await expect(page.locator('[data-testid="analyzing-indicator"]')).toBeVisible()
    
    // Wait for success message
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible({ timeout: 30000 })
    
    // Should see file count message
    await expect(page.locator('text=1 files analyzed')).toBeVisible()

    // Step 5: Verify run appears in runs list
    await expect(page.locator('[data-testid^="run-item-"]')).toBeVisible({ timeout: 5000 })
    
    // Should show run stats
    await expect(page.locator('text=files')).toBeVisible()

    // Step 6: Verify graph appears
    // The graph should be visible after analysis completes
    await expect(page.locator('.react-flow')).toBeVisible({ timeout: 10000 })
    
    // Step 7: Go back to input (simulating user clicking back)
    await page.goto('/')
    
    // Wait for app to reload
    await page.waitForSelector('text=ReactViz')
    
    // Step 8: Select the project again
    await page.click('text=Test Project E2E')
    
    // Wait for runs to load
    await expect(page.locator('[data-testid^="run-item-"]')).toBeVisible({ timeout: 5000 })
    
    // Step 9: Click on the saved run to reload it
    await page.click('[data-testid^="run-item-"]')
    
    // Step 10: Verify graph reloads
    await expect(page.locator('.react-flow')).toBeVisible({ timeout: 10000 })
    
    // Should see loading indicator while run loads
    await expect(page.locator('[data-testid="analyzing-indicator"]')).toBeVisible()
  })
})
