import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";

import { Navbar } from "./components/Navbar";
import "./globals.css";

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
    <html lang="en">
      <body>
        <ClerkProvider>
          <Navbar />
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
