"use client";

import { useState, useEffect } from "react";
import styles from "../page.module.css";
import EventListClient from "../components/EventListClient";
import CommonDecisionList from "../components/CommonDecisionList";
import TaskListClient from "../components/TaskListClient";
import { Tabs, Tab, Box, Typography, CircularProgress } from "@mui/material";

export default function Page() {
  const [allData, setAllData] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const res = await fetch("/api/events");
      if (res.ok) {
        const fetchedData = await res.json();
        setAllData(fetchedData);
      } else {
        console.error("API fetch failed:", await res.json());
        setAllData([]);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const calendarEvents = allData.filter((item: any) => item.type === "calendar");
  const commonDecisions = allData.filter((item: any) => item.type === "common_decision").map((item: any) => ({ id: item.id, name: item.name, type: item.type }));
  const tasks = allData.filter((item: any) => item.type === "task");

  return (
    <div className={styles.page}>
      <Typography variant="h4" component="h1" sx={{ mb: 4 }}>
        Decision Helper
      </Typography>
      <Tabs value={tabValue} onChange={handleTabChange} aria-label="Decision Helper Tabs">
        <Tab label="Calendar" />
        <Tab label="Common Decisions" />
        <Tab label="To Do" />
      </Tabs>
      <Box sx={{ mt: 2, mx: "auto" }} width="100%">
        {tabValue === 0 && (loading ? <CircularProgress /> : <EventListClient initialEvents={calendarEvents} />)}
        {tabValue === 1 && (loading ? <CircularProgress /> : <CommonDecisionList initialDecisions={commonDecisions} />)}
        {tabValue === 2 && (loading ? <CircularProgress /> : <TaskListClient initialTasks={tasks} />)}
      </Box>
    </div>
  );
}
