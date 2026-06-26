import { NavLink, Outlet } from 'react-router-dom'
import { sections } from '../sections'

/**
 * The Portal shell: a persistent header with primary nav plus an <Outlet/> the
 * router fills with the active page. The four sections are listed in the nav
 * automatically from the sections registry.
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
          {sections.map((section) => (
            <NavLink key={section.slug} to={`/${section.slug}`}>
              {section.name}
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
