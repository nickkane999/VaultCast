"use client";

import React, { useState } from "react";
import { Container, Box, Typography, Button, Link as MuiLink, List, ListItem, ListItemText, Paper, FormControl, InputLabel, Select, MenuItem, CircularProgress } from "@mui/material";
import NextLink from "next/link";

const resourceLinks = [
  { href: "/resources/decision_helper", primary: "Decision Helper" },
  { href: "/resources/ai_emailer", primary: "AI Emailer" },
  { href: "/resources/ai_messenger", primary: "AI Messenger Profiles" },
  { href: "/resources/image_analyzer", primary: "Image Analyzer" },
  { href: "/resources/admin", primary: "Administration Tasks" },
  // Add other resource links here
];

export default function ResourcesPage() {
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
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        Resources: Application Tools
      </Typography>

      <Typography variant="h5" gutterBottom></Typography>
      <List>
        {resourceLinks.map((link) => (
          <ListItem key={link.href} disablePadding>
            <MuiLink component={NextLink} href={link.href} sx={{ width: "100%" }}>
              <ListItemText primary={link.primary} />
            </MuiLink>
          </ListItem>
        ))}
      </List>
    </Container>
  );
}
