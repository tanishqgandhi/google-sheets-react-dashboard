import { createSign } from 'node:crypto';

const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_SHEETS_SCOPE =
  'https://www.googleapis.com/auth/spreadsheets.readonly';

const getEnv = (name) => {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }

  return value;
};

const mapRowsToObjects = (values) => {
  if (!Array.isArray(values) || values.length === 0) {
    return [];
  }

  const [headers, ...rows] = values;

  return rows
    .filter((row) => row.some((cell) => String(cell || '').trim() !== ''))
    .map((row) =>
      headers.reduce((record, header, index) => {
        record[header] = row[index] ?? '';
        return record;
      }, {})
    );
};

const normalizePrivateKey = (value) =>
  value
    .trim()
    .replace(/^"|"$/g, '')
    .replace(/\\n/g, '\n')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n');

const toBase64Url = (value) =>
  Buffer.from(value)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');

const createSignedJwt = ({ clientEmail, privateKey }) => {
  const now = Math.floor(Date.now() / 1000);

  const header = {
    alg: 'RS256',
    typ: 'JWT',
  };

  const payload = {
    iss: clientEmail,
    scope: GOOGLE_SHEETS_SCOPE,
    aud: GOOGLE_TOKEN_URL,
    exp: now + 3600,
    iat: now,
  };

  const encodedHeader = toBase64Url(JSON.stringify(header));
  const encodedPayload = toBase64Url(JSON.stringify(payload));
  const unsignedToken = `${encodedHeader}.${encodedPayload}`;

  const signer = createSign('RSA-SHA256');
  signer.update(unsignedToken);
  signer.end();

  const signature = signer
    .sign(privateKey, 'base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');

  return `${unsignedToken}.${signature}`;
};

const getAccessToken = async ({ clientEmail, privateKey }) => {
  const assertion = createSignedJwt({ clientEmail, privateKey });

  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }),
  });

  const json = await response.json();

  if (!response.ok || !json.access_token) {
    throw new Error(
      json.error_description || json.error || 'Unable to get Google access token.'
    );
  }

  return json.access_token;
};

export const handler = async () => {
  try {
    const spreadsheetId = getEnv('GOOGLE_SPREADSHEET_ID');
    const sheetName = getEnv('GOOGLE_SHEET_NAME');
    const clientEmail = getEnv('GOOGLE_SERVICE_ACCOUNT_EMAIL');
    const privateKey = normalizePrivateKey(getEnv('GOOGLE_PRIVATE_KEY'));
    const accessToken = await getAccessToken({ clientEmail, privateKey });

    const range = encodeURIComponent(`${sheetName}!A:Z`);
    const sheetsUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}`;

    const response = await fetch(sheetsUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const json = await response.json();

    if (!response.ok) {
      throw new Error(
        json.error?.message || 'Unable to fetch rows from Google Sheets API.'
      );
    }

    const records = mapRowsToObjects(json.values || []);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      },
      body: JSON.stringify(records),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      },
      body: JSON.stringify({
        error: 'Secure Google Sheets fetch failed.',
        details: error.message,
      }),
    };
  }
};
