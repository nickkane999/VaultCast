import { ObjectId } from "mongodb";

export interface Decision {
  id: string | number; // Using string to be consistent with MongoDB _id conversion
  name: string;
}

export interface Event extends Decision {
  date: string; // YYYY-MM-DD format
  startTime?: string; // Optional HH:mm format
  endTime?: string; // Optional HH:mm format
  attended?: boolean; // Add attended field
}

export interface CommonDecision extends Decision {}

export interface Task extends Decision {
  is_completed: boolean;
  tags?: string[];
  projectId?: string; // Reference to a Project
}

export interface Project extends Decision {
  description: string;
  dueDate: string; // YYYY-MM-DD format
  is_completed: boolean;
}

// Import Essential from the essentials slice instead of defining it here
export type { Essential } from "@/store/decision_helper/essentialsSlice";

export type EventCardProps = {
  event: Event;
  decision?: number;
  onDecision: (id: string | number) => void;
  onEdit: () => void;
  onDelete: () => void;
  onUpdate: (updatedEvent: Event) => void;
};

export type Item = Event | CommonDecision | Task | Project;
