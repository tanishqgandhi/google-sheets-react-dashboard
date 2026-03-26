// Replace these values with your Google Sheet details.
export const SPREADSHEET_ID = '1aE4rnNtKB7X0h_vPFyk_wq2YHZz8BeRevKFWGZPSRu4';
export const SHEET_NAME = 'Sheet1';

// OpenSheet API format:
// https://opensheet.elk.sh/{SPREADSHEET_ID}/{SHEET_NAME}
//
// Where to get SPREADSHEET_ID:
// From the Google Sheet URL:
// https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit#gid=0
//
// Where to get SHEET_NAME:
// Use the exact bottom tab name from the Google Sheet.
//
// If the sheet name contains spaces, encode it:
// Sales Data -> Sales%20Data
export const API_URL = `https://opensheet.elk.sh/${SPREADSHEET_ID}/${encodeURIComponent(
  SHEET_NAME
)}`;

// OpenSheet also supports using the tab order number instead of the tab name.
// "1" means the first sheet tab in the spreadsheet.
export const FALLBACK_API_URL = `https://opensheet.elk.sh/${SPREADSHEET_ID}/1`;

export const REFRESH_INTERVAL_MS = 10000;
