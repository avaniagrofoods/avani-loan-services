// src/lib/googleSheets.js
// Client-side bundle must NEVER embed production Google Apps Script URLs or credentials.
// All CRM/Sheets writes are handled exclusively server-side after explicit consent.

export const logToGoogleSheets = async (leadData) => {
  if (!leadData || leadData.consent !== true) {
    return false;
  }
  // Client-side direct Google Apps Script posting is intentionally disabled for security.
  return false;
};
