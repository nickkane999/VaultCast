"use client";

import React from "react";
import { List, ListItem } from "@mui/material";
import MessengerProfileCard from "./MessengerProfileCard";
import { MessageProfile, MessengerProfileListProps } from "./types";

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
