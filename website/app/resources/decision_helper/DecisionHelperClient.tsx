"use client";

import React, { useState, useTransition, useEffect } from "react";
import styles from "@/app/page.module.css";
import EventListClient from "@/lib/features/decision_helper/EventListClient";
import CommonDecisionList from "@/lib/features/decision_helper/CommonDecisionList";
import TaskListClient from "@/lib/features/decision_helper/TaskListClient";
import ProjectListClient from "@/lib/features/decision_helper/ProjectListClient";
import EssentialListClient from "@/lib/features/decision_helper/EssentialListClient";
import { Tabs, Tab, Box, Typography, Button, Alert } from "@mui/material";
import { Provider, useDispatch } from "react-redux";
import { store } from "@/store/store";
import { Task, Event, CommonDecision, Project, Essential } from "@/lib/features/decision_helper/types";
import { setTasks, setCalendarEvents, setProjects, setCommonDecisions, setEssentials } from "@/store/decision_helper";

interface DecisionHelperData {
  tasks: Task[];
  projects: Project[];
  events: Event[];
  decisions: CommonDecision[];
  essentials: Essential[];
}

interface DecisionHelperClientProps {
  initialData: DecisionHelperData;
  refreshAction: () => Promise<void>;
}

function DecisionHelperContent({ initialData, refreshAction }: DecisionHelperClientProps) {
  const dispatch = useDispatch();
  const [tabValue, setTabValue] = useState(0);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Initialize Redux store with server-fetched data
  useEffect(() => {
    dispatch(setTasks(initialData.tasks));
    dispatch(setCalendarEvents(initialData.events));
    dispatch(setProjects(initialData.projects));
    dispatch(setCommonDecisions(initialData.decisions));
    dispatch(setEssentials(initialData.essentials));
  }, [dispatch, initialData]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleRefresh = () => {
    startTransition(async () => {
      try {
        await refreshAction();
        setError(null);
      } catch (err) {
        setError("Failed to refresh data");
      }
    });
  };

  const handleClearError = () => {
    setError(null);
  };

  return (
    <div className={styles.page}>
      <Typography variant="h4" component="h1" sx={{ mb: 4 }}>
        Decision Helper
      </Typography>

      <Button variant="outlined" onClick={handleRefresh} disabled={isPending} sx={{ mb: 2 }}>
        {isPending ? "Refreshing..." : "Refresh"}
      </Button>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={handleClearError}>
          {error}
        </Alert>
      )}

      <Tabs value={tabValue} onChange={handleTabChange} aria-label="Decision Helper Tabs">
        <Tab label="Calendar" />
        <Tab label="Common Decisions" />
        <Tab label="To Do" />
        <Tab label="Projects" />
        <Tab label="Essentials" />
      </Tabs>
      <Box sx={{ mt: 2, mx: "auto" }} width="100%">
        {tabValue === 0 && <EventListClient initialEvents={initialData.events} />}
        {tabValue === 1 && <CommonDecisionList initialDecisions={initialData.decisions} />}
        {tabValue === 2 && <TaskListClient initialTasks={initialData.tasks} initialProjects={initialData.projects} />}
        {tabValue === 3 && <ProjectListClient initialProjects={initialData.projects} />}
        {tabValue === 4 && <EssentialListClient initialEssentials={initialData.essentials} />}
      </Box>
    </div>
  );
}

export default function DecisionHelperClient(props: DecisionHelperClientProps) {
  return (
    <Provider store={store}>
      <DecisionHelperContent {...props} />
    </Provider>
  );
}
