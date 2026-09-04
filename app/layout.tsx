import type { ComponentProps } from "react";
import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import {
  Fira_Code,
  Inter,
  JetBrains_Mono,
  Pixelify_Sans,
  Plus_Jakarta_Sans,
  Space_Grotesk,
} from "next/font/google";

import { DEFAULT_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";
import { BetaNotice } from "./components/BetaNotice";
import { CookieBanner } from "./components/CookieBanner";
import { IdleDim } from "./components/IdleDim";
import { Navbar } from "./components/Navbar";
import { OptionalAnalytics } from "./components/OptionalAnalytics";
import { ScrollNav } from "./components/ScrollNav";
import { StickyCta } from "./components/StickyCta";
import "./globals.css";

const sans = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sans",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-jakarta",
  display: "swap",
  preload: false,
});

const grotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-grotesk",
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
  metadataBase: new URL(SITE_URL),
  title: `${SITE_NAME}. Proof, not prose.`,
  description: DEFAULT_DESCRIPTION,
  applicationName: SITE_NAME,
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_US",
    title: `${SITE_NAME}. Proof, not prose.`,
    description: DEFAULT_DESCRIPTION,
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME}. Proof, not prose.`,
    description: DEFAULT_DESCRIPTION,
  },
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
      className={`${sans.variable} ${jakarta.variable} ${grotesk.variable} ${mono.variable} ${fira.variable} ${pixel.variable}`}
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
          <BetaNotice />
          {children}
          <StickyCta />
          <CookieBanner />
          <OptionalAnalytics />
        </ClerkProvider>
      </body>
    </html>
  );
}
