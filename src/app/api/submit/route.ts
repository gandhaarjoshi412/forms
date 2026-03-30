import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { appendToGoogleSheet } from "@/lib/google-sheets";

export const runtime = "nodejs";

const FILE_PATH = path.join(process.cwd(), "leads.csv");

// Helper to normalize phone numbers for comparison
function normalizePhone(phone: string): string {
  if (!phone) return "";
  let digits = phone.replace(/\D/g, "");
  if (digits.startsWith("91") && digits.length === 12) {
    digits = digits.slice(2);
  }
  return digits;
}

export async function POST(request: NextRequest) {
  try {
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ success: false, message: "Invalid request body" }, { status: 400 });
    }

    // Safely extract and trim strings
    const name = typeof body?.name === "string" ? body.name.trim() : "";
    const rawPhone = typeof body?.phone === "string" ? body.phone.trim() : "";

    // 1. Phone Normalization
    const phone = normalizePhone(rawPhone);

    // 2. Exact Validations
    if (!name) {
      return NextResponse.json({ success: false, message: "Name must not be empty" }, { status: 400 });
    }

    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phone || !phoneRegex.test(phone)) {
      return NextResponse.json({ success: false, message: "Phone must be a valid 10-digit Indian number" }, { status: 400 });
    }

    // Protect against CSV injection by escaping quotes
    const safeName = `"${name.replace(/"/g, '""')}"`;
    const createdAt = new Date().toISOString();
    const csvLine = `${safeName},${phone},${createdAt}\n`;

    // 3. Duplicate Check & File Handling
    try {
      let fileExists = false;
      try {
        await fs.access(FILE_PATH);
        fileExists = true;
      } catch {
        fileExists = false;
      }

      if (fileExists) {
        // Read file to check for duplicates
        const fileContent = await fs.readFile(FILE_PATH, "utf-8");
        const lines = fileContent.split("\n");
        
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;
          
          const match = line.match(/,(\d{10}),[^,]+$/);
          
          if (match && match[1] === phone) {
            return NextResponse.json(
              { success: false, message: "This number is already registered / हा नंबर आधीच नोंदणीकृत आहे" },
              { status: 409 }
            );
          }
        }
      }

      // 4. File Write (Backup)
      if (!fileExists) {
        const header = "name,phone,createdAt\n";
        await fs.writeFile(FILE_PATH, header + csvLine, "utf-8");
      } else {
        await fs.appendFile(FILE_PATH, csvLine, "utf-8");
      }
    } catch (fileError) {
      console.error("[CSV Write/Read Error]:", fileError);
      return NextResponse.json({ success: false, message: "Server error occurred while saving data." }, { status: 500 });
    }

    // 5. Google Sheets Sync (Non-blocking)
    // The google-sheets.ts catches its own errors so they don't break the response
    await appendToGoogleSheet(name, phone, createdAt);

    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error) {
    console.error("[API Error]:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ success: false, message: "Method not allowed" }, { status: 405 });
}
