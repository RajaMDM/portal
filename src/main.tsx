import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'

// HashRouter is used deliberately: it serves deep links from a single static
// file (index.html) with zero server config, which is exactly what free static
// hosts like GitHub Pages give us. Upgrade trigger: switch to BrowserRouter +
// a 404.html redirect when we need clean URLs for SEO or a custom domain.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>,
)
