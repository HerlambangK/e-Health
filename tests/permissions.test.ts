import { describe, it, expect } from "vitest";
import { hasPermission } from "../utils/permissions";

describe("RBAC permissions", () => {
  it("allows admin to create billing", () => {
    expect(hasPermission("admin", "billing", "create")).toBe(true);
  });

  it("denies patient to delete rekamedis", () => {
    expect(hasPermission("patient", "rekamedis", "delete")).toBe(false);
  });

  it("allows doctor to update rekamedis", () => {
    expect(hasPermission("doctor", "rekamedis", "update")).toBe(true);
  });
});
