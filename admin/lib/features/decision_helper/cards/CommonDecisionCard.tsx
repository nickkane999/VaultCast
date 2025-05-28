import { CardContent, Typography, Box, Button } from "@mui/material";
import { CommonDecision } from "../types";
import styles from "../DecisionHelper.module.css";

interface CommonDecisionCardProps {
  item: CommonDecision;
  onDecision?: (id: string) => void;
}

export default function CommonDecisionCard({ item, onDecision }: CommonDecisionCardProps) {
  return (
    <CardContent className={styles.cardContent}>
      <Typography variant="h6" component="div">
        {item.name}
      </Typography>

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
