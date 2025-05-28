"use client";

import React from "react";
import { useState, useEffect } from "react";
import Image from "next/image";
import styles from "@/app/page.module.css";

const CONTENT_SERVER_URL = process.env.NEXT_PUBLIC_CONTENT_SERVER_URL || "http://127.0.0.1:3001";

interface MediaDisplayProps {
  type: "image" | "video" | "file";
  path: string;
}

export default function MediaDisplay({ type, path }: MediaDisplayProps) {
  const [error, setError] = useState<string | null>(null);
  const fullUrl = `${CONTENT_SERVER_URL}/${path}`;

  const renderMedia = () => {
    switch (type) {
      case "image":
        return (
          <div className={styles.imageContainer}>
            <Image src={fullUrl} alt={path.split("/").pop() || "media"} width={400} height={300} style={{ objectFit: "contain" }} />
          </div>
        );
      case "video":
        return (
          <video controls className={styles.videoPlayer}>
            <source src={fullUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        );
      case "file":
        return (
          <a href={fullUrl} target="_blank" rel="noopener noreferrer" className={styles.fileLink}>
            {path.split("/").pop()}
          </a>
        );
      default:
        return <div>Unsupported media type</div>;
    }
  };

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  return <div className={styles.mediaDisplay}>{renderMedia()}</div>;
}
