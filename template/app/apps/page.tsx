'use client';

import Link from 'next/link';
import styles from './page.module.css';

export default function AppsPage() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>Apps</h1>
        <p className={styles.subtitle}>Explore the available apps and features</p>

        <div className={styles.grid}>
          <Link href="/apps/small-features" className={styles.categoryCard}>
            <h2 className={styles.categoryTitle}>Small-Features</h2>
            <p className={styles.categoryDescription}>
              1 feature available
            </p>
            <div className={styles.arrow}>→</div>
          </Link>


        </div>
      </div>
    </div>
  );
}
