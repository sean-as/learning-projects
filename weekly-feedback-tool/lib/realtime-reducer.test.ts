import { describe, it, expect } from "vitest";
import { applyRealtimeEvent } from "./realtime-reducer";

type Row = { id: string; name: string };

describe("applyRealtimeEvent", () => {
  it("appends a row on insert", () => {
    const rows: Row[] = [{ id: "1", name: "a" }];
    const result = applyRealtimeEvent(rows, {
      eventType: "INSERT",
      new: { id: "2", name: "b" },
    });
    expect(result).toEqual([
      { id: "1", name: "a" },
      { id: "2", name: "b" },
    ]);
  });

  it("does not duplicate an insert for an id already present", () => {
    const rows: Row[] = [{ id: "1", name: "a" }];
    const result = applyRealtimeEvent(rows, {
      eventType: "INSERT",
      new: { id: "1", name: "a" },
    });
    expect(result).toEqual(rows);
  });

  it("patches a row on update", () => {
    const rows: Row[] = [
      { id: "1", name: "a" },
      { id: "2", name: "b" },
    ];
    const result = applyRealtimeEvent(rows, {
      eventType: "UPDATE",
      new: { id: "2", name: "b-updated" },
    });
    expect(result).toEqual([
      { id: "1", name: "a" },
      { id: "2", name: "b-updated" },
    ]);
  });

  it("removes a row on delete", () => {
    const rows: Row[] = [
      { id: "1", name: "a" },
      { id: "2", name: "b" },
    ];
    const result = applyRealtimeEvent(rows, {
      eventType: "DELETE",
      old: { id: "1", name: "a" },
    });
    expect(result).toEqual([{ id: "2", name: "b" }]);
  });

  it("is a no-op deleting an id that is not present", () => {
    const rows: Row[] = [{ id: "1", name: "a" }];
    const result = applyRealtimeEvent(rows, {
      eventType: "DELETE",
      old: { id: "99", name: "z" },
    });
    expect(result).toEqual(rows);
  });
});
