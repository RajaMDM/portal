/**
 * Recipes data layer.
 *
 * Everything the Recipes mini-app needs to persist lives here so the React
 * component stays presentation-focused. Storage is plain localStorage — the
 * whole module is client-side, there is no backend, and nothing leaves the
 * browser. The on-disk shape is versioned (see STORAGE_KEY) so a future schema
 * change can migrate rather than silently corrupt saved data.
 */

/** A single recipe. `id` and `createdAt` are assigned on save. */
export interface Recipe {
  /** Stable unique id (used as React key and for lookups). */
  id: string
  /** Dish name, e.g. "Weeknight Tomato Pasta". */
  title: string
  /** Loose grouping for filtering, e.g. "Dinner", "Dessert". */
  category: string
  /** Rough active time in minutes. 0 means "not specified". */
  minutes: number
  /** How many people it serves. 0 means "not specified". */
  servings: number
  /** Ingredient lines, one entry per ingredient. */
  ingredients: string[]
  /** Method steps, in order. */
  steps: string[]
  /** Unix epoch (ms) when the recipe was added — used for sort order. */
  createdAt: number
}

/** Fields a user supplies when adding a recipe (id/createdAt are derived). */
export type RecipeDraft = Omit<Recipe, 'id' | 'createdAt'>

/**
 * Versioned storage key. Bump the suffix if the persisted shape changes in a
 * backwards-incompatible way so old data can be detected and migrated.
 */
const STORAGE_KEY = 'try-portal:recipes:v1'

/**
 * Fictitious sample recipes seeded on first run so the app never opens empty.
 * Brand-free, invented dishes — safe placeholder content.
 */
const SAMPLE_RECIPES: Recipe[] = [
  {
    id: 'sample-tomato-pasta',
    title: 'Weeknight Tomato Pasta',
    category: 'Dinner',
    minutes: 25,
    servings: 4,
    ingredients: [
      '400g dried spaghetti',
      '2 tbsp olive oil',
      '3 cloves garlic, sliced',
      '1 can (400g) chopped tomatoes',
      'Handful of fresh basil',
      'Salt and black pepper',
    ],
    steps: [
      'Boil the spaghetti in well-salted water until al dente.',
      'Warm the olive oil and gently soften the garlic without browning.',
      'Add the tomatoes, season, and simmer for 10 minutes.',
      'Toss the drained pasta through the sauce and finish with basil.',
    ],
    createdAt: 1_700_000_000_000,
  },
  {
    id: 'sample-lemon-pancakes',
    title: 'Sunday Lemon Pancakes',
    category: 'Breakfast',
    minutes: 20,
    servings: 3,
    ingredients: [
      '150g plain flour',
      '1 tsp baking powder',
      '1 egg',
      '200ml milk',
      'Zest of 1 lemon',
      'Butter, for the pan',
    ],
    steps: [
      'Whisk the flour, baking powder, egg, milk, and lemon zest into a smooth batter.',
      'Melt a little butter in a hot non-stick pan.',
      'Cook spoonfuls of batter until bubbles form, then flip and brown the other side.',
      'Serve warm with a squeeze of lemon and a drizzle of honey.',
    ],
    createdAt: 1_700_000_100_000,
  },
  {
    id: 'sample-chickpea-salad',
    title: 'Herby Chickpea Salad',
    category: 'Lunch',
    minutes: 15,
    servings: 2,
    ingredients: [
      '1 can (400g) chickpeas, drained',
      '1 cucumber, diced',
      '200g cherry tomatoes, halved',
      'Small bunch parsley, chopped',
      'Juice of 1 lemon',
      '3 tbsp olive oil',
    ],
    steps: [
      'Tip the chickpeas, cucumber, and tomatoes into a bowl.',
      'Add the parsley.',
      'Dress with lemon juice and olive oil, season, and toss to combine.',
    ],
    createdAt: 1_700_000_200_000,
  },
]

/** A tiny, dependency-free unique id. Good enough for client-side keys. */
function newId(): string {
  return `r-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e6).toString(36)}`
}

/**
 * Read all recipes from localStorage. On first run (nothing stored) the sample
 * set is seeded and returned. Any parse/quota error is swallowed and the
 * samples are returned so the app degrades gracefully instead of crashing.
 */
export function loadRecipes(): Recipe[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw === null) {
      saveRecipes(SAMPLE_RECIPES)
      return SAMPLE_RECIPES
    }
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return SAMPLE_RECIPES
    // Defensively keep only well-formed entries.
    return parsed.filter(isRecipe)
  } catch {
    return SAMPLE_RECIPES
  }
}

/** Persist the full recipe list. Returns false if storage is unavailable. */
export function saveRecipes(recipes: Recipe[]): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(recipes))
    return true
  } catch {
    return false
  }
}

/**
 * Build a complete Recipe from a user draft, assigning id and timestamp.
 * Pure — it does not persist; the caller owns the updated list and saving.
 */
export function createRecipe(draft: RecipeDraft): Recipe {
  return { ...draft, id: newId(), createdAt: Date.now() }
}

/**
 * Case-insensitive search across title, category, and ingredients. An empty or
 * whitespace-only query returns the list unchanged.
 */
export function searchRecipes(recipes: Recipe[], query: string): Recipe[] {
  const q = query.trim().toLowerCase()
  if (!q) return recipes
  return recipes.filter((r) => {
    const haystack = [r.title, r.category, ...r.ingredients]
      .join(' ')
      .toLowerCase()
    return haystack.includes(q)
  })
}

/** Narrow an unknown parsed value to a Recipe, guarding against bad storage. */
function isRecipe(value: unknown): value is Recipe {
  if (typeof value !== 'object' || value === null) return false
  const r = value as Record<string, unknown>
  return (
    typeof r.id === 'string' &&
    typeof r.title === 'string' &&
    typeof r.category === 'string' &&
    typeof r.minutes === 'number' &&
    typeof r.servings === 'number' &&
    Array.isArray(r.ingredients) &&
    Array.isArray(r.steps) &&
    typeof r.createdAt === 'number'
  )
}
