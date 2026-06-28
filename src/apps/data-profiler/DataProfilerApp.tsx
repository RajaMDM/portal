import { useCallback, useRef, useState } from 'react'
import { ParseError, parseFile, type Table } from './parse'
import { profileTable, type ColumnType, type TableProfile } from './profile'
import './data-profiler.css'

/**
 * Data Profiler mini-app — the Portal's first Data-section vertical slice.
 *
 * Drop a .csv or .xlsx file and get an instant column profile (name, inferred
 * type, null %, distinct count) plus a sample-row preview. Every byte is parsed
 * in the browser — nothing is uploaded. This is the concrete answer to the
 * "master data spread across too many Excels" pain: point it at any of those
 * spreadsheets and see its shape in seconds.
 *
 * State is a tiny machine: idle → parsing → (result | error). The heavy parsing
 * modules are imported statically here, but the whole mini-app is itself
 * lazily loaded by the registry, so the parser only ships when someone opens
 * this tool.
 */
type Status =
  | { phase: 'idle' }
  | { phase: 'parsing'; fileName: string }
  | { phase: 'error'; message: string }
  | { phase: 'done'; fileName: string; table: Table; profile: TableProfile }

export default function DataProfilerApp() {
  const [status, setStatus] = useState<Status>({ phase: 'idle' })
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback(async (file: File) => {
    setStatus({ phase: 'parsing', fileName: file.name })
    try {
      const table = await parseFile(file)
      const profile = profileTable(table)
      setStatus({ phase: 'done', fileName: file.name, table, profile })
    } catch (err) {
      // ParseError carries a user-facing message; anything else is unexpected.
      const message =
        err instanceof ParseError
          ? err.message
          : 'Something went wrong reading that file. It may be malformed or in an unsupported format.'
      setStatus({ phase: 'error', message })
    }
  }, [])

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragging(false)
      const file = e.dataTransfer.files?.[0]
      if (file) void handleFile(file)
    },
    [handleFile],
  )

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) void handleFile(file)
    // Reset so picking the same file again re-triggers a parse.
    e.target.value = ''
  }

  function reset() {
    setStatus({ phase: 'idle' })
  }

  return (
    <section className="profiler">
      <div className="profiler__intro">
        <h1>📊 Excel / CSV Profiler</h1>
        <p>
          Drop a spreadsheet and see its shape in seconds — column names, inferred
          types, how many values are missing, and how many are distinct. Built for
          the everyday mess of master data spread across too many Excels.
        </p>
        <p className="profiler__privacy" role="note">
          🔒 Your file never leaves this device. Parsing happens entirely in your
          browser — nothing is uploaded to any server.
        </p>
      </div>

      <button
        type="button"
        className={`profiler__dropzone${dragging ? ' profiler__dropzone--active' : ''}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        aria-label="Choose or drop a .csv or .xlsx file to profile"
      >
        <span className="profiler__dropzone-icon" aria-hidden="true">
          ⬆️
        </span>
        <span className="profiler__dropzone-text">
          <strong>Drop a file here</strong> or click to choose
        </span>
        <span className="profiler__dropzone-hint">.csv or .xlsx</span>
        <input
          ref={inputRef}
          type="file"
          accept=".csv,.tsv,.txt,.xlsx"
          className="profiler__file-input"
          onChange={onInputChange}
        />
      </button>

      {status.phase === 'parsing' && (
        <p className="profiler__status" role="status">
          Profiling <strong>{status.fileName}</strong>…
        </p>
      )}

      {status.phase === 'error' && (
        <div className="profiler__error" role="alert">
          <p>{status.message}</p>
          <button type="button" className="profiler__btn" onClick={reset}>
            Try another file
          </button>
        </div>
      )}

      {status.phase === 'done' && (
        <ProfileResult
          fileName={status.fileName}
          table={status.table}
          profile={status.profile}
          onReset={reset}
        />
      )}
    </section>
  )
}

/** The full result view: summary, column profile table, and sample rows. */
function ProfileResult({
  fileName,
  table,
  profile,
  onReset,
}: {
  fileName: string
  table: Table
  profile: TableProfile
  onReset: () => void
}) {
  const sourceLabel = table.source === 'xlsx' ? 'Excel workbook' : 'CSV file'

  return (
    <div className="profiler__result">
      <div className="profiler__result-head">
        <div>
          <h2>{fileName}</h2>
          <p className="profiler__summary">
            {sourceLabel}
            {table.sheetName ? ` · sheet “${table.sheetName}”` : ''} ·{' '}
            <strong>{profile.rowCount.toLocaleString()}</strong>{' '}
            {profile.rowCount === 1 ? 'row' : 'rows'} ·{' '}
            <strong>{profile.columnCount}</strong>{' '}
            {profile.columnCount === 1 ? 'column' : 'columns'}
          </p>
        </div>
        <button type="button" className="profiler__btn profiler__btn--ghost" onClick={onReset}>
          Profile another file
        </button>
      </div>

      <h3 className="profiler__section-title">Column profile</h3>
      <div className="profiler__table-wrap">
        <table className="profiler__table">
          <thead>
            <tr>
              <th>Column</th>
              <th>Type</th>
              <th className="profiler__num">Null %</th>
              <th className="profiler__num">Distinct</th>
              <th>Examples</th>
            </tr>
          </thead>
          <tbody>
            {profile.columns.map((col) => (
              <tr key={col.name}>
                <td className="profiler__col-name">{col.name}</td>
                <td>
                  <span className={`profiler__type profiler__type--${col.type}`}>
                    {typeLabel(col.type)}
                  </span>
                </td>
                <td className="profiler__num">
                  {col.nullPct > 0 ? `${col.nullPct}%` : '—'}
                </td>
                <td className="profiler__num">{col.distinctCount.toLocaleString()}</td>
                <td className="profiler__examples">
                  {col.examples.length > 0 ? col.examples.join(', ') : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 className="profiler__section-title">
        Sample rows{' '}
        <span className="profiler__section-sub">
          (first {profile.sampleRows.length} of {profile.rowCount.toLocaleString()})
        </span>
      </h3>
      <div className="profiler__table-wrap">
        <table className="profiler__table profiler__table--sample">
          <thead>
            <tr>
              {table.columns.map((name, i) => (
                <th key={i}>{name}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {profile.sampleRows.map((row, r) => (
              <tr key={r}>
                {row.map((cell, c) => (
                  <td key={c}>{cell === '' ? <span className="profiler__null">∅</span> : cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/** Human label for a column type. */
function typeLabel(type: ColumnType): string {
  switch (type) {
    case 'number':
      return 'Number'
    case 'date':
      return 'Date'
    case 'boolean':
      return 'Boolean'
    case 'empty':
      return 'Empty'
    default:
      return 'Text'
  }
}
