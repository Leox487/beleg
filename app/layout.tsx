import type { ComponentProps } from "react";
import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Inter, JetBrains_Mono } from "next/font/google";

import { IdleDim } from "./components/IdleDim";
import { Navbar } from "./components/Navbar";
import { ScrollNav } from "./components/ScrollNav";
import "./globals.css";

const sans = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sans",
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
      className={`${sans.variable} ${mono.variable}`}
    >
      <body>
        <ClerkProvider
          appearance={
            {
              variables: {
                colorBackground: "#1A1D20",
                colorText: "#E0E0E0",
                colorPrimary: "#2DD4A0",
                colorInputBackground: "#22262B",
                colorInputText: "#E0E0E0",
                borderRadius: "8px",
              },
            } as ComponentProps<typeof ClerkProvider>["appearance"]
          }
        >
          <IdleDim />
          <ScrollNav>
            <Navbar />
          </ScrollNav>
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
