import fs from "fs";
import path from "path";
import type { ProgressUpdate } from "./progress";

export async function copyServerAndServices(sendUpdate: (update: ProgressUpdate) => void): Promise<{ serverFiles: string[]; serviceFiles: string[] }> {
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
    const adminServerPath = path.join(adminBasePath, "server");
    const templateServerPath = path.join(templateBasePath, "server");

    if (fs.existsSync(adminServerPath)) {
      const serverEntries = await fs.promises.readdir(adminServerPath, { withFileTypes: true });

      for (const entry of serverEntries) {
        if (entry.isFile()) {
          const srcPath = path.join(adminServerPath, entry.name);
          const destPath = path.join(templateServerPath, entry.name);

          if (!fs.existsSync(destPath)) {
            const destDir = path.dirname(destPath);
            await fs.promises.mkdir(destDir, { recursive: true });
            await fs.promises.copyFile(srcPath, destPath);
            serverFiles.push(`lib/server/${entry.name}`);
          }
        }
      }
    }

    const adminServicesPath = path.join(adminBasePath, "services");
    const templateServicesPath = path.join(templateBasePath, "services");

    if (fs.existsSync(adminServicesPath)) {
      const serviceEntries = await fs.promises.readdir(adminServicesPath, { withFileTypes: true });

      for (const entry of serviceEntries) {
        if (entry.isFile()) {
          const srcPath = path.join(adminServicesPath, entry.name);
          const destPath = path.join(templateServicesPath, entry.name);

          if (!fs.existsSync(destPath)) {
            const destDir = path.dirname(destPath);
            await fs.promises.mkdir(destDir, { recursive: true });
            await fs.promises.copyFile(srcPath, destPath);
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
