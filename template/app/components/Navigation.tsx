"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Navigation.module.css";

const Navigation = () => {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/download', label: 'Integrate' },
    { href: '/apps', label: 'Apps' }
  ];

  return (
    <nav className={styles.nav}>
      <div className={styles.container}>
        <div className={styles.logo}>
          <Link href="/">VaultCast</Link>
        </div>
        <ul className={styles.navItems}>
          {navItems.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className={`${styles.navLink} ${pathname.startsWith(item.href) && item.href !== '/' ? styles.active : pathname === item.href ? styles.active : ''}`}>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default Navigation;
