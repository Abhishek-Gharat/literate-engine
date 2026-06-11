export function getNodeType(filename) {
  const basename = filename.split('/').pop()

  if (/^use[A-Z]/.test(basename)) return 'hook'
  if (/\.config\./.test(filename)) return 'config'
  if (/(^|\/)(tsconfig|jsconfig|package|vite\.config|webpack\.config)\./.test(filename)) return 'config'
  if (/\.(css|scss)$/.test(filename)) return 'style'
  if (/(context|Context|Provider|provider|store|Store)\./.test(filename)) return 'context'
  if (/(route|Route|router|Router|Page|page)\./.test(filename)) return 'page'
  if (basename === 'App.jsx' || basename === 'App.tsx') return 'root'
  if (basename?.includes('index')) return 'index'
  return 'component'
}
