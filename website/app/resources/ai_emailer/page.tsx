"use client";

import React from "react";
import { Container, Box, Typography } from "@mui/material";
import EmailForm from "@/app/features/ai_emailer/EmailForm";
import { Provider } from "react-redux";
import { store } from "@/store/store";

export default function AiEmailerPage() {
  return (
    <Provider store={store}>
      <Container sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          AI Email Generator
        </Typography>

        <EmailForm />
      </Container>
    </Provider>
  );
}
