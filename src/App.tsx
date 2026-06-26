import { Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import About from './pages/About'
import NotFound from './pages/NotFound'
import { apps } from './apps/registry'

/**
 * The Portal's route tree. Every page renders inside the shared <Layout/>.
 * Live mini-app routes are generated from the registry so adding a mini-app
 * never means editing this file — append one entry in `apps/registry.ts`.
 */
export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="about" element={<About />} />
        {apps
          .filter((app) => app.status === 'live' && app.component)
          .map((app) => {
            const Screen = app.component!
            return (
              <Route
                key={app.slug}
                path={`apps/${app.slug}`}
                element={
                  <Suspense fallback={<p className="prose">Loading…</p>}>
                    <Screen />
                  </Suspense>
                }
              />
            )
          })}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
