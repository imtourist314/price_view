feat(ui): database tables single-select listbox (~50ch width) with selection label and dev proxy

Summary
- Vue UI lists database tables from http://127.0.0.1:8000/database/list and allows selecting one table at a time.
- Listbox width set to approximately 50 characters for better readability.
- Live-updating label reflects the currently selected table.
- Dev proxy is configured to avoid CORS by routing /database/* to the backend.

User-facing changes
- The app shows “Database Tables” with a Reload button.
- Once loaded, a single-select listbox (~50ch wide) appears; selecting a row updates the “Selected table” label.
- Clear error message on failures and an empty state when no tables are available.

Implementation details
- src/api.js
  - fetchTables() calls the proxied path /database/list.
  - Supports both raw JSON and HTML responses by parsing a <pre> block for JSON content.
- vite.config.js
  - Dev server proxy maps /database to http://127.0.0.1:8000 with changeOrigin enabled.
- src/App.vue
  - Renders a single-select <select> populated with table names using fetchTables().
  - Adds CSS to size the listbox to ~50 characters: #table-listbox { width: 50ch; }.
  - Binds v-model for selection and updates an aria-live label with the current selection.
  - Includes a “Reload” button and error handling UI.

Files changed
- src/App.vue
- generated_pr.md

How to test
1) Start the backend that serves http://127.0.0.1:8000/database/list.
2) Run the frontend dev server: npm run dev
3) Open http://localhost:5173, click “Reload,” pick a table from the listbox, and verify the selection label updates.
