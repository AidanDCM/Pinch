import { toCanonical } from "@pinch/pricing-engine";
import type {
  ComparableCatalogItem,
  ProductRelationship,
  SubstitutionPolicy,
} from "./types.ts";

function samePackage(
  left: ComparableCatalogItem,
  right: ComparableCatalogItem,
): boolean {
  const a = toCanonical(left.package);
  const b = toCanonical(right.package);

  if (a.kind !== b.kind) return false;

  const scale = Math.max(1, Math.abs(a.amount), Math.abs(b.amount));
  return Math.abs(a.amount - b.amount) <= scale * 1e-9;
}

function sameBrand(
  left: ComparableCatalogItem,
  right: ComparableCatalogItem,
): boolean {
  return Boolean(left.brandId) && left.brandId === right.brandId;
}

export function classifyProductRelationship(
  left: ComparableCatalogItem,
  right: ComparableCatalogItem,
  policy: SubstitutionPolicy = {},
): ProductRelationship {
  if (left.gtin && right.gtin && left.gtin === right.gtin) {
    return {
      level: "EXACT",
      reason: "Matching GTIN identifies the same sellable product.",
    };
  }

  if (
    left.productId === right.productId &&
    sameBrand(left, right) &&
    left.variantKey === right.variantKey &&
    samePackage(left, right)
  ) {
    return {
      level: "EXACT",
      reason:
        "Canonical product, brand, variant, and normalized package size match.",
    };
  }

  if (
    left.productId === right.productId &&
    sameBrand(left, right) &&
    left.variantKey === right.variantKey
  ) {
    return {
      level: "SAME_PRODUCT_DIFFERENT_SIZE",
      reason:
        "Canonical product, brand, and variant match but package size differs.",
    };
  }

  if (
    sameBrand(left, right) &&
    left.categoryId === right.categoryId &&
    left.equivalenceGroupId === right.equivalenceGroupId
  ) {
    return {
      level: "SAME_BRAND_EQUIVALENT",
      reason:
        "Items share a brand and an equivalence group but are not the same exact variant.",
    };
  }

  if (
    left.categoryId === right.categoryId &&
    left.equivalenceGroupId === right.equivalenceGroupId
  ) {
    return {
      level: "CATEGORY_EQUIVALENT",
      reason:
        "Items are different products in the same explicitly comparable equivalence group.",
    };
  }

  if (
    policy.acceptedProductIds?.includes(right.productId) ||
    policy.acceptedEquivalenceGroupIds?.includes(
      right.equivalenceGroupId,
    )
  ) {
    return {
      level: "USER_ACCEPTABLE_SUBSTITUTE",
      reason:
        "The user's substitution policy explicitly permits this alternative.",
    };
  }

  return {
    level: "NOT_COMPARABLE",
    reason:
      "No exact, equivalence-group, or user-approved substitution relationship exists.",
  };
}
