import React from "react";
import { Box, TextField, Button, Typography, Card, CardContent } from "@mui/material";
import { Essential } from "./types";
import styles from "./DecisionHelper.module.css";

interface EssentialFormProps {
  essential: Omit<Essential, "id">;
  onEssentialChange: (partialEssential: Partial<Omit<Essential, "id">>) => void;
  onSave: () => void;
  onCancel: () => void;
}

export default function EssentialForm({ essential, onEssentialChange, onSave, onCancel }: EssentialFormProps) {
  const handleChange = (field: keyof Essential, value: string | number) => {
    onEssentialChange({ [field]: value });
  };

  return (
    <Card className={styles.essentialFormCard}>
      <CardContent>
        <Typography variant="h6" className={styles.essentialFormTitle}>
          Add New Essential
        </Typography>

        <Box className={styles.essentialFormFields}>
          <TextField label="Title" value={essential?.title || ""} onChange={(e) => handleChange("title", e.target.value)} fullWidth required />

          <TextField label="Description" value={essential?.description || ""} onChange={(e) => handleChange("description", e.target.value)} fullWidth multiline rows={3} required />

          <TextField label="Due Date" type="date" value={essential?.due_date || ""} onChange={(e) => handleChange("due_date", e.target.value)} fullWidth required InputLabelProps={{ shrink: true }} />

          <TextField label="Interval (days)" type="number" value={essential?.interval || 1} onChange={(e) => handleChange("interval", parseInt(e.target.value) || 1)} fullWidth required inputProps={{ min: 1 }} />

          <Box className={styles.essentialFormButtons}>
            <Button variant="outlined" onClick={onCancel}>
              Cancel
            </Button>
            <Button variant="contained" onClick={onSave}>
              Save
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
