export type Event = {
  id: string | number;
  name: string;
  date: string;
};

export type EventCardProps = {
  event: Event;
  decision?: number;
  onDecision: (id: string | number) => void;
};
