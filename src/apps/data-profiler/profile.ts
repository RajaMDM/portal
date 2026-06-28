/**
 * Column profiling for the Data Profiler mini-app.
 *
 * Given a parsed {@link Table}, compute per-column statistics — inferred type,
 * null share, distinct count, and a couple of example values — plus a small
 * sample of rows for preview. Pure functions, no I/O: easy to reason about and
 * trivially testable.
 */
import type { CellValue, Table } from './parse'

/** The type we infer for a column from its (non-null) values. */
export type ColumnType = 'number' | 'date' | 'boolean' | 'text' | 'empty'

/** Profile of a single column. */
export interface ColumnProfile {
  name: string
  type: ColumnType
  /** Non-null value count. */
  count: number
  /** Number of empty/missing cells. */
  nullCount: number
  /** Share of cells that are empty, 0–100, rounded to one decimal. */
  nullPct: number
  /** Distinct non-null values (compared by display form). */
  distinctCount: number
  /** A few example non-null values, formatted for display. */
  examples: string[]
}

/** The full profile of a table: row/column totals, per-column stats, sample. */
export interface TableProfile {
  rowCount: number
  columnCount: number
  columns: ColumnProfile[]
  /** First N data rows, each cell already formatted for display. */
  sampleRows: string[][]
}

/** How many data rows to show in the preview. */
const SAMPLE_SIZE = 10
/** How many example values to keep per column. */
const EXAMPLE_COUNT = 3

/** Build a complete {@link TableProfile} from a parsed table. */
export function profileTable(table: Table): TableProfile {
  const { columns, rows } = table
  const rowCount = rows.length

  const columnProfiles = columns.map((name, colIndex) =>
    profileColumn(name, rows, colIndex, rowCount),
  )

  const sampleRows = rows
    .slice(0, SAMPLE_SIZE)
    .map((row) => row.map((cell) => formatCell(cell)))

  return {
    rowCount,
    columnCount: columns.length,
    columns: columnProfiles,
    sampleRows,
  }
}

/** Profile one column by scanning every row's cell at `colIndex`. */
function profileColumn(
  name: string,
  rows: CellValue[][],
  colIndex: number,
  rowCount: number,
): ColumnProfile {
  let nullCount = 0
  const distinct = new Set<string>()
  const examples: string[] = []
  // Tally how each non-null value classifies; the column type is the single
  // class they all share (else 'text').
  const seenTypes = new Set<ColumnType>()

  for (const row of rows) {
    const cell = row[colIndex]
    if (cell === null || cell === undefined || cell === '') {
      nullCount++
      continue
    }

    const display = formatCell(cell)
    if (!distinct.has(display)) {
      distinct.add(display)
      if (examples.length < EXAMPLE_COUNT) examples.push(display)
    }
    seenTypes.add(classifyValue(cell))
  }

  const count = rowCount - nullCount
  const type = resolveColumnType(seenTypes, count)

  return {
    name,
    type,
    count,
    nullCount,
    nullPct: rowCount === 0 ? 0 : round1((nullCount / rowCount) * 100),
    distinctCount: distinct.size,
    examples,
  }
}

/**
 * Reduce the set of per-value classes to one column type. All-agree wins; a
 * column with no values is 'empty'; mixed classes fall back to 'text'.
 */
function resolveColumnType(seenTypes: Set<ColumnType>, count: number): ColumnType {
  if (count === 0) return 'empty'
  if (seenTypes.size === 1) return [...seenTypes][0]
  // A column of integers and decimals both classify as 'number' already, so any
  // remaining mix (e.g. numbers + text) is best described as free text.
  return 'text'
}

/**
 * Classify a single cell value. XLSX cells arrive already typed; CSV cells
 * arrive as strings, which we sniff for numbers, dates, and booleans using
 * conservative patterns to avoid false positives (e.g. a zip code isn't a date).
 */
function classifyValue(value: CellValue): ColumnType {
  if (value instanceof Date) return 'date'
  if (typeof value === 'number') return 'number'
  if (typeof value === 'boolean') return 'boolean'

  const text = String(value).trim()
  if (text === '') return 'empty'
  if (/^(true|false)$/i.test(text)) return 'boolean'
  if (NUMBER_RE.test(text)) return 'number'
  if (isDateString(text)) return 'date'
  return 'text'
}

/** Plain integer/decimal/scientific notation, optionally signed. */
const NUMBER_RE = /^[+-]?(\d+(\.\d+)?|\.\d+)([eE][+-]?\d+)?$/

/**
 * Conservative date detection for CSV strings: ISO-ish `YYYY-MM-DD` (optionally
 * with a time) or common slash forms with a 4-digit year, and only if the
 * runtime can actually parse it. Kept tight so numeric-looking text isn't
 * mistaken for a date.
 */
function isDateString(text: string): boolean {
  const isoLike = /^\d{4}-\d{2}-\d{2}([ T]\d{2}:\d{2}(:\d{2})?)?$/
  const slashLike = /^\d{1,2}\/\d{1,2}\/\d{4}$/
  if (!isoLike.test(text) && !slashLike.test(text)) return false
  return !Number.isNaN(Date.parse(text))
}

/** Format any cell value into a compact, human-readable string for the UI. */
export function formatCell(value: CellValue): string {
  if (value === null || value === undefined) return ''
  if (value instanceof Date) {
    // Date-only if there's no time component, else a tidy date+time.
    const hasTime =
      value.getUTCHours() || value.getUTCMinutes() || value.getUTCSeconds()
    const iso = value.toISOString()
    return hasTime ? iso.slice(0, 16).replace('T', ' ') : iso.slice(0, 10)
  }
  return String(value)
}

/** Round to one decimal place. */
function round1(n: number): number {
  return Math.round(n * 10) / 10
}
