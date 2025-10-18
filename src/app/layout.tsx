import type { Metadata } from "next";
import Header from "./comp/header";
import { Analytics } from "@vercel/analytics/next";
import "../../public/assets/css/main.css";

export const metadata: Metadata = {
  title: "PHO-GUIDE",
  description: "A physics olympiad tutoring website, designed by current high school students.",
  icons: {
    icon: "/favicon.ico",
  },
};

interface LayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: LayoutProps) {
  return (
    <html lang="en">    

      <body> <Header /><main>{children}</main>
           <Analytics /></body>
    </html>
  );
}