const { google } = require('googleapis');

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

exports.handler = async () => {
  try {
    const spreadsheetId = getEnv('GOOGLE_SPREADSHEET_ID');
    const sheetName = getEnv('GOOGLE_SHEET_NAME');
    const clientEmail = getEnv('GOOGLE_SERVICE_ACCOUNT_EMAIL');
    const privateKey = getEnv('GOOGLE_PRIVATE_KEY').replace(/\\n/g, '\n');

    const auth = new google.auth.JWT({
      email: clientEmail,
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A:Z`,
    });

    const records = mapRowsToObjects(response.data.values || []);

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
