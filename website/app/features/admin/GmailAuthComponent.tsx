"use client";

import React, { useState } from "react";
import { Box, Typography, Button, CircularProgress } from "@mui/material";

export default function GmailAuthComponent() {
  const [loading, setLoading] = useState(false);

  const handleGetRefreshToken = async () => {
    setLoading(true);
    window.location.href = "/api/admin/google_email_authentication/generate_auth_url";
  };

  return (
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
        Note: Ensure your environment variables (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI) are correctly set up on the server. The GOOGLE_REDIRECT_URI must be set to `http://localhost:3000/api/google_email_authentication/oauth2callback` (or your deployed equivalent) and also
        configured in your Google Cloud Console OAuth client settings.
      </Typography>
    </Box>
  );
}
