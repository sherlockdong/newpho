// app/layout.tsx
import type { Metadata } from "next";
import Script from "next/script";
import "../../public/assets/global-reset.css";
import "./globals.css";
import Header from "./comp/header";
import 'katex/dist/katex.min.css';
import LenisProvider from "../components/LenisProvider";
import { Analytics } from "@vercel/analytics/react";

export const metadata: Metadata = {
  title: "Physics Olympiad Guide",
  description: "AI-powered physics learning platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-TF3TR8PXK2"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-TF3TR8PXK2');
          `}
        </Script>
      </head>
      <body>
        <LenisProvider>
          <Header />
          {children}
        </LenisProvider>
        <Analytics />
      </body>
    </html>
  );
}