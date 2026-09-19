import assert from "node:assert/strict";
import test from "node:test";

import {
  observationFreshness,
  validateObservation,
  weightedPriceCentsPerGram,
} from "../src/observations.ts";
import type { PriceObservation } from "../src/types.ts";

function regularObservation(
  overrides: Partial<PriceObservation> = {},
): PriceObservation {
  return {
    id: "obs-1",
    retailerId: "walmart",
    storeId: "walmart-33174-1",
    productId: "milk-2pct-gallon",
    observedAt: "2026-09-19T12:00:00-04:00",
    confidence: 0.95,
    source: {
      kind: "RETAILER_WEB",
      uri: "https://example.test/product",
    },
    price: {
      kind: "PACKAGE",
      packagePriceCents: 398,
      package: {
        kind: "volume",
        amount: 1,
        unit: "gallon",
      },
    },
    ...overrides,
  };
}

test("recent regular price is fresh within its freshness window", () => {
  const result = observationFreshness(
    regularObservation(),
    "2026-09-19T18:00:00-04:00",
    24 * 60 * 60 * 1000,
  );

  assert.equal(result, "FRESH");
});

test("regular price becomes stale without inventing an expiration date", () => {
  const result = observationFreshness(
    regularObservation(),
    "2026-09-22T12:00:00-04:00",
    24 * 60 * 60 * 1000,
  );

  assert.equal(result, "STALE");
});

test("promotion validity beats recency when the offer has expired", () => {
  const observation = regularObservation({
    observedAt: "2026-09-19T08:00:00-04:00",
    validFrom: "2026-09-17T00:00:00-04:00",
    validUntil: "2026-09-19T10:00:00-04:00",
    promotion: {
      type: "BUY_X_GET_Y",
      buyQuantity: 1,
      freeQuantity: 1,
      requiresFullGroup: true,
    },
  });

  assert.equal(
    observationFreshness(
      observation,
      "2026-09-19T11:00:00-04:00",
      24 * 60 * 60 * 1000,
    ),
    "EXPIRED",
  );
});

test("future-dated offer is not yet valid", () => {
  const observation = regularObservation({
    validFrom: "2026-09-20T00:00:00-04:00",
    validUntil: "2026-09-26T23:59:59-04:00",
  });

  assert.equal(
    observationFreshness(
      observation,
      "2026-09-19T18:00:00-04:00",
      24 * 60 * 60 * 1000,
    ),
    "NOT_YET_VALID",
  );
});

test("weighted meat price remains a rate and does not invent a package total", () => {
  const observation = regularObservation({
    productId: "chicken-breast",
    price: {
      kind: "WEIGHTED",
      pricePerUnitCents: 299,
      unit: "lb",
    },
  });

  assert.equal(observation.price.kind, "WEIGHTED");
  if (observation.price.kind === "WEIGHTED") {
    assert.equal(observation.price.pricePerUnitCents, 299);
    assert.equal(observation.price.unit, "lb");
  }

  assert.ok(
    Math.abs(
      weightedPriceCentsPerGram(observation) -
        299 / 453.59237,
    ) < 1e-12,
  );
});

test("source provenance survives as first-class observation data", () => {
  const observation = regularObservation({
    source: {
      kind: "WEEKLY_AD",
      sourceId: "publix-week-2026-09-17",
      uri: "https://example.test/flyer",
      note: "Miami region",
    },
  });

  validateObservation(observation);
  assert.equal(observation.source.kind, "WEEKLY_AD");
  assert.equal(
    observation.source.sourceId,
    "publix-week-2026-09-17",
  );
  assert.equal(observation.source.note, "Miami region");
});

test("invalid confidence is rejected", () => {
  assert.throws(
    () =>
      validateObservation(
        regularObservation({ confidence: 1.2 }),
      ),
    /confidence/,
  );
});
