"use client";

import React, { useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, List, ListItem, ListItemText, ListItemAvatar, Avatar, Typography, Box, CircularProgress, Alert } from "@mui/material";
import { Search, Movie } from "@mui/icons-material";
import { tmdbService } from "@/lib/services/tmdbService";

interface TMDbSearchDialogProps {
  open: boolean;
  onClose: () => void;
  onSelectMovie: (movieData: any) => void;
  initialSearchTerm?: string;
}

export default function TMDbSearchDialog({ open, onClose, onSelectMovie, initialSearchTerm = "" }: TMDbSearchDialogProps) {
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const results = await tmdbService.searchMovies(searchTerm);
      setSearchResults(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to search movies");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectMovie = async (movie: any) => {
    setLoading(true);
    setError(null);

    try {
      const movieDetails = await tmdbService.getMovieDetails(movie.id);
      const formData = tmdbService.transformToVideoFormData(movieDetails);
      onSelectMovie(formData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch movie details");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).getFullYear();
    } catch {
      return "";
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Movie />
          Load Movie Data from TMDb
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            label="Search for movie"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter movie title..."
            variant="outlined"
            InputProps={{
              endAdornment: (
                <Button onClick={handleSearch} disabled={loading || !searchTerm.trim()} startIcon={<Search />} variant="contained" sx={{ ml: 1 }}>
                  Search
                </Button>
              ),
            }}
          />
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {!loading && searchResults.length > 0 && (
          <List sx={{ maxHeight: 400, overflow: "auto" }}>
            {searchResults.slice(0, 10).map((movie) => (
              <ListItem
                key={movie.id}
                onClick={() => handleSelectMovie(movie)}
                sx={{
                  border: "1px solid #e0e0e0",
                  borderRadius: 1,
                  mb: 1,
                  cursor: "pointer",
                  "&:hover": {
                    backgroundColor: "#f5f5f5",
                  },
                }}
              >
                <ListItemAvatar>
                  <Avatar src={movie.poster_path ? `https://image.tmdb.org/t/p/w92${movie.poster_path}` : undefined} variant="square" sx={{ width: 56, height: 84 }}>
                    <Movie />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography variant="h6" component="div">
                      {movie.title} {movie.release_date && `(${formatDate(movie.release_date)})`}
                    </Typography>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {movie.overview}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Rating: {movie.vote_average}/10 • TMDb ID: {movie.id}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}

        {!loading && searchResults.length === 0 && searchTerm && (
          <Typography variant="body1" color="text.secondary" sx={{ textAlign: "center", py: 4 }}>
            No movies found for "{searchTerm}". Try a different search term.
          </Typography>
        )}

        {!searchTerm && (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", py: 4 }}>
            Enter a movie title to search The Movie Database (TMDb).
          </Typography>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );
}
