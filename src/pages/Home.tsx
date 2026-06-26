import { Link } from 'react-router-dom'
import { sections } from '../sections'
import { liveApps } from '../apps/registry'

/**
 * Landing page: a hero, a grid of the four Portal sections, and a small strip of
 * any live mini-apps you can jump straight into. Both grids are generated from
 * their registries, so they stay in sync as the Portal grows.
 */
export default function Home() {
  return (
    <>
      <section className="hero">
        <h1>The Portal</h1>
        <p>
          A growing home for small, focused tools — for school folks, data work,
          recipes, AI examples, and whatever comes next. Pick a section to get
          started.
        </p>
      </section>

      <section className="app-grid" aria-label="Sections">
        {sections.map((section) => (
          <Link key={section.slug} to={`/${section.slug}`} className="app-card">
            <span className="app-card__icon" aria-hidden="true">
              {section.icon}
            </span>
            <h2 className="app-card__name">{section.name}</h2>
            <p className="app-card__desc">{section.tagline}</p>
          </Link>
        ))}
      </section>

      {liveApps.length > 0 && (
        <section className="home-apps" aria-label="Live mini-apps">
          <h2 className="home-apps__heading">Jump back in</h2>
          <div className="app-grid">
            {liveApps.map((app) => (
              <Link
                key={app.slug}
                to={`/apps/${app.slug}`}
                className="app-card"
              >
                <span className="app-card__icon" aria-hidden="true">
                  {app.icon}
                </span>
                <span className="app-card__category">{app.category}</span>
                <h2 className="app-card__name">{app.name}</h2>
                <p className="app-card__desc">{app.description}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </>
  )
}
