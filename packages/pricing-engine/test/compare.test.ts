import assert from "node:assert/strict";
import test from "node:test";

import {
  bestUnitValue,
  compareOffers,
  lowestCashChoice,
} from "../src/compare.ts";
import type { Offer } from "../src/types.ts";

const pastaOffers: Offer[] = [
  {
    id: "store-a-pasta",
    storeId: "store-a",
    productId: "fettuccine",
    label: "Fettuccine 16 oz",
    basePriceCents: 150,
    package: { kind: "mass", amount: 16, unit: "oz" },
    promotion: { type: "NONE" },
  },
  {
    id: "store-b-pasta-bogo",
    storeId: "store-b",
    productId: "fettuccine",
    label: "Fettuccine 16 oz BOGO",
    basePriceCents: 200,
    package: { kind: "mass", amount: 16, unit: "oz" },
    promotion: {
      type: "BUY_X_GET_Y",
      buyQuantity: 1,
      freeQuantity: 1,
      requiresFullGroup: true,
    },
  },
];

test("separates lowest checkout price from best unit value", () => {
  const lowest = lowestCashChoice(pastaOffers);
  const value = bestUnitValue(pastaOffers);

  assert.equal(lowest.offer.id, "store-a-pasta");
  assert.equal(lowest.checkoutPriceCents, 150);

  assert.equal(value.offer.id, "store-b-pasta-bogo");
  assert.equal(value.bundle.checkoutPriceCents, 200);
  assert.equal(value.bundle.packagesReceived, 2);
});

test("explains the cash-versus-value tradeoff", () => {
  const result = compareOffers(pastaOffers);

  assert.equal(result.lowestCashOutlay.offer.id, "store-a-pasta");
  assert.equal(result.bestUnitValue.offer.id, "store-b-pasta-bogo");
  assert.equal(result.tradeoff.sameOffer, false);
  assert.equal(result.tradeoff.additionalSpendCents, 50);
  assert.equal(result.tradeoff.additionalPackages, 1);
  assert.ok(
    Math.abs(result.tradeoff.unitSavingsPercent - 33.3333333333) <
      1e-6,
  );
});

test("normalization makes different package sizes directly comparable", () => {
  const offers: Offer[] = [
    {
      id: "three-lb",
      storeId: "a",
      productId: "chicken",
      label: "Chicken 3 lb",
      basePriceCents: 897,
      package: { kind: "mass", amount: 3, unit: "lb" },
    },
    {
      id: "two-lb",
      storeId: "b",
      productId: "chicken",
      label: "Chicken 2 lb",
      basePriceCents: 640,
      package: { kind: "mass", amount: 2, unit: "lb" },
    },
  ];

  const value = bestUnitValue(offers);
  assert.equal(value.offer.id, "three-lb");
});
