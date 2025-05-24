"use client";

import React from "react";
import styles from "@/app/page.module.css";
import EventListClient from "@/app/features/decision_helper/EventListClient";
import CommonDecisionList from "@/app/features/decision_helper/CommonDecisionList";
import TaskListClient from "@/app/features/decision_helper/TaskListClient";
import ProjectListClient from "@/app/features/decision_helper/ProjectListClient";
import EssentialListClient from "@/app/features/decision_helper/EssentialListClient";
import { Tabs, Tab, Box, Typography, CircularProgress, Alert } from "@mui/material";
import { Provider } from "react-redux";
import { store } from "@/store/store";
import { useDecisionHelperPage } from "@/app/features/decision_helper/hooks/useDecisionHelperPage";

function DecisionHelperPageContent() {
  const { calendarEvents, commonDecisions, tasks, projects, essentials, loading, error, tabValue, handleTabChange, handleClearError } = useDecisionHelperPage();

  return (
    <div className={styles.page}>
      <Typography variant="h4" component="h1" sx={{ mb: 4 }}>
        Decision Helper
      </Typography>

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
        {tabValue === 0 && (loading ? <CircularProgress /> : <EventListClient initialEvents={calendarEvents} />)}
        {tabValue === 1 && (loading ? <CircularProgress /> : <CommonDecisionList initialDecisions={commonDecisions} />)}
        {tabValue === 2 && (loading ? <CircularProgress /> : <TaskListClient initialTasks={tasks} initialProjects={projects} />)}
        {tabValue === 3 && (loading ? <CircularProgress /> : <ProjectListClient initialProjects={projects} />)}
        {tabValue === 4 && (loading ? <CircularProgress /> : <EssentialListClient initialEssentials={essentials} />)}
      </Box>
    </div>
  );
}

export default function Page() {
  return (
    <Provider store={store}>
      <DecisionHelperPageContent />
    </Provider>
  );
}
