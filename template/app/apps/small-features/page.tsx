"use client";

import Link from "next/link";
import styles from "./page.module.css";

export default function SmallFeaturesPage() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>Small-Features</h1>
        <p className={styles.subtitle}>Explore the available small-features and features</p>

        <div className={styles.grid}>
          <Link href="/apps/small-features/ai-messenger" className={styles.featureCard}>
            <h3 className={styles.featureTitle}>Ai Messenger</h3>
            <div className={styles.arrow}>→</div>
          </Link>
        </div>
      </div>
    </div>
  );
}
