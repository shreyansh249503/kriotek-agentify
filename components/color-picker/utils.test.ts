import {
  hexToRgb,
  hsvToRgb,
  hexToHsv,
  hsvToHex,
  isValidHex,
} from "./utils";

describe("color-picker utils", () => {
  describe("hexToRgb", () => {
    it("should convert 6-digit hex string to RGB object", () => {
      expect(hexToRgb("#ffffff")).toEqual({ r: 255, g: 255, b: 255 });
      expect(hexToRgb("#000000")).toEqual({ r: 0, g: 0, b: 0 });
      expect(hexToRgb("#ff0000")).toEqual({ r: 255, g: 0, b: 0 });
    });

    it("should convert 3-digit shorthand hex string to RGB object", () => {
      expect(hexToRgb("#fff")).toEqual({ r: 255, g: 255, b: 255 });
      expect(hexToRgb("#f00")).toEqual({ r: 255, g: 0, b: 0 });
    });
  });

  describe("hsvToRgb", () => {
    it("should convert HSV values to RGB object for all hue sectors", () => {
      expect(hsvToRgb(0, 100, 100)).toEqual({ r: 255, g: 0, b: 0 });
      expect(hsvToRgb(120, 100, 100)).toEqual({ r: 0, g: 255, b: 0 });
      expect(hsvToRgb(240, 100, 100)).toEqual({ r: 0, g: 0, b: 255 });
      expect(hsvToRgb(60, 100, 100)).toEqual({ r: 255, g: 255, b: 0 });
      expect(hsvToRgb(180, 100, 100)).toEqual({ r: 0, g: 255, b: 255 });
      expect(hsvToRgb(300, 100, 100)).toEqual({ r: 255, g: 0, b: 255 });
    });
  });

  describe("hexToHsv & hsvToHex", () => {
    it("should convert hex to HSV correctly", () => {
      const hsvRed = hexToHsv("#ff0000");
      expect(hsvRed.h).toBeCloseTo(0);
      expect(hsvRed.s).toBeCloseTo(100);
      expect(hsvRed.v).toBeCloseTo(100);
    });

    it("should convert HSV to hex correctly", () => {
      expect(hsvToHex(0, 100, 100)).toBe("#ff0000");
      expect(hsvToHex(0, 0, 100)).toBe("#ffffff");
      expect(hsvToHex(0, 0, 0)).toBe("#000000");
    });
  });

  describe("isValidHex", () => {
    it("should validate hex color strings accurately", () => {
      expect(isValidHex("#fff")).toBe(true);
      expect(isValidHex("#FFFFFF")).toBe(true);
      expect(isValidHex("#000000")).toBe(true);
      expect(isValidHex("ff0000")).toBe(true);
      expect(isValidHex("#invalid")).toBe(false);
      expect(isValidHex("#1234")).toBe(false);
    });
  });
});
