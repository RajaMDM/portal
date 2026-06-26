/** Static About page describing what the Portal is and how it is built. */
export default function About() {
  return (
    <section className="prose">
      <h1>About The Portal</h1>
      <p>
        The Portal is a single-page web app that hosts a collection of small,
        independent mini-apps under one roof. Each mini-app lives in its own
        folder and is registered in a central list, so the home grid, navigation,
        and routes stay in sync automatically.
      </p>
      <p>
        It is built with React and Vite, written in TypeScript, and ships as a
        fully client-side app — no backend required. Any API keys a mini-app
        needs are entered by you at runtime and never stored on a server.
      </p>
      <h2>Tech at a glance</h2>
      <ul>
        <li>React + Vite (single-page, client-side rendered)</li>
        <li>TypeScript for type safety</li>
        <li>React Router for navigation between mini-apps</li>
        <li>Deployable to free static hosting</li>
      </ul>
    </section>
  )
}
