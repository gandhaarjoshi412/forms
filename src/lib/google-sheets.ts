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

/**
 * Checks if a phone number already exists in Column B of the Google Sheet.
 */
export async function checkIfPhoneExists(phone: string): Promise<boolean> {
  try {
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    
    if (!spreadsheetId || !process.env.GOOGLE_CLIENT_EMAIL || !privateKey) {
      return false; // Skip check if misconfigured
    }

    // Read column B (Phone numbers)
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "Sheet1!B:B",
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      return false;
    }

    // Check if the exact phone number already exists in the column
    // The phone parameter is fully normalized using normalizePhone before this is called
    return rows.some((row) => {
      const cellValue = row[0]?.toString() || "";
      // Strip non-digits from the cell value to compare accurately
      const cleanCell = cellValue.replace(/\D/g, "");
      // If the clean cell matches the phone exactly (or matches without 91 prefix)
      return cleanCell === phone || (cleanCell.length === 12 && cleanCell.startsWith("91") && cleanCell.slice(2) === phone);
    });

  } catch (error) {
    console.error("[Google Sheets API Error] Failed to check duplicates:", error);
    // If we fail to read, we return false so we don't block potentially valid submissions.
    return false;
  }
}
