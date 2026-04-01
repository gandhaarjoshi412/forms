"use client";

import { useState, useCallback, type FormEvent, type ChangeEvent } from "react";

interface FormData {
  name: string;
  whatsapp: string;
}

interface FormErrors {
  name?: string;
  whatsapp?: string;
}

type FormStatus = "idle" | "loading" | "success" | "error";

// Validation
function validateName(value: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) return "Please enter your name / कृपया तुमचं नाव टाका";
  if (trimmed.length < 2) return "Name must be at least 2 characters / नाव किमान 2 अक्षरे असावे";
  return undefined;
}

function validateWhatsApp(value: string): string | undefined {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "Please enter your WhatsApp number / कृपया WhatsApp नंबर टाका";
  if (digits.length !== 10) return "Enter a valid 10-digit number / 10 अंकी नंबर टाका";
  if (!/^[6-9]/.test(digits)) return "Number must start with 6-9 / नंबर 6-9 ने सुरू व्हावा";
  return undefined;
}

// UI Pieces
function Spinner() {
  return (
    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

function SuccessMessage({ onReset }: { onReset: () => void }) {
  return (
    <div className="animate-fade-in-up text-center py-6 sm:py-8 px-2" role="alert">
      <div className="mx-auto mb-4 flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-[#E8F5E9]">
        <svg className="h-8 w-8 sm:h-10 sm:w-10 text-[#2E7D32]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h2 className="text-lg sm:text-xl font-semibold text-[#2E7D32] mb-2">Thank you!</h2>
      <p className="text-base sm:text-lg text-text-muted leading-relaxed mb-0.5">We will contact you soon.</p>
      <p className="text-base sm:text-lg text-text-muted leading-relaxed mb-5 sm:mb-6">धन्यवाद! आम्ही लवकरच संपर्क करू.</p>
      <button
        type="button"
        onClick={onReset}
        className="text-sm font-medium text-primary underline underline-offset-4 hover:text-primary-dark cursor-pointer"
      >
        Submit another response / पुन्हा पाठवा
      </button>
    </div>
  );
}

export default function LeadForm() {
  const [formData, setFormData] = useState<FormData>({ name: "", whatsapp: "" });
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [status, setStatus] = useState<FormStatus>("idle");
  const [serverError, setServerError] = useState("");

  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "whatsapp") {
      const digitsOnly = value.replace(/\D/g, "").slice(0, 10);
      setFormData((prev) => ({ ...prev, [name]: digitsOnly }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    if (touched[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  }, [touched]);

  const handleBlur = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({ ...prev, [name]: name === "name" ? validateName(value) : validateWhatsApp(value) }));
  }, []);

  const handleSubmit = useCallback(async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setServerError("");

    const nameError = validateName(formData.name);
    const whatsappError = validateWhatsApp(formData.whatsapp);
    setTouched({ name: true, whatsapp: true });
    setErrors({ name: nameError, whatsapp: whatsappError });

    if (nameError || whatsappError) return;
    setStatus("loading");

    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: formData.name.trim(), phone: formData.whatsapp }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setStatus("success");
      } else {
        setStatus("error");
        setServerError(""); 
        
        if (res.status === 400 && data.details) {
          const backendFieldErrors: FormErrors = {};
          if (data.details.name?.length > 0) backendFieldErrors.name = data.details.name[0];
          if (data.details.phone?.length > 0) backendFieldErrors.whatsapp = data.details.phone[0];
          
          if (Object.keys(backendFieldErrors).length > 0) {
            setErrors((prev) => ({ ...prev, ...backendFieldErrors }));
          } else {
            setServerError(data.message || data.error || "Validation failed / प्रमाणीकरण अयशस्वी");
          }
        } else {
          setServerError(data.message || data.error || "Something went wrong. Please try again. / काहीतरी चूक झाली. कृपया पुन्हा प्रयत्न करा.");
        }
      }
    } catch (error) {
      setStatus("error");
      setServerError("Network error. Please check your connection. / नेटवर्क त्रुटी. कृपया तुमचे कनेक्शन तपासा.");
    }
  }, [formData]);

  const handleReset = useCallback(() => {
    setFormData({ name: "", whatsapp: "" });
    setErrors({});
    setTouched({});
    setStatus("idle");
    setServerError("");
  }, []);

  if (status === "success") return <SuccessMessage onReset={handleReset} />;

  return (
    <form onSubmit={handleSubmit} noValidate className="animate-fade-in-up space-y-4 sm:space-y-5">
      <div>
        <label htmlFor="lead-name" className="block text-[13px] sm:text-sm font-medium text-text mb-1.5">
          Enter your name / तुमचं नाव टाका
        </label>
        <input
          id="lead-name"
          name="name"
          type="text"
          autoComplete="name"
          placeholder="e.g. Ramesh Patil"
          value={formData.name}
          onChange={handleChange}
          onBlur={handleBlur}
          aria-invalid={!!errors.name}
          className={`w-full rounded-xl border-2 bg-white px-4 py-3.5 sm:py-4 text-base sm:text-lg text-text focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none ${errors.name ? "border-error" : "border-border"}`}
        />
        {errors.name && <p className="mt-1.5 text-xs sm:text-sm text-error font-medium">{errors.name}</p>}
      </div>

      <div>
        <label htmlFor="lead-whatsapp" className="block text-[13px] sm:text-sm font-medium text-text mb-1.5">
          Enter your WhatsApp number / तुमचा WhatsApp नंबर टाका
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base sm:text-lg font-medium text-text-muted select-none pointer-events-none">+91</span>
          <input
            id="lead-whatsapp"
            name="whatsapp"
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            placeholder="9823246538"
            value={formData.whatsapp}
            onChange={handleChange}
            onBlur={handleBlur}
            aria-invalid={!!errors.whatsapp}
            className={`w-full rounded-xl border-2 bg-white pl-14 pr-4 py-3.5 sm:py-4 text-base sm:text-lg text-text focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none ${errors.whatsapp ? "border-error" : "border-border"}`}
          />
        </div>
        {errors.whatsapp && <p className="mt-1.5 text-xs sm:text-sm text-error font-medium">{errors.whatsapp}</p>}
      </div>

      {serverError && (
        <div className="rounded-xl bg-red-50 border border-error/20 p-3 text-xs sm:text-sm text-error text-center font-medium">
          {serverError}
        </div>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className={`w-full flex items-center justify-center gap-2.5 rounded-xl py-3.5 sm:py-4 px-6 text-base sm:text-lg font-semibold text-white transition-all ${status === "loading" ? "bg-primary/70 cursor-not-allowed" : "bg-primary hover:bg-primary-dark active:scale-[0.98]"}`}
      >
        {status === "loading" ? <><Spinner /><span>Submitting... / पाठवत आहे...</span></> : "Submit / पाठवा"}
      </button>
    </form>
  );
}
