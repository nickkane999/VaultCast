import { Card, CardContent, Typography, Button, IconButton, Box, Checkbox, FormControlLabel } from "@mui/material";
import { Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { EventCardProps, Event, CommonDecision, Task } from "./types";
import styles from "./DecisionHelper.module.css";
import { CardComponentProps, formatDate } from "./states/CardComponentState";

// Helper function to format time from HH:mm to h:mm AM/PM
const formatTimeTo12Hour = (timeString: string) => {
  if (!timeString) return "";
  const [hours, minutes] = timeString.split(":").map(Number);
  const ampm = hours >= 12 ? "PM" : "AM";
  const formattedHours = hours % 12 || 12; // Convert 0 to 12 for 12 AM/PM
  return `${formattedHours}:${String(minutes).padStart(2, "0")} ${ampm}`;
};

export default function CardComponent({ item, decision, onDecision, onEdit, onDelete, onToggleComplete }: CardComponentProps) {
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
          // Event case
          <>
            <Typography variant="body2" color="text.secondary">
              {formatDate((item as Event).date)}
              {((item as Event).startTime || (item as Event).endTime) && `. ${(item as Event).startTime ? formatTimeTo12Hour((item as Event).startTime!) : ""} - ${(item as Event).endTime ? formatTimeTo12Hour((item as Event).endTime!) : ""}`}
            </Typography>
            {item.type === "calendar" &&
              "date" in item &&
              item.date &&
              typeof item.date === "string" &&
              (() => {
                const event = item as Event; // Cast once after type and date checks
                const eventDate = new Date(event.date);
                const now = new Date();
                const isPastEvent = eventDate < new Date(now.getFullYear(), now.getMonth(), now.getDate());

                if (event.attended === true) {
                  return (
                    <Typography variant="body2" className={styles.attendedSuccessText}>
                      Event Attended
                    </Typography>
                  );
                } else if (isPastEvent && (event.attended === false || event.attended === undefined)) {
                  return (
                    <Typography variant="body2" className={styles.attendedErrorText}>
                      Event Not Attended
                    </Typography>
                  );
                }
                return null; // Do not show anything otherwise
              })()}
          </>
        )}
        {
          item.type === "task" && "dueDate" in item && item.dueDate && typeof item.dueDate === "string" ? (
            // Task case
            <Typography variant="body2" color="text.secondary">
              {formatDate(item.dueDate)}
            </Typography>
          ) : null /* Render null if not CommonDecision/Task or no dueDate */
        }

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
