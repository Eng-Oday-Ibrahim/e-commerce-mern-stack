import type { Metadata } from "next";
import "./globals.css";
import "react-loading-skeleton/dist/skeleton.css";
import AppShell from "./components/layout/AppShell";
import { Inter, Playfair_Display, Cairo } from "next/font/google";
import "flag-icons/css/flag-icons.min.css";
/* ================= FONTS ================= */

export const inter = Inter({
  subsets: ["latin"],
  variable: "--font-en-body",
  display: "swap",
});

export const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-en-title",
  display: "swap",
});


export const cairo = Cairo({
  subsets: ["arabic"],
  weight: ["400", "700"],
  variable: "--font-ar-body",
  display: "swap",
});



/* ================= METADATA ================= */

export const metadata: Metadata = {
  title: "Sudanista",
  description: "",
  icons: {
    icon: "/images/logo.png",
  },
};

/* ================= ROOT LAYOUT ================= */

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`
        ${inter.variable}
        ${playfair.variable}
        ${cairo.variable}
        h-full antialiased
      `}
    >
      <body className="min-h-full">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
