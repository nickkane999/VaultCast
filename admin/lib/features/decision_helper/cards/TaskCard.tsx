import { CardContent, Typography, Box, Checkbox, FormControlLabel, Button, Chip } from "@mui/material";
import { Task, Project } from "../types";
import styles from "../DecisionHelper.module.css";
import { formatDate } from "../util/card_component";
import { useTaskCard } from "../hooks/useTaskCard";
interface TaskCardProps {
  item: Task;
  projects: Project[];
  onDecision?: (id: string) => void;
  onToggleComplete?: (task: Task) => void;
}
export default function TaskCard({ item, projects, onDecision, onToggleComplete }: TaskCardProps) {
  const { projectName } = useTaskCard({ item, projects });

  return (
    <CardContent className={styles.cardContent}>
      <Typography variant="h6" component="div">
        {item.name}
      </Typography>

      {/* Display project if available */}
      <Box className={styles.taskInfoRow}>
        {projectName && <Chip label={`Project: ${projectName}`} color="primary" variant="outlined" size="small" />}

        {item.tags && item.tags.length > 0 && (
          <Box className={styles.tagsContainer}>
            {" "}
            {item.tags.map((tag, index) => (
              <Chip key={index} label={tag} size="small" variant="outlined" />
            ))}{" "}
          </Box>
        )}
      </Box>

      {item.is_completed !== undefined && <FormControlLabel control={<Checkbox checked={item.is_completed} onChange={() => onToggleComplete && onToggleComplete(item)} />} label="Completed" />}

      {item.is_completed && item.complete_description && (
        <Box sx={{ mt: 1, p: 1, backgroundColor: "#f5f5f5", borderRadius: 1 }}>
          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic" }}>
            Completion Notes: {item.complete_description}
          </Typography>
        </Box>
      )}

      <Box className={styles.taskButtonRow}>
        {onDecision && (
          <Button variant="contained" color="primary" onClick={() => onDecision(item.id as string)}>
            Make decision
          </Button>
        )}
      </Box>
    </CardContent>
  );
}
