import type { ComponentProps } from "react";
import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import {
  Fira_Code,
  Fraunces,
  Inter,
  JetBrains_Mono,
  Newsreader,
  Pixelify_Sans,
  Playfair_Display,
  Plus_Jakarta_Sans,
} from "next/font/google";

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

const news = Newsreader({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-news",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
  display: "swap",
  preload: false,
});

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-fraunces",
  display: "swap",
  preload: false,
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-jakarta",
  display: "swap",
  preload: false,
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

const fira = Fira_Code({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-fira",
  display: "swap",
  preload: false,
});

const pixel = Pixelify_Sans({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-pixel",
  display: "swap",
  preload: false,
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
      className={`${sans.variable} ${news.variable} ${playfair.variable} ${fraunces.variable} ${jakarta.variable} ${mono.variable} ${fira.variable} ${pixel.variable}`}
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
