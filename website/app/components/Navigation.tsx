import Link from "next/link";
import styles from "./Navigation.module.css";

export default function Navigation() {
  return (
    <nav className={styles.nav}>
      <ul>
        <li>
          <Link href="/">Home</Link>
        </li>
        <li>
          <Link href="/videos">Videos</Link>
        </li>
        <li>
          <Link href="/files">Files</Link>
        </li>
        <li>
          <Link href="/resources">Resources</Link>
        </li>
      </ul>
    </nav>
  );
}
