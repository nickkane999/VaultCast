"use client";

import React, { useState } from "react";
import { Container, Box, Typography, Paper, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import GmailAuthComponent from "@/lib/features/admin/GmailAuthComponent";

export default function AdminPage() {
  const [selectedSection, setSelectedSection] = useState("gmail_refresh_token");

  const handleSectionChange = (event: any) => {
    setSelectedSection(event.target.value);
  };

  return (
    <Container sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Admin Page
      </Typography>

      <Paper elevation={2} sx={{ p: 3 }}>
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel id="admin-section-label">Select Admin Task</InputLabel>
          <Select labelId="admin-section-label" id="admin-section-select" value={selectedSection} label="Select Admin Task" onChange={handleSectionChange}>
            <MenuItem value="gmail_refresh_token">Gmail Refresh Token</MenuItem>
          </Select>
        </FormControl>

        {selectedSection === "gmail_refresh_token" && <GmailAuthComponent />}
      </Paper>
    </Container>
  );
}
