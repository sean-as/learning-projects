export type RealtimeEvent<T> =
  | { eventType: "INSERT"; new: T; old?: unknown }
  | { eventType: "UPDATE"; new: T; old?: unknown }
  | { eventType: "DELETE"; new?: unknown; old: T };

export function applyRealtimeEvent<T extends { id: string }>(
  rows: T[],
  event: RealtimeEvent<T>
): T[] {
  switch (event.eventType) {
    case "INSERT": {
      if (rows.some((row) => row.id === event.new.id)) {
        return rows;
      }
      return [...rows, event.new];
    }
    case "UPDATE": {
      return rows.map((row) => (row.id === event.new.id ? { ...row, ...event.new } : row));
    }
    case "DELETE": {
      return rows.filter((row) => row.id !== event.old.id);
    }
    default:
      return rows;
  }
}
