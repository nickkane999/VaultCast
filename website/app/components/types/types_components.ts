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

export type CommonDecision = {
  id: string | number;
  name: string;
};
