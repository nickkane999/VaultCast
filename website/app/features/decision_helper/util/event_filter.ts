import { Event } from "../types";

export const getFilteredAndSortedEvents = (events: Event[], dateFilter: string, sortOrder: "Ascending" | "Descending", hidePastDates: boolean) => {
  const now = new Date();
  const todayLocalMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const filtered = events.filter((event) => {
    const [year, month, day] = (event as Event).date.split("-").map(Number);
    const eventDateLocalMidnight = new Date(year, month - 1, day);

    if (hidePastDates) {
      if (eventDateLocalMidnight.getTime() < todayLocalMidnight.getTime()) {
        return false;
      }
    }

    switch (dateFilter) {
      case "All":
        return true;
      case "Current Year":
        return eventDateLocalMidnight.getFullYear() === now.getFullYear();
      case "Current Month":
        return eventDateLocalMidnight.getFullYear() === now.getFullYear() && eventDateLocalMidnight.getMonth() === now.getMonth();
      case "Current Week":
        const startOfWeek = new Date(todayLocalMidnight);
        startOfWeek.setDate(todayLocalMidnight.getDate() - todayLocalMidnight.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);

        return eventDateLocalMidnight.getTime() >= startOfWeek.getTime() && eventDateLocalMidnight.getTime() <= endOfWeek.getTime();
      case "Today":
        return eventDateLocalMidnight.getTime() === todayLocalMidnight.getTime();
      default:
        return true;
    }
  });

  const sorted = [...filtered].sort((a, b) => {
    const dateA = new Date((a as Event).date);
    const dateB = new Date((b as Event).date);

    if (sortOrder === "Ascending") {
      return dateA.getTime() - dateB.getTime();
    } else {
      return dateB.getTime() - dateA.getTime();
    }
  });

  return sorted;
};
