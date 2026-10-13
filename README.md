# Google Sheets React Dashboard

A React dashboard built with Vite and Recharts. The browser requests a same-origin Netlify Function that reads a private Google Sheet using service-account credentials.

## Features

- KPI cards for employee row count, total sales, total revenue, and average revenue.
- Sales-by-employee bar chart, revenue-by-department pie chart, and revenue-over-date line chart.
- Data table, connection status, and last-updated timestamp.
- Automatic refresh every 10 seconds and a manual refresh button.
- Loading and empty states, plus clearly labeled demo data when the endpoint fails.

## Local setup

Install Node.js and npm compatible with Vite 6, then run:

```sh
git clone https://github.com/tanishqgandhi/google-sheets-react-dashboard.git
cd google-sheets-react-dashboard
npm install
npm run dev
```

Open the URL printed by Vite. This runs the frontend only: Vite does not serve the Netlify Function or apply the redirect in `netlify.toml`. Without that endpoint, the dashboard falls back to demo data.

To build and preview the frontend:

```sh
npm run build
npm run preview
```

The build writes to `dist`. The preview command serves that frontend build; it does not run Netlify Functions.

### Local testing with live Sheets data

Configure the four server-side variables below in your shell environment, then run Netlify Dev from the repository root:

```sh
npx netlify-cli dev
```

Use the URL printed by Netlify Dev so the function and `/api/sheets` redirect are available locally. Netlify CLI is invoked separately; it is not a dependency or npm script in this repository.

## Google Sheets configuration

Enable the Google Sheets API for your Google Cloud project, create a service account and its key, and share the spreadsheet with the service account's email with Viewer access. The spreadsheet can remain private.

Use the first row for column headers. The dashboard recommends:

```text
Name | Department | Sales | Revenue | Date | Region
```

The function reads `GOOGLE_SHEET_NAME!A:Z`, uses the first row as object keys, skips completely blank data rows, and fills missing cells with empty strings.

Set only these variables for the function:

| Variable | Value |
| --- | --- |
| `GOOGLE_SPREADSHEET_ID` | Spreadsheet ID from its URL, between `/d/` and `/edit`. |
| `GOOGLE_SHEET_NAME` | Worksheet/tab name to read. |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | `client_email` from the service-account key. |
| `GOOGLE_PRIVATE_KEY` | Complete PEM `private_key` from the service-account key, including BEGIN/END lines. |

The private-key normalizer accepts actual newlines or literal `\n` sequences. Keep the key and credentials out of committed files and frontend code. These variables are read through `process.env` in the function; no `VITE_*` credentials or browser API key are required.

## Verified data flow

1. `src/App.jsx` fetches `/api/sheets` on mount, every 10 seconds, and on manual refresh.
2. Netlify rewrites that route to `/.netlify/functions/sheets` with status 200.
3. `netlify/functions/sheets.js` creates an RS256-signed service-account JWT with the read-only Sheets scope and exchanges it for a Google OAuth access token.
4. The function calls the Google Sheets v4 values endpoint for the configured tab's `A:Z` range and returns an array of row objects as JSON with `Cache-Control: no-store`.
5. React normalizes the rows and calculates the dashboard metrics. If the request or JSON processing fails, it displays bundled demo rows with a Demo Mode notice. Later refreshes retry the endpoint.

The active path does not call OpenSheet or Google Sheets directly from the browser. Credentials stay server-side, but the function returns sheet data to callers; it does not implement dashboard-user authentication or authorization.

## Deploy to Netlify

1. Import this GitHub repository into Netlify.
2. Use the repository root as the base directory. The committed `netlify.toml` provides:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Functions directory: `netlify/functions`
   - Rewrite: `/api/sheets` → `/.netlify/functions/sheets` (200)
3. Add the four variables above in Netlify's environment settings and make them available to Functions in the deployment context you use.
4. Confirm the spreadsheet is shared with the service account, then deploy. Redeploy after changing the configuration.
5. Open `/api/sheets` on the deployed site to verify it returns a JSON array, then check that the dashboard shows live data.

A function failure returns HTTP 500 with a JSON error and details. Check the variable values, private-key formatting, Sheets API access, tab name, and service-account sharing if the dashboard remains in Demo Mode.
