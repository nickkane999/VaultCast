"use client";

import React, { useState } from "react";
import { Container, Box, Typography, Paper, FormControl, InputLabel, Select, MenuItem, Button, CircularProgress, Alert } from "@mui/material";

export default function AdminPage() {
  const [selectedSection, setSelectedSection] = useState("gmail_refresh_token");
  const [loading, setLoading] = useState(false);

  const handleGetRefreshToken = async () => {
    setLoading(true);
    window.location.href = "/api/generate_auth_url";
  };

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
            {/* Add other admin tasks here */}
          </Select>
        </FormControl>

        {selectedSection === "gmail_refresh_token" && (
          <Box>
            <Typography variant="h5" gutterBottom>
              Gmail API Refresh Token
            </Typography>
            <Typography paragraph>
              Click the button below to authorize this application to send emails on your behalf via Gmail. You will be redirected to Google to grant permission. After granting permission, you will be redirected back to the application. Check the server console logs for your Refresh Token.
            </Typography>
            <Button variant="contained" color="primary" onClick={handleGetRefreshToken} disabled={loading} sx={{ mt: 2 }}>
              {loading ? <CircularProgress size={24} /> : "Authorize Gmail & Get Refresh Token"}
            </Button>
            <Typography variant="caption" display="block" sx={{ mt: 2 }}>
              Note: Ensure your environment variables (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI) are correctly set up on the server. The GOOGLE_REDIRECT_URI must be set to `http://localhost:3000/api/oauth2callback` (or your deployed equivalent) and also configured in your Google
              Cloud Console OAuth client settings.
            </Typography>
          </Box>
        )}

        {/* Add other admin sections here based on selectedSection */}
      </Paper>
    </Container>
  );
}
