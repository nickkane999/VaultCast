import Image from "next/image";
import Link from "next/link";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.hero}>
          <h1 className={styles.heroTitle}>Welcome to VaultCast Template</h1>
          <p className={styles.heroSubtitle}>Your one-stop destination for integrating premium React components and features directly into your project</p>
        </div>

        <div className={styles.features}>
          <div className={styles.feature}>
            <div className={styles.featureIcon}>🧩</div>
            <h3>Premium Components</h3>
            <p>Integrate high-quality React components including video players, media displays, and navigation elements directly into your lib/components directory.</p>
          </div>

          <div className={styles.feature}>
            <div className={styles.featureIcon}>⚡</div>
            <h3>Advanced Features</h3>
            <p>Add complete feature sets like AI messaging, image analysis, and video management tools straight into your lib/features folder.</p>
          </div>

          <div className={styles.feature}>
            <div className={styles.featureIcon}>⚙️</div>
            <h3>Instant Integration</h3>
            <p>No more manual file copying! Select what you need and it's automatically integrated into your project structure.</p>
          </div>
        </div>

        <div className={styles.ctas}>
          <Link href="/download" className={styles.primary}>
            Start Integrating
          </Link>
          <a href="https://github.com/your-repo" target="_blank" rel="noopener noreferrer" className={styles.secondary}>
            View on GitHub
          </a>
        </div>
      </main>

      <footer className={styles.footer}>
        <p>&copy; 2024 VaultCast Template. Built with Next.js and React.</p>
      </footer>
    </div>
  );
}
