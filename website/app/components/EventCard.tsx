import { useState } from "react";
import { Card, CardContent, Typography, Button } from "@mui/material";
import { EventCardProps } from "./types/types_components";

export default function EventCard({ event, decision, onDecision }: EventCardProps) {
  return (
    <Card variant="outlined" sx={{ width: "100%", borderRadius: 2, boxShadow: 2, p: 2 }}>
      <CardContent sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
        <Typography variant="h6" component="div">
          {event.name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {event.date}
        </Typography>
        <Button variant="contained" color="primary" onClick={() => onDecision(event.id)}>
          Make decision
        </Button>
        {decision && (
          <Typography variant="body1" color="primary" fontWeight="bold">
            Decision: {decision}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}
