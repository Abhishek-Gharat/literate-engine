import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import ShareViewer from './components/share/ShareViewer.jsx'

const shareMatch = window.location.pathname.match(/^\/share\/([^/]+)$/)
const Root = shareMatch ? <ShareViewer runId={decodeURIComponent(shareMatch[1])} /> : <App />

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {Root}
  </StrictMode>,
)
