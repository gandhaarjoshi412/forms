import { z } from "zod";

// ---------------------------------------------------------------------------
// Zod v4 schema for lead submission
// ---------------------------------------------------------------------------

export const leadSchema = z.object({
  name: z
    .string({ error: "Name is required / नाव आवश्यक आहे" })
    .trim()
    .min(2, "Name must be at least 2 characters / नाव किमान 2 अक्षरे असावे")
    .max(100, "Name is too long / नाव खूप मोठे आहे")
    .transform((val) => sanitize(val)),

  phone: z
    .string({ error: "Phone number is required / फोन नंबर आवश्यक आहे" })
    .trim()
    .transform((val) => {
      // Strip all non-digits, then remove leading 91 country code if present
      let digits = val.replace(/\D/g, "");
      if (digits.startsWith("91") && digits.length === 12) {
        digits = digits.slice(2);
      }
      return digits;
    })
    .refine((val) => val.length === 10, {
      message: "Enter a valid 10-digit number / 10 अंकी नंबर टाका",
    })
    .refine((val) => /^[6-9]/.test(val), {
      message: "Number must start with 6-9 / नंबर 6-9 ने सुरू व्हावा",
    }),
});

export type LeadInput = z.infer<typeof leadSchema>;

// ---------------------------------------------------------------------------
// Input sanitization — strips HTML tags, control chars, excess whitespace
// ---------------------------------------------------------------------------

function sanitize(input: string): string {
  return input
    // Remove HTML tags
    .replace(/<[^>]*>/g, "")
    // Remove control characters (except newline/tab)
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
    // Collapse multiple spaces into one
    .replace(/\s+/g, " ")
    .trim();
}
