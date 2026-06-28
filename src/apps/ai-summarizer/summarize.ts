import Anthropic from '@anthropic-ai/sdk'

/**
 * AI Summarizer — data/logic layer.
 *
 * This module owns the single Claude API call the mini-app makes. It is kept
 * apart from the React component (the recipes pattern) so the UI stays focused
 * on rendering and state, and the API contract lives in one auditable place.
 *
 * Everything here runs in the browser. The user pastes their own Anthropic API
 * key at runtime; we hold it in memory only and hand it straight to the SDK.
 * The key is never written to disk, never committed, and never sent anywhere
 * except `api.anthropic.com`.
 */

/** Models we expose in the picker. Opus is the default — Sonnet and Haiku are
 *  cheaper/faster options the user can pick to trade quality for cost/latency.
 *  All three speak the same Messages API, so the call shape below is identical
 *  regardless of choice. IDs are bare aliases (no date suffix) by design. */
export interface ModelOption {
  id: string
  label: string
  note: string
}

export const MODELS: ModelOption[] = [
  {
    id: 'claude-opus-4-8',
    label: 'Claude Opus 4.8',
    note: 'Most capable — best quality, highest cost',
  },
  {
    id: 'claude-sonnet-4-6',
    label: 'Claude Sonnet 4.6',
    note: 'Balanced — strong quality, lower cost',
  },
  {
    id: 'claude-haiku-4-5',
    label: 'Claude Haiku 4.5',
    note: 'Fastest and cheapest — great for short text',
  },
]

/** Output styles. Each maps to a tailored instruction so the same input can be
 *  summarised three useful ways without changing any code. */
export type SummaryStyle = 'concise' | 'bullets' | 'takeaways'

export interface StyleOption {
  id: SummaryStyle
  label: string
  instruction: string
}

export const STYLES: StyleOption[] = [
  {
    id: 'concise',
    label: 'Concise paragraph',
    instruction:
      'Summarise the text below in a single tight paragraph (3–4 sentences). Capture the core message and omit minor detail.',
  },
  {
    id: 'bullets',
    label: 'Bullet points',
    instruction:
      'Summarise the text below as 4–7 short bullet points, one idea per bullet. Start each bullet with "- ".',
  },
  {
    id: 'takeaways',
    label: 'Key takeaways',
    instruction:
      'Extract the 3–5 most important takeaways from the text below as a numbered list. Each takeaway should be a single, self-contained sentence.',
  },
]

/** Inputs for a summarise run. */
export interface SummarizeRequest {
  apiKey: string
  model: string
  style: SummaryStyle
  text: string
}

/**
 * Stream a summary from Claude, invoking `onDelta` for each chunk of text as it
 * arrives. Returns the full summary once the stream completes.
 *
 * We stream (rather than wait for the whole response) so the user sees output
 * appear token-by-token — the expected feel for an AI feature and a clear
 * signal that something is happening. `dangerouslyAllowBrowser` is required for
 * any browser-side call: it tells the SDK to send the
 * `anthropic-dangerous-direct-browser-access` header so the request isn't
 * blocked, and it is safe precisely because the key is the user's own,
 * supplied at runtime — there is no shared secret to leak.
 */
export async function streamSummary(
  req: SummarizeRequest,
  onDelta: (text: string) => void,
  signal?: AbortSignal,
): Promise<string> {
  const client = new Anthropic({
    apiKey: req.apiKey,
    dangerouslyAllowBrowser: true,
  })

  const style = STYLES.find((s) => s.id === req.style) ?? STYLES[0]

  // No `thinking` block: summarisation is a direct task, so we skip extended
  // reasoning for speed and lower cost. max_tokens is deliberately modest — a
  // summary is short, and capping it bounds the user's spend per run.
  const stream = client.messages.stream(
    {
      model: req.model,
      max_tokens: 1024,
      system:
        'You are a precise summarisation assistant. Summarise faithfully, never invent facts not present in the source, and match the requested format exactly. Reply with only the summary — no preamble, no closing remarks.',
      messages: [
        {
          role: 'user',
          content: `${style.instruction}\n\n---\n${req.text}\n---`,
        },
      ],
    },
    { signal },
  )

  stream.on('text', (delta) => onDelta(delta))

  const message = await stream.finalMessage()
  return message.content
    .filter((block): block is Anthropic.TextBlock => block.type === 'text')
    .map((block) => block.text)
    .join('')
}

/**
 * Turn any thrown error into a short, user-facing message. We map the SDK's
 * typed error classes to plain English so the UI never shows a raw stack trace
 * and the user knows whether the fix is on their side (bad key, too much text)
 * or ours/Anthropic's (rate limit, outage).
 */
export function describeError(err: unknown): string {
  if (err instanceof Anthropic.AuthenticationError) {
    return 'That API key was rejected. Check it and try again.'
  }
  if (err instanceof Anthropic.PermissionDeniedError) {
    return 'This key lacks access to the selected model. Try a different model or key.'
  }
  if (err instanceof Anthropic.RateLimitError) {
    return 'Rate limit hit. Wait a moment and try again.'
  }
  if (err instanceof Anthropic.BadRequestError) {
    return `The request was rejected: ${err.message}`
  }
  if (err instanceof Anthropic.APIConnectionError) {
    return 'Could not reach the Anthropic API. Check your connection and try again.'
  }
  if (err instanceof Anthropic.APIError) {
    return `API error (${err.status ?? 'unknown'}): ${err.message}`
  }
  if (err instanceof Error) {
    return err.message
  }
  return 'Something went wrong. Please try again.'
}
