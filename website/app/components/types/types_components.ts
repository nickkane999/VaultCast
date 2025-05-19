export type Event = {
  id: string | number;
  name: string;
  date: string;
  type: "calendar" | "common_decision";
};

export type EventCardProps = {
  event: Event;
  decision?: number;
  onDecision: (id: string | number) => void;
  onEdit: () => void;
  onDelete: () => void;
  onUpdate: (updatedEvent: Event) => void;
};

export interface CommonDecision {
  id: string | number;
  name: string;
  type: "common_decision";
}

export interface Task {
  id: string | number;
  name: string;
  type: "task";
  is_completed: boolean;
  tags?: string[];
}

export type Item = Event | CommonDecision | Task;
