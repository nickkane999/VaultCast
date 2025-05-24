import { CardContent, Typography, Box, FormControlLabel, Checkbox } from "@mui/material";
import { Project } from "../types";
import styles from "../DecisionHelper.module.css";
import { formatDate } from "../util/card_component";

interface ProjectCardProps {
  item: Project;
  onToggleComplete?: (item: Project) => void;
}

export default function ProjectCard({ item, onToggleComplete }: ProjectCardProps) {
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

      {item.is_completed !== undefined && <FormControlLabel control={<Checkbox checked={item.is_completed} onChange={() => onToggleComplete && onToggleComplete(item)} />} label="Completed" />}
    </CardContent>
  );
}
