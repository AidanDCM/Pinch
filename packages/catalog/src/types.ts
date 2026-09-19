import type { PackageMeasure } from "@pinch/pricing-engine";

export type MatchLevel =
  | "EXACT"
  | "SAME_PRODUCT_DIFFERENT_SIZE"
  | "SAME_BRAND_EQUIVALENT"
  | "CATEGORY_EQUIVALENT"
  | "USER_ACCEPTABLE_SUBSTITUTE"
  | "NOT_COMPARABLE";

export interface Brand {
  id: string;
  name: string;
}

export interface Category {
  id: string;
  name: string;
  parentId?: string;
}

export interface CanonicalProduct {
  id: string;
  name: string;
  categoryId: string;
  equivalenceGroupId: string;
}

export interface ComparableCatalogItem {
  id: string;
  productId: string;
  categoryId: string;
  equivalenceGroupId: string;
  brandId?: string;
  variantKey: string;
  gtin?: string;
  package: PackageMeasure;
}

export interface SubstitutionPolicy {
  acceptedProductIds?: readonly string[];
  acceptedEquivalenceGroupIds?: readonly string[];
}

export interface ProductRelationship {
  level: MatchLevel;
  reason: string;
}
