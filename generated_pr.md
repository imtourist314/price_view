feat(ui): list database tables with single-select listbox and selection label

Summary
- Implement a new Vue UI that fetches and displays the list of database tables from http://127.0.0.1:8000/database/list.
- Renders a listbox (single-select <select>) populated with table names.
- Shows a live-updating label with the currently selected table.
- Keeps the existing API code intact and adds a new fetchTables() utility.

User-facing changes
- The app now shows “Database Tables” with a Reload button.
- A listbox appears once tables are loaded; selecting a row updates the “Selected table” label.
- Error messages are displayed if the fetch fails, and an empty state appears when no tables are available.

Implementation details
- src/api.js
  - Added export async function fetchTables() to call the given endpoint.
  - Handles the endpoint’s HTML response by parsing the <pre> block and JSON-decoding its content.
  - Falls back to direct JSON parsing if the server returns raw JSON.
- src/App.vue
  - Replaced the previous “items” view with a tables view.
  - Uses fetchTables() to load data on mount and on “Reload”.
  - Displays a single-select listbox bound with v-model to track the selected table.
  - Updates an aria-live label with the current selection.

Notes
- If the browser blocks the cross-origin request (CORS), ensure the backend at 127.0.0.1:8000 allows the dev origin or configure a local proxy.

Files changed
- src/App.vue
- src/api.js

How to test
1) Start the backend that serves http://127.0.0.1:8000/database/list.
2) Start the frontend dev server (e.g., “npm run dev”) and open the app in your browser.
3) Click “Reload” to fetch tables, select a table from the listbox, and verify the selection label updates accordingly.
feat(ui): list database tables with single-select listbox and dev proxy

Summary
- Implement a Vue UI that fetches and displays the list of database tables.
- Renders a single-select listbox populated with table names and a live-updating selection label.
- Adds a Vite dev proxy to avoid CORS by routing /database/* to the backend.

User-facing changes
- The app shows “Database Tables” with a Reload button.
- Once loaded, a listbox appears; selecting a row updates the “Selected table” label.
- Clear error message on failures and an empty state when no tables are available.

Implementation details
- src/api.js
  - fetchTables() now calls the proxied path /database/list (instead of an absolute URL).
  - Supports both raw JSON and HTML responses by parsing a <pre> block for JSON content.
- vite.config.js
  - Adds a dev server proxy mapping /database to http://127.0.0.1:8000 with changeOrigin enabled.
- src/App.vue
  - Uses fetchTables() to load and render the tables list and bind a single-select listbox to the selection label.

Files changed
- src/api.js
- vite.config.js
- generated_pr.md

How to test
1) Start the backend that serves http://127.0.0.1:8000/database/list.
2) Run the frontend dev server: npm run dev
3) Open the app in your browser, click “Reload,” pick a table from the listbox, and verify the selection label updates.
