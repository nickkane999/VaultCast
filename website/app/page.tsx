import styles from "./page.module.css";
import MediaDisplay from "./components/MediaDisplay";

export default function Home() {
  return (
    <div className={styles.page}>
      <h1>Welcome to VaultCast</h1>
      <p>Your secure platform for file sharing and streaming</p>

      {/* Example usage of MediaDisplay component */}
      <div className={styles.mediaGrid}>
        <MediaDisplay type="image" path="images/vaultcast_logo.png" />
        {/* Add more MediaDisplay components as needed */}
      </div>
    </div>
  );
}
