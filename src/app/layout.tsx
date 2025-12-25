// app/layout.tsx
import type { Metadata } from "next";
import "../../public/assets/css/main.css"; // or your main.css path
import Header from "./comp/header"; // Create this component next

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
      <body>
        <Header />  {/* Fixed header here */}
        <main>{children}</main>  {/* All page content starts below header */}
      </body>
    </html>
  );
}