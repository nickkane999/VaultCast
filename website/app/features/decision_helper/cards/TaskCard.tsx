import { CardContent, Typography, Box, Checkbox, FormControlLabel, Button, Chip } from "@mui/material";
import { Task } from "../types";
import styles from "../DecisionHelper.module.css";
import { formatDate } from "../util/card_component";
import { useEffect, useState } from "react";

interface TaskCardProps {
  item: Task;
  onDecision?: (id: string) => void;
  onToggleComplete?: (task: Task) => void;
}

export default function TaskCard({ item, onDecision, onToggleComplete }: TaskCardProps) {
  const [projectName, setProjectName] = useState<string | null>(null);

  // Fetch project name if projectId exists
  useEffect(() => {
    const fetchProjectName = async () => {
      if (item.projectId) {
        try {
          const response = await fetch(`/api/decision_helper/projects`);
          if (response.ok) {
            const projects = await response.json();
            const matchingProject = projects.find((project: any) => project.id === item.projectId);
            if (matchingProject) {
              setProjectName(matchingProject.name);
            }
          }
        } catch (error) {
          console.error("Error fetching project details:", error);
        }
      }
    };

    fetchProjectName();
  }, [item.projectId]);

  return (
    <CardContent className={styles.cardContent}>
      <Typography variant="h6" component="div">
        {item.name}
      </Typography>

      {/* Display project if available */}
      <Box sx={{ mt: 1, mb: 1, display: "flex", flexDirection: "row", alignItems: "center", gap: 1 }}>
        {projectName && <Chip label={`Project: ${projectName}`} color="primary" variant="outlined" size="small" />}

        {item.tags && item.tags.length > 0 && (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
            {item.tags.map((tag, index) => (
              <Chip key={index} label={tag} size="small" variant="outlined" />
            ))}
          </Box>
        )}
      </Box>

      {item.is_completed !== undefined && <FormControlLabel control={<Checkbox checked={item.is_completed} onChange={() => onToggleComplete && onToggleComplete(item)} />} label="Completed" />}

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
