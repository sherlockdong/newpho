import localFont from "next/font/local";
import styles from "./page.module.css";
import "./globals.css";
import Footer from "./comp/footer";
import classNames from 'classnames';
import Header from "./comp/header";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata = {
  title: "PHO-GUIDE",
  description: "A physics olympiad tutoring website, designed by current Highschool students.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
     <body className={classNames(geistSans.variable, geistMono.variable, styles.page)}>
      <Header />  {children}<Footer />
      </body>

    </html>
  );
}
