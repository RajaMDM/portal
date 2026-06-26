import { Link } from 'react-router-dom'
import { apps } from '../apps/registry'

/** Landing page: a hero plus a grid of mini-app cards sourced from the registry. */
export default function Home() {
  return (
    <>
      <section className="hero">
        <h1>The Portal</h1>
        <p>
          A growing home for small, focused tools — for school folks, data work,
          recipes, AI examples, and whatever comes next. Pick one to get started.
        </p>
      </section>

      <section className="app-grid" aria-label="Mini-apps">
        {apps.map((app) => {
          const card = (
            <>
              <span className="app-card__icon" aria-hidden="true">
                {app.icon}
              </span>
              <span className="app-card__category">{app.category}</span>
              <h2 className="app-card__name">{app.name}</h2>
              <p className="app-card__desc">{app.description}</p>
              {app.status === 'planned' && (
                <span className="app-card__badge">Coming soon</span>
              )}
            </>
          )

          return app.status === 'live' ? (
            <Link key={app.slug} to={`/apps/${app.slug}`} className="app-card">
              {card}
            </Link>
          ) : (
            <div
              key={app.slug}
              className="app-card app-card--disabled"
              aria-disabled="true"
            >
              {card}
            </div>
          )
        })}
      </section>
    </>
  )
}
