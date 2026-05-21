<template>
  <main class="container">
    <div class="topbar">
      <h1>Database Table Viewer</h1>
      <button
        class="theme-toggle"
        @click="toggleTheme"
        :aria-pressed="theme === 'dark'"
        :title="theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'"
      >
        <span v-if="theme === 'dark'">🌙</span>
        <span v-else>☀️</span>
      </button>
    </div>

    <form @submit.prevent="load">
      <button :disabled="loading">{{ loading ? 'Loading…' : 'Reload' }}</button>
    </form>

    <section v-if="error" class="error">
      {{ error }}
    </section>

    <div class="content">
      <aside class="sidebar">
        <section v-if="tables.length">
          <label for="table-listbox">Tables</label>
          <select
            id="table-listbox"
            v-model="selected"
            :size="Math.min(12, Math.max(4, tables.length))"
            :disabled="loading"
          >
            <option v-for="name in tables" :key="name" :value="name">
              {{ name }}
            </option>
          </select>
        </section>
        <p v-else-if="!loading">No tables found.</p>

        <p class="selection" aria-live="polite">
          Selected table: <strong>{{ selected || 'None' }}</strong>
        </p>
      </aside>

      <section v-if="selected" class="preview">
        <div class="preview-header">
          <h2>Table preview</h2>
          <span class="muted">(up to 10 rows)</span>
        </div>

        <p v-if="tableLoading" class="muted">Loading table data…</p>
        <section v-else-if="tableError" class="error">
          {{ tableError }}
        </section>
        <p v-else-if="!tableRows.length" class="muted">No rows returned.</p>

        <div v-else class="table-scroll" role="region" aria-label="Table data preview">
          <table class="data-table">
            <thead>
              <tr>
                <th v-for="col in tableColumns" :key="col.id">
                  {{ col.label }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, idx) in tableRows" :key="idx">
                <td v-for="col in tableColumns" :key="col.id">
                  {{ formatCell(cellValue(row, col)) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { fetchTables, fetchTableData } from './api.js'

const tables = ref([])
const loading = ref(false)
const error = ref('')
const selected = ref('')

const tableRows = ref([])
const tableColumns = ref([])
const tableLoading = ref(false)
const tableError = ref('')
let tableRequestSeq = 0

const prefersDark =
  typeof window !== 'undefined' &&
  window.matchMedia &&
  window.matchMedia('(prefers-color-scheme: dark)').matches
const theme = ref(prefersDark ? 'dark' : 'light')

function toggleTheme() {
  theme.value = theme.value === 'dark' ? 'light' : 'dark'
}

onMounted(() => {
  document.documentElement.setAttribute('data-theme', theme.value)
})

watch(theme, (val) => {
  document.documentElement.setAttribute('data-theme', val)
})

async function load() {
  loading.value = true
  error.value = ''
  try {
    const list = await fetchTables()
    tables.value = list
      .map((t) => (typeof t === 'string' ? t : t.table_name))
      .filter(Boolean)

    if (!tables.value.includes(selected.value)) {
      selected.value = ''
    }
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e)
  } finally {
    loading.value = false
  }
}

function extractRows(payload) {
  if (Array.isArray(payload)) return payload
  if (payload && typeof payload === 'object') {
    for (const key of ['rows', 'data', 'results', 'items']) {
      if (Array.isArray(payload[key])) return payload[key]
    }
  }
  return []
}

function deriveColumns(rows, payload) {
  if (!rows.length) return []

  const first = rows[0]
  const isArrayRow = Array.isArray(first)
  const isObjectRow = first && typeof first === 'object' && !Array.isArray(first)

  // Some backends return { columns: [...], rows: [...] } (often with array rows).
  if (payload && typeof payload === 'object' && Array.isArray(payload.columns) && payload.columns.length) {
    const cols = payload.columns.map((c) => String(c))
    if (isArrayRow) {
      return cols.map((label, index) => ({ id: label, label, kind: 'index', index }))
    }
    if (isObjectRow) {
      return cols.map((key) => ({ id: key, label: key, kind: 'key', key }))
    }
  }

  if (isObjectRow) {
    return Object.keys(first).map((key) => ({ id: key, label: key, kind: 'key', key }))
  }

  if (isArrayRow) {
    return first.map((_, index) => ({
      id: String(index),
      label: `col_${index + 1}`,
      kind: 'index',
      index
    }))
  }

  return [{ id: 'value', label: 'value', kind: 'value' }]
}

function cellValue(row, col) {
  if (col.kind === 'key') return row?.[col.key]
  if (col.kind === 'index') return row?.[col.index]
  return row
}

function formatCell(value) {
  if (value === null || value === undefined) return ''
  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  try {
    return JSON.stringify(value)
  } catch {
    return String(value)
  }
}

async function loadSelectedTablePreview(tableName) {
  const seq = ++tableRequestSeq
  tableLoading.value = true
  tableError.value = ''
  tableRows.value = []
  tableColumns.value = []

  try {
    const payload = await fetchTableData(tableName, { limit: 10 })
    if (seq !== tableRequestSeq) return

    const rows = extractRows(payload).slice(0, 10)
    tableRows.value = rows
    tableColumns.value = deriveColumns(rows, payload)
  } catch (e) {
    if (seq !== tableRequestSeq) return
    tableError.value = e instanceof Error ? e.message : String(e)
  } finally {
    if (seq === tableRequestSeq) {
      tableLoading.value = false
    }
  }
}

watch(selected, (val) => {
  if (!val) {
    tableRequestSeq++
    tableRows.value = []
    tableColumns.value = []
    tableLoading.value = false
    tableError.value = ''
    return
  }

  loadSelectedTablePreview(val)
})

onMounted(load)
</script>

<style>
:root {
  color-scheme: light dark;
  --bg: #f6f7fb;
  --surface: #ffffff;
  --text: #0b1221;
  --muted: #5b657a;
  --border: #e5e7f0;
  --accent: #3b82f6;
  --accent-contrast: #ffffff;
  --shadow: 0 8px 24px rgba(16, 24, 40, 0.06), 0 2px 8px rgba(16, 24, 40, 0.04);
  --ring: 0 0 0 3px rgba(59, 130, 246, 0.35);
  --danger: #e11d48;
}

[data-theme='dark'] {
  --bg: #0b1221;
  --surface: #101828;
  --text: #e6eaf3;
  --muted: #94a3b8;
  --border: #243047;
  --accent: #60a5fa;
  --accent-contrast: #ffffff;
  --shadow: 0 8px 24px rgba(2, 6, 23, 0.45), 0 2px 8px rgba(2, 6, 23, 0.6);
  --ring: 0 0 0 3px rgba(96, 165, 250, 0.35);
  --danger: #fb7185;
}

html,
body {
  height: 100%;
}

body {
  font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial,
    'Apple Color Emoji', 'Segoe UI Emoji';
  margin: 0;
  padding: 0;
  background: var(--bg);
  color: var(--text);
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  transition: background-color 0.25s ease, color 0.25s ease;
}

.container {
  max-width: none;
  margin: 0;
  padding: 1rem;
}

.topbar {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 1rem;
  margin-bottom: 0.75rem;
}

h1 {
  font-size: 1.5rem;
  margin: 0;
  letter-spacing: -0.01em;
}

h2 {
  font-size: 1.05rem;
  margin: 0;
  letter-spacing: -0.01em;
}

.theme-toggle {
  appearance: none;
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text);
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 999px;
  display: grid;
  place-items: center;
  cursor: pointer;
  box-shadow: var(--shadow);
  position: fixed;
  top: 12px;
  right: 12px;
  z-index: 1000;
  transition: transform 0.12s ease, background-color 0.2s ease, color 0.2s ease,
    border-color 0.2s ease, box-shadow 0.2s ease;
}

.theme-toggle:hover {
  transform: translateY(-1px);
}

.theme-toggle:active {
  transform: translateY(0);
}

.theme-toggle:focus-visible {
  outline: none;
  box-shadow: var(--shadow), var(--ring);
}

form {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 1rem;
  box-shadow: var(--shadow);
  margin-bottom: 1rem;
}

button {
  appearance: none;
  border: 1px solid var(--border);
  background: var(--accent);
  color: var(--accent-contrast);
  font-weight: 600;
  padding: 0.6rem 0.9rem;
  border-radius: 10px;
  cursor: pointer;
  transition: filter 0.2s ease, transform 0.12s ease, background-color 0.2s ease,
    border-color 0.2s ease;
}

button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

button:not(:disabled):hover {
  filter: brightness(1.05);
  transform: translateY(-1px);
}

button:not(:disabled):active {
  transform: translateY(0);
}

.content {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.sidebar {
  flex: 0 0 22rem;
  max-width: 26rem;
  min-width: 16rem;
  display: flex;
  flex-direction: column;
}

.preview {
  flex: 1 1 auto;
  min-width: 0;
  margin-top: 0;
}

@media (max-width: 900px) {
  .content {
    flex-direction: column;
  }

  .sidebar {
    flex: 0 0 auto;
    width: 100%;
    max-width: none;
  }

  .preview {
    margin-top: 1rem;
  }
}

label {
  display: block;
  font-size: 0.9rem;
  color: var(--muted);
  margin-bottom: 0.35rem;
}

#table-listbox {
  width: 100%;
  margin-top: 0.25rem;
  padding: 0.6rem 0.75rem;
  border-radius: 10px;
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text);
  box-shadow: var(--shadow);
  outline: none;
  transition: box-shadow 0.2s ease, border-color 0.2s ease, background-color 0.2s ease,
    color 0.2s ease;
}

#table-listbox:focus {
  box-shadow: var(--shadow), var(--ring);
  border-color: var(--accent);
}

.error {
  background: color-mix(in srgb, var(--danger) 12%, transparent);
  border: 1px solid color-mix(in srgb, var(--danger) 35%, transparent);
  color: var(--danger);
  padding: 0.75rem 1rem;
  border-radius: 10px;
  margin-top: 1rem;
}

.selection {
  margin-top: 0.75rem;
  color: var(--muted);
}

.preview {
  margin-top: 0;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 1rem;
  box-shadow: var(--shadow);
}

.preview-header {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.muted {
  color: var(--muted);
}

.table-scroll {
  overflow: auto;
  max-height: 60vh;
  border: 1px solid var(--border);
  border-radius: 10px;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.data-table th,
.data-table td {
  text-align: left;
  padding: 0.5rem 0.65rem;
  border-bottom: 1px solid var(--border);
  white-space: nowrap;
}

.data-table th {
  position: sticky;
  top: 0;
  background: var(--surface);
  z-index: 1;
  font-weight: 700;
  color: var(--text);
}

.data-table tbody tr:hover td {
  background: color-mix(in srgb, var(--accent) 8%, transparent);
}

strong {
  color: var(--text);
}
</style>
