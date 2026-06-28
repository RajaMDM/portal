/**
 * Client-side parsers for the Data Profiler mini-app.
 *
 * Everything here runs in the browser — a dropped file is never uploaded. CSV is
 * parsed by a small hand-rolled state machine (no dependency); XLSX is unzipped
 * with fflate (tiny, MIT, actively maintained) and its worksheet XML is read
 * with the browser-native DOMParser. We deliberately avoid the SheetJS `xlsx`
 * npm package: its public-registry build is frozen at 0.18.5 with a known
 * prototype-pollution CVE (fixed only on the vendor's private CDN).
 *
 * Both parsers produce the same shape — a {@link Table} of a header row plus
 * typed cell values — so the profiler downstream doesn't care where the data
 * came from.
 */
import { strFromU8, unzipSync } from 'fflate'

/**
 * A single cell value. CSV cells arrive as strings (the profiler infers their
 * real type later); XLSX cells arrive already typed because the spreadsheet
 * tells us. `null` means an empty/missing cell.
 */
export type CellValue = string | number | boolean | Date | null

/** A parsed tabular file: column headers and the data rows beneath them. */
export interface Table {
  /** Header names from the first row. Blank headers become `Column N`. */
  columns: string[]
  /** Data rows, each already padded/truncated to `columns.length`. */
  rows: CellValue[][]
  /** Where the table came from, surfaced in the UI for reassurance. */
  source: 'csv' | 'xlsx'
  /** Name of the worksheet read (XLSX only); undefined for CSV. */
  sheetName?: string
}

/** Thrown for problems we can explain to the user (empty file, no rows, …). */
export class ParseError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ParseError'
  }
}

/**
 * Parse a dropped File into a {@link Table}, dispatching on its extension.
 * Async because reading the file and (for XLSX) unzipping are themselves async.
 */
export async function parseFile(file: File): Promise<Table> {
  if (file.size === 0) {
    throw new ParseError('That file is empty — there’s nothing to profile.')
  }

  const name = file.name.toLowerCase()
  if (name.endsWith('.csv') || name.endsWith('.tsv') || name.endsWith('.txt')) {
    return parseCsv(await file.text())
  }
  if (name.endsWith('.xlsx')) {
    return parseXlsx(new Uint8Array(await file.arrayBuffer()))
  }
  throw new ParseError(
    'Unsupported file type. Please choose a .csv or .xlsx file.',
  )
}

// ---------------------------------------------------------------------------
// CSV
// ---------------------------------------------------------------------------

/**
 * Parse CSV/TSV text into a Table. Handles quoted fields, escaped quotes (""),
 * embedded commas and newlines, and both CRLF and LF line endings. The
 * delimiter is auto-detected from the first line (comma, semicolon, or tab) so
 * EU-style semicolon files and tab-separated exports work without ceremony.
 */
export function parseCsv(text: string): Table {
  // Strip a UTF-8 BOM if present — Excel loves to add one.
  const input = text.charCodeAt(0) === 0xfeff ? text.slice(1) : text
  if (input.trim() === '') {
    throw new ParseError('That file is empty — there’s nothing to profile.')
  }

  const delimiter = detectDelimiter(input)
  const grid = splitCsv(input, delimiter)
  if (grid.length === 0) {
    throw new ParseError('No rows found in that file.')
  }

  const header = grid[0].map((h, i) => h.trim() || `Column ${i + 1}`)
  const width = header.length
  const rows: CellValue[][] = grid.slice(1).map((row) => {
    const cells: CellValue[] = new Array(width)
    for (let i = 0; i < width; i++) {
      const raw = row[i]
      // Empty string → null so null-counting and type inference agree.
      cells[i] = raw === undefined || raw === '' ? null : raw
    }
    return cells
  })

  if (rows.length === 0) {
    throw new ParseError(
      'That file has a header row but no data rows to profile.',
    )
  }
  return { columns: header, rows, source: 'csv' }
}

/** Pick the delimiter that appears most often on the first line. */
function detectDelimiter(text: string): string {
  const firstLine = text.slice(0, text.indexOf('\n') === -1 ? text.length : text.indexOf('\n'))
  const candidates = [',', ';', '\t']
  let best = ','
  let bestCount = -1
  for (const d of candidates) {
    const count = firstLine.split(d).length - 1
    if (count > bestCount) {
      bestCount = count
      best = d
    }
  }
  return best
}

/**
 * Split CSV text into a grid of string cells using a single-pass state machine.
 * RFC-4180-ish: double-quotes wrap fields, a doubled quote ("") is a literal
 * quote, and anything (including the delimiter or a newline) inside quotes is
 * data. Blank trailing lines are dropped.
 */
function splitCsv(text: string, delimiter: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let inQuotes = false

  for (let i = 0; i < text.length; i++) {
    const char = text[i]

    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"'
          i++ // skip the escaped quote
        } else {
          inQuotes = false
        }
      } else {
        field += char
      }
      continue
    }

    if (char === '"') {
      inQuotes = true
    } else if (char === delimiter) {
      row.push(field)
      field = ''
    } else if (char === '\n') {
      row.push(field)
      rows.push(row)
      row = []
      field = ''
    } else if (char === '\r') {
      // Swallow CR; the following LF (if any) ends the row.
    } else {
      field += char
    }
  }

  // Flush the final field/row if the file didn't end with a newline.
  if (field !== '' || row.length > 0) {
    row.push(field)
    rows.push(row)
  }

  // Drop fully-blank rows (e.g. a stray trailing newline produced one).
  return rows.filter((r) => !(r.length === 1 && r[0] === ''))
}

// ---------------------------------------------------------------------------
// XLSX
// ---------------------------------------------------------------------------

/**
 * Parse the first worksheet of an XLSX file. The file is a ZIP of XML parts:
 * we unzip with fflate, then read workbook/sheet/sharedStrings/styles with
 * DOMParser. Only the first sheet (by tab order) is profiled.
 */
export function parseXlsx(bytes: Uint8Array): Table {
  let files: Record<string, Uint8Array>
  try {
    files = unzipSync(bytes)
  } catch {
    throw new ParseError(
      'That file isn’t a readable .xlsx workbook. If it’s an old .xls file, re-save it as .xlsx.',
    )
  }

  const read = (path: string): string | null => {
    const entry = files[path]
    return entry ? strFromU8(entry) : null
  }

  const parser = new DOMParser()
  const parseXml = (xml: string, label: string): Document => {
    const doc = parser.parseFromString(xml, 'application/xml')
    if (doc.querySelector('parsererror')) {
      throw new ParseError(`The workbook’s ${label} is corrupted and can’t be read.`)
    }
    return doc
  }

  // 1. Resolve the first sheet's part path via workbook.xml + its rels.
  const workbookXml = read('xl/workbook.xml')
  if (!workbookXml) {
    throw new ParseError('That .xlsx file is missing its workbook — it may be corrupted.')
  }
  const sheetPath = resolveFirstSheetPath(parseXml(workbookXml, 'workbook'), read)
  const sheetName = firstSheetName(parseXml(workbookXml, 'workbook'))

  const sheetXml = read(sheetPath)
  if (!sheetXml) {
    throw new ParseError('Could not find the first worksheet inside the workbook.')
  }

  // 2. Lookup tables: shared strings and which style indices are dates.
  const sharedStrings = readSharedStrings(read('xl/sharedStrings.xml'), parseXml)
  const dateStyles = readDateStyles(read('xl/styles.xml'), parseXml)

  // 3. Walk the worksheet into a sparse grid keyed by row/column index.
  const grid = readSheet(parseXml(sheetXml, 'worksheet'), sharedStrings, dateStyles)
  if (grid.length === 0) {
    throw new ParseError('That worksheet is empty — there’s nothing to profile.')
  }

  const width = grid.reduce((max, r) => Math.max(max, r.length), 0)
  const headerRow = grid[0]
  const columns: string[] = []
  for (let i = 0; i < width; i++) {
    const cell = headerRow[i]
    const label = cell == null ? '' : String(cell instanceof Date ? cell.toISOString() : cell).trim()
    columns.push(label || `Column ${i + 1}`)
  }

  const rows: CellValue[][] = grid.slice(1).map((r) => {
    const cells: CellValue[] = new Array(width)
    for (let i = 0; i < width; i++) cells[i] = r[i] ?? null
    return cells
  })

  if (rows.length === 0) {
    throw new ParseError('That worksheet has a header row but no data rows to profile.')
  }
  return { columns, rows, source: 'xlsx', sheetName }
}

/** Name of the first sheet (by tab order) for display. */
function firstSheetName(workbook: Document): string {
  const sheet = workbook.querySelector('sheets > sheet')
  return sheet?.getAttribute('name') ?? 'Sheet1'
}

/**
 * Map the first `<sheet>` in workbook.xml to its part path via the relationship
 * id (r:id) recorded in xl/_rels/workbook.xml.rels. Falls back to the
 * conventional xl/worksheets/sheet1.xml if rels can't be resolved.
 */
function resolveFirstSheetPath(
  workbook: Document,
  read: (path: string) => string | null,
): string {
  const fallback = 'xl/worksheets/sheet1.xml'
  const sheet = workbook.querySelector('sheets > sheet')
  // r:id lives in the relationships namespace; getAttribute with the raw
  // qualified name is the most portable way to read it across parsers.
  const rid =
    sheet?.getAttribute('r:id') ??
    sheet?.getAttributeNS('http://schemas.openxmlformats.org/officeDocument/2006/relationships', 'id')
  const relsXml = read('xl/_rels/workbook.xml.rels')
  if (!rid || !relsXml) return fallback

  const rels = new DOMParser().parseFromString(relsXml, 'application/xml')
  for (const rel of Array.from(rels.getElementsByTagName('Relationship'))) {
    if (rel.getAttribute('Id') === rid) {
      const target = rel.getAttribute('Target')
      if (!target) return fallback
      // Targets are relative to the xl/ folder; normalise a leading slash too.
      const clean = target.replace(/^\//, '').replace(/^xl\//, '')
      return `xl/${clean}`
    }
  }
  return fallback
}

/**
 * Read sharedStrings.xml into a flat array. Each `<si>` may hold plain `<t>`
 * text or several `<r><t>` rich-text runs, which we concatenate.
 */
function readSharedStrings(
  xml: string | null,
  parseXml: (xml: string, label: string) => Document,
): string[] {
  if (!xml) return []
  const doc = parseXml(xml, 'shared strings')
  return Array.from(doc.getElementsByTagName('si')).map((si) => {
    const runs = si.getElementsByTagName('t')
    let text = ''
    for (const t of Array.from(runs)) text += t.textContent ?? ''
    return text
  })
}

// Built-in number-format ids that represent dates/times (per the OOXML spec).
const BUILTIN_DATE_FORMATS = new Set([14, 15, 16, 17, 18, 19, 20, 21, 22, 45, 46, 47])

/**
 * Determine which cell-style indices (the `s` attribute on a cell) format their
 * numeric value as a date. We read styles.xml: custom number formats whose code
 * contains date/time tokens, plus the built-in date format ids, then map each
 * cellXfs entry to whether its numFmtId is a date format.
 */
function readDateStyles(
  xml: string | null,
  parseXml: (xml: string, label: string) => Document,
): Set<number> {
  const dateStyleIndices = new Set<number>()
  if (!xml) return dateStyleIndices
  const doc = parseXml(xml, 'styles')

  // Custom formats: numFmtId -> is-a-date based on the format code's tokens.
  const customDateFmtIds = new Set<number>()
  for (const fmt of Array.from(doc.getElementsByTagName('numFmt'))) {
    const id = Number(fmt.getAttribute('numFmtId'))
    const code = (fmt.getAttribute('formatCode') ?? '').toLowerCase()
    // Strip quoted literals and bracketed colour/condition blocks, then look
    // for date/time tokens. The 'm' token is minutes or months — either way a
    // date/time, so it counts.
    const stripped = code.replace(/"[^"]*"/g, '').replace(/\[[^\]]*\]/g, '')
    if (/[dymhs]/.test(stripped)) customDateFmtIds.add(id)
  }

  const isDateFmt = (id: number) =>
    BUILTIN_DATE_FORMATS.has(id) || customDateFmtIds.has(id)

  const cellXfs = doc.querySelector('cellXfs')
  if (!cellXfs) return dateStyleIndices
  Array.from(cellXfs.getElementsByTagName('xf')).forEach((xf, index) => {
    if (isDateFmt(Number(xf.getAttribute('numFmtId') ?? 0))) {
      dateStyleIndices.add(index)
    }
  })
  return dateStyleIndices
}

/**
 * Walk worksheet rows/cells into a sparse 2-D array. Cell references like "B2"
 * place values at the right column even when the sheet omits empty cells.
 */
function readSheet(
  worksheet: Document,
  sharedStrings: string[],
  dateStyles: Set<number>,
): CellValue[][] {
  const grid: CellValue[][] = []
  for (const rowEl of Array.from(worksheet.getElementsByTagName('row'))) {
    const cells: CellValue[] = []
    for (const cellEl of Array.from(rowEl.getElementsByTagName('c'))) {
      const ref = cellEl.getAttribute('r')
      const colIndex = ref ? columnIndexFromRef(ref) : cells.length
      cells[colIndex] = readCell(cellEl, sharedStrings, dateStyles)
    }
    // Normalise holes (sparse arrays) to null so downstream code is simple.
    for (let i = 0; i < cells.length; i++) if (cells[i] === undefined) cells[i] = null
    grid.push(cells)
  }
  // Trim trailing fully-empty rows that some tools append.
  while (grid.length > 0 && grid[grid.length - 1].every((c) => c == null)) {
    grid.pop()
  }
  return grid
}

/** Read one `<c>` cell element into a typed value. */
function readCell(
  cellEl: Element,
  sharedStrings: string[],
  dateStyles: Set<number>,
): CellValue {
  const type = cellEl.getAttribute('t')

  // Inline strings store text under <is><t> rather than <v>.
  if (type === 'inlineStr') {
    const t = cellEl.getElementsByTagName('t')[0]
    const text = t?.textContent ?? ''
    return text === '' ? null : text
  }

  const vEl = cellEl.getElementsByTagName('v')[0]
  const raw = vEl?.textContent ?? ''
  if (raw === '') return null

  switch (type) {
    case 's': // shared string
      return sharedStrings[Number(raw)] ?? null
    case 'str': // formula result string
      return raw
    case 'b': // boolean
      return raw === '1'
    case 'e': // error literal (e.g. #DIV/0!)
      return raw
    default: {
      // Number — but if the cell's style formats it as a date, convert the
      // Excel serial to a real Date so the profile reads as a date, not 45000.
      const num = Number(raw)
      const styleIndex = Number(cellEl.getAttribute('s') ?? -1)
      if (dateStyles.has(styleIndex) && Number.isFinite(num)) {
        return excelSerialToDate(num)
      }
      return Number.isFinite(num) ? num : raw
    }
  }
}

/** Convert an A1-style cell reference ("AB12") to a 0-based column index. */
function columnIndexFromRef(ref: string): number {
  let index = 0
  for (let i = 0; i < ref.length; i++) {
    const code = ref.charCodeAt(i)
    if (code >= 65 && code <= 90) {
      index = index * 26 + (code - 64) // A=1
    } else if (code >= 97 && code <= 122) {
      index = index * 26 + (code - 96)
    } else {
      break // hit the row digits
    }
  }
  return index - 1
}

/**
 * Convert an Excel date serial number to a JS Date. Excel's epoch is
 * 1899-12-30 (its day 1 is 1900-01-01, and it wrongly treats 1900 as a leap
 * year — using 1899-12-30 as the origin absorbs that off-by-one). Fractional
 * days carry the time of day. We build the date in UTC for stability.
 */
function excelSerialToDate(serial: number): Date {
  const epoch = Date.UTC(1899, 11, 30)
  return new Date(epoch + Math.round(serial * 86400000))
}
