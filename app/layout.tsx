import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Source_Sans_3, Syne } from "next/font/google";

import { Navbar } from "./components/Navbar";
import "./globals.css";

const display = Syne({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const sans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Beleg — Proof, not prose.",
  description:
    "Beleg gives your traction a cryptographically sealed timeline — recorded as it happens, witnessed by real people, and provable to anyone reading.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <body>
        <ClerkProvider>
          <Navbar />
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
