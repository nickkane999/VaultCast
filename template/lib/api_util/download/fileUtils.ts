import fs from "fs";
import path from "path";

export async function copyFile(src: string, dest: string): Promise<void> {
  const destDir = path.dirname(dest);
  await fs.promises.mkdir(destDir, { recursive: true });
  await fs.promises.copyFile(src, dest);
}

export async function copyDirectory(src: string, dest: string, featureName?: string): Promise<void> {
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

export async function fixImportPaths(filePath: string, featureName: string): Promise<void> {
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
