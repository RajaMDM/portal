import { useState } from 'react'

/**
 * Example mini-app. It exists to prove the registry → route → screen wiring
 * and to give future mini-apps a copy-paste starting point. Replace freely.
 */
export default function WelcomeApp() {
  const [count, setCount] = useState(0)

  return (
    <section className="prose">
      <h1>Welcome Tour</h1>
      <p>
        This is an example mini-app mounted by the Portal. It has its own route,
        its own card on the home page, and is loaded only when you open it.
      </p>
      <p>
        Building a new mini-app is three steps: create a folder under{' '}
        <code>src/apps/</code>, export a default component, and add one entry to{' '}
        <code>src/apps/registry.ts</code>.
      </p>
      <button type="button" onClick={() => setCount((c) => c + 1)}>
        Clicked {count} {count === 1 ? 'time' : 'times'}
      </button>
    </section>
  )
}
