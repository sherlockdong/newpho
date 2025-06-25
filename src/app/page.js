import styles from "./page.module.css";
import Link from 'next/link';
export default function Home() {
  return (
    <div className={styles.page}>
      <div className={styles.title}>Physics Olympiad Guide</div>
    <div className={styles.desp}>An AI-Human hybrid-powered database to improve your physics to the Olympics level.</div>
    <button className={styles.getStartedButton}><Link href='/rout'>Get Started</Link></button>

    <div className={styles.us}><h2>About us</h2>
    </div>
    <div className={styles.gridsContainer}>
      <div className={styles.grid}>
        <h3>Who are "we"?</h3>
        <p>We are current highschool students who share a passion in physics, and hopes to share our knowledge to those who want to do better in this amazing subject.
          The more people we have, the more fun it is ! If you are interested in joining and building this project together, please contact us and let us know. 
        </p>
      </div>

      <div className={styles.grid}>
        <h3>How is PHO-Guide special?</h3>
        <p>This website includes information from physics Olympiad in different countries, to specific categories to problems that might appear in a competitive contest. 
          There is also some basic physics knowledge for highschool and middle school students to pave their road to become a physicist. 
        </p>
      </div>

    </div>
    </div>
  );
}
