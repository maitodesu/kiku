import { describe, expect, it } from "vitest";
import { style } from "./style";

describe("style", () => {
  it("converts a simple object to a style string", () => {
    expect(style({ color: "red" })).toBe("color: red;");
  });

  it("handles multiple properties", () => {
    expect(style({ color: "red", "font-size": "12px" })).toBe("color: red; font-size: 12px;");
  });

  it("handles numeric values", () => {
    expect(style({ "font-size": 12, "z-index": 100 })).toBe("font-size: 12; z-index: 100;");
  });

  it("skips null values", () => {
    expect(style({ color: "red", opacity: null })).toBe("color: red;");
  });

  it("skips undefined values", () => {
    expect(style({ color: "red", opacity: undefined })).toBe("color: red;");
  });

  it("skips false values", () => {
    expect(style({ color: "red", disabled: false })).toBe("color: red;");
  });

  it("includes true values", () => {
    expect(style({ visible: true })).toBe("visible: true;");
  });

  it("returns empty string for empty object", () => {
    expect(style({})).toBe("");
  });

  it("returns empty string when all values are null/undefined/false", () => {
    expect(style({ a: null, b: undefined, c: false })).toBe("");
  });

  it("trims trailing whitespace", () => {
    const result = style({ color: "red" });
    expect(result).not.toMatch(/\s$/);
  });

  it("handles boolean true value", () => {
    expect(style({ "pointer-events": true })).toBe("pointer-events: true;");
  });

  it("handles mixed types", () => {
    expect(
      style({
        width: "100%",
        "max-width": "48rem",
        display: "block",
        hidden: false,
        count: 0,
      }),
    ).toBe("width: 100%; max-width: 48rem; display: block; count: 0;");
  });

  it("skips only falsy values that are null, undefined, or exactly false", () => {
    // 0 and "" are truthy for this function (not skipped)
    expect(style({ a: 0, b: "" })).toBe("a: 0; b: ;");
  });

  it("handles CSS custom properties", () => {
    expect(style({ "--my-color": "red" })).toBe("--my-color: red;");
  });

  it("handles kebab-case property names", () => {
    expect(style({ "background-color": "blue", "border-radius": "4px" })).toBe(
      "background-color: blue; border-radius: 4px;",
    );
  });
});
