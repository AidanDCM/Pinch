import assert from "node:assert/strict";
import test from "node:test";

import {
  priceForAtLeastPackages,
  promotionBundle,
} from "../src/promotions.ts";

test("BOGO preserves checkout cash and effective unit value", () => {
  const bundle = promotionBundle(200, {
    type: "BUY_X_GET_Y",
    buyQuantity: 1,
    freeQuantity: 1,
    requiresFullGroup: true,
  });

  assert.equal(bundle.checkoutPriceCents, 200);
  assert.equal(bundle.packagesReceived, 2);
  assert.equal(bundle.effectivePricePerPackageCents, 100);
});

test("BOGO requiring a pair does not invent a half-price single", () => {
  const one = priceForAtLeastPackages(200, 1, {
    type: "BUY_X_GET_Y",
    buyQuantity: 1,
    freeQuantity: 1,
    requiresFullGroup: true,
  });

  assert.equal(one.checkoutPriceCents, 200);
  assert.equal(one.packagesReceived, 2);
});

test("multibuy computes effective package price", () => {
  const bundle = promotionBundle(300, {
    type: "MULTIBUY",
    quantity: 2,
    totalPriceCents: 500,
    requiresFullQuantity: true,
  });

  assert.equal(bundle.checkoutPriceCents, 500);
  assert.equal(bundle.packagesReceived, 2);
  assert.equal(bundle.effectivePricePerPackageCents, 250);
});

test("percent discounts stay in integer cents", () => {
  const bundle = promotionBundle(399, {
    type: "PERCENT_OFF",
    percent: 25,
  });

  assert.equal(bundle.checkoutPriceCents, 299);
});

test("fixed discounts cannot create negative checkout totals", () => {
  const bundle = promotionBundle(100, {
    type: "AMOUNT_OFF",
    amountOffCents: 150,
  });

  assert.equal(bundle.checkoutPriceCents, 0);
});
