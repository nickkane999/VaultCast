import { Event, CommonDecision, Task } from "../types";

export interface CardComponentProps {
  item: Event | CommonDecision | Task;
  onDecision?: (id: string | number) => void;
  onEdit: (item: Event | CommonDecision | Task) => void;
  onDelete: (id: string | number) => void;
  decision?: number;
  onToggleComplete?: (item: Task) => void;
}

export const formatDate = (dateString?: string) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const offset = date.getTimezoneOffset() * 60000;
  const localDate = new Date(date.getTime() + offset);
  const options = { year: "numeric", month: "short", day: "numeric" } as const;
  return localDate.toLocaleDateString("en-US", options);
};
