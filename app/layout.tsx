import type React from "react";
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Header as LayoutHeader } from "@/components/layout/header";
import { AuthProvider } from "@/components/auth-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Birthy",
  description: "Birthy is a platform for managing birthday notifications",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
      </head>
      <body>
        <AuthProvider>
          <LayoutHeader />
          <main className="min-h-screen bg-background">
            <div className="max-w-6xl mx-auto">{children}</div>
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
