import { CardContent, Typography, Box, Button } from "@mui/material";
import { Essential } from "../types";
import styles from "../DecisionHelper.module.css";
import { formatDate } from "../util/card_component";

interface EssentialCardProps {
  item: Essential;
  onComplete: (id: string | number) => void;
  onDecision?: (id: string | number) => void;
  decision?: string;
}

export default function EssentialCard({ item, onComplete, onDecision }: EssentialCardProps) {
  return (
    <CardContent className={styles.cardContent}>
      <Typography variant="h6" component="div">
        {item.title}
      </Typography>
      <Typography variant="body2" color="text.secondary" className={styles.descriptionTextField}>
        {item.description}
      </Typography>
      <Typography variant="body2" className={styles.descriptionTextField}>
        Completed: {item.completed_times} times
      </Typography>
      <Typography variant="body2" className={styles.descriptionTextField}>
        Due Date: {formatDate(item.due_date)}
      </Typography>

      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
        {onDecision && (
          <Button variant="outlined" onClick={() => onDecision(item.id)} size="small">
            Make Decision
          </Button>
        )}
        <Button variant="contained" onClick={() => onComplete(item.id)} size="small">
          Complete Essential
        </Button>
      </Box>
    </CardContent>
  );
}
