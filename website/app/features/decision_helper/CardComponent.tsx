import { Card, CardContent, Typography, Button, IconButton, Box, Checkbox, FormControlLabel } from "@mui/material";
import { Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { EventCardProps, Event, CommonDecision, Task, Item, Project, Essential } from "./types";
import styles from "./DecisionHelper.module.css";
import { CardComponentProps, formatDate } from "./util/card_component";
import CalendarCard from "./cards/CalendarCard";
import TaskCard from "./cards/TaskCard";
import CommonDecisionCard from "./cards/CommonDecisionCard";
import ProjectCard from "./cards/ProjectCard";
import EssentialCard from "./cards/EssentialCard";

export default function CardComponent({ item, decision, onDecision, onEdit, onDelete, onToggleComplete, onComplete, type, projects }: CardComponentProps & { type: "task" | "project" | "calendar" | "common_decision" | "essential"; onComplete?: (id: string | number) => void; projects?: Project[] }) {
  // Assuming item is always a Task in this context now that type field is removed
  // const hasDecision = item.type === "calendar" || item.type === "common_decision" || item.type === "task" || item.type === "essential";

  const handleDecision = (id: string | number) => {
    if (onDecision) {
      onDecision(id);
    }
  };

  const handleComplete = (id: string | number) => {
    if (onComplete) {
      onComplete(id);
    }
  };

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

      {/* Use the type prop for conditional rendering */}
      {type === "calendar" && <CalendarCard item={item as Event} onDecision={handleDecision} />}
      {type === "task" && <TaskCard item={item as Task} projects={projects || []} onDecision={onDecision} onToggleComplete={onToggleComplete} />}
      {type === "common_decision" && <CommonDecisionCard item={item as CommonDecision} onDecision={handleDecision} />}
      {type === "project" && <ProjectCard item={item as Project} />}
      {type === "essential" && <EssentialCard item={item as Essential} onComplete={handleComplete} onDecision={handleDecision} />}

      {type !== "project" && decision && (
        <Box className={styles.decisionResultBottomRight}>
          <Typography variant="body1" color="primary" fontWeight="bold">
            Decision: {decision}
          </Typography>
        </Box>
      )}
    </Card>
  );
}
