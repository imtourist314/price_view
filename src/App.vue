<template>
  <main class="container">
    <div class="topbar">
      <h1>Database Table Viewer</h1>
      <button class="theme-toggle" @click="toggleTheme" :aria-pressed="theme === 'dark'" :title="theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'">
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
  </main>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { fetchTables } from './api.js'

const tables = ref([])
const loading = ref(false)
const error = ref('')
const selected = ref('')

const prefersDark = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
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
    console.log(list);
    tables.value = list.map(t => (typeof t === 'string' ? t : t.table_name)).filter(Boolean)
    if (!tables.value.includes(selected.value)) {
      selected.value = ''
    }
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e)
  } finally {
    loading.value = false
  }
}

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
  --shadow: 0 8px 24px rgba(16,24,40,.06), 0 2px 8px rgba(16,24,40,.04);
  --ring: 0 0 0 3px rgba(59,130,246,.35);
  --danger: #e11d48;
}

[data-theme="dark"] {
  --bg: #0b1221;
  --surface: #101828;
  --text: #e6eaf3;
  --muted: #94a3b8;
  --border: #243047;
  --accent: #60a5fa;
  --accent-contrast: #ffffff;
  --shadow: 0 8px 24px rgba(2,6,23,.45), 0 2px 8px rgba(2,6,23,.6);
  --ring: 0 0 0 3px rgba(96,165,250,.35);
  --danger: #fb7185;
}

html, body {
  height: 100%;
}

body {
  font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji";
  margin: 0;
  padding: 0;
  background: var(--bg);
  color: var(--text);
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  transition: background-color .25s ease, color .25s ease;
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
  transition: transform .12s ease, background-color .2s ease, color .2s ease, border-color .2s ease, box-shadow .2s ease;
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
  transition: filter .2s ease, transform .12s ease, background-color .2s ease, border-color .2s ease;
}

button:disabled {
  opacity: .7;
  cursor: not-allowed;
}

button:not(:disabled):hover {
  filter: brightness(1.05);
  transform: translateY(-1px);
}

button:not(:disabled):active {
  transform: translateY(0);
}

label {
  display: block;
  font-size: .9rem;
  color: var(--muted);
  margin-bottom: .35rem;
}

#table-listbox {
  width: 50ch;
  margin-top: 0.25rem;
  padding: 0.6rem 0.75rem;
  border-radius: 10px;
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text);
  box-shadow: var(--shadow);
  outline: none;
  transition: box-shadow .2s ease, border-color .2s ease, background-color .2s ease, color .2s ease;
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
  margin-top: 1rem;
  color: var(--muted);
}

strong {
  color: var(--text);
}
</style>
