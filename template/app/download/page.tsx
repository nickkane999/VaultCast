"use client";

import { useState } from "react";
import styles from "./download.module.css";

interface DownloadItem {
  name: string;
  description: string;
  type: "component" | "feature";
  hasPage?: boolean;
}

interface IntegrationResult {
  success: boolean;
  message: string;
  copiedFiles: string[];
  pageRoute?: string;
  navigationUpdated?: boolean;
  errors?: string[];
}

const components: DownloadItem[] = [
  { name: "MediaDisplay.tsx", description: "Component for displaying media content", type: "component" },
  { name: "VideoPlayer.tsx", description: "Advanced video player component", type: "component" },
  { name: "IsolatedTextField.tsx", description: "Optimized text field component", type: "component" },
  { name: "CompletionDialog.tsx", description: "Dialog component for completion states", type: "component" },
  { name: "TrailerButton.tsx", description: "Button component for trailers", type: "component" },
  { name: "VideoPlayerById.tsx", description: "Video player with ID-based loading", type: "component" },
  { name: "Navigation.tsx", description: "Navigation component with styling", type: "component" },
];

const features: DownloadItem[] = [
  { name: "videos", description: "Video management and processing features", type: "feature", hasPage: true },
  { name: "image_analyzer", description: "AI-powered image analysis tools", type: "feature", hasPage: true },
  { name: "decision_helper", description: "Decision-making assistance utilities", type: "feature", hasPage: true },
  { name: "ai_messenger", description: "Complete AI messaging system with client, store, and API routes", type: "feature", hasPage: true },
  { name: "ai_emailer", description: "AI-powered email automation", type: "feature", hasPage: true },
  { name: "admin", description: "Administrative tools and interfaces", type: "feature", hasPage: true },
];

export default function DownloadPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [isIntegrating, setIsIntegrating] = useState(false);
  const [integrationResult, setIntegrationResult] = useState<IntegrationResult | null>(null);
  const [routeConfigs, setRouteConfigs] = useState<Record<string, string>>({});

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setSelectedItems(new Set());
    setIntegrationResult(null);
    setRouteConfigs({});
  };

  const handleItemToggle = (itemName: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemName)) {
      newSelected.delete(itemName);
      // Remove route config when item is deselected
      const newRouteConfigs = { ...routeConfigs };
      delete newRouteConfigs[itemName];
      setRouteConfigs(newRouteConfigs);
    } else {
      newSelected.add(itemName);
      // Set default route for features with pages
      if (selectedCategory === "features") {
        const feature = features.find((f) => f.name === itemName);
        if (feature?.hasPage) {
          setRouteConfigs((prev) => ({
            ...prev,
            [itemName]: `/tools/${itemName.replace("_", "-")}`,
          }));
        }
      }
    }
    setSelectedItems(newSelected);
  };

  const handleRouteChange = (itemName: string, route: string) => {
    setRouteConfigs((prev) => ({
      ...prev,
      [itemName]: route,
    }));
  };

  const handleSelectAll = () => {
    const currentItems = selectedCategory === "components" ? components : features;
    const allNames = currentItems.map((item) => item.name);
    setSelectedItems(new Set(allNames));

    // Set default routes for all features with pages
    if (selectedCategory === "features") {
      const newRouteConfigs: Record<string, string> = {};
      features.forEach((feature) => {
        if (feature.hasPage) {
          newRouteConfigs[feature.name] = `/tools/${feature.name.replace("_", "-")}`;
        }
      });
      setRouteConfigs(newRouteConfigs);
    }
  };

  const handleDeselectAll = () => {
    setSelectedItems(new Set());
    setRouteConfigs({});
  };

  const handleIntegrate = async () => {
    if (selectedItems.size === 0) return;

    setIsIntegrating(true);
    setIntegrationResult(null);

    try {
      const response = await fetch("/api/download", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          category: selectedCategory,
          items: Array.from(selectedItems),
          routeConfigs: selectedCategory === "features" ? routeConfigs : undefined,
        }),
      });

      const result = await response.json();
      setIntegrationResult(result);

      if (result.success) {
        setSelectedItems(new Set());
        setRouteConfigs({});
      }
    } catch (error) {
      console.error("Integration error:", error);
      setIntegrationResult({
        success: false,
        message: "Integration failed. Please try again.",
        copiedFiles: [],
        errors: ["Network error or server unavailable"],
      });
    } finally {
      setIsIntegrating(false);
    }
  };

  const getCurrentItems = () => {
    return selectedCategory === "components" ? components : features;
  };

  const isRouteValid = (route: string) => {
    return route.startsWith("/") && route.length > 1 && /^\/[a-zA-Z0-9\-_\/]+$/.test(route);
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>Integrate VaultCast Resources</h1>
        <p className={styles.subtitle}>Choose components and features to integrate directly into your project structure</p>

        <div className={styles.categorySelector}>
          <label htmlFor="category" className={styles.label}>
            Select Category:
          </label>
          <select id="category" value={selectedCategory} onChange={(e) => handleCategoryChange(e.target.value)} className={styles.dropdown}>
            <option value="">Choose a category...</option>
            <option value="components">Components</option>
            <option value="features">Features</option>
            <option value="configuration">Configuration</option>
          </select>
        </div>

        {integrationResult && (
          <div className={`${styles.resultMessage} ${integrationResult.success ? styles.success : styles.error}`}>
            <h3>{integrationResult.success ? "✅ Success!" : "❌ Error"}</h3>
            <p>{integrationResult.message}</p>
            {integrationResult.pageRoute && (
              <p className={styles.routeInfo}>
                📄 Page created at: <strong>{integrationResult.pageRoute}</strong>
              </p>
            )}
            {integrationResult.navigationUpdated && <p className={styles.navInfo}>🧭 Navigation automatically updated with new link</p>}
            {integrationResult.copiedFiles.length > 0 && (
              <div className={styles.copiedFiles}>
                <h4>Integrated files:</h4>
                <ul>
                  {integrationResult.copiedFiles.map((file) => (
                    <li key={file}>{file}</li>
                  ))}
                </ul>
              </div>
            )}
            {integrationResult.errors && integrationResult.errors.length > 0 && (
              <div className={styles.errorList}>
                <h4>Errors:</h4>
                <ul>
                  {integrationResult.errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {selectedCategory === "configuration" && (
          <div className={styles.configurationPlaceholder}>
            <h2>Configuration</h2>
            <p>Configuration options coming soon! This section will contain setup files and configuration templates.</p>
          </div>
        )}

        {selectedCategory && selectedCategory !== "configuration" && (
          <div className={styles.itemsSection}>
            <div className={styles.selectionControls}>
              <button onClick={handleSelectAll} className={styles.controlButton}>
                Select All
              </button>
              <button onClick={handleDeselectAll} className={styles.controlButton}>
                Deselect All
              </button>
              <span className={styles.selectedCount}>
                {selectedItems.size} of {getCurrentItems().length} selected
              </span>
            </div>

            <div className={styles.itemsList}>
              {getCurrentItems().map((item) => (
                <div key={item.name} className={styles.item}>
                  <label className={styles.itemLabel}>
                    <input type="checkbox" checked={selectedItems.has(item.name)} onChange={() => handleItemToggle(item.name)} className={styles.checkbox} />
                    <div className={styles.itemInfo}>
                      <h3 className={styles.itemName}>{item.name}</h3>
                      <p className={styles.itemDescription}>{item.description}</p>
                      {item.hasPage && selectedItems.has(item.name) && (
                        <div className={styles.routeConfig}>
                          <label htmlFor={`route-${item.name}`} className={styles.routeLabel}>
                            Page Route:
                          </label>
                          <input
                            id={`route-${item.name}`}
                            type="text"
                            value={routeConfigs[item.name] || ""}
                            onChange={(e) => handleRouteChange(item.name, e.target.value)}
                            placeholder="/tools/my-feature"
                            className={`${styles.routeInput} ${routeConfigs[item.name] && !isRouteValid(routeConfigs[item.name]) ? styles.routeInputError : ""}`}
                          />
                          <small className={styles.routeHelp}>Where should this feature's page be accessible? (e.g., /tools/ai-chat)</small>
                        </div>
                      )}
                    </div>
                  </label>
                </div>
              ))}
            </div>

            <div className={styles.downloadSection}>
              <button onClick={handleIntegrate} disabled={selectedItems.size === 0 || isIntegrating} className={styles.downloadButton}>
                {isIntegrating ? "Integrating..." : `Integrate Selected (${selectedItems.size})`}
              </button>
              <p className={styles.integrationNote}>{selectedCategory === "features" ? "Features will be integrated with working pages and navigation links" : "Components will be copied to your project's lib/components directory"}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
