import { Event } from "../types";

export async function deleteEvent(id: string | number) {
  const response = await fetch(`/api/decision_helper/events?id=${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error("Failed to delete event");
  }
  return response;
}

export async function updateEvent(event: any) {
  const res = await fetch(`/api/decision_helper/events?id=${event.id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ...event }),
  });
  if (!res.ok) {
    throw new Error("Failed to update event");
  }
  return res.json();
}

export async function addEvent(newEvent: any) {
  const res = await fetch("/api/decision_helper/events", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ...newEvent, attended: newEvent.attended ?? false }),
  });
  if (!res.ok) {
    throw new Error("Failed to add event");
  }
  return res.json();
}
