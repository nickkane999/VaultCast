import fs from "fs";
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";
import type { ProgressUpdate } from "./progress";

const execAsync = promisify(exec);

export async function checkAlreadyInstalled(packages: string[]): Promise<string[]> {
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

export async function installPackages(packages: string[], sendUpdate: (update: ProgressUpdate) => void): Promise<{ success: boolean; output: string; installed: string[] }> {
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
