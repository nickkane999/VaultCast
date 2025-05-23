import { CardContent, Typography, Box, Button } from "@mui/material";
import { Event } from "../types";
import styles from "../DecisionHelper.module.css";
import { formatDate } from "../util/card_component";

// Helper function to format time from HH:mm to h:mm AM/PM
const formatTimeTo12Hour = (timeString: string) => {
  if (!timeString) return "";
  const [hours, minutes] = timeString.split(":").map(Number);
  const ampm = hours >= 12 ? "PM" : "AM";
  const formattedHours = hours % 12 || 12; // Convert 0 to 12 for 12 AM/PM
  return `${formattedHours}:${String(minutes).padStart(2, "0")} ${ampm}`;
};

interface CalendarCardProps {
  item: Event;
  decision?: string;
  onDecision?: (id: string) => void;
}

export default function CalendarCard({ item, decision, onDecision }: CalendarCardProps) {
  return (
    <CardContent className={styles.cardContent}>
      <Typography variant="h6" component="div">
        {item.name}
      </Typography>

      <Typography variant="body2" color="text.secondary">
        {formatDate(item.date)}
        {(item.startTime || item.endTime) && `. ${item.startTime ? formatTimeTo12Hour(item.startTime!) : ""} - ${item.endTime ? formatTimeTo12Hour(item.endTime!) : ""}`}
      </Typography>
      {item.date &&
        typeof item.date === "string" &&
        (() => {
          const eventDate = new Date(item.date);
          const now = new Date();
          const isPastEvent = eventDate < new Date(now.getFullYear(), now.getMonth(), now.getDate());

          if (item.attended === true) {
            return (
              <Typography variant="body2" className={styles.attendedSuccessText}>
                Event Attended
              </Typography>
            );
          } else if (isPastEvent && (item.attended === false || item.attended === undefined)) {
            return (
              <Typography variant="body2" className={styles.attendedErrorText}>
                Event Not Attended
              </Typography>
            );
          }
          return null;
        })()}

      {onDecision && (
        <Box className={styles.buttonDecisionRow}>
          <Button variant="contained" color="primary" onClick={() => onDecision(item.id as string)}>
            Make decision
          </Button>
        </Box>
      )}
    </CardContent>
  );
}
