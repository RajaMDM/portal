import type { ComponentType } from 'react'
import { lazy } from 'react'

/**
 * A mini-app is a self-contained feature mounted under its own route in the
 * Portal (e.g. a recipe space, a data tool, an AI example). The registry is the
 * single source of truth: the home grid, the nav, and the router are all
 * generated from this list. To add a mini-app, drop a folder under `src/apps/`
 * and append one entry here — no routing or layout edits required.
 */
export interface MiniApp {
  /** URL slug, mounted at `/apps/<slug>`. Keep it kebab-case and stable. */
  slug: string
  /** Display name shown in the nav and on its card. */
  name: string
  /** One-line description for the home grid card. */
  description: string
  /** Loose grouping for future filtering on the home page. */
  category: 'School' | 'Data' | 'Recipes' | 'AI' | 'Utilities'
  /** Emoji or short glyph used as the card icon (kept dependency-free). */
  icon: string
  /** 'live' renders the app; 'planned' shows a disabled "coming soon" card. */
  status: 'live' | 'planned'
  /**
   * Lazily-loaded screen component. Code-splitting per mini-app keeps the
   * initial bundle small as the Portal grows. Omitted for 'planned' apps.
   */
  component?: ComponentType
}

export const apps: MiniApp[] = [
  {
    slug: 'ai-summarizer',
    name: 'Text Summarizer',
    description:
      'Paste any text and Claude summarises it in your browser. Bring your own API key — entered at runtime, never stored. The AI Examples section’s first slice.',
    category: 'AI',
    icon: '🤖',
    status: 'live',
    component: lazy(() => import('./ai-summarizer/AiSummarizerApp')),
  },
  {
    slug: 'recipes',
    name: 'Recipe Book',
    description:
      'Save, browse, and search recipes — kept in your browser, no account needed. The Portal’s first real vertical slice.',
    category: 'Recipes',
    icon: '🍳',
    status: 'live',
    component: lazy(() => import('./recipes/RecipesApp')),
  },
  {
    slug: 'welcome',
    name: 'Welcome Tour',
    description:
      'A tiny example mini-app that demonstrates the Portal pattern: its own route, card, and lazily-loaded screen.',
    category: 'Utilities',
    icon: '👋',
    status: 'live',
    component: lazy(() => import('./welcome/WelcomeApp')),
  },
]

export const liveApps = apps.filter((a) => a.status === 'live')
