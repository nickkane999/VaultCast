"use client";

import React from "react";
import { Box, Typography, Card, CardContent, CardActions, Button, Grid, Chip, IconButton, Paper } from "@mui/material";
import { History, Delete, PlayArrow, QueryBuilder } from "@mui/icons-material";
import { useMarketingLinks } from "../hooks/useMarketingLinks";
import { MarketingQuery } from "../types";

interface QueryCardProps {
  query: MarketingQuery;
  onLoad: (query: MarketingQuery) => void;
  onDelete: (queryId: string) => void;
}

function QueryCard({ query, onLoad, onDelete }: QueryCardProps) {
  const handleLoad = () => {
    onLoad(query);
  };

  const handleDelete = () => {
    onDelete(query.id);
  };

  return (
    <Card elevation={1} sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <CardContent sx={{ flex: 1 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
          <Typography variant="h6" component="h3" sx={{ fontWeight: "bold", flex: 1 }}>
            {query.query.length > 60 ? `${query.query.substring(0, 60)}...` : query.query}
          </Typography>
          <IconButton size="small" onClick={handleDelete} color="error">
            <Delete />
          </IconButton>
        </Box>

        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
          {query.platform && <Chip label={`Platform: ${query.platform}`} size="small" variant="outlined" />}
          {query.targetAudience && <Chip label={`Audience: ${query.targetAudience}`} size="small" variant="outlined" />}
          {query.budget && <Chip label={`Budget: ${query.budget}`} size="small" variant="outlined" />}
          {query.experience && <Chip label={`Experience: ${query.experience}`} size="small" variant="outlined" />}
          {query.product && <Chip label={`Product: ${query.product}`} size="small" variant="outlined" />}
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <QueryBuilder fontSize="small" />
          {new Date(query.createdAt).toLocaleDateString()}
        </Typography>
      </CardContent>

      <CardActions>
        <Button size="small" startIcon={<PlayArrow />} onClick={handleLoad} variant="contained" fullWidth>
          Load Query
        </Button>
      </CardActions>
    </Card>
  );
}

export default function SavedQueries() {
  const { savedQueries, loadQuery, deleteSavedQuery } = useMarketingLinks();

  const handleLoadQuery = (query: MarketingQuery) => {
    loadQuery(query);
  };

  const handleDeleteQuery = async (queryId: string) => {
    if (window.confirm("Are you sure you want to delete this saved query?")) {
      try {
        await deleteSavedQuery(queryId);
      } catch (error) {
        console.error("Failed to delete query:", error);
      }
    }
  };

  if (savedQueries.length === 0) {
    return (
      <Paper elevation={1} sx={{ p: 3, textAlign: "center" }}>
        <History sx={{ fontSize: 48, color: "text.secondary", mb: 2 }} />
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No saved queries yet
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Save your marketing queries to quickly reuse them later
        </Typography>
      </Paper>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <History color="primary" />
        Saved Queries ({savedQueries.length})
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Click "Load Query" to reuse a previous search or delete queries you no longer need.
      </Typography>

      <Grid container spacing={2}>
        {savedQueries.map((query) => (
          <Grid key={query.id} size={{ xs: 12, sm: 6, lg: 4 }}>
            <QueryCard query={query} onLoad={handleLoadQuery} onDelete={handleDeleteQuery} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
