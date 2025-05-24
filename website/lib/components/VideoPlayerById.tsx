"use client";
import React, { useState, useEffect } from "react";

interface VideoPlayerByIdProps {
  videoId: string;
  filename?: string;
}

const VideoPlayerById: React.FC<VideoPlayerByIdProps> = ({ videoId, filename }) => {
  const [error, setError] = useState<string | null>(null);
  const contentServerUrl = process.env.NEXT_PUBLIC_CONTENT_SERVER_URL || "http://localhost:3001";

  const videoUrl = `${contentServerUrl}/videos/by-id/${videoId}`;

  useEffect(() => {
    setError(null);
  }, [videoId]);

  const handleError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    console.error("Video playback error:", e);
    setError("Error playing video. Please check your VPN connection and ensure the content server is running.");
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
        {filename && <p style={{ fontSize: "0.875rem", marginTop: "8px" }}>Expected file: {filename}</p>}
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
    <div>
      <video controls width="100%" style={{ maxWidth: "1000px" }} onError={handleError}>
        <source src={videoUrl} type="video/mp4" />
        <source src={videoUrl} type="video/avi" />
        <source src={videoUrl} type="video/mov" />
        <source src={videoUrl} type="video/mkv" />
        Your browser does not support the video tag.
      </video>
      {filename && <p style={{ fontSize: "0.75rem", color: "#666", marginTop: "8px" }}>Playing: {filename}</p>}
    </div>
  );
};

export default VideoPlayerById;
