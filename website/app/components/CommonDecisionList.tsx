import { useState } from "react";
import { Box, Button, Card, CardContent, Typography, IconButton } from "@mui/material";
import { Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { CommonDecision } from "./types/types_components";

// Sample data for common decisions (replace with API fetch if needed)
const initialCommonDecisions: CommonDecision[] = [
  { id: 1, name: "Sample Decision 1" },
  { id: 2, name: "Sample Decision 2" },
];

export default function CommonDecisionList() {
  const [decisions, setDecisions] = useState<CommonDecision[]>(initialCommonDecisions);

  const handleDelete = (id: string | number) => {
    setDecisions((prev) => prev.filter((decision) => decision.id !== id));
  };

  // Placeholder for edit functionality
  const handleEdit = (id: string | number) => {
    console.log(`Edit common decision with ID: ${id}`);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {decisions.map((decision) => (
        <Card key={decision.id} variant="outlined" sx={{ width: "100%", borderRadius: 2, boxShadow: 2, p: 2, position: "relative" }}>
          <Box sx={{ position: "absolute", top: 8, right: 8 }}>
            <IconButton onClick={() => handleEdit(decision.id)} aria-label="Edit" size="small">
              <EditIcon />
            </IconButton>
            <IconButton onClick={() => handleDelete(decision.id)} aria-label="Delete" size="small">
              <DeleteIcon />
            </IconButton>
          </Box>
          <CardContent sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
            <Typography variant="h6" component="div">
              {decision.name}
            </Typography>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
}
