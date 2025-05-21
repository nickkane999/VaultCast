"use client";

import { useState, useEffect } from "react";
import styles from "../../page.module.css";
import EventListClient from "../../features/decision_helper/EventListClient";
import CommonDecisionList from "../../features/decision_helper/CommonDecisionList";
import TaskListClient from "../../features/decision_helper/TaskListClient";
import ProjectListClient from "../../features/decision_helper/ProjectListClient";
import { Tabs, Tab, Box, Typography, CircularProgress } from "@mui/material";
import { useDecisionHelperState } from "../../features/decision_helper/states/DecisionHelperStates";

export default function Page() {
  const { calendarEvents, commonDecisions, tasks, projects, loading, tabValue, handleTabChange } = useDecisionHelperState();

  return (
    <div className={styles.page}>
      <Typography variant="h4" component="h1" sx={{ mb: 4 }}>
        Decision Helper
      </Typography>
      <Tabs value={tabValue} onChange={handleTabChange} aria-label="Decision Helper Tabs">
        <Tab label="Calendar" />
        <Tab label="Common Decisions" />
        <Tab label="To Do" />
        <Tab label="Projects" />
      </Tabs>
      <Box sx={{ mt: 2, mx: "auto" }} width="100%">
        {tabValue === 0 && (loading ? <CircularProgress /> : <EventListClient initialEvents={calendarEvents} />)}
        {tabValue === 1 && (loading ? <CircularProgress /> : <CommonDecisionList initialDecisions={commonDecisions} />)}
        {tabValue === 2 && (loading ? <CircularProgress /> : <TaskListClient initialTasks={tasks} />)}
        {tabValue === 3 && (loading ? <CircularProgress /> : <ProjectListClient initialProjects={projects} />)}
      </Box>
    </div>
  );
}
