import type { MiniApp } from './apps/registry'

/**
 * A Section is a top-level area of the Portal shown in the primary nav and on
 * the home page (School, Data, Recipes, AI Examples). Each section surfaces the
 * live mini-apps that share its `category`; until any ship, the section page
 * renders an empty-state placeholder.
 *
 * This list is the single source of truth — the nav, the home grid, and the
 * router are all generated from it. Add a section by appending one entry here.
 */
export interface Section {
  /** URL slug, mounted at `/<slug>`. Keep it kebab-case and stable. */
  slug: string
  /** Display name shown in the nav, on its home card, and as the page title. */
  name: string
  /** One-line summary for the home card. */
  tagline: string
  /** Fuller intro shown at the top of the section page. */
  description: string
  /** Emoji glyph used as the card/page icon (kept dependency-free). */
  icon: string
  /** Mini-app category this section surfaces from the registry. */
  category: MiniApp['category']
}

export const sections: Section[] = [
  {
    slug: 'school',
    name: 'School',
    tagline: 'Tools for classrooms, teachers, and learners.',
    description:
      'A home for small classroom and learning tools — planners, quiz helpers, and other utilities for school folks.',
    icon: '🎓',
    category: 'School',
  },
  {
    slug: 'data',
    name: 'Data',
    tagline: 'Utilities for cleaning, shaping, and exploring data.',
    description:
      'Lightweight, browser-based helpers for everyday data-management work — no installs, no servers, your data stays on your machine.',
    icon: '📊',
    category: 'Data',
  },
  {
    slug: 'recipes',
    name: 'Recipes',
    tagline: 'A space to collect and share recipes.',
    description:
      'A friendly corner for saving, browsing, and sharing recipes. Cooking tools and a shared recipe book will live here.',
    icon: '🍳',
    category: 'Recipes',
  },
  {
    slug: 'ai',
    name: 'AI Examples',
    tagline: 'Hands-on examples of AI running in your browser.',
    description:
      'Working demonstrations of AI-powered features. You bring your own API key at runtime — nothing is stored or sent to our servers.',
    icon: '🤖',
    category: 'AI',
  },
]

/** Look up a section by its URL slug. */
export const getSection = (slug: string): Section | undefined =>
  sections.find((s) => s.slug === slug)
