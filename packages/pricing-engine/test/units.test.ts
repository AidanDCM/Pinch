import assert from "node:assert/strict";
import test from "node:test";

import {
  convertAmount,
  pricePerRequestedUnitCents,
  toCanonical,
} from "../src/units.ts";

test("normalizes one pound to grams", () => {
  assert.ok(
    Math.abs(convertAmount(1, "lb", "g") - 453.59237) < 1e-9,
  );
});

test("normalizes sixteen ounces to one pound", () => {
  assert.ok(Math.abs(convertAmount(16, "oz", "lb") - 1) < 1e-12);
});

test("normalizes one gallon to milliliters", () => {
  assert.ok(
    Math.abs(
      convertAmount(1, "gallon", "ml") - 3785.411784,
    ) < 1e-6,
  );
});

test("normalizes a dozen to twelve items", () => {
  assert.equal(convertAmount(1, "dozen", "count"), 12);
});

test("calculates advertised weighted meat price per pound", () => {
  const centsPerPound = pricePerRequestedUnitCents(
    897,
    { kind: "mass", amount: 3, unit: "lb" },
    "lb",
  );

  assert.equal(centsPerPound, 299);
});

test("rejects mismatched package kind and unit", () => {
  assert.throws(
    () =>
      toCanonical({
        kind: "mass",
        amount: 1,
        unit: "gallon",
      }),
    /does not match/,
  );
});
