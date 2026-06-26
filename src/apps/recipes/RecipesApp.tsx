import { useEffect, useMemo, useState } from 'react'
import {
  createRecipe,
  loadRecipes,
  saveRecipes,
  searchRecipes,
  type Recipe,
  type RecipeDraft,
} from './data'
import './recipes.css'

/**
 * Recipes mini-app — the Portal's first real vertical slice.
 *
 * It proves the module pattern end-to-end: add a recipe, see it persist across
 * reloads (localStorage, no backend), and search what's saved. State lives in
 * this component; the data layer (./data) owns persistence and search so this
 * file stays focused on the UI. Fully client-side and brand-free.
 */
export default function RecipesApp() {
  // Recipes are loaded once from storage, then kept in React state. Every
  // mutation writes the new array straight back to localStorage (below), so a
  // reload rehydrates exactly what the user last saw.
  const [recipes, setRecipes] = useState<Recipe[]>(() => loadRecipes())
  const [query, setQuery] = useState('')
  const [showForm, setShowForm] = useState(false)

  // Persist on every change. Cheap for a personal recipe book and keeps storage
  // and state in lockstep without scattering save() calls through handlers.
  useEffect(() => {
    saveRecipes(recipes)
  }, [recipes])

  // Newest first, then narrowed by the search box. useMemo avoids re-filtering
  // on unrelated re-renders (e.g. toggling the form).
  const visible = useMemo(() => {
    const sorted = [...recipes].sort((a, b) => b.createdAt - a.createdAt)
    return searchRecipes(sorted, query)
  }, [recipes, query])

  function handleAdd(draft: RecipeDraft) {
    setRecipes((prev) => [createRecipe(draft), ...prev])
    setShowForm(false)
  }

  function handleDelete(id: string) {
    setRecipes((prev) => prev.filter((r) => r.id !== id))
  }

  return (
    <section className="recipes">
      <div className="recipes__intro">
        <h1>🍳 Recipes</h1>
        <p>
          A little recipe book that lives in your browser. Add a recipe and it
          stays put across reloads — everything is saved on this device only,
          with no account and no server.
        </p>
      </div>

      <div className="recipes__toolbar">
        <input
          type="search"
          className="recipes__search"
          placeholder="Search by name, category, or ingredient…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search recipes"
        />
        <button
          type="button"
          className="recipes__btn"
          onClick={() => setShowForm((s) => !s)}
          aria-expanded={showForm}
        >
          {showForm ? 'Close' : '+ Add recipe'}
        </button>
      </div>

      <p className="recipes__count">
        {recipes.length === 0
          ? 'No recipes yet.'
          : query.trim()
            ? `${visible.length} of ${recipes.length} ${recipes.length === 1 ? 'recipe' : 'recipes'} match “${query.trim()}”.`
            : `${recipes.length} ${recipes.length === 1 ? 'recipe' : 'recipes'} saved.`}
      </p>

      {showForm && <RecipeForm onAdd={handleAdd} onCancel={() => setShowForm(false)} />}

      {visible.length > 0 ? (
        <ul className="recipes__list">
          {visible.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} onDelete={handleDelete} />
          ))}
        </ul>
      ) : (
        <div className="recipes__empty" role="status">
          {query.trim() ? (
            <p>No recipes match your search. Try a different word.</p>
          ) : (
            <p>
              Your recipe book is empty. Use <strong>+ Add recipe</strong> to
              save your first one.
            </p>
          )}
        </div>
      )}
    </section>
  )
}

/** A single expandable recipe card. Collapsed by default to keep the list scannable. */
function RecipeCard({
  recipe,
  onDelete,
}: {
  recipe: Recipe
  onDelete: (id: string) => void
}) {
  const [open, setOpen] = useState(false)
  const meta = [
    recipe.minutes > 0 ? `${recipe.minutes} min` : null,
    recipe.servings > 0 ? `serves ${recipe.servings}` : null,
  ]
    .filter(Boolean)
    .join(' · ')

  return (
    <li className="recipe-card">
      <button
        type="button"
        className="recipe-card__summary"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <span>
          <span className="recipe-card__title">{recipe.title}</span>
          <span className="recipe-card__category">{recipe.category}</span>
        </span>
        {meta && <span className="recipe-card__meta">{meta}</span>}
      </button>

      {open && (
        <div className="recipe-card__body">
          <h3>Ingredients</h3>
          <ul>
            {recipe.ingredients.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>

          <h3>Method</h3>
          <ol>
            {recipe.steps.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>

          <div className="recipe-card__footer">
            <button
              type="button"
              className="recipes__btn recipes__btn--danger"
              onClick={() => onDelete(recipe.id)}
            >
              Delete recipe
            </button>
          </div>
        </div>
      )}
    </li>
  )
}

/** The add-recipe form. Lives in its own state until submit so typing never
 *  re-renders the recipe list. Ingredients and steps are entered one per line. */
function RecipeForm({
  onAdd,
  onCancel,
}: {
  onAdd: (draft: RecipeDraft) => void
  onCancel: () => void
}) {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [minutes, setMinutes] = useState('')
  const [servings, setServings] = useState('')
  const [ingredients, setIngredients] = useState('')
  const [steps, setSteps] = useState('')
  const [error, setError] = useState('')

  function toLines(value: string): string[] {
    return value
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmedTitle = title.trim()
    const ingredientLines = toLines(ingredients)
    const stepLines = toLines(steps)

    if (!trimmedTitle) {
      setError('Give your recipe a name.')
      return
    }
    if (ingredientLines.length === 0) {
      setError('Add at least one ingredient (one per line).')
      return
    }
    if (stepLines.length === 0) {
      setError('Add at least one step (one per line).')
      return
    }

    onAdd({
      title: trimmedTitle,
      category: category.trim() || 'Uncategorised',
      // Number() of '' is 0, which our data layer treats as "not specified".
      minutes: Math.max(0, Math.floor(Number(minutes) || 0)),
      servings: Math.max(0, Math.floor(Number(servings) || 0)),
      ingredients: ingredientLines,
      steps: stepLines,
    })
  }

  return (
    <form className="recipes__form" onSubmit={handleSubmit} noValidate>
      <div className="recipes__field">
        <label htmlFor="recipe-title">Recipe name</label>
        <input
          id="recipe-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Weeknight Tomato Pasta"
          autoFocus
        />
      </div>

      <div className="recipes__field-row">
        <div className="recipes__field">
          <label htmlFor="recipe-category">Category</label>
          <input
            id="recipe-category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Dinner"
          />
        </div>
        <div className="recipes__field">
          <label htmlFor="recipe-minutes">Minutes</label>
          <input
            id="recipe-minutes"
            type="number"
            min="0"
            value={minutes}
            onChange={(e) => setMinutes(e.target.value)}
            placeholder="25"
          />
        </div>
        <div className="recipes__field">
          <label htmlFor="recipe-servings">Serves</label>
          <input
            id="recipe-servings"
            type="number"
            min="0"
            value={servings}
            onChange={(e) => setServings(e.target.value)}
            placeholder="4"
          />
        </div>
      </div>

      <div className="recipes__field">
        <label htmlFor="recipe-ingredients">Ingredients</label>
        <textarea
          id="recipe-ingredients"
          rows={5}
          value={ingredients}
          onChange={(e) => setIngredients(e.target.value)}
          placeholder={'One per line, e.g.\n400g spaghetti\n2 tbsp olive oil'}
        />
        <span className="recipes__field-hint">One ingredient per line.</span>
      </div>

      <div className="recipes__field">
        <label htmlFor="recipe-steps">Method</label>
        <textarea
          id="recipe-steps"
          rows={5}
          value={steps}
          onChange={(e) => setSteps(e.target.value)}
          placeholder={'One step per line, e.g.\nBoil the pasta until al dente.\nSimmer the sauce for 10 minutes.'}
        />
        <span className="recipes__field-hint">One step per line.</span>
      </div>

      {error && <p className="recipes__error" role="alert">{error}</p>}

      <div className="recipes__form-actions">
        <button type="submit" className="recipes__btn">
          Save recipe
        </button>
        <button
          type="button"
          className="recipes__btn recipes__btn--ghost"
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
