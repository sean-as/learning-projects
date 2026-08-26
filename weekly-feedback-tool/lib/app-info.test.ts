import { describe, it, expect } from "vitest";
import { APP_NAME, greeting } from "./app-info";

describe("app-info", () => {
  it("exposes the app name", () => {
    expect(APP_NAME).toBe("Weekly Feedback Tool");
  });

  it("builds a greeting", () => {
    expect(greeting("Sean")).toBe("Weekly Feedback Tool: welcome, Sean");
  });
});
