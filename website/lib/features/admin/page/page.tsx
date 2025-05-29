"use client";

import React from "react";
import { Box, Container, Typography, Paper, Tabs, Tab } from "@mui/material";
import { useState } from "react";
import BulkVideoUpdateComponent from "../BulkVideoUpdateComponent";
import CollectionRenameComponent from "../CollectionRenameComponent";
import GmailAuthComponent from "../GmailAuthComponent";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div role="tabpanel" hidden={value !== index} id={`admin-tabpanel-${index}`} aria-labelledby={`admin-tab-${index}`} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function AdminPage() {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom align="center">
        Admin Dashboard
      </Typography>
      <Typography variant="h6" color="text.secondary" align="center" sx={{ mb: 4 }}>
        Manage your VaultCast system settings and perform administrative tasks
      </Typography>

      <Paper elevation={3}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="admin tabs">
            <Tab label="Bulk Video Update" />
            <Tab label="Collection Management" />
            <Tab label="Gmail Authentication" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <BulkVideoUpdateComponent />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <CollectionRenameComponent />
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <GmailAuthComponent />
        </TabPanel>
      </Paper>
    </Container>
  );
}
