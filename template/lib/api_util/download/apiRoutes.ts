import fs from "fs";
import path from "path";
import { copyDirectory, copyFile } from "./fileUtils";
import type { ProgressUpdate } from "./progress";

export async function copyApiRoutes(featureName: string, apiRoutes: { from: string; to: string }[], sendUpdate: (update: ProgressUpdate) => void): Promise<string[]> {
  const copiedRoutes: string[] = [];
  const skippedRoutes: string[] = [];

  // First, handle automatic API route movement from lib/features/[feature]/api/ to app/api/[feature]/
  const featureApiPath = path.join(process.cwd(), "lib", "features", featureName, "api");
  const targetApiPath = path.join(process.cwd(), "app", "api", featureName);

  let hasApiDirectory = false;

  if (fs.existsSync(featureApiPath)) {
    hasApiDirectory = true;

    sendUpdate({
      step: "api_routes",
      status: "started",
      details: `Moving API routes from lib/features/${featureName}/api/ to app/api/${featureName}/`,
      data: { featureName, from: `lib/features/${featureName}/api/`, to: `app/api/${featureName}/` },
    });

    try {
      // Copy the entire API directory
      if (!fs.existsSync(targetApiPath)) {
        await copyDirectory(featureApiPath, targetApiPath);

        // Fix import paths in all copied API files
        await fixApiImportPaths(targetApiPath, featureName);

        copiedRoutes.push(`app/api/${featureName}/`);

        sendUpdate({
          step: "api_routes",
          status: "completed",
          details: `API routes moved to app/api/${featureName}/`,
          data: { moved: true, path: `app/api/${featureName}/` },
        });
      } else {
        skippedRoutes.push(`app/api/${featureName}/`);

        sendUpdate({
          step: "api_routes",
          status: "skipped",
          details: `API directory already exists at app/api/${featureName}/`,
          data: { skipped: true, path: `app/api/${featureName}/` },
        });
      }
    } catch (error: any) {
      sendUpdate({
        step: "api_routes",
        status: "error",
        details: `Error moving API routes: ${error.message}`,
        data: { error: error.message },
      });
    }
  }

  // Then handle any additional specific API routes from the installation file
  if (apiRoutes.length > 0) {
    if (!hasApiDirectory) {
      sendUpdate({
        step: "api_routes",
        status: "started",
        details: `Copying ${apiRoutes.length} specific API routes`,
        data: { routes: apiRoutes },
      });
    }

    const featurePath = path.join(process.cwd(), "lib", "features", featureName);

    for (const route of apiRoutes) {
      try {
        const destPath = path.join(process.cwd(), route.to);

        if (fs.existsSync(destPath)) {
          skippedRoutes.push(route.to);
          continue;
        }

        const sourcePath = path.join(featurePath, route.from.replace(`lib/features/${featureName}/`, ""));

        if (fs.existsSync(sourcePath)) {
          await copyFile(sourcePath, destPath);

          // Fix import paths in the copied file
          await fixApiImportPaths(destPath, featureName, true);

          copiedRoutes.push(route.to);
        }
      } catch (error: any) {
        console.error(`Error copying API route ${route.from} to ${route.to}:`, error);
      }
    }
  }

  // Generate final status message
  if (hasApiDirectory || apiRoutes.length > 0) {
    const totalProcessed = copiedRoutes.length + skippedRoutes.length;
    const statusDetails = [copiedRoutes.length > 0 ? `Moved/created ${copiedRoutes.length} API route${copiedRoutes.length > 1 ? "s" : ""}` : "", skippedRoutes.length > 0 ? `Skipped ${skippedRoutes.length} existing route${skippedRoutes.length > 1 ? "s" : ""}` : ""].filter(Boolean).join(", ");

    if (!hasApiDirectory) {
      sendUpdate({
        step: "api_routes",
        status: "completed",
        details: statusDetails || "API routes processed",
        data: { copied: copiedRoutes, skipped: skippedRoutes },
      });
    }
  } else {
    sendUpdate({
      step: "api_routes",
      status: "skipped",
      details: `No API routes found for ${featureName}`,
      data: { featureName },
    });
  }

  return copiedRoutes;
}

async function fixApiImportPaths(apiPath: string, featureName: string, isSingleFile: boolean = false): Promise<void> {
  try {
    if (isSingleFile) {
      // Handle single file
      if (apiPath.endsWith(".ts") || apiPath.endsWith(".tsx")) {
        await fixApiFileImports(apiPath, featureName);
      }
    } else {
      // Handle directory recursively
      const entries = await fs.promises.readdir(apiPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(apiPath, entry.name);

        if (entry.isDirectory()) {
          await fixApiImportPaths(fullPath, featureName, false);
        } else if (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx")) {
          await fixApiFileImports(fullPath, featureName);
        }
      }
    }
  } catch (error) {
    console.error(`Error fixing API import paths in ${apiPath}:`, error);
  }
}

async function fixApiFileImports(filePath: string, featureName: string): Promise<void> {
  try {
    let content = await fs.promises.readFile(filePath, "utf-8");
    let modified = false;

    // Fix imports that reference the feature's store or utilities
    const importFixes: { pattern: RegExp; replacement: string }[] = [
      // Fix relative imports to the feature store
      {
        pattern: /from ['"]\.\.\/\.\.\/store\/([^'"]+)['"]/g,
        replacement: `from '@/lib/features/${featureName}/store/$1'`,
      },
      // Fix relative imports to feature utilities
      {
        pattern: /from ['"]\.\.\/utils\/([^'"]+)['"]/g,
        replacement: `from '@/lib/features/${featureName}/api/utils/$1'`,
      },
      // Fix relative imports to other API files within the same feature
      {
        pattern: /from ['"]\.\.\/([^'"]+)['"]/g,
        replacement: `from '@/lib/features/${featureName}/api/$1'`,
      },
      // Fix server/database imports
      {
        pattern: /from ['"]@\/lib\/server\/([^'"]+)['"]/g,
        replacement: `from '@/lib/server/$1'`,
      },
      // Fix global store imports to feature store
      {
        pattern: /from ['"]@\/store\/([^'"]+)['"]/g,
        replacement: `from '@/lib/features/${featureName}/store/$1'`,
      },
    ];

    importFixes.forEach(({ pattern, replacement }) => {
      if (pattern.test(content)) {
        content = content.replace(pattern, replacement);
        modified = true;
      }
    });

    // Handle the special case for relative imports from current directory
    const currentDirPattern = /from ['"]\.\/([^'"]+)['"]/g;
    if (currentDirPattern.test(content)) {
      content = content.replace(currentDirPattern, (match: string, p1: string) => {
        if (p1 === "route" || p1.endsWith(".ts") || p1.endsWith(".tsx")) {
          return `from './${p1}'`;
        }
        return `from '@/lib/features/${featureName}/api/${p1}'`;
      });
      modified = true;
    }

    if (modified) {
      await fs.promises.writeFile(filePath, content);
    }
  } catch (error) {
    console.error(`Error fixing imports in API file ${filePath}:`, error);
  }
}
