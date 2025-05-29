import fs from "fs";
import path from "path";
import { copyFile } from "./fileUtils";
import type { ProgressUpdate } from "./progress";

export async function createNewStoreFile(sendUpdate: (update: ProgressUpdate) => void): Promise<void> {
  const storePath = path.join(process.cwd(), "store", "store.ts");

  sendUpdate({
    step: "store_creation",
    status: "started",
    details: "Creating baseline Redux store configuration",
    data: {},
  });

  const baselineStoreContent = `import { configureStore } from '@reduxjs/toolkit';

export const store = configureStore({
  reducer: {
    // Add your reducers here
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
`;

  try {
    await fs.promises.mkdir(path.dirname(storePath), { recursive: true });
    await fs.promises.writeFile(storePath, baselineStoreContent);

    sendUpdate({
      step: "store_creation",
      status: "completed",
      details: "Baseline Redux store created successfully",
      data: { path: "store/store.ts" },
    });
  } catch (error: any) {
    sendUpdate({
      step: "store_creation",
      status: "error",
      details: `Error creating baseline store: ${error.message}`,
      data: { error: error.message },
    });
    throw error;
  }
}

export async function updateStore(featureName: string, storeIntegration: string | null, sendUpdate: (update: ProgressUpdate) => void): Promise<boolean> {
  const storePath = path.join(process.cwd(), "store", "store.ts");

  // Check if store file exists and has content
  let storeContent = "";
  let needsBaselineCreation = false;

  if (fs.existsSync(storePath)) {
    storeContent = await fs.promises.readFile(storePath, "utf-8");
    // Check if file is effectively empty (only whitespace/newlines)
    if (storeContent.trim().length === 0) {
      needsBaselineCreation = true;
    }
  } else {
    needsBaselineCreation = true;
  }

  // Create baseline store if needed
  if (needsBaselineCreation) {
    await createNewStoreFile(sendUpdate);
    storeContent = await fs.promises.readFile(storePath, "utf-8");
  }

  // Check if store already has this feature configured
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

  sendUpdate({
    step: "store",
    status: "started",
    details: "Configuring Redux store with feature reducer",
    data: { featureName },
  });

  try {
    // Map feature names to slice file names (camelCase)
    const sliceFileNames: Record<string, string> = {
      ai_messenger: "aiMessengerSlice",
      ai_emailer: "aiEmailerSlice",
      image_analyzer: "imageAnalyzerSlice",
      decision_helper: "decisionHelperSlice",
    };

    const finalReducerName = reducerNames[featureName] || featureName;
    const sliceFileName = sliceFileNames[featureName] || `${featureName}Slice`;

    const importLine = `import ${finalReducerName}Reducer from '@/lib/features/${featureName}/store/${sliceFileName}';`;

    // Add import if not present
    if (!storeContent.includes(importLine)) {
      const configureStoreImportMatch = storeContent.match(/(import.*configureStore.*;\n)/);
      if (configureStoreImportMatch) {
        storeContent = storeContent.replace(configureStoreImportMatch[1], configureStoreImportMatch[1] + importLine + "\n");
      } else {
        // Fallback: add import after the first import or at the beginning
        const firstImportMatch = storeContent.match(/(import.*;\n)/);
        if (firstImportMatch) {
          storeContent = storeContent.replace(firstImportMatch[1], firstImportMatch[1] + importLine + "\n");
        } else {
          storeContent = importLine + "\n" + storeContent;
        }
      }
    }

    // Add reducer if not present
    if (!storeContent.includes(`${finalReducerName}: ${finalReducerName}Reducer`)) {
      const reducerMatch = storeContent.match(/(reducer:\s*\{[\s\S]*?)\}/);
      if (reducerMatch) {
        const beforeClosing = reducerMatch[1];
        let newReducerContent;

        if (beforeClosing.includes("// Add your reducers here")) {
          // Replace the comment with the actual reducer
          newReducerContent = beforeClosing.replace("// Add your reducers here", `${finalReducerName}: ${finalReducerName}Reducer,`);
        } else {
          // Add the reducer to existing reducers
          newReducerContent = beforeClosing + `\n    ${finalReducerName}: ${finalReducerName}Reducer,`;
        }

        storeContent = storeContent.replace(reducerMatch[1] + "}", newReducerContent + "\n  }");
      }
    }

    await fs.promises.writeFile(storePath, storeContent);

    sendUpdate({
      step: "store",
      status: "completed",
      details: `Redux store configured with ${featureName} reducer`,
      data: { configured: true, featureName },
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

export async function copyGlobalStoreSlices(featureName: string, sendUpdate: (update: ProgressUpdate) => void): Promise<boolean> {
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
