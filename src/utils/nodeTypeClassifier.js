export function getNodeType(filename) {
  const basename = filename.split('/').pop()

  if (/^use[A-Z]/.test(basename)) return 'hook'
  if (/\.(css|scss)$/.test(filename)) return 'style'
  if (filename.includes('Page') || filename.includes('page')) return 'page'
  if (basename === 'App.jsx' || basename === 'App.tsx') return 'root'
  if (basename?.includes('index')) return 'index'
  return 'component'
}
