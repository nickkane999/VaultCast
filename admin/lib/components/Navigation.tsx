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
        <li>
          <Link href="/resources" className={pathname.startsWith("/resources") ? "active" : ""}>
            Resources
          </Link>
        </li>
      </ul>
    </nav>
  );
}
