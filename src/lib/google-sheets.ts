import { google } from "googleapis";

// We extract credentials from environment variables.
// Private keys often have newline issues when passed as environment variables in certain hostings,
// so we ensure they are parsed correctly by replacing "\\n" with "\n".
const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: privateKey,
  },
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const sheets = google.sheets({ version: "v4", auth });

/**
 * Appends a new lead to the configured Google Sheet.
 * Errors are caught internally so they do NOT bubble up and crash the main API flow.
 */
export async function appendToGoogleSheet(name: string, phone: string, createdAt: string) {
  try {
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    
    // Safety check missing envs
    if (!spreadsheetId || !process.env.GOOGLE_CLIENT_EMAIL || !privateKey) {
      console.warn("[Google Sheets] Missing configuration/credentials. Skipping sheet update.");
      return;
    }

    // Append to Sheet1 (Change "Sheet1" if your actual tab is named something else)
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: "Sheet1!A:C",
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[name, phone, createdAt]],
      },
    });

  } catch (error) {
    // We log the error but don't re-throw it so we don't block the user's success response
    console.error("[Google Sheets API Error] Failed to append row:", error);
  }
}
