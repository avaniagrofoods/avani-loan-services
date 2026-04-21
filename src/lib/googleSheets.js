/**
 * Google Sheets Integration Utility
 * This utility handles sending form data to a Google Apps Script Webhook.
 */

const GOOGLE_SHEETS_WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbylRZzHt8TJnLlfwuVlTcjh7qd1IiP5FEjTlxwaJ9GSRZy5El-Ur8TgVv1M6nYeZZNc8Q/exec';

export const logToGoogleSheets = async (data) => {
  if (!GOOGLE_SHEETS_WEBHOOK_URL) {
    console.warn('Google Sheets Webhook URL not found. Data will not be logged.');
    return { status: 'error', message: 'Config missing' };
  }

  try {
    const response = await fetch(GOOGLE_SHEETS_WEBHOOK_URL, {
      method: 'POST',
      mode: 'no-cors', // Basic mode for simple Google Apps Script redirects
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    return { status: 'success', data: response };
  } catch (error) {
    console.error('Error logging to Google Sheets:', error);
    return { status: 'error', message: error.message };
  }
};
