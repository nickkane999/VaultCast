"use client";

import React from "react";
import { Container, Box, Typography, Tabs, Tab } from "@mui/material";
import { Edit, Palette } from "@mui/icons-material";
import EmailForm from "@/lib/features/ai_emailer/EmailForm";
import EmailDesignTab from "@/lib/features/ai_emailer/EmailDesignTab";
import { Provider } from "react-redux";
import { store } from "@/store/store";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store/store";
import { setCurrentTab } from "@/lib/features/ai_emailer/store/aiEmailerSlice";

function EmailerContent() {
  const dispatch = useDispatch<AppDispatch>();
  const { currentTab } = useSelector((state: RootState) => state.aiEmailer);

  const handleTabChange = (event: React.SyntheticEvent, newValue: "write" | "design") => {
    dispatch(setCurrentTab(newValue));
  };

  return (
    <Container sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        AI Email Generator
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Create compelling emails with AI assistance or design beautiful templates with our visual editor.
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs value={currentTab} onChange={handleTabChange} aria-label="Email creation tabs">
          <Tab icon={<Edit />} label="Write" value="write" iconPosition="start" />
          <Tab icon={<Palette />} label="Design" value="design" iconPosition="start" />
        </Tabs>
      </Box>

      <Box sx={{ mt: 3 }}>
        {currentTab === "write" && <EmailForm />}
        {currentTab === "design" && <EmailDesignTab />}
      </Box>
    </Container>
  );
}

export default function AiEmailerPage() {
  return (
    <Provider store={store}>
      <EmailerContent />
    </Provider>
  );
}
