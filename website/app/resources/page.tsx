import styles from "../page.module.css";
import EventListClient from "../components/EventListClient";

type Event = { id: string | number; name: string; date: string };

export default async function Page() {
  const res = await fetch("http://localhost:3000/api/events");
  const data = await res.json();
  return (
    <div className={styles.page}>
      <h1>Personal Calendar</h1>
      <EventListClient initialEvents={data} />
    </div>
  );
}
