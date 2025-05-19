import { Card, CardContent, Typography, Button, IconButton, Box } from "@mui/material";
import { Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { EventCardProps, Event, CommonDecision } from "./types/types_components";

interface CardComponentProps {
  item: Event | CommonDecision;
  onDecision?: (id: string | number) => void;
  onEdit: (item: Event | CommonDecision) => void;
  onDelete: (id: string | number) => void;
  decision?: number;
}

export default function CardComponent({ item, decision, onDecision, onEdit, onDelete }: CardComponentProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const offset = date.getTimezoneOffset() * 60000; // Offset in milliseconds
    const localDate = new Date(date.getTime() + offset); // Adjust to local time
    const options = { year: "numeric", month: "short", day: "numeric" } as const;
    return localDate.toLocaleDateString("en-US", options);
  };
  const hasDecision = item.type === "calendar" || item.type === "common_decision";

  return (
    <Card key={item.id} variant="outlined" sx={{ width: "100%", maxWidth: 1080, borderRadius: 2, boxShadow: 2, p: 2, position: "relative", mx: "auto" }}>
      <Box sx={{ position: "absolute", top: 8, right: 8 }}>
        <IconButton onClick={() => onEdit(item)} aria-label="Edit" size="small">
          <EditIcon />
        </IconButton>
        <IconButton onClick={() => onDelete(item.id)} aria-label="Delete" size="small">
          <DeleteIcon />
        </IconButton>
      </Box>
      <CardContent sx={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 1 }}>
        <Typography variant="h6" component="div">
          {item.name}
        </Typography>
        {item.type === "calendar" && (
          <Typography variant="body2" color="text.secondary">
            {formatDate((item as Event).date)}
          </Typography>
        )}
        {hasDecision && (
          <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center" }}>
            {onDecision && (
              <Button variant="contained" color="primary" onClick={() => onDecision(item.id)}>
                Make decision
              </Button>
            )}
          </Box>
        )}
      </CardContent>
      {/* Absolutely positioned Decision Result */}
      {hasDecision && decision && (
        <Box sx={{ position: "absolute", bottom: 16, right: 16 }}>
          <Typography variant="body1" color="primary" fontWeight="bold">
            Decision: {decision}
          </Typography>
        </Box>
      )}
    </Card>
  );
}
