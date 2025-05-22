"use client";

import React, { useState } from "react";
import { Container, Box, Typography, Button, Link as MuiLink, List, ListItem, ListItemText, Paper, FormControl, InputLabel, Select, MenuItem, CircularProgress } from "@mui/material";
import NextLink from "next/link";

const resourceLinks = [
  { href: "/resources/ai_emailer", primary: "AI Emailer" },
  { href: "/resources/ai_messenger", primary: "AI Messenger" },
  { href: "/resources/decision_helper", primary: "Decision Helper" },
  // Add other resource links here
];

export default function ResourcesPage() {
  const [selectedSection, setSelectedSection] = useState("gmail_refresh_token");
  const [loading, setLoading] = useState(false);

  const handleGetRefreshToken = async () => {
    setLoading(true);
    // Redirect to the API route that generates the Google Auth URL
    // This API route will then redirect the user to Google
    window.location.href = "/api/generate_auth_url";
    // No need to setLoading(false) here as the page will navigate away.
  };

  const handleSectionChange = (event: any) => {
    setSelectedSection(event.target.value);
  };

  return (
    <Container sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        Resources
      </Typography>

      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Application Tools
        </Typography>
        <List>
          {resourceLinks.map((link) => (
            <ListItem key={link.href} disablePadding>
              <MuiLink component={NextLink} href={link.href} sx={{ width: "100%" }}>
                <ListItemText primary={link.primary} />
              </MuiLink>
            </ListItem>
          ))}
        </List>
      </Paper>

      <Paper elevation={2} sx={{ p: 3 }}>
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel id="resource-section-label">Select Section</InputLabel>
          <Select labelId="resource-section-label" id="resource-section-select" value={selectedSection} label="Select Section" onChange={handleSectionChange}>
            <MenuItem value="gmail_refresh_token">Gmail Refresh Token</MenuItem>
            {/* Add other MenuItem options here if you create more sections */}
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
        {/* Add other conditional sections here based on selectedSection */}
      </Paper>
    </Container>
  );
}
