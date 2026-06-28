import { useRef, useState } from 'react'
import {
  describeError,
  MODELS,
  STYLES,
  streamSummary,
  type SummaryStyle,
} from './summarize'
import './ai-summarizer.css'

/**
 * AI Summarizer mini-app — the Portal's first AI Examples vertical slice.
 *
 * It demonstrates a useful, fully client-side AI call: the user pastes text and
 * their own Anthropic API key, picks a model and an output style, and Claude
 * streams back a summary. The key lives in component state only — never written
 * to disk, never committed, sent only to api.anthropic.com. The data layer
 * (./summarize) owns the API contract; this file owns UI and state.
 */
export default function AiSummarizerApp() {
  // The key is held in memory for the life of this page only. A reload clears
  // it — a deliberate trade for a clean privacy story (nothing persisted).
  const [apiKey, setApiKey] = useState('')
  const [showKey, setShowKey] = useState(false)

  const [model, setModel] = useState(MODELS[0].id)
  const [style, setStyle] = useState<SummaryStyle>('concise')
  const [text, setText] = useState('')

  const [summary, setSummary] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>(
    'idle',
  )
  const [error, setError] = useState('')

  // Lets us cancel an in-flight stream if the user hits Stop.
  const abortRef = useRef<AbortController | null>(null)

  const canRun = apiKey.trim().length > 0 && text.trim().length > 0

  async function handleSummarize() {
    if (!canRun || status === 'loading') return

    const controller = new AbortController()
    abortRef.current = controller
    setStatus('loading')
    setError('')
    setSummary('')

    try {
      await streamSummary(
        { apiKey: apiKey.trim(), model, style, text: text.trim() },
        (delta) => setSummary((prev) => prev + delta),
        controller.signal,
      )
      setStatus('done')
    } catch (err) {
      // An intentional Stop shows up as an abort — treat it as a clean cancel,
      // not an error, and keep whatever streamed so far.
      if (controller.signal.aborted) {
        setStatus(summary ? 'done' : 'idle')
        return
      }
      setError(describeError(err))
      setStatus('error')
    } finally {
      abortRef.current = null
    }
  }

  function handleStop() {
    abortRef.current?.abort()
  }

  function handleClearKey() {
    setApiKey('')
    setShowKey(false)
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(summary)
    } catch {
      // Clipboard can be blocked (permissions, insecure context). Non-fatal —
      // the text is still visible and selectable, so we stay quiet.
    }
  }

  return (
    <section className="ai">
      <div className="ai__intro">
        <h1>🤖 Text Summarizer</h1>
        <p>
          Paste any text and Claude will summarise it — right here in your
          browser. Bring your own Anthropic API key; it never leaves this page
          except to call Anthropic, and nothing is stored or sent to our
          servers.
        </p>
      </div>

      {/* ---- API key ---------------------------------------------------- */}
      <div className="ai__field">
        <label htmlFor="ai-key">Anthropic API key</label>
        <div className="ai__key-row">
          <input
            id="ai-key"
            type={showKey ? 'text' : 'password'}
            className="ai__input"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-ant-…"
            autoComplete="off"
            spellCheck={false}
          />
          <button
            type="button"
            className="ai__btn ai__btn--ghost"
            onClick={() => setShowKey((s) => !s)}
            aria-pressed={showKey}
          >
            {showKey ? 'Hide' : 'Show'}
          </button>
          <button
            type="button"
            className="ai__btn ai__btn--ghost"
            onClick={handleClearKey}
            disabled={!apiKey}
          >
            Clear
          </button>
        </div>
        <p className="ai__privacy" role="note">
          🔒 Your key stays in this browser tab, in memory only. It is never
          saved to disk, never committed to our code, and is sent only to
          Anthropic to make the request. Reloading the page clears it. Get a key
          at{' '}
          <a
            href="https://console.anthropic.com/settings/keys"
            target="_blank"
            rel="noreferrer"
          >
            console.anthropic.com
          </a>
          .
        </p>
      </div>

      {/* ---- Options ---------------------------------------------------- */}
      <div className="ai__options">
        <div className="ai__field">
          <label htmlFor="ai-model">Model</label>
          <select
            id="ai-model"
            className="ai__input"
            value={model}
            onChange={(e) => setModel(e.target.value)}
          >
            {MODELS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label} — {m.note}
              </option>
            ))}
          </select>
        </div>

        <div className="ai__field">
          <label htmlFor="ai-style">Summary style</label>
          <select
            id="ai-style"
            className="ai__input"
            value={style}
            onChange={(e) => setStyle(e.target.value as SummaryStyle)}
          >
            {STYLES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ---- Input text ------------------------------------------------- */}
      <div className="ai__field">
        <label htmlFor="ai-text">Text to summarise</label>
        <textarea
          id="ai-text"
          className="ai__textarea"
          rows={9}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste an article, email thread, meeting notes, a long message…"
        />
        <span className="ai__field-hint">
          {text.trim() ? `${text.trim().length.toLocaleString()} characters` : 'Any length of text works.'}
        </span>
      </div>

      {/* ---- Actions ---------------------------------------------------- */}
      <div className="ai__actions">
        {status === 'loading' ? (
          <button type="button" className="ai__btn" onClick={handleStop}>
            Stop
          </button>
        ) : (
          <button
            type="button"
            className="ai__btn"
            onClick={handleSummarize}
            disabled={!canRun}
          >
            Summarise
          </button>
        )}
        {!canRun && status === 'idle' && (
          <span className="ai__field-hint">
            Enter your API key and some text to begin.
          </span>
        )}
      </div>

      {/* ---- Error ------------------------------------------------------ */}
      {status === 'error' && (
        <p className="ai__error" role="alert">
          {error}
        </p>
      )}

      {/* ---- Output ----------------------------------------------------- */}
      {(status === 'loading' || summary) && (
        <div className="ai__output" aria-live="polite">
          <div className="ai__output-head">
            <h2>Summary</h2>
            {status === 'done' && summary && (
              <button
                type="button"
                className="ai__btn ai__btn--ghost"
                onClick={handleCopy}
              >
                Copy
              </button>
            )}
          </div>
          {summary ? (
            <p className="ai__summary">{summary}</p>
          ) : (
            <p className="ai__summary ai__summary--pending">Summarising…</p>
          )}
        </div>
      )}
    </section>
  )
}
