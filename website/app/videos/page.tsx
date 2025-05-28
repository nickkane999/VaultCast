"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Box, Tabs, Tab, Typography, CircularProgress } from "@mui/material";
import { Movie, Tv } from "@mui/icons-material";
import { Provider } from "react-redux";
import { store } from "@/store/store";
import MoviesClient from "./movies/MoviesClient";
import TVShowsClient from "./tv/TVShowsClient";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div role="tabpanel" hidden={value !== index} id={`videos-tabpanel-${index}`} aria-labelledby={`videos-tab-${index}`} {...other}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `videos-tab-${index}`,
    "aria-controls": `videos-tabpanel-${index}`,
  };
}

function VideosPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize tab value based on search params
  const getInitialTabValue = () => {
    const tab = searchParams.get("tab");
    if (tab === "tv") return 1;
    if (tab === "movies") return 0;
    return 0; // Default to movies
  };

  const [tabValue, setTabValue] = useState(getInitialTabValue);

  // Update tab when search params change
  useEffect(() => {
    const tab = searchParams.get("tab");

    if (tab === "tv") {
      setTabValue(1);
    } else if (tab === "movies") {
      setTabValue(0);
    } else {
      // Default to movies and redirect
      setTabValue(0);
      router.push("/videos?tab=movies");
    }
  }, [searchParams, router]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);

    // Preserve existing search params when switching tabs
    const currentParams = new URLSearchParams(searchParams.toString());

    // Update tab parameter
    if (newValue === 0) {
      currentParams.set("tab", "movies");
    } else {
      currentParams.set("tab", "tv");
    }

    router.push(`/videos?${currentParams.toString()}`);
  };

  return (
    <Box sx={{ width: "100%", p: 3 }}>
      <Typography variant="h4" component="h1" sx={{ mb: 3, textAlign: "center" }}>
        Video Library
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="video library tabs"
          centered
          sx={{
            "& .MuiTab-root": {
              minWidth: 120,
              fontSize: "1.1rem",
              fontWeight: 500,
            },
          }}
        >
          <Tab
            icon={<Movie />}
            label="Movies"
            {...a11yProps(0)}
            sx={{
              "&.Mui-selected": {
                color: "primary.main",
                fontWeight: 600,
              },
            }}
          />
          <Tab
            icon={<Tv />}
            label="TV Shows"
            {...a11yProps(1)}
            sx={{
              "&.Mui-selected": {
                color: "primary.main",
                fontWeight: 600,
              },
            }}
          />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <MoviesClient />
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <TVShowsClient />
      </TabPanel>
    </Box>
  );
}

export default function VideosPage() {
  return (
    <Provider store={store}>
      <Suspense
        fallback={
          <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
            <CircularProgress />
          </Box>
        }
      >
        <VideosPageContent />
      </Suspense>
    </Provider>
  );
}
