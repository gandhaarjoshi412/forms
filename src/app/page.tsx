import Image from "next/image";
import LeadForm from "@/components/LeadForm";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-6 sm:py-12">
      {/* Card */}
      <div className="w-full max-w-[420px]">
        {/* Header — Logo + Brand */}
        <header className="mb-5 sm:mb-8 text-center">
          <div className="mx-auto mb-3 flex items-center justify-center">
            <Image
              src="/logo.webp"
              alt="Onkar Enterprises Logo"
              width={160}
              height={52}
              priority
              className="h-auto w-auto max-h-[48px] sm:max-h-[60px] object-contain"
            />
          </div>
          <div className="h-[3px] w-10 mx-auto rounded-full bg-accent mb-2.5" />
          <p className="text-xs sm:text-sm text-text-muted tracking-wide">
            Industrial Automation &amp; Hydraulic Systems
          </p>
        </header>

        {/* Form Card */}
        <div className="rounded-2xl bg-white shadow-xl shadow-primary/5 border border-border/50 px-5 py-5 sm:p-8">
          <h1 className="text-lg sm:text-xl font-semibold text-primary mb-1">
            Get in Touch
          </h1>
          <p className="text-[13px] sm:text-sm text-text-muted mb-5 sm:mb-6 leading-relaxed">
            Fill in your details — we&apos;ll reach out on WhatsApp.
            <br />
            <span className="text-text-muted/80">
              खालील माहिती भरा — आम्ही WhatsApp वर संपर्क करू.
            </span>
          </p>

          <LeadForm />
        </div>

        {/* Footer */}
        <footer className="mt-5 sm:mt-6 pb-2 text-center text-[11px] text-text-muted/50">
          © {new Date().getFullYear()} Onkar Enterprises. All rights reserved.
        </footer>
      </div>
    </main>
  );
}
