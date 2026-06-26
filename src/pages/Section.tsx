import { Link, useParams } from 'react-router-dom'
import { getSection } from '../sections'
import { liveApps } from '../apps/registry'
import NotFound from './NotFound'

/**
 * Generic section page. Renders the section's intro plus either a grid of the
 * live mini-apps in its category or, while none exist, an empty-state
 * placeholder. One component serves all sections via the `:section` route
 * param, so adding a section never means adding a page.
 */
export default function Section() {
  const { section: slug } = useParams()
  const section = slug ? getSection(slug) : undefined

  if (!section) return <NotFound />

  const apps = liveApps.filter((app) => app.category === section.category)

  return (
    <>
      <section className="hero">
        <span className="section-hero__icon" aria-hidden="true">
          {section.icon}
        </span>
        <h1>{section.name}</h1>
        <p>{section.description}</p>
      </section>

      {apps.length > 0 ? (
        <section className="app-grid" aria-label={`${section.name} tools`}>
          {apps.map((app) => (
            <Link key={app.slug} to={`/apps/${app.slug}`} className="app-card">
              <span className="app-card__icon" aria-hidden="true">
                {app.icon}
              </span>
              <h2 className="app-card__name">{app.name}</h2>
              <p className="app-card__desc">{app.description}</p>
            </Link>
          ))}
        </section>
      ) : (
        <div className="empty-state" role="status">
          <span className="empty-state__icon" aria-hidden="true">
            {section.icon}
          </span>
          <h2 className="empty-state__title">Nothing here yet</h2>
          <p>
            The {section.name} section is just getting started. Tools will appear
            here as they ship.
          </p>
          <Link to="/">← Back to the Portal home</Link>
        </div>
      )}
    </>
  )
}
