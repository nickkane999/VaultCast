"use client";

import React, { useState } from "react";
import { Box, Typography, Grid, Tabs, Tab, Paper } from "@mui/material";
import { TrendingUp, History, Analytics } from "@mui/icons-material";
import { Provider } from "react-redux";
import { store } from "@/store/store";
import { useMarketingLinks } from "./hooks/useMarketingLinks";
import MarketingQueryForm from "./components/MarketingQueryForm";
import AnalysisResults from "./components/AnalysisResults";
import SavedQueries from "./components/SavedQueries";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

function MarketingLinksContent() {
  const [tabValue, setTabValue] = useState(0);
  const { analyses, currentAnalysis } = useMarketingLinks();

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleAnalyzeComplete = () => {
    setTabValue(1);
  };

  return (
    <Box sx={{ maxWidth: 1400, mx: "auto", p: 3 }}>
      <Box sx={{ textAlign: "center", mb: 4 }}>
        <TrendingUp sx={{ fontSize: 56, color: "primary.main", mb: 2 }} />
        <Typography variant="h3" component="h1" gutterBottom>
          AI Affiliate Marketing Assistant
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
          Find trending keywords and profitable affiliate opportunities with AI
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 800, mx: "auto" }}>
          Enter what you want to market, and our AI will analyze Google Trends, identify profitable keywords, suggest affiliate programs, and create a complete action plan to help you succeed.
        </Typography>
      </Box>

      <Paper elevation={2} sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} variant="fullWidth" sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tab icon={<TrendingUp />} label="New Analysis" iconPosition="start" />
          <Tab icon={<Analytics />} label={`Results${currentAnalysis ? ` (${analyses.length})` : ""}`} iconPosition="start" />
          <Tab icon={<History />} label="Saved Queries" iconPosition="start" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Box sx={{ p: 3 }}>
            <MarketingQueryForm onAnalyze={handleAnalyzeComplete} />
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box sx={{ p: 3 }}>
            <AnalysisResults />
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Box sx={{ p: 3 }}>
            <SavedQueries />
          </Box>
        </TabPanel>
      </Paper>

      {analyses.length > 0 && tabValue === 0 && (
        <Paper elevation={1} sx={{ p: 2, textAlign: "center", bgcolor: "info.light", color: "info.contrastText" }}>
          <Typography variant="body2">
            💡 You have {analyses.length} previous analysis result{analyses.length !== 1 ? "s" : ""}. Switch to the "Results" tab to view them.
          </Typography>
        </Paper>
      )}
    </Box>
  );
}

export default function MarketingLinksClient() {
  return (
    <Provider store={store}>
      <MarketingLinksContent />
    </Provider>
  );
}
