import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0B3C5D",
};

export const metadata: Metadata = {
  title: "Onkar Enterprises | Contact Us",
  description:
    "Get in touch with Onkar Enterprises — your trusted partner for industrial automation, hydraulic systems, and maintenance solutions in Chhatrapati Sambhajinagar.",
  keywords: [
    "Onkar Enterprises",
    "Industrial Automation",
    "Hydraulic Systems",
    "Pneumatic Systems",
    "Aurangabad",
    "Chhatrapati Sambhajinagar",
  ],
  openGraph: {
    title: "Onkar Enterprises | Contact Us",
    description:
      "Get in touch with Onkar Enterprises — your trusted partner for industrial automation and hydraulic systems.",
    type: "website",
    locale: "en_IN",
  },
  icons: {
    icon: "/logo.webp",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
