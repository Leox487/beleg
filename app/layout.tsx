import type { ComponentProps } from "react";
import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Instrument_Serif, Inter, JetBrains_Mono } from "next/font/google";

import { Navbar } from "./components/Navbar";
import { ScrollNav } from "./components/ScrollNav";
import "./globals.css";

const sans = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-sans",
  display: "swap",
});

const display = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Beleg. Proof, not prose.",
  description:
    "Beleg gives your traction a cryptographically sealed timeline, recorded as it happens, witnessed by real people, and provable to anyone reading.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png", sizes: "32x32" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${sans.variable} ${display.variable} ${mono.variable}`}
    >
      <body>
        <ClerkProvider
          appearance={
            {
              variables: {
                colorBackground: "#12141A",
                colorText: "#F2F3F5",
                colorPrimary: "#2DD4A0",
                colorInputBackground: "#191C24",
                colorInputText: "#F2F3F5",
                borderRadius: "8px",
              },
            } as ComponentProps<typeof ClerkProvider>["appearance"]
          }
        >
          <ScrollNav>
            <Navbar />
          </ScrollNav>
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
