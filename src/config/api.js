// Secure version:
// The browser no longer talks to Google Sheets or OpenSheet directly.
// It calls a Netlify serverless function instead.
//
// Production:
// /api/sheets -> /.netlify/functions/sheets
//
// Local secure testing:
// Run with Netlify Dev so the same route works locally.
// netlify dev
export const API_URL = '/api/sheets';

export const REFRESH_INTERVAL_MS = 10000;
