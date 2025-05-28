"use client";

import { Button } from "@mui/material";
import { PlayArrow } from "@mui/icons-material";

interface TrailerButtonProps {
  trailerUrl: string;
}

export default function TrailerButton({ trailerUrl }: TrailerButtonProps) {
  const handleClick = () => {
    window.open(trailerUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <Button variant="contained" color="secondary" startIcon={<PlayArrow />} onClick={handleClick} size="large">
      Watch Trailer
    </Button>
  );
}
