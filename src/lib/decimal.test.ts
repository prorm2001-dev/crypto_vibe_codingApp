import { describe, expect, it } from "vitest";
import { comparePercent, percentChange, priceToMicro, microToPrice } from "./decimal";
import { pickWinningCoin } from "./winner";

describe("decimal", () => {
  it("converts prices without float drift", () => {
    expect(microToPrice(priceToMicro("42000.50"))).toBe("42000.5");
    expect(microToPrice(priceToMicro("0.00001234"))).toBe("0.00001234");
  });

  it("calculates percent change precisely", () => {
    expect(percentChange("100", "110")).toBe("10");
    expect(percentChange("100", "90")).toBe("-10");
    expect(percentChange("50000", "52500")).toBe("5");
  });

  it("compares percentages for winner determination", () => {
    expect(comparePercent("5.25", "5.2")).toBe(1);
    expect(comparePercent("3", "5")).toBe(-1);
    expect(comparePercent("2.5", "2.5")).toBe(0);
  });
});

describe("pickWinningCoin", () => {
  it("picks highest positive movement", () => {
    const changes = new Map([
      ["bitcoin", "2"],
      ["ethereum", "5.5"],
      ["solana", "-1"],
    ]);
    expect(
      pickWinningCoin(changes, ["bitcoin", "ethereum", "solana"]),
    ).toBe("ethereum");
  });

  it("falls back to least bad when all negative", () => {
    const changes = new Map([
      ["bitcoin", "-5"],
      ["ethereum", "-2"],
      ["solana", "-8"],
    ]);
    expect(
      pickWinningCoin(changes, ["bitcoin", "ethereum", "solana"]),
    ).toBe("ethereum");
  });

  it("breaks ties alphabetically", () => {
    const changes = new Map([
      ["bitcoin", "3"],
      ["cardano", "3"],
    ]);
    expect(pickWinningCoin(changes, ["bitcoin", "cardano"])).toBe("bitcoin");
  });
});
