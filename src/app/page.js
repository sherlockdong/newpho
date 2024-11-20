import styles from "./page.module.css";
import Link from 'next/link';
export default function Home() {
  return (
    <div className={styles.page}>
      <div className={styles.title}>PHO - GUIDE</div>
    <div className={styles.desp}>An AI-Human hybrid-powered database to improve your physics to the Olympics level.</div>
    <button className={styles.getStartedButton}><Link href='/rout'>Get Started</Link></button>
    </div>
  );
}
