"use client";
import Link from "next/link";
import styles from "./Navigation.module.css";
import { usePathname } from "next/navigation";

export default function Navigation() {
  const pathname = usePathname();
  return (
    <nav className={styles.nav}>
      <ul>
        <li>
          <Link href="/" className={pathname === "/" ? "active" : ""}>
            Home
          </Link>
        </li>
        <li>
          <Link href="/videos" className={pathname === "/videos" ? "active" : ""}>
            Videos
          </Link>
        </li>
        <li>
          <Link href="/files" className={pathname === "/files" ? "active" : ""}>
            Files
          </Link>
        </li>
        <li className={styles.dropdown}>
          <span className={styles.dropdownToggle}>Resources</span>
          <ul className={styles.dropdownContent}>
            <li>
              <Link href="/resources/decision_helper" className={pathname === "/resources/decision_helper" ? "active" : ""}>
                Decision Helper
              </Link>
            </li>
            <li>
              <Link href="/resources/ai_messenger" className={pathname === "/resources/ai_messenger" ? "active" : ""}>
                AI Messenger
              </Link>
            </li>
          </ul>
        </li>
      </ul>
    </nav>
  );
}
