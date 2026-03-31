import { NextRequest, NextResponse } from "next/server";
import { appendToGoogleSheet } from "@/lib/google-sheets";

export const runtime = "nodejs";

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

    const createdAt = new Date().toISOString();

    // 3. Google Sheets Sync
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
