"use client";
import React, { useState, useEffect, useRef } from "react";
import { Box, IconButton, Slider, Typography } from "@mui/material";
import { PlayArrow, Pause, VolumeUp, VolumeOff, Fullscreen } from "@mui/icons-material";

interface VideoPlayerProps {
  filename: string;
  videoType?: "movie" | "tv";
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ filename, videoType = "movie" }) => {
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);

  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<number | null>(null);

  const contentServerUrl = process.env.NEXT_PUBLIC_CONTENT_SERVER_URL || "http://localhost:3001";
  // Convert backslashes to forward slashes and encode the filename for URL
  const encodedFilename = encodeURIComponent(filename.replace(/\\/g, "/"));
  const videoUrl = videoType === "tv" ? `${contentServerUrl}/videos/tv/${encodedFilename}` : `${contentServerUrl}/videos/movies/${encodedFilename}`;

  const togglePlayPause = () => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
  };

  const handleProgressChange = (event: Event, newValue: number | number[]) => {
    if (!videoRef.current) return;
    const time = ((newValue as number) * duration) / 100;
    videoRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const handleVolumeChange = (event: Event, newValue: number | number[]) => {
    if (!videoRef.current) return;
    const vol = (newValue as number) / 100;
    videoRef.current.volume = vol;
    setVolume(vol);
    setIsMuted(vol === 0);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;

    if (isMuted) {
      videoRef.current.volume = volume;
      setIsMuted(false);
    } else {
      videoRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;

    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await containerRef.current.requestFullscreen();
      }
    } catch (error) {
      console.error("Fullscreen error:", error);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      window.clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = window.setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  };

  useEffect(() => {
    setError(null);
  }, [filename]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);

    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!videoRef.current) return;

      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault();
          videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 5);
          break;
        case "ArrowRight":
          e.preventDefault();
          videoRef.current.currentTime = Math.min(videoRef.current.duration || 0, videoRef.current.currentTime + 5);
          break;
        case " ":
          e.preventDefault();
          togglePlayPause();
          break;
        case "m":
        case "M":
          e.preventDefault();
          toggleMute();
          break;
        case "f":
        case "F":
          e.preventDefault();
          toggleFullscreen();
          break;
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("keydown", handleKeyDown);
      container.setAttribute("tabindex", "0");
    }

    return () => {
      if (container) {
        container.removeEventListener("keydown", handleKeyDown);
      }
    };
  }, [togglePlayPause, toggleMute, toggleFullscreen]);

  const handleError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    console.error("Video playback error:", e);
    const target = e.target as HTMLVideoElement;
    const error = target.error;

    let errorMessage = "Error playing video.";

    if (error) {
      switch (error.code) {
        case error.MEDIA_ERR_NETWORK:
          errorMessage = "Network error: Unable to load video. Please check if the content server is running.";
          break;
        case error.MEDIA_ERR_DECODE:
          errorMessage = "Video decode error: The video file may be corrupted.";
          break;
        case error.MEDIA_ERR_SRC_NOT_SUPPORTED:
          errorMessage = "Video format not supported or file not found.";
          break;
        default:
          errorMessage = "Unknown video error occurred.";
      }
    }

    setError(errorMessage);
  };

  if (error) {
    return (
      <div
        className="error-container"
        style={{
          padding: "20px",
          backgroundColor: "#fee2e2",
          border: "1px solid #ef4444",
          borderRadius: "8px",
          color: "#991b1b",
        }}
      >
        <p>{error}</p>
        <button
          onClick={() => setError(null)}
          style={{
            marginTop: "10px",
            padding: "8px 16px",
            backgroundColor: "#dc2626",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <Box
      ref={containerRef}
      sx={{
        position: "relative",
        width: "100%",
        maxWidth: "1000px",
        backgroundColor: "#000",
        borderRadius: 1,
        overflow: "hidden",
        outline: "none",
        "&:focus": {
          outline: "2px solid #1976d2",
        },
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      <video ref={videoRef} width="100%" style={{ display: "block" }} onError={handleError} onClick={togglePlayPause}>
        <source src={videoUrl} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      <Box
        sx={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          background: "linear-gradient(transparent, rgba(0,0,0,0.7))",
          padding: 2,
          opacity: showControls ? 1 : 0,
          transition: "opacity 0.3s ease",
        }}
      >
        <Box sx={{ mb: 1 }}>
          <Slider
            value={duration ? (currentTime / duration) * 100 : 0}
            onChange={handleProgressChange}
            sx={{
              color: "#fff",
              "& .MuiSlider-thumb": {
                width: 12,
                height: 12,
              },
            }}
          />
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <IconButton onClick={togglePlayPause} sx={{ color: "#fff" }}>
            {isPlaying ? <Pause /> : <PlayArrow />}
          </IconButton>

          <Typography variant="body2" sx={{ color: "#fff", minWidth: "80px" }}>
            {formatTime(currentTime)} / {formatTime(duration)}
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1, ml: 2 }}>
            <IconButton onClick={toggleMute} sx={{ color: "#fff" }}>
              {isMuted ? <VolumeOff /> : <VolumeUp />}
            </IconButton>
            <Slider
              value={isMuted ? 0 : volume * 100}
              onChange={handleVolumeChange}
              sx={{
                width: 80,
                color: "#fff",
                "& .MuiSlider-thumb": {
                  width: 10,
                  height: 10,
                },
              }}
            />
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          <IconButton onClick={toggleFullscreen} sx={{ color: "#fff" }}>
            <Fullscreen />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
};

export default VideoPlayer;
