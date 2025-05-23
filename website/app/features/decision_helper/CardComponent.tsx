import { Card, CardContent, Typography, Button, IconButton, Box, Checkbox, FormControlLabel } from "@mui/material";
import { Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { EventCardProps, Event, CommonDecision, Task, Item, Project } from "./types";
import styles from "./DecisionHelper.module.css";
import { CardComponentProps, formatDate } from "./util/card_component";
import CalendarCard from "./cards/CalendarCard";
import TaskCard from "./cards/TaskCard";
import CommonDecisionCard from "./cards/CommonDecisionCard";
import ProjectCard from "./cards/ProjectCard";

export default function CardComponent({ item, decision, onDecision, onEdit, onDelete, onToggleComplete, type }: CardComponentProps & { type: "task" | "project" | "calendar" | "common_decision" }) {
  // Assuming item is always a Task in this context now that type field is removed
  // const hasDecision = item.type === "calendar" || item.type === "common_decision" || item.type === "task";

  const handleDecision = (id: string | number) => {
    if (onDecision) {
      onDecision(id);
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
      {type === "calendar" && <CalendarCard item={item as Event} decision={decision?.toString()} onDecision={handleDecision} />}
      {type === "task" && <TaskCard item={item as Task} onDecision={onDecision} onToggleComplete={onToggleComplete} />}
      {type === "common_decision" && <CommonDecisionCard item={item as CommonDecision} decision={decision?.toString()} onDecision={onDecision} />}
      {type === "project" && <ProjectCard item={item as Project} />}

      {/* Retaining decision display for tasks, events, and common decisions if applicable */}
      {/* Removed specific type checks here as well */}
      {/* {hasDecision && decision && (item.type === "calendar" || item.type === "common_decision") && ( */}
      {/*   <Box className={styles.decisionResultBottomRight}> */}
      {/*     <Typography variant="body1" color="primary" fontWeight="bold"> */}
      {/*       Decision: {decision} */}
      {/*     </Typography> */}
      {/*   </Box> */}
      {/* )} */}
      {(type === "task" || type === "calendar" || type === "common_decision") && decision && (
        <Box className={styles.decisionResultBottomRight}>
          <Typography variant="body1" color="primary" fontWeight="bold">
            Decision: {decision}
          </Typography>
        </Box>
      )}
    </Card>
  );
}
