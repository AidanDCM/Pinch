import type {
  MassUnit,
  MoneyCents,
  PackageMeasure,
  Promotion,
} from "@pinch/pricing-engine";

export interface Retailer {
  id: string;
  name: string;
}

export interface Store {
  id: string;
  retailerId: string;
  name: string;
  addressLine1: string;
  city: string;
  region: string;
  postalCode: string;
  latitude?: number;
  longitude?: number;
}

export type ObservationSourceKind =
  | "RETAILER_API"
  | "RETAILER_WEB"
  | "WEEKLY_AD"
  | "RECEIPT"
  | "SHELF_REPORT"
  | "MANUAL";

export interface ObservationSource {
  kind: ObservationSourceKind;
  sourceId?: string;
  uri?: string;
  note?: string;
}

export type PriceBasis =
  | {
      kind: "PACKAGE";
      packagePriceCents: MoneyCents;
      package: PackageMeasure;
    }
  | {
      kind: "WEIGHTED";
      pricePerUnitCents: MoneyCents;
      unit: Extract<MassUnit, "g" | "kg" | "oz" | "lb">;
    };

export interface PriceObservation {
  id: string;
  retailerId: string;
  storeId: string;
  productId: string;
  observedAt: string;
  validFrom?: string;
  validUntil?: string;
  confidence: number;
  source: ObservationSource;
  price: PriceBasis;
  promotion?: Promotion;
}

export type ObservationFreshness =
  | "NOT_YET_VALID"
  | "FRESH"
  | "STALE"
  | "EXPIRED";
