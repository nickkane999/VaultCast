import { CardContent, Typography, Box } from "@mui/material";
import { Project } from "../types";
import styles from "../DecisionHelper.module.css";
import { formatDate } from "../util/card_component";

interface ProjectCardProps {
  item: Project;
  decision?: string;
  onDecision?: (id: string) => void;
}

export default function ProjectCard({ item, decision, onDecision }: ProjectCardProps) {
  return (
    <CardContent className={styles.cardContent}>
      <Typography variant="h6" component="div">
        {item?.name}
      </Typography>

      {item?.description && (
        <Typography variant="body2" color="text.secondary" className={styles.descriptionTextField}>
          {item.description}
        </Typography>
      )}

      {item?.dueDate && typeof item.dueDate === "string" ? (
        <Typography variant="body2" color="text.secondary">
          Due Date: {formatDate(item.dueDate)}
        </Typography>
      ) : null}

      {/* Add decision button if needed for projects */}
      {/*
      {onDecision && (
        <Box className={styles.buttonDecisionRow}>
          <Button variant="contained" color="primary" onClick={() => onDecision(item.id as string)}>
            Make decision
          </Button>
        </Box>
      )}
      */}
    </CardContent>
  );
}
