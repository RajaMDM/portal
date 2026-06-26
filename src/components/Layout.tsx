import { NavLink, Outlet } from 'react-router-dom'
import { liveApps } from '../apps/registry'

/**
 * The Portal shell: a persistent header with primary nav plus an <Outlet/> the
 * router fills with the active page. Live mini-apps are listed in the nav
 * automatically from the registry.
 */
export default function Layout() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <NavLink to="/" className="brand">
          The&nbsp;Portal
        </NavLink>
        <nav className="nav">
          <NavLink to="/" end>
            Home
          </NavLink>
          {liveApps.map((app) => (
            <NavLink key={app.slug} to={`/apps/${app.slug}`}>
              {app.name}
            </NavLink>
          ))}
          <NavLink to="/about">About</NavLink>
        </nav>
      </header>

      <main className="app-main">
        <Outlet />
      </main>

      <footer className="app-footer">
        <span>The Portal — a home for small, useful tools.</span>
      </footer>
    </div>
  )
}
