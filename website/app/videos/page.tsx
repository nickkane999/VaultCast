import styles from "../page.module.css";
import VideoPlayer from "../../lib/components/VideoPlayer";

export default function Videos() {
  const videoFilename = "John Wick.mp4";

  return (
    <div className={styles.page}>
      <h1>Videos</h1>
      <VideoPlayer filename={videoFilename} />
    </div>
  );
}
