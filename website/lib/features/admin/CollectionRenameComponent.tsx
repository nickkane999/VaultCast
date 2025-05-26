"use client";

import React, { useState, useEffect } from "react";
import { Box, Typography, FormControl, InputLabel, Select, MenuItem, Button, Alert, CircularProgress } from "@mui/material";
import IsolatedTextField from "@/lib/components/IsolatedTextField";

interface Collection {
  name: string;
}

export default function CollectionRenameComponent() {
  const [collections, setCollections] = useState<string[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<string>("");
  const [newCollectionName, setNewCollectionName] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [fetchingCollections, setFetchingCollections] = useState<boolean>(true);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Fetch collections on component mount
  useEffect(() => {
    fetchCollections();
  }, []);

  const fetchCollections = async () => {
    try {
      setFetchingCollections(true);
      const response = await fetch("/api/admin/collections");
      if (!response.ok) {
        throw new Error("Failed to fetch collections");
      }
      const data = await response.json();
      setCollections(data.collections || []);
    } catch (error) {
      console.error("Error fetching collections:", error);
      setMessage({ type: "error", text: "Failed to fetch collections" });
    } finally {
      setFetchingCollections(false);
    }
  };

  const handleCollectionChange = (event: any) => {
    const collection = event.target.value;
    setSelectedCollection(collection);
    setNewCollectionName(collection); // Pre-fill with current name
    setMessage(null); // Clear any previous messages
  };

  const handleNewNameChange = (value: string) => {
    setNewCollectionName(value);
    setMessage(null); // Clear any previous messages
  };

  const handleRenameCollection = async () => {
    if (!selectedCollection || !newCollectionName) {
      setMessage({ type: "error", text: "Please select a collection and enter a new name" });
      return;
    }

    if (selectedCollection === newCollectionName) {
      setMessage({ type: "error", text: "New name must be different from current name" });
      return;
    }

    try {
      setLoading(true);
      setMessage(null);

      const response = await fetch("/api/admin/collections/rename", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          oldName: selectedCollection,
          newName: newCollectionName,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to rename collection");
      }

      setMessage({ type: "success", text: `Collection "${selectedCollection}" renamed to "${newCollectionName}" successfully!` });

      // Refresh collections list
      await fetchCollections();

      // Reset form
      setSelectedCollection("");
      setNewCollectionName("");
    } catch (error: any) {
      console.error("Error renaming collection:", error);
      setMessage({ type: "error", text: error.message || "Failed to rename collection" });
    } finally {
      setLoading(false);
    }
  };

  const isUpdateDisabled = !selectedCollection || !newCollectionName || selectedCollection === newCollectionName || loading;

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Rename Collection
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Select a collection from your MongoDB database and rename it.
      </Typography>

      {message && (
        <Alert severity={message.type} sx={{ mb: 3 }}>
          {message.text}
        </Alert>
      )}

      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {/* Collection Selection */}
        <FormControl fullWidth>
          <InputLabel id="collection-select-label">Select Collection</InputLabel>
          <Select labelId="collection-select-label" value={selectedCollection} label="Select Collection" onChange={handleCollectionChange} disabled={fetchingCollections}>
            {fetchingCollections ? (
              <MenuItem disabled>
                <CircularProgress size={20} sx={{ mr: 1 }} />
                Loading collections...
              </MenuItem>
            ) : collections.length === 0 ? (
              <MenuItem disabled>No collections found</MenuItem>
            ) : (
              collections.map((collection) => (
                <MenuItem key={collection} value={collection}>
                  {collection}
                </MenuItem>
              ))
            )}
          </Select>
        </FormControl>

        {/* New Collection Name Input */}
        <IsolatedTextField fullWidth label="New Collection Name" value={newCollectionName} onDebouncedChange={handleNewNameChange} disabled={!selectedCollection} placeholder="Enter new collection name" />

        {/* Update Button */}
        <Button variant="contained" onClick={handleRenameCollection} disabled={isUpdateDisabled} sx={{ alignSelf: "flex-start" }}>
          {loading ? <CircularProgress size={20} /> : "Update"}
        </Button>

        {/* Current Selection Info */}
        {selectedCollection && (
          <Box sx={{ p: 2, bgcolor: "grey.50", borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary">
              <strong>Current:</strong> {selectedCollection}
            </Typography>
            {newCollectionName && newCollectionName !== selectedCollection && (
              <Typography variant="body2" color="text.secondary">
                <strong>New:</strong> {newCollectionName}
              </Typography>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
}
