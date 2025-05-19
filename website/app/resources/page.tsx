"use client";

import { useState, useEffect } from "react";
import styles from "../page.module.css";
import EventListClient from "../components/EventListClient";
import CommonDecisionList from "../components/CommonDecisionList";
import { Tabs, Tab, Box, Typography, CircularProgress } from "@mui/material";

export default function Page() {
  const [data, setData] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const res = await fetch("/api/events");
      const fetchedData = await res.json();
      setData(fetchedData);
      setLoading(false);
    }
    fetchData();
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <div className={styles.page}>
      <Typography variant="h4" component="h1" sx={{ mb: 4 }}>
        Decision Helper
      </Typography>
      <Tabs value={tabValue} onChange={handleTabChange} aria-label="Decision Helper Tabs">
        <Tab label="Calendar" />
        <Tab label="Common Decisions" />
      </Tabs>
      <Box sx={{ mt: 2 }}>
        {tabValue === 0 && (loading ? <CircularProgress /> : <EventListClient initialEvents={data} />)}
        {tabValue === 1 && <CommonDecisionList />}
      </Box>
    </div>
  );
}
