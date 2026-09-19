import assert from "node:assert/strict";
import test from "node:test";

import { classifyProductRelationship } from "../src/matching.ts";
import type { ComparableCatalogItem } from "../src/types.ts";

function item(
  overrides: Partial<ComparableCatalogItem> = {},
): ComparableCatalogItem {
  return {
    id: "barilla-fettuccine-16",
    productId: "fettuccine",
    categoryId: "dry-pasta",
    equivalenceGroupId: "plain-dry-pasta",
    brandId: "barilla",
    variantKey: "regular",
    package: { kind: "mass", amount: 16, unit: "oz" },
    ...overrides,
  };
}

test("matching GTIN is exact even when retailer listing IDs differ", () => {
  const left = item({ id: "listing-a", gtin: "076808280749" });
  const right = item({ id: "listing-b", gtin: "076808280749" });

  assert.equal(
    classifyProductRelationship(left, right).level,
    "EXACT",
  );
});

test("same product and variant with a different package is not exact", () => {
  const left = item();
  const right = item({
    id: "barilla-fettuccine-12",
    package: { kind: "mass", amount: 12, unit: "oz" },
  });

  assert.equal(
    classifyProductRelationship(left, right).level,
    "SAME_PRODUCT_DIFFERENT_SIZE",
  );
});

test("unit aliases normalize before exact package comparison", () => {
  const left = item({
    package: { kind: "mass", amount: 16, unit: "oz" },
  });
  const right = item({
    id: "same-size-lb",
    package: { kind: "mass", amount: 1, unit: "lb" },
  });

  assert.equal(
    classifyProductRelationship(left, right).level,
    "EXACT",
  );
});

test("same brand pasta variants can be same-brand equivalents", () => {
  const fettuccine = item();
  const spaghetti = item({
    id: "barilla-spaghetti",
    productId: "spaghetti",
    variantKey: "spaghetti",
  });

  assert.equal(
    classifyProductRelationship(fettuccine, spaghetti).level,
    "SAME_BRAND_EQUIVALENT",
  );
});

test("store-brand and national-brand equivalents remain non-exact", () => {
  const barilla = item();
  const storeBrand = item({
    id: "store-fettuccine",
    brandId: "store-brand",
  });

  assert.equal(
    classifyProductRelationship(barilla, storeBrand).level,
    "CATEGORY_EQUIVALENT",
  );
});

test("unrelated categories are not comparable by default", () => {
  const pasta = item();
  const paperTowels = item({
    id: "paper-towels",
    productId: "paper-towels",
    categoryId: "household-paper",
    equivalenceGroupId: "paper-towels",
    brandId: "bounty",
    variantKey: "select-a-size",
    package: { kind: "count", amount: 6, unit: "count" },
  });

  assert.equal(
    classifyProductRelationship(pasta, paperTowels).level,
    "NOT_COMPARABLE",
  );
});

test("explicit user policy can allow an otherwise non-comparable substitute", () => {
  const porkSausage = item({
    id: "pork-sausage",
    productId: "pork-sausage",
    categoryId: "sausage",
    equivalenceGroupId: "pork-sausage",
    brandId: "brand-a",
    variantKey: "links",
    package: { kind: "mass", amount: 16, unit: "oz" },
  });
  const turkeySausage = item({
    id: "turkey-sausage",
    productId: "turkey-sausage",
    categoryId: "sausage",
    equivalenceGroupId: "turkey-sausage",
    brandId: "brand-b",
    variantKey: "links",
    package: { kind: "mass", amount: 16, unit: "oz" },
  });

  assert.equal(
    classifyProductRelationship(porkSausage, turkeySausage, {
      acceptedProductIds: ["turkey-sausage"],
    }).level,
    "USER_ACCEPTABLE_SUBSTITUTE",
  );
});
