// This file is intentionally not imported anywhere
// It tests ReactViz orphan/unreferenced file detection

export function orphanHelper() {
  return 'This function is never used'
}

export const orphanConfig = {
  debug: true,
  mode: 'test'
}
