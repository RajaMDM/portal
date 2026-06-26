import { Link } from 'react-router-dom'

/** Fallback page for unknown routes. */
export default function NotFound() {
  return (
    <section className="prose">
      <h1>Page not found</h1>
      <p>That page doesn’t exist (yet). Let’s get you back on track.</p>
      <Link to="/">← Back to the Portal home</Link>
    </section>
  )
}
