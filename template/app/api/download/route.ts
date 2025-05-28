import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

async function copyDirectory(src: string, dest: string): Promise<void> {
  await fs.promises.mkdir(dest, { recursive: true });
  const entries = await fs.promises.readdir(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      await copyDirectory(srcPath, destPath);
    } else {
      await fs.promises.copyFile(srcPath, destPath);
    }
  }
}

async function copyFile(src: string, dest: string): Promise<void> {
  const destDir = path.dirname(dest);
  await fs.promises.mkdir(destDir, { recursive: true });
  await fs.promises.copyFile(src, dest);
}

async function createPageFromFeature(featureName: string, targetRoute: string): Promise<boolean> {
  try {
    const featuresPath = path.join(process.cwd(), "lib", "features", featureName);
    const pageSourcePath = path.join(featuresPath, "page", "page.tsx");

    // Create the destination directory structure
    const routeParts = targetRoute.split("/").filter((part) => part !== "");
    const targetPageDir = path.join(process.cwd(), "app", ...routeParts);
    const targetPagePath = path.join(targetPageDir, "page.tsx");

    // Check if the feature has a page.tsx file
    if (fs.existsSync(pageSourcePath)) {
      await copyFile(pageSourcePath, targetPagePath);
      return true;
    }

    return false;
  } catch (error) {
    console.error(`Error creating page for ${featureName}:`, error);
    return false;
  }
}

async function updateNavigation(routes: Record<string, string>): Promise<boolean> {
  try {
    const navigationPath = path.join(process.cwd(), "app", "components", "Navigation.tsx");

    // Check if Navigation component exists
    if (!fs.existsSync(navigationPath)) {
      // Create a basic navigation component
      const basicNavContent = `'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Navigation.module.css';

const Navigation = () => {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/download', label: 'Integrate' },
${Object.entries(routes)
  .map(([featureName, route]) => `    { href: '${route}', label: '${featureName.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}' },`)
  .join("\n")}
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
              <Link 
                href={item.href}
                className={\`\${styles.navLink} \${pathname === item.href ? styles.active : ''}\`}
              >
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
`;

      await fs.promises.mkdir(path.dirname(navigationPath), { recursive: true });
      await fs.promises.writeFile(navigationPath, basicNavContent);

      // Create basic CSS for navigation
      const navigationCSSPath = path.join(process.cwd(), "app", "components", "Navigation.module.css");
      const basicNavCSS = `.nav {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1rem 0;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo a {
  font-size: 1.5rem;
  font-weight: bold;
  color: white;
  text-decoration: none;
}

.navItems {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  gap: 2rem;
}

.navLink {
  color: rgba(255, 255, 255, 0.9);
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.navLink:hover,
.navLink.active {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

@media (max-width: 768px) {
  .navItems {
    gap: 1rem;
  }
  
  .navLink {
    padding: 0.5rem;
    font-size: 0.9rem;
  }
}
`;

      await fs.promises.writeFile(navigationCSSPath, basicNavCSS);
      return true;
    }

    // Navigation exists, update it
    let navContent = await fs.promises.readFile(navigationPath, "utf-8");

    // Find the navItems array and update it
    const navItemsStart = navContent.indexOf("const navItems = [");
    const navItemsEnd = navContent.indexOf("];", navItemsStart) + 2;

    if (navItemsStart !== -1 && navItemsEnd !== -1) {
      const beforeNavItems = navContent.substring(0, navItemsStart);
      const afterNavItems = navContent.substring(navItemsEnd);

      // Get existing nav items (basic extraction)
      const existingItems = ["{ href: '/', label: 'Home' }", "{ href: '/download', label: 'Integrate' }"];

      // Add new route items
      const newItems = Object.entries(routes).map(([featureName, route]) => `{ href: '${route}', label: '${featureName.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}' }`);

      const allItems = [...existingItems, ...newItems];

      const newNavItems = `const navItems = [
    ${allItems.join(",\n    ")}
  ];`;

      const updatedContent = beforeNavItems + newNavItems + afterNavItems;
      await fs.promises.writeFile(navigationPath, updatedContent);
      return true;
    }

    return false;
  } catch (error) {
    console.error("Error updating navigation:", error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { category, items, routeConfigs } = await request.json();

    if (!category || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Invalid request data" }, { status: 400 });
    }

    const adminBasePath = path.join(process.cwd(), "..", "website", "lib");
    const templateBasePath = path.join(process.cwd(), "lib");
    const templateStorePath = path.join(process.cwd(), "store");

    let copiedFiles: string[] = [];
    let errors: string[] = [];
    let pageRoute: string | undefined;
    let navigationUpdated = false;

    if (category === "components") {
      const adminComponentsPath = path.join(adminBasePath, "components");
      const templateComponentsPath = path.join(templateBasePath, "components");

      for (const item of items) {
        try {
          const srcPath = path.join(adminComponentsPath, item);
          const destPath = path.join(templateComponentsPath, item);

          if (fs.existsSync(srcPath)) {
            const stats = fs.statSync(srcPath);
            if (stats.isFile()) {
              await copyFile(srcPath, destPath);
              copiedFiles.push(`lib/components/${item}`);
            }
          } else {
            errors.push(`Component ${item} not found`);
          }
        } catch (error) {
          errors.push(`Failed to copy ${item}: ${error}`);
        }
      }
    } else if (category === "features") {
      const adminFeaturesPath = path.join(adminBasePath, "features");
      const templateFeaturesPath = path.join(templateBasePath, "features");

      // Store routes for navigation update
      const createdRoutes: Record<string, string> = {};

      for (const item of items) {
        try {
          const srcPath = path.join(adminFeaturesPath, item);
          const destPath = path.join(templateFeaturesPath, item);

          if (fs.existsSync(srcPath)) {
            const stats = fs.statSync(srcPath);
            if (stats.isDirectory()) {
              await copyDirectory(srcPath, destPath);
              copiedFiles.push(`lib/features/${item}/`);

              // Handle page creation for features with route configs
              if (routeConfigs && routeConfigs[item]) {
                const route = routeConfigs[item];
                const pageCreated = await createPageFromFeature(item, route);
                if (pageCreated) {
                  createdRoutes[item] = route;
                  pageRoute = route; // For single item integration feedback
                  copiedFiles.push(`app${route}/page.tsx`);
                }
              }
            }
          } else {
            errors.push(`Feature ${item} not found`);
          }
        } catch (error) {
          errors.push(`Failed to copy ${item}: ${error}`);
        }
      }

      // Update navigation if any pages were created
      if (Object.keys(createdRoutes).length > 0) {
        navigationUpdated = await updateNavigation(createdRoutes);
        if (navigationUpdated) {
          copiedFiles.push("app/components/Navigation.tsx");
        }
      }

      // Create/update store configuration for features
      if (copiedFiles.length > 0) {
        try {
          const storeIndexPath = path.join(templateStorePath, "index.ts");
          const storeContent = `// Redux store configuration
import { configureStore } from '@reduxjs/toolkit';

// Import feature slices here as you add them
// Example: import exampleSlice from '../lib/features/example/exampleSlice';

export const store = configureStore({
  reducer: {
    // Add your feature reducers here
    // example: exampleSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
`;

          await fs.promises.mkdir(templateStorePath, { recursive: true });
          if (!fs.existsSync(storeIndexPath)) {
            await fs.promises.writeFile(storeIndexPath, storeContent);
            copiedFiles.push("store/index.ts");
          }
        } catch (error) {
          console.warn("Could not create store configuration:", error);
        }
      }
    }

    const response = {
      success: true,
      message: `Successfully integrated ${copiedFiles.length > 0 ? items.length : 0} ${category}${pageRoute ? " with working page" : ""}`,
      copiedFiles,
      pageRoute,
      navigationUpdated,
      errors: errors.length > 0 ? errors : undefined,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Integration error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Integration failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
