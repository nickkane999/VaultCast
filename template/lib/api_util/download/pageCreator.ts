import fs from "fs";
import path from "path";
import type { ProgressUpdate } from "./progress";

export async function createPageFromFeature(featureName: string, targetRoute: string, sendUpdate: (update: ProgressUpdate) => void): Promise<boolean> {
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
      const destDir = path.dirname(targetPagePath);
      await fs.promises.mkdir(destDir, { recursive: true });
      await fs.promises.copyFile(pageSourcePath, targetPagePath);

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
