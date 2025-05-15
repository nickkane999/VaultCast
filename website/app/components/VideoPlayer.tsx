import React from "react";

interface VideoPlayerProps {
  filename: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ filename }) => {
  // Use the proxied URL through Next.js
  const videoUrl = `/videos/${filename}`;

  return (
    <div>
      <video controls width="100%" style={{ maxWidth: "1000px" }}>
        <source src={videoUrl} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

export default VideoPlayer;
