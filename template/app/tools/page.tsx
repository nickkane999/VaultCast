'use client';

import Link from 'next/link';
import styles from './page.module.css';

export default function ToolsPage() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>Tools</h1>
        <p className={styles.subtitle}>Explore the available tools and features</p>

        <div className={styles.grid}>


          <Link href="/tools/ai-emailer" className={styles.featureCard}>
            <h3 className={styles.featureTitle}>Ai Emailer</h3>
            <div className={styles.arrow}>→</div>
          </Link>
        </div>
      </div>
    </div>
  );
}
