import { Card, CardContent, Typography, Button, IconButton, Box, Checkbox, FormControlLabel } from "@mui/material";
import { Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { EventCardProps, Event, CommonDecision, Task } from "./types";
import styles from "./DecisionHelper.module.css";

interface CardComponentProps {
  item: Event | CommonDecision | Task;
  onDecision?: (id: string | number) => void;
  onEdit: (item: Event | CommonDecision | Task) => void;
  onDelete: (id: string | number) => void;
  decision?: number;
  onToggleComplete?: (item: Task) => void;
}

export default function CardComponent({ item, decision, onDecision, onEdit, onDelete, onToggleComplete }: CardComponentProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const offset = date.getTimezoneOffset() * 60000; // Offset in milliseconds
    const localDate = new Date(date.getTime() + offset); // Adjust to local time
    const options = { year: "numeric", month: "short", day: "numeric" } as const;
    return localDate.toLocaleDateString("en-US", options);
  };
  const hasDecision = item.type === "calendar" || item.type === "common_decision" || item.type === "task";

  return (
    <Card key={item.id} variant="outlined" className={styles.cardContainer}>
      <Box sx={{ position: "absolute", top: 8, right: 8 }}>
        <IconButton onClick={() => onEdit(item)} aria-label="Edit" size="small">
          <EditIcon />
        </IconButton>
        <IconButton onClick={() => onDelete(item.id)} aria-label="Delete" size="small">
          <DeleteIcon />
        </IconButton>
      </Box>
      <CardContent className={styles.cardContent}>
        <Typography variant="h6" component="div">
          {item.name}
        </Typography>
        {item.type === "calendar" && (
          <Typography variant="body2" color="text.secondary">
            {formatDate((item as Event).date)}
          </Typography>
        )}
        {item.type === "task" && (item as Task).is_completed !== undefined && <FormControlLabel control={<Checkbox checked={(item as Task).is_completed} onChange={() => onToggleComplete && onToggleComplete(item as Task)} />} label="Completed" />}
        {(item.type === "calendar" || item.type === "common_decision") && hasDecision && (
          <Box className={styles.buttonDecisionRow}>
            {onDecision && (
              <Button variant="contained" color="primary" onClick={() => onDecision(item.id)}>
                Make decision
              </Button>
            )}
          </Box>
        )}
        {item.type === "task" && (
          <Box className={styles.taskButtonRow}>
            {onDecision && (
              <Button variant="contained" color="primary" onClick={() => onDecision(item.id)}>
                Make decision
              </Button>
            )}
            {onToggleComplete && (
              <Button variant="outlined" color="secondary" onClick={() => onToggleComplete(item as Task)}>
                Finished
              </Button>
            )}
          </Box>
        )}
      </CardContent>
      {/* Absolutely positioned Decision Result */}
      {hasDecision && decision && (
        <Box className={styles.decisionResultBottomRight}>
          <Typography variant="body1" color="primary" fontWeight="bold">
            Decision: {decision}
          </Typography>
        </Box>
      )}
    </Card>
  );
}
