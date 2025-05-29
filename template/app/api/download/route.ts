import { NextRequest, NextResponse } from "next/server";
import { createProgressStream } from "@/lib/api_util/download/progress";
import { copyDirectory } from "@/lib/api_util/download/fileUtils";
import { installPackages } from "@/lib/api_util/download/packageInstaller";
import { parseInstallationFile } from "@/lib/api_util/download/installParser";
import { copyApiRoutes } from "@/lib/api_util/download/apiRoutes";
import { updateStore, copyGlobalStoreSlices } from "@/lib/api_util/download/store";
import { createPageFromFeature } from "@/lib/api_util/download/pageCreator";
import { copyServerAndServices } from "@/lib/api_util/download/serverServices";
import { createHierarchicalPages, updateHierarchicalNavigation } from "@/lib/api_util/download/navigation";
import fs from "fs";
import path from "path";

export async function POST(request: NextRequest) {
  const { category, items, routeConfigs } = await request.json();

  if (!category || !items || !Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: "Invalid request data" }, { status: 400 });
  }

  const { stream, sendUpdate, close } = createProgressStream();

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

      const completedOperations: string[] = [];
      let totalPackagesInstalled = 0;
      let totalApiRoutes = 0;
      let totalPages = 0;
      let navigationUpdated = false;
      let storeConfigured = false;
      let serverServicesCopied = 0;
      let indexPagesCreated = 0;

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

          const { packages, apiRoutes, storeIntegration } = await parseInstallationFile(destPath);

          await copyGlobalStoreSlices(item, sendUpdate);

          if (packages.length > 0) {
            const result = await installPackages(packages, sendUpdate);
            if (result.installed.length > 0) {
              totalPackagesInstalled += result.installed.length;
            }
          }

          const copiedRoutes = await copyApiRoutes(item, apiRoutes, sendUpdate);
          totalApiRoutes += copiedRoutes.length;

          const storeResult = await updateStore(item, storeIntegration, sendUpdate);
          if (storeResult && !storeConfigured) {
            storeConfigured = true;
          }

          if (routeConfigs && routeConfigs[item]) {
            const pageCreated = await createPageFromFeature(item, routeConfigs[item], sendUpdate);
            if (pageCreated) {
              totalPages++;
            }
          }
        }

        if (routeConfigs && Object.keys(routeConfigs).length > 0) {
          const { created, skipped } = await createHierarchicalPages(routeConfigs, sendUpdate);
          indexPagesCreated = created.length;

          const navResult = await updateHierarchicalNavigation(routeConfigs, sendUpdate);
          if (navResult) {
            navigationUpdated = true;
          }
        }
      }

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
