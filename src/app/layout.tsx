// src/app/layout.tsx
import "./globals.css";
import Footer from "./comp/footer";
import Header from "./comp/header";
import styles from "./page.module.css"; // Keep for page.js compatibility

export const metadata = {
  title: "PHO-GUIDE",
  description: "A physics olympiad tutoring website, designed by current high school students.",
  icons: {
    icon: "/favicon.ico", // Retain for prior 548.js fix
  },
};

interface LayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: LayoutProps) {
  return (
    <html lang="en"><body className={styles.page}><Header />{children}<Footer /></body></html>
  );
}