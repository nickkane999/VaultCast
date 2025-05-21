"use client";

import React from "react";
import { List, ListItem, Typography } from "@mui/material";
import MessengerProfileCard from "./MessengerProfileCard";
import { MessageProfile } from "./types";

interface MessengerProfileListProps {
  profiles: MessageProfile[];
  onUpdateProfile: (profileId: string, updatedData: { name: string; systemPrompt: string; files: string[] }) => Promise<void>;
  onDeleteProfile: (profileId: string) => void;
  availableFiles: string[];
}

export default function MessengerProfileList({ profiles, onUpdateProfile, onDeleteProfile, availableFiles }: MessengerProfileListProps) {
  return (
    <List>
      {profiles.map((profile) => (
        <ListItem key={profile.id} sx={{ mb: 6, mt: 6 }}>
          <MessengerProfileCard profile={profile} onUpdate={onUpdateProfile} onDelete={onDeleteProfile} availableFiles={availableFiles} />
        </ListItem>
      ))}
    </List>
  );
}
