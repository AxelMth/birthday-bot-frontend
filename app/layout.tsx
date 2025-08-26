import type React from "react";
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Header as LayoutHeader } from "@/components/layout/header";
import { AuthProvider } from "@/components/auth-provider";
import "./globals.css";
import "./theme.css";

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
      <body className="app-shell">
        <AuthProvider>
          <header className="app-header">
            <div className="app-header__inner">
              <LayoutHeader />
            </div>
          </header>
          <main>{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
