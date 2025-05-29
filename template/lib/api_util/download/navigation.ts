import fs from "fs";
import path from "path";
import type { ProgressUpdate } from "./progress";

export async function createHierarchicalPages(routeConfigs: Record<string, string>, sendUpdate: (update: ProgressUpdate) => void): Promise<{ created: string[]; skipped: string[] }> {
  const created: string[] = [];
  const skipped: string[] = [];

  if (Object.keys(routeConfigs).length === 0) {
    return { created, skipped };
  }

  sendUpdate({
    step: "hierarchical_pages",
    status: "started",
    details: "Creating hierarchical index pages",
    data: { routeConfigs },
  });

  try {
    const routeStructure = buildRouteStructure(routeConfigs);

    for (const [route, children] of Object.entries(routeStructure)) {
      if (children.length > 0) {
        const indexPagePath = path.join(process.cwd(), "app", route, "page.tsx");

        if (!fs.existsSync(indexPagePath)) {
          await createIndexPage(route, children, indexPagePath);
          created.push(route);
        } else {
          skipped.push(route);
        }
      }
    }

    sendUpdate({
      step: "hierarchical_pages",
      status: "completed",
      details: `Created ${created.length} hierarchical pages, skipped ${skipped.length} existing pages`,
      data: { created, skipped },
    });

    return { created, skipped };
  } catch (error: any) {
    sendUpdate({
      step: "hierarchical_pages",
      status: "error",
      details: `Error creating hierarchical pages: ${error.message}`,
      data: { error: error.message },
    });
    return { created, skipped };
  }
}

export async function updateHierarchicalNavigation(routeConfigs: Record<string, string>, sendUpdate: (update: ProgressUpdate) => void): Promise<boolean> {
  if (Object.keys(routeConfigs).length === 0) {
    return true;
  }

  sendUpdate({
    step: "navigation",
    status: "started",
    details: "Updating hierarchical navigation",
    data: { routeConfigs },
  });

  try {
    const navigationPath = path.join(process.cwd(), "lib", "components", "Navigation.tsx");

    if (!fs.existsSync(navigationPath)) {
      await createNavigationComponent(routeConfigs, navigationPath);
    } else {
      await updateNavigationComponent(routeConfigs, navigationPath);
    }

    sendUpdate({
      step: "navigation",
      status: "completed",
      details: "Navigation updated with hierarchical structure",
      data: { updated: true },
    });

    return true;
  } catch (error: any) {
    sendUpdate({
      step: "navigation",
      status: "error",
      details: `Error updating navigation: ${error.message}`,
      data: { error: error.message },
    });
    return false;
  }
}

function buildRouteStructure(routeConfigs: Record<string, string>): Record<string, string[]> {
  const structure: Record<string, string[]> = {};

  for (const [feature, route] of Object.entries(routeConfigs)) {
    const segments = route.split("/").filter(Boolean);

    // Add each route segment to the structure
    for (let i = 0; i < segments.length - 1; i++) {
      const parentRoute = segments.slice(0, i + 1).join("/");
      const childRoute = segments.slice(0, i + 2).join("/");

      if (!structure[parentRoute]) {
        structure[parentRoute] = [];
      }

      if (!structure[parentRoute].includes(childRoute)) {
        structure[parentRoute].push(childRoute);
      }
    }

    // Also ensure that the final route (the actual feature route) is tracked
    // This helps with cases where multiple features exist in the same parent directory
    const fullRoute = segments.join("/");
    if (segments.length > 1) {
      const parentRoute = segments.slice(0, -1).join("/");
      if (!structure[parentRoute]) {
        structure[parentRoute] = [];
      }
      if (!structure[parentRoute].includes(fullRoute)) {
        structure[parentRoute].push(fullRoute);
      }
    }
  }

  return structure;
}

async function createIndexPage(route: string, children: string[], indexPagePath: string): Promise<void> {
  const segments = route.split("/");
  const title = segments[segments.length - 1]
    .split(/[-_]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("-");

  const functionName = title.replace(/[-\s]/g, "");

  // Calculate the correct relative path to global.module.css based on route depth
  const routeDepth = segments.length;
  const cssImportPath = "../".repeat(routeDepth) + "global.module.css";

  // Create directoryItems array from children
  const directoryItems = children.map((child) => {
    const childSegments = child.split("/");
    const childTitle = childSegments[childSegments.length - 1]
      .split(/[-_]/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

    return {
      href: `/${child}`,
      label: childTitle,
    };
  });

  // Create the directoryItems constant for the component
  const directoryItemsCode = `const directoryItems = [
${directoryItems.map((item) => `  { href: "${item.href}", label: "${item.label}" },`).join("\n")}
];`;

  // Create the mapped JSX for the grid
  const mappedLinks = `{directoryItems.map((item, index) => (
            <Link key={index} href={item.href} className={styles.featureCard}>
              <h3 className={styles.featureTitle}>{item.label}</h3>
              <div className={styles.arrow}>→</div>
            </Link>
          ))}`;

  const pageContent = `"use client";

import Link from "next/link";
import styles from "${cssImportPath}";

${directoryItemsCode}

export default function ${functionName}Page() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>${title}</h1>
        <p className={styles.subtitle}>Explore the available ${title.toLowerCase()} and features</p>

        <div className={styles.grid}>
          ${mappedLinks}
        </div>
      </div>
    </div>
  );
}`;

  const destDir = path.dirname(indexPagePath);
  await fs.promises.mkdir(destDir, { recursive: true });
  await fs.promises.writeFile(indexPagePath, pageContent);
}

async function createNavigationComponent(routeConfigs: Record<string, string>, navigationPath: string): Promise<void> {
  const routes = Object.entries(routeConfigs).map(([feature, route]) => {
    const title = feature
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
    return { href: `/${route}`, title };
  });

  const navigationContent = `"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const routes = ${JSON.stringify(routes, null, 2)};

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link href="/" className="text-xl font-bold">
            Home
          </Link>
          <div className="flex space-x-4">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={\`px-3 py-2 rounded-md text-sm font-medium transition-colors \${
                  pathname === route.href
                    ? "bg-blue-500 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }\`}
              >
                {route.title}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}`;

  const destDir = path.dirname(navigationPath);
  await fs.promises.mkdir(destDir, { recursive: true });
  await fs.promises.writeFile(navigationPath, navigationContent);
}

async function updateNavigationComponent(routeConfigs: Record<string, string>, navigationPath: string): Promise<void> {
  const content = await fs.promises.readFile(navigationPath, "utf-8");

  const newRoutes = Object.entries(routeConfigs).map(([feature, route]) => {
    const title = feature
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
    return { href: `/${route}`, title };
  });

  const routesRegex = /const routes = (\[[\s\S]*?\]);/;
  const match = content.match(routesRegex);

  if (match) {
    try {
      const existingRoutes = JSON.parse(match[1]);
      const mergedRoutes = [...existingRoutes];

      newRoutes.forEach((newRoute) => {
        if (!mergedRoutes.some((existing) => existing.href === newRoute.href)) {
          mergedRoutes.push(newRoute);
        }
      });

      const updatedContent = content.replace(routesRegex, `const routes = ${JSON.stringify(mergedRoutes, null, 2)};`);

      await fs.promises.writeFile(navigationPath, updatedContent);
    } catch (error) {
      console.error("Error parsing existing routes, creating new navigation:", error);
      await createNavigationComponent(routeConfigs, navigationPath);
    }
  } else {
    await createNavigationComponent(routeConfigs, navigationPath);
  }
}
