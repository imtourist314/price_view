feat(ui): load selected table preview (up to 10 rows)

Summary
- Selecting a table name now fetches a small preview (up to 10 rows) from that table and renders it to the right of the table selector (stacks below on narrow screens).
- The request uses the existing /data/:table endpoint with a limit parameter where supported.

User-facing changes
- Click/select a table in the listbox to automatically load and display a preview grid beside the list.
- Shows loading and error states for the preview, plus an empty-state message when no rows are returned.

Implementation details
- src/api.js
  - fetchTableData(tableName, { limit }) now supports an optional limit query param (e.g. /data/my_table?limit=10).
- src/App.vue
  - Watches the selected table and calls fetchTableData(..., { limit: 10 }).
  - Renders a dynamic HTML table based on returned row shape (object rows, array rows, or primitive rows).

Files changed
- src/api.js
- src/App.vue
- generated_pr.md

How to test
1) Start the backend on http://127.0.0.1:8000.
2) Run the frontend: npm run dev
3) Open http://localhost:5173.
4) Select a table name; verify a preview table loads and contains at most 10 rows.
