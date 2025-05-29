import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

interface ProgressUpdate {
  step: string;
  status: "started" | "completed" | "skipped" | "error";
  details?: string;
  data?: any;
}

function createProgressStream() {
  const encoder = new TextEncoder();
  let controller: ReadableStreamDefaultController;

  const stream = new ReadableStream({
    start(ctrl) {
      controller = ctrl;
    },
  });

  const sendUpdate = (update: ProgressUpdate) => {
    const data = `data: ${JSON.stringify(update)}\n\n`;
    controller.enqueue(encoder.encode(data));
  };

  const close = () => {
    controller.close();
  };

  return { stream, sendUpdate, close };
}

async function fixImportPaths(filePath: string, featureName: string): Promise<void> {
  if (!filePath.endsWith(".ts") && !filePath.endsWith(".tsx")) {
    return;
  }

  try {
    let content = await fs.promises.readFile(filePath, "utf-8");
    let modified = false;

    // For ai_emailer, only fix the import paths, don't rename functions
    if (featureName === "ai_emailer") {
      // Only fix import paths from global store to local store
      const globalStoreImports = [`@/store/aiEmailerSlice`];

      globalStoreImports.forEach((globalImport) => {
        const sliceName = globalImport.split("/").pop();
        const localImport = `./store/${sliceName}`;

        if (content.includes(`from "${globalImport}"`)) {
          content = content.replace(new RegExp(`from "${globalImport.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"`, "g"), `from "${localImport}"`);
          modified = true;
        }

        if (content.includes(`from '${globalImport}'`)) {
          content = content.replace(new RegExp(`from '${globalImport.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}'`, "g"), `from '${localImport}'`);
          modified = true;
        }
      });

      if (modified) {
        await fs.promises.writeFile(filePath, content);
      }
      return;
    }

    // For other features, use the original comprehensive fixing
    const globalStoreImports = [`@/store/${featureName}Slice`, `@/store/aiMessengerSlice`, `@/store/imageAnalyzerSlice`, `@/store/decisionHelperSlice`];

    globalStoreImports.forEach((globalImport) => {
      const sliceName = globalImport.split("/").pop();
      const localImport = `./store/${sliceName}`;

      if (content.includes(`from "${globalImport}"`)) {
        content = content.replace(new RegExp(`from "${globalImport.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"`, "g"), `from "${localImport}"`);
        modified = true;
      }

      if (content.includes(`from '${globalImport}'`)) {
        content = content.replace(new RegExp(`from '${globalImport.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}'`, "g"), `from '${localImport}'`);
        modified = true;
      }
    });

    // Fix Redux toolkit function calls - convert from thunks to direct async thunk calls (for non-ai_emailer features)
    const thunkReplacements = {
      handleSubmitThunk: "generateEmailDraft",
      handleSendEmailThunk: "sendEmail",
      fetchPastEmailsThunk: "fetchPastEmails",
      loadPastEmailThunk: "loadEmail",
      deletePastEmailThunk: "deleteEmail",
      generateEmailWithDesignThunk: "generateEmailDraft",
      fetchDesignsThunk: "fetchDesigns",
      fetchTemplatesForDesignThunk: "fetchTemplates",
      generateHtmlDesignThunk: "generateEmailDraft",
      setDraftCustomizations: "setDraftCustomization",
      setHtmlDesignCustomizations: "setHtmlDesignCustomization",
    };

    Object.entries(thunkReplacements).forEach(([oldName, newName]) => {
      if (content.includes(oldName)) {
        content = content.replace(new RegExp(`\\b${oldName}\\b`, "g"), newName);
        modified = true;
      }
    });

    // Fix specific function call patterns that need payloads
    const functionCallFixes = [
      // Fix payload structure for customization functions
      {
        pattern: /dispatch\(setDraftCustomization\(\{ \[([^\]]+)\]: ([^}]+) \}\)\)/g,
        replacement: "dispatch(setDraftCustomization({ field: $1, value: $2 }))",
      },
      {
        pattern: /dispatch\(setHtmlDesignCustomization\(\{ \[([^\]]+)\]: ([^}]+) \}\)\)/g,
        replacement: "dispatch(setHtmlDesignCustomization({ field: $1, value: $2 }))",
      },
      // Fix null values to empty strings for string parameters
      {
        pattern: /dispatch\(setSelectedPastEmail\(null\)\)/g,
        replacement: 'dispatch(setSelectedPastEmail(""))',
      },
      // Fix view mode parameter
      {
        pattern: /"Raw HTML" \| "Preview"/g,
        replacement: '"Form" | "Preview"',
      },
    ];

    functionCallFixes.forEach((fix) => {
      if (fix.pattern.test(content)) {
        content = content.replace(fix.pattern, fix.replacement);
        modified = true;
      }
    });

    if (modified) {
      await fs.promises.writeFile(filePath, content);
    }
  } catch (error) {
    console.error(`Error fixing imports in ${filePath}:`, error);
  }
}

async function copyDirectory(src: string, dest: string, featureName?: string): Promise<void> {
  await fs.promises.mkdir(dest, { recursive: true });
  const entries = await fs.promises.readdir(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      await copyDirectory(srcPath, destPath, featureName);
    } else {
      await fs.promises.copyFile(srcPath, destPath);

      // Fix import paths for TypeScript files if we have a feature name
      if (featureName) {
        await fixImportPaths(destPath, featureName);
      }
    }
  }
}

async function copyFile(src: string, dest: string): Promise<void> {
  const destDir = path.dirname(dest);
  await fs.promises.mkdir(destDir, { recursive: true });
  await fs.promises.copyFile(src, dest);
}

async function parseInstallationFile(featurePath: string): Promise<{
  packages: string[];
  apiRoutes: { from: string; to: string }[];
  storeIntegration: string | null;
}> {
  const installationPath = path.join(featurePath, "INSTALLATION.md");

  if (!fs.existsSync(installationPath)) {
    return { packages: [], apiRoutes: [], storeIntegration: null };
  }

  const content = await fs.promises.readFile(installationPath, "utf-8");

  // Extract packages from JSON block
  const packagesMatch = content.match(/```json[\s\S]*?\{[\s\S]*?"dependencies":\s*\{([^}]+)\}/);
  const packages: string[] = [];

  if (packagesMatch) {
    const depsContent = packagesMatch[1];
    const packageMatches = depsContent.match(/"([^"]+)":\s*"[^"]+"/g);
    if (packageMatches) {
      packages.push(
        ...packageMatches
          .map((match) => {
            const name = match.match(/"([^"]+)":/)?.[1];
            return name || "";
          })
          .filter(Boolean)
      );
    }
  }

  // Extract API routes
  const apiRoutes: { from: string; to: string }[] = [];
  const routeMatches = content.match(/- From: `([^`]+)`\s*\n\s*- To: `([^`]+)`/g);

  if (routeMatches) {
    routeMatches.forEach((match) => {
      const fromMatch = match.match(/From: `([^`]+)`/);
      const toMatch = match.match(/To: `([^`]+)`/);
      if (fromMatch && toMatch) {
        apiRoutes.push({ from: fromMatch[1], to: toMatch[1] });
      }
    });
  }

  // Extract store integration info
  const storeMatch = content.match(/import\s+(\w+)\s+from\s+['"']([^'"']+)['"'];/);
  const storeIntegration = storeMatch ? storeMatch[0] : null;

  return { packages, apiRoutes, storeIntegration };
}

async function checkAlreadyInstalled(packages: string[]): Promise<string[]> {
  try {
    const packageJsonPath = path.join(process.cwd(), "package.json");
    if (!fs.existsSync(packageJsonPath)) return [];

    const packageJson = JSON.parse(await fs.promises.readFile(packageJsonPath, "utf-8"));
    const installedDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };

    return packages.filter((pkg) => pkg in installedDeps);
  } catch {
    return [];
  }
}

async function installPackages(packages: string[], sendUpdate: (update: ProgressUpdate) => void): Promise<{ success: boolean; output: string; installed: string[] }> {
  if (packages.length === 0) {
    return { success: true, output: "No packages to install", installed: [] };
  }

  const alreadyInstalled = await checkAlreadyInstalled(packages);
  const toInstall = packages.filter((pkg) => !alreadyInstalled.includes(pkg));

  if (alreadyInstalled.length > 0) {
    sendUpdate({
      step: "packages",
      status: "skipped",
      details: `Packages already installed: ${alreadyInstalled.join(", ")}`,
      data: { skipped: alreadyInstalled },
    });
  }

  if (toInstall.length === 0) {
    return { success: true, output: "All packages already installed", installed: alreadyInstalled };
  }

  sendUpdate({
    step: "packages",
    status: "started",
    details: `Installing packages: ${toInstall.join(", ")}`,
    data: { installing: toInstall },
  });

  try {
    const packageList = toInstall.join(" ");
    const { stdout, stderr } = await execAsync(`npm install ${packageList}`, {
      cwd: process.cwd(),
      timeout: 120000, // 2 minutes timeout
    });

    sendUpdate({
      step: "packages",
      status: "completed",
      details: `Successfully installed ${toInstall.length} packages`,
      data: { installed: toInstall },
    });

    return { success: true, output: stdout + stderr, installed: [...alreadyInstalled, ...toInstall] };
  } catch (error: any) {
    sendUpdate({
      step: "packages",
      status: "error",
      details: `Failed to install packages: ${error.message}`,
      data: { error: error.message },
    });
    return { success: false, output: error.message, installed: alreadyInstalled };
  }
}

async function createPageFromFeature(featureName: string, targetRoute: string, sendUpdate: (update: ProgressUpdate) => void): Promise<boolean> {
  const routeParts = targetRoute.split("/").filter((part) => part !== "");
  const targetPagePath = path.join(process.cwd(), "app", ...routeParts, "page.tsx");

  if (fs.existsSync(targetPagePath)) {
    sendUpdate({
      step: "page",
      status: "skipped",
      details: `Page already exists at ${targetRoute}`,
      data: { route: targetRoute },
    });
    return true;
  }

  sendUpdate({
    step: "page",
    status: "started",
    details: `Creating page at ${targetRoute}`,
    data: { route: targetRoute },
  });

  try {
    const featuresPath = path.join(process.cwd(), "lib", "features", featureName);
    const pageSourcePath = path.join(featuresPath, "page", "page.tsx");

    if (fs.existsSync(pageSourcePath)) {
      await copyFile(pageSourcePath, targetPagePath);
      sendUpdate({
        step: "page",
        status: "completed",
        details: `Page created at ${targetRoute}`,
        data: { route: targetRoute, path: targetPagePath },
      });
      return true;
    } else {
      sendUpdate({
        step: "page",
        status: "error",
        details: `Source page not found for ${featureName}`,
        data: { featureName },
      });
      return false;
    }
  } catch (error: any) {
    sendUpdate({
      step: "page",
      status: "error",
      details: `Error creating page: ${error.message}`,
      data: { error: error.message },
    });
    return false;
  }
}

async function copyApiRoutes(featureName: string, apiRoutes: { from: string; to: string }[], sendUpdate: (update: ProgressUpdate) => void): Promise<string[]> {
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

async function updateStore(featureName: string, storeIntegration: string | null, sendUpdate: (update: ProgressUpdate) => void): Promise<boolean> {
  const storePath = path.join(process.cwd(), "store", "store.ts");

  // Check if store already has this feature configured
  if (fs.existsSync(storePath)) {
    const storeContent = await fs.promises.readFile(storePath, "utf-8");

    // Check for different reducer names based on feature
    const reducerNames: Record<string, string> = {
      ai_messenger: "aiMessenger",
      ai_emailer: "aiEmailer",
      image_analyzer: "imageAnalyzer",
      decision_helper: "decisionHelper",
    };

    const reducerName = reducerNames[featureName];
    if (reducerName && storeContent.includes(`${reducerName}: ${reducerName}Reducer`)) {
      sendUpdate({
        step: "store",
        status: "skipped",
        details: `Store already configured with ${featureName} reducer`,
        data: { existing: true },
      });
      return true;
    }
  }

  sendUpdate({
    step: "store",
    status: "started",
    details: "Configuring Redux store",
    data: { featureName },
  });

  try {
    if (!fs.existsSync(storePath)) {
      // Create new store file with the feature reducer
      const reducerNames: Record<string, string> = {
        ai_messenger: "aiMessenger",
        ai_emailer: "aiEmailer",
        image_analyzer: "imageAnalyzer",
        decision_helper: "decisionHelper",
      };

      // Map feature names to slice file names (camelCase)
      const sliceFileNames: Record<string, string> = {
        ai_messenger: "aiMessengerSlice",
        ai_emailer: "aiEmailerSlice",
        image_analyzer: "imageAnalyzerSlice",
        decision_helper: "decisionHelperSlice",
      };

      const reducerName = reducerNames[featureName] || featureName;
      const sliceFileName = sliceFileNames[featureName] || `${featureName}Slice`;

      const storeContent = `import { configureStore } from '@reduxjs/toolkit';
import ${reducerName}Reducer from '@/lib/features/${featureName}/store/${sliceFileName}';

export const store = configureStore({
  reducer: {
    ${reducerName}: ${reducerName}Reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
`;

      await fs.promises.mkdir(path.dirname(storePath), { recursive: true });
      await fs.promises.writeFile(storePath, storeContent);
    } else {
      // Update existing store file
      let storeContent = await fs.promises.readFile(storePath, "utf-8");

      const reducerNames: Record<string, string> = {
        ai_messenger: "aiMessenger",
        ai_emailer: "aiEmailer",
        image_analyzer: "imageAnalyzer",
        decision_helper: "decisionHelper",
      };

      // Map feature names to slice file names (camelCase)
      const sliceFileNames: Record<string, string> = {
        ai_messenger: "aiMessengerSlice",
        ai_emailer: "aiEmailerSlice",
        image_analyzer: "imageAnalyzerSlice",
        decision_helper: "decisionHelperSlice",
      };

      const reducerName = reducerNames[featureName] || featureName;
      const sliceFileName = sliceFileNames[featureName] || `${featureName}Slice`;

      const importLine = `import ${reducerName}Reducer from '@/lib/features/${featureName}/store/${sliceFileName}';`;

      // Add import if not present
      if (!storeContent.includes(importLine)) {
        const configureStoreImportMatch = storeContent.match(/(import.*configureStore.*;\n)/);
        if (configureStoreImportMatch) {
          storeContent = storeContent.replace(configureStoreImportMatch[1], configureStoreImportMatch[1] + importLine + "\n");
        }
      }

      // Add reducer if not present
      if (!storeContent.includes(`${reducerName}: ${reducerName}Reducer`)) {
        const reducerMatch = storeContent.match(/(reducer:\s*\{[\s\S]*?)\}/);
        if (reducerMatch) {
          const beforeClosing = reducerMatch[1];
          const newReducerContent = beforeClosing.includes("// Add your reducers here") ? beforeClosing.replace("// Add your reducers here", `${reducerName}: ${reducerName}Reducer,`) : beforeClosing + `\n    ${reducerName}: ${reducerName}Reducer,`;
          storeContent = storeContent.replace(reducerMatch[1] + "}", newReducerContent + "\n  }");
        }
      }

      await fs.promises.writeFile(storePath, storeContent);
    }

    sendUpdate({
      step: "store",
      status: "completed",
      details: "Redux store configured with feature reducer",
      data: { configured: true },
    });

    return true;
  } catch (error: any) {
    sendUpdate({
      step: "store",
      status: "error",
      details: `Error updating store: ${error.message}`,
      data: { error: error.message },
    });
    return false;
  }
}

async function copyGlobalStoreSlices(featureName: string, sendUpdate: (update: ProgressUpdate) => void): Promise<boolean> {
  // For ai_emailer, copy from the feature's local store instead of global store
  if (featureName === "ai_emailer") {
    const websiteFeatureStorePath = path.join(process.cwd(), "..", "website", "lib", "features", featureName, "store");
    const templateFeatureStorePath = path.join(process.cwd(), "lib", "features", featureName, "store");
    const sliceFileName = "aiEmailerSlice.ts";

    const sourceSlicePath = path.join(websiteFeatureStorePath, sliceFileName);
    const targetSlicePath = path.join(templateFeatureStorePath, sliceFileName);

    if (!fs.existsSync(sourceSlicePath)) {
      sendUpdate({
        step: "store_slice",
        status: "skipped",
        details: `Feature store slice not found for ${featureName}`,
        data: { featureName },
      });
      return true;
    }

    if (fs.existsSync(targetSlicePath)) {
      sendUpdate({
        step: "store_slice",
        status: "skipped",
        details: `Feature store slice already exists for ${featureName}`,
        data: { featureName },
      });
      return true;
    }

    sendUpdate({
      step: "store_slice",
      status: "started",
      details: `Copying feature store slice for ${featureName}`,
      data: { featureName, sliceFileName },
    });

    try {
      await copyFile(sourceSlicePath, targetSlicePath);

      sendUpdate({
        step: "store_slice",
        status: "completed",
        details: `Feature store slice copied for ${featureName}`,
        data: { featureName, path: `lib/features/${featureName}/store/${sliceFileName}` },
      });

      return true;
    } catch (error: any) {
      sendUpdate({
        step: "store_slice",
        status: "error",
        details: `Error copying feature store slice: ${error.message}`,
        data: { error: error.message },
      });
      return false;
    }
  }

  // For other features, use the original global store logic
  const websiteStorePath = path.join(process.cwd(), "..", "website", "store");
  const templateStorePath = path.join(process.cwd(), "store");

  // Map feature names to their store slice files
  const storeSliceMap: Record<string, string> = {
    ai_messenger: "aiMessengerSlice.ts",
    image_analyzer: "imageAnalyzerSlice.ts",
    decision_helper: "decisionHelperSlice.ts",
  };

  const sliceFileName = storeSliceMap[featureName];
  if (!sliceFileName) {
    return true; // No global slice needed for this feature
  }

  const sourceSlicePath = path.join(websiteStorePath, sliceFileName);
  const targetSlicePath = path.join(templateStorePath, sliceFileName);

  if (!fs.existsSync(sourceSlicePath)) {
    sendUpdate({
      step: "store_slice",
      status: "skipped",
      details: `Global store slice not found for ${featureName}`,
      data: { featureName },
    });
    return true;
  }

  if (fs.existsSync(targetSlicePath)) {
    sendUpdate({
      step: "store_slice",
      status: "skipped",
      details: `Global store slice already exists for ${featureName}`,
      data: { featureName },
    });
    return true;
  }

  sendUpdate({
    step: "store_slice",
    status: "started",
    details: `Copying global store slice for ${featureName}`,
    data: { featureName, sliceFileName },
  });

  try {
    await copyFile(sourceSlicePath, targetSlicePath);

    sendUpdate({
      step: "store_slice",
      status: "completed",
      details: `Global store slice copied for ${featureName}`,
      data: { featureName, path: `store/${sliceFileName}` },
    });

    return true;
  } catch (error: any) {
    sendUpdate({
      step: "store_slice",
      status: "error",
      details: `Error copying store slice: ${error.message}`,
      data: { error: error.message },
    });
    return false;
  }
}

async function copyServerAndServices(sendUpdate: (update: ProgressUpdate) => void): Promise<{ serverFiles: string[]; serviceFiles: string[] }> {
  const adminBasePath = path.join(process.cwd(), "..", "website", "lib");
  const templateBasePath = path.join(process.cwd(), "lib");

  const serverFiles: string[] = [];
  const serviceFiles: string[] = [];

  sendUpdate({
    step: "server_services",
    status: "started",
    details: "Copying server and services files",
    data: {},
  });

  try {
    // Copy server files
    const adminServerPath = path.join(adminBasePath, "server");
    const templateServerPath = path.join(templateBasePath, "server");

    if (fs.existsSync(adminServerPath)) {
      const serverEntries = await fs.promises.readdir(adminServerPath, { withFileTypes: true });

      for (const entry of serverEntries) {
        if (entry.isFile()) {
          const srcPath = path.join(adminServerPath, entry.name);
          const destPath = path.join(templateServerPath, entry.name);

          if (!fs.existsSync(destPath)) {
            await copyFile(srcPath, destPath);
            serverFiles.push(`lib/server/${entry.name}`);
          }
        }
      }
    }

    // Copy services files
    const adminServicesPath = path.join(adminBasePath, "services");
    const templateServicesPath = path.join(templateBasePath, "services");

    if (fs.existsSync(adminServicesPath)) {
      const serviceEntries = await fs.promises.readdir(adminServicesPath, { withFileTypes: true });

      for (const entry of serviceEntries) {
        if (entry.isFile()) {
          const srcPath = path.join(adminServicesPath, entry.name);
          const destPath = path.join(templateServicesPath, entry.name);

          if (!fs.existsSync(destPath)) {
            await copyFile(srcPath, destPath);
            serviceFiles.push(`lib/services/${entry.name}`);
          }
        }
      }
    }

    const totalCopied = serverFiles.length + serviceFiles.length;
    const details = totalCopied > 0 ? `Copied ${serverFiles.length} server files and ${serviceFiles.length} service files` : "All server and service files already exist";

    sendUpdate({
      step: "server_services",
      status: "completed",
      details,
      data: { serverFiles, serviceFiles, totalCopied },
    });

    return { serverFiles, serviceFiles };
  } catch (error: any) {
    sendUpdate({
      step: "server_services",
      status: "error",
      details: `Error copying server/services: ${error.message}`,
      data: { error: error.message },
    });
    return { serverFiles: [], serviceFiles: [] };
  }
}

interface RouteStructure {
  path: string;
  label: string;
  features: { name: string; route: string; label: string }[];
  children: { [key: string]: RouteStructure };
}

function buildRouteStructure(routeConfigs: Record<string, string>): { [key: string]: RouteStructure } {
  const structure: { [key: string]: RouteStructure } = {};

  Object.entries(routeConfigs).forEach(([featureName, route]) => {
    const parts = route.split("/").filter((part) => part !== "");
    if (parts.length === 0) return;

    const topLevel = parts[0];
    const featureLabel = featureName.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

    // Helper function to convert kebab-case to proper labels
    const formatLabel = (text: string) => {
      return text
        .split(/[-_\s]+/)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(" ");
    };

    // Initialize top level if it doesn't exist
    if (!structure[topLevel]) {
      structure[topLevel] = {
        path: `/${topLevel}`,
        label: formatLabel(topLevel),
        features: [],
        children: {},
      };
    }

    if (parts.length === 2) {
      // Direct feature under top level (e.g., /tools/ai-messenger)
      structure[topLevel].features.push({
        name: featureName,
        route: route,
        label: featureLabel,
      });
    } else if (parts.length > 2) {
      // Nested structure (e.g., /tools/ai/ai-messenger)
      let current = structure[topLevel];

      for (let i = 1; i < parts.length - 1; i++) {
        const part = parts[i];
        const partPath = "/" + parts.slice(0, i + 1).join("/");

        if (!current.children[part]) {
          current.children[part] = {
            path: partPath,
            label: formatLabel(part),
            features: [],
            children: {},
          };
        }
        current = current.children[part];
      }

      // Add the feature to the deepest level
      current.features.push({
        name: featureName,
        route: route,
        label: featureLabel,
      });
    }
  });

  return structure;
}

async function createIndexPage(structure: RouteStructure, sendUpdate: (update: ProgressUpdate) => void): Promise<boolean> {
  const routeParts = structure.path.split("/").filter((part) => part !== "");
  const indexPagePath = path.join(process.cwd(), "app", ...routeParts, "page.tsx");

  if (fs.existsSync(indexPagePath)) {
    sendUpdate({
      step: "index_pages",
      status: "skipped",
      details: `Index page already exists at ${structure.path}`,
      data: { path: structure.path },
    });
    return true;
  }

  sendUpdate({
    step: "index_pages",
    status: "started",
    details: `Creating index page at ${structure.path}`,
    data: { path: structure.path },
  });

  try {
    // Convert kebab-case to PascalCase for function name
    const functionName =
      structure.label
        .split(/[-\s]+/) // Split on hyphens and spaces
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join("") + "Page";

    const pageContent = `'use client';

import Link from 'next/link';
import styles from './page.module.css';

export default function ${functionName}() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>${structure.label}</h1>
        <p className={styles.subtitle}>Explore the available ${structure.label.toLowerCase()} and features</p>

        <div className={styles.grid}>
${Object.values(structure.children)
  .map(
    (child) => `          <Link href="${child.path}" className={styles.categoryCard}>
            <h2 className={styles.categoryTitle}>${child.label}</h2>
            <p className={styles.categoryDescription}>
              ${child.features.length} feature${child.features.length !== 1 ? "s" : ""} available
            </p>
            <div className={styles.arrow}>→</div>
          </Link>`
  )
  .join("\n")}

${structure.features
  .map(
    (feature) => `          <Link href="${feature.route}" className={styles.featureCard}>
            <h3 className={styles.featureTitle}>${feature.label}</h3>
            <div className={styles.arrow}>→</div>
          </Link>`
  )
  .join("\n")}
        </div>
      </div>
    </div>
  );
}
`;

    await fs.promises.mkdir(path.dirname(indexPagePath), { recursive: true });
    await fs.promises.writeFile(indexPagePath, pageContent);

    // Create accompanying CSS file
    const cssPath = path.join(process.cwd(), "app", ...routeParts, "page.module.css");
    const cssContent = `.container {
  min-height: 100vh;
  padding: 2rem;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.content {
  max-width: 1200px;
  margin: 0 auto;
}

.title {
  font-size: 3rem;
  font-weight: bold;
  text-align: center;
  margin-bottom: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  text-align: center;
  font-size: 1.2rem;
  color: #666;
  margin-bottom: 3rem;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.categoryCard {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  text-decoration: none;
  color: inherit;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  border: 2px solid transparent;
  position: relative;
  overflow: hidden;
}

.categoryCard::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
}

.categoryCard:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
  border-color: #667eea;
}

.featureCard {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  text-decoration: none;
  color: inherit;
  box-shadow: 0 2px 15px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  border: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.featureCard:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 25px rgba(0, 0, 0, 0.12);
  border-color: #667eea;
}

.categoryTitle {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #2d3748;
}

.categoryDescription {
  color: #718096;
  font-size: 0.95rem;
  margin-bottom: 1rem;
}

.featureTitle {
  font-size: 1.1rem;
  font-weight: 500;
  color: #2d3748;
  margin: 0;
}

.arrow {
  font-size: 1.5rem;
  color: #667eea;
  transition: transform 0.3s ease;
}

.categoryCard:hover .arrow,
.featureCard:hover .arrow {
  transform: translateX(4px);
}

@media (max-width: 768px) {
  .title {
    font-size: 2rem;
  }
  
  .grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .categoryCard,
  .featureCard {
    padding: 1.5rem;
  }
}
`;

    await fs.promises.writeFile(cssPath, cssContent);

    sendUpdate({
      step: "index_pages",
      status: "completed",
      details: `Index page created at ${structure.path}`,
      data: { path: structure.path, created: indexPagePath },
    });

    return true;
  } catch (error: any) {
    sendUpdate({
      step: "index_pages",
      status: "error",
      details: `Error creating index page: ${error.message}`,
      data: { error: error.message },
    });
    return false;
  }
}

async function createHierarchicalPages(routeConfigs: Record<string, string>, sendUpdate: (update: ProgressUpdate) => void): Promise<{ created: string[]; skipped: string[] }> {
  const structure = buildRouteStructure(routeConfigs);
  const created: string[] = [];
  const skipped: string[] = [];

  sendUpdate({
    step: "index_pages",
    status: "started",
    details: `Creating hierarchical index pages for ${Object.keys(structure).length} top-level sections`,
    data: { structure: Object.keys(structure) },
  });

  // Create index pages for each level
  async function createPagesRecursively(struct: RouteStructure) {
    const result = await createIndexPage(struct, sendUpdate);
    if (result) {
      created.push(struct.path);
    } else {
      skipped.push(struct.path);
    }

    // Recursively create pages for children
    for (const child of Object.values(struct.children)) {
      await createPagesRecursively(child);
    }
  }

  for (const topLevel of Object.values(structure)) {
    await createPagesRecursively(topLevel);
  }

  return { created, skipped };
}

async function updateHierarchicalNavigation(routeConfigs: Record<string, string>, sendUpdate: (update: ProgressUpdate) => void): Promise<boolean> {
  const structure = buildRouteStructure(routeConfigs);
  const topLevelRoutes = Object.values(structure).map((s) => ({ path: s.path, label: s.label }));

  sendUpdate({
    step: "navigation",
    status: "started",
    details: "Updating navigation with hierarchical structure",
    data: { topLevelRoutes },
  });

  try {
    const navigationPath = path.join(process.cwd(), "app", "components", "Navigation.tsx");

    if (!fs.existsSync(navigationPath)) {
      const basicNavContent = `'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Navigation.module.css';

const Navigation = () => {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/download', label: 'Integrate' },
${topLevelRoutes.map((route) => `    { href: '${route.path}', label: '${route.label}' },`).join("\n")}
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
                className={\`\${styles.navLink} \${pathname.startsWith(item.href) && item.href !== '/' ? styles.active : pathname === item.href ? styles.active : ''}\`}
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
    } else {
      let navContent = await fs.promises.readFile(navigationPath, "utf-8");

      const navItemsStart = navContent.indexOf("const navItems = [");
      const navItemsEnd = navContent.indexOf("];", navItemsStart) + 2;

      if (navItemsStart !== -1 && navItemsEnd !== -1) {
        const beforeNavItems = navContent.substring(0, navItemsStart);
        const afterNavItems = navContent.substring(navItemsEnd);

        // Extract existing navigation items from the current file
        const existingNavItemsText = navContent.substring(navItemsStart, navItemsEnd);
        const existingItemMatches = existingNavItemsText.match(/\{\s*href:\s*['"][^'"]+['"]\s*,\s*label:\s*['"][^'"]+['"]\s*\}/g);
        const existingItems = existingItemMatches || ["{ href: '/', label: 'Home' }", "{ href: '/download', label: 'Integrate' }"];

        const newItems = topLevelRoutes.map((route) => `{ href: '${route.path}', label: '${route.label}' }`);

        // Merge existing and new items, avoiding duplicates
        const allItemsSet = new Set([...existingItems, ...newItems]);
        const allItems = Array.from(allItemsSet);

        const newNavItems = `const navItems = [
    ${allItems.join(",\n    ")}
  ];`;

        // Update the className logic for better path matching
        const updatedContent = beforeNavItems + newNavItems + afterNavItems;
        const improvedContent = updatedContent.replace(/className={\`\$\{styles\.navLink\}[^`]*\`}/, "className={`${styles.navLink} ${pathname.startsWith(item.href) && item.href !== '/' ? styles.active : pathname === item.href ? styles.active : ''}`}");

        await fs.promises.writeFile(navigationPath, improvedContent);
      }
    }

    sendUpdate({
      step: "navigation",
      status: "completed",
      details: `Navigation updated with ${topLevelRoutes.length} top-level sections`,
      data: { topLevelSections: topLevelRoutes },
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

export async function POST(request: NextRequest) {
  const { category, items, routeConfigs } = await request.json();

  if (!category || !items || !Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: "Invalid request data" }, { status: 400 });
  }

  const { stream, sendUpdate, close } = createProgressStream();

  // Start the integration process
  (async () => {
    try {
      sendUpdate({
        step: "initialization",
        status: "started",
        details: `Starting integration of ${items.length} ${category}`,
        data: { category, items },
      });

      const adminBasePath = path.join(process.cwd(), "..", "website", "lib");
      const templateBasePath = path.join(process.cwd(), "lib");

      // Track all completed operations for final summary
      const completedOperations: string[] = [];
      let totalPackagesInstalled = 0;
      let totalApiRoutes = 0;
      let totalPages = 0;
      let navigationUpdated = false;
      let storeConfigured = false;
      let serverServicesCopied = 0;
      let indexPagesCreated = 0;

      // Always copy server and services files first
      const { serverFiles, serviceFiles } = await copyServerAndServices(sendUpdate);
      serverServicesCopied = serverFiles.length + serviceFiles.length;
      if (serverServicesCopied > 0) {
        completedOperations.push(`${serverServicesCopied} server/service files`);
      }

      if (category === "features") {
        const adminFeaturesPath = path.join(adminBasePath, "features");
        const templateFeaturesPath = path.join(templateBasePath, "features");

        for (const item of items) {
          const srcPath = path.join(adminFeaturesPath, item);
          const destPath = path.join(templateFeaturesPath, item);

          if (!fs.existsSync(srcPath)) {
            sendUpdate({
              step: "feature_copy",
              status: "error",
              details: `Feature ${item} not found`,
              data: { item },
            });
            continue;
          }

          // Check if feature already exists
          if (fs.existsSync(destPath)) {
            sendUpdate({
              step: "feature_copy",
              status: "skipped",
              details: `Feature ${item} already exists`,
              data: { item },
            });
          } else {
            sendUpdate({
              step: "feature_copy",
              status: "started",
              details: `Copying feature ${item}`,
              data: { item },
            });

            await copyDirectory(srcPath, destPath, item);

            sendUpdate({
              step: "feature_copy",
              status: "completed",
              details: `Feature ${item} copied successfully`,
              data: { item, path: `lib/features/${item}/` },
            });

            completedOperations.push(`${item} feature`);
          }

          // Parse installation requirements
          const { packages, apiRoutes, storeIntegration } = await parseInstallationFile(destPath);

          // Copy global store slice if needed
          await copyGlobalStoreSlices(item, sendUpdate);

          // Install packages
          if (packages.length > 0) {
            const result = await installPackages(packages, sendUpdate);
            if (result.installed.length > 0) {
              totalPackagesInstalled += result.installed.length;
            }
          }

          // Copy API routes (both automatic detection and installation file routes)
          const copiedRoutes = await copyApiRoutes(item, apiRoutes, sendUpdate);
          totalApiRoutes += copiedRoutes.length;

          // Update store
          const storeResult = await updateStore(item, storeIntegration, sendUpdate);
          if (storeResult && !storeConfigured) {
            storeConfigured = true;
          }

          // Create page
          if (routeConfigs && routeConfigs[item]) {
            const pageCreated = await createPageFromFeature(item, routeConfigs[item], sendUpdate);
            if (pageCreated) {
              totalPages++;
            }
          }
        }

        // Create hierarchical index pages and update navigation if we have route configs
        if (routeConfigs && Object.keys(routeConfigs).length > 0) {
          const { created, skipped } = await createHierarchicalPages(routeConfigs, sendUpdate);
          indexPagesCreated = created.length;

          const navResult = await updateHierarchicalNavigation(routeConfigs, sendUpdate);
          if (navResult) {
            navigationUpdated = true;
          }
        }
      }

      // Build comprehensive success message
      const successParts: string[] = [];

      if (items.length > 0) {
        successParts.push(`${items.length} ${category}`);
      }

      if (totalPages > 0) {
        successParts.push(`${totalPages} working page${totalPages > 1 ? "s" : ""}`);
      }

      if (indexPagesCreated > 0) {
        successParts.push(`${indexPagesCreated} index page${indexPagesCreated > 1 ? "s" : ""}`);
      }

      if (totalPackagesInstalled > 0) {
        successParts.push(`${totalPackagesInstalled} package${totalPackagesInstalled > 1 ? "s" : ""}`);
      }

      if (totalApiRoutes > 0) {
        successParts.push(`${totalApiRoutes} API route${totalApiRoutes > 1 ? "s" : ""}`);
      }

      if (serverServicesCopied > 0) {
        successParts.push(`${serverServicesCopied} server/service file${serverServicesCopied > 1 ? "s" : ""}`);
      }

      const additionalFeatures: string[] = [];
      if (navigationUpdated) additionalFeatures.push("hierarchical navigation");
      if (storeConfigured) additionalFeatures.push("Redux store configuration");

      let finalMessage = `Successfully integrated ${successParts.join(", ")}`;
      if (additionalFeatures.length > 0) {
        finalMessage += ` with ${additionalFeatures.join(" and ")}`;
      }

      sendUpdate({
        step: "completion",
        status: "completed",
        details: finalMessage,
        data: {
          completed: true,
          summary: {
            features: items.length,
            packages: totalPackagesInstalled,
            apiRoutes: totalApiRoutes,
            pages: totalPages,
            indexPages: indexPagesCreated,
            serverServices: serverServicesCopied,
            navigationUpdated,
            storeConfigured,
          },
        },
      });
    } catch (error: any) {
      sendUpdate({
        step: "error",
        status: "error",
        details: `Integration failed: ${error.message}`,
        data: { error: error.message },
      });
    } finally {
      close();
    }
  })();

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
