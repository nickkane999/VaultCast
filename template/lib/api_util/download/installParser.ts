import fs from "fs";
import path from "path";

export async function parseInstallationFile(featurePath: string): Promise<{
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
