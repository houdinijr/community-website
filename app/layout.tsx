import type { Metadata, Viewport } from "next";

import { PwaProvider } from "@/components/pwa-provider";

import "./globals.css";

export const metadata: Metadata = {
  title: "Congolese Community in Zimbabwe",
  description:
    "A professional community platform for Congolese students and families in Zimbabwe, featuring activities, leadership information, and certificate verification.",
  applicationName: "CECAU",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "CECAU",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/images/cecau-logo.png", sizes: "192x192", type: "image/png" },
      { url: "/images/cecau-logo.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/images/cecau-logo.png", sizes: "180x180", type: "image/png" }],
    shortcut: ["/images/cecau-logo.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#1C75BC",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-body">
        <PwaProvider />
        {children}
      </body>
    </html>
  );
}
