export type MoneyCents = number;

export type MeasureKind = "mass" | "volume" | "count";

export type MassUnit = "g" | "kg" | "oz" | "lb";
export type VolumeUnit =
  | "ml"
  | "l"
  | "fl_oz"
  | "cup"
  | "pint"
  | "quart"
  | "gallon";
export type CountUnit = "count" | "dozen";
export type MeasureUnit = MassUnit | VolumeUnit | CountUnit;

export interface PackageMeasure {
  kind: MeasureKind;
  amount: number;
  unit: MeasureUnit;
}

export type Promotion =
  | { type: "NONE" }
  | {
      type: "BUY_X_GET_Y";
      buyQuantity: number;
      freeQuantity: number;
      requiresFullGroup: boolean;
    }
  | {
      type: "MULTIBUY";
      quantity: number;
      totalPriceCents: MoneyCents;
      requiresFullQuantity: boolean;
    }
  | {
      type: "PERCENT_OFF";
      percent: number;
    }
  | {
      type: "AMOUNT_OFF";
      amountOffCents: MoneyCents;
    };

export interface Offer {
  id: string;
  storeId: string;
  productId: string;
  label: string;
  basePriceCents: MoneyCents;
  package: PackageMeasure;
  promotion?: Promotion;
}

export interface BundleEconomics {
  checkoutPriceCents: MoneyCents;
  packagesReceived: number;
  effectivePricePerPackageCents: number;
}

export interface QuantityPrice {
  checkoutPriceCents: MoneyCents;
  packagesReceived: number;
}

export interface OfferEconomics {
  offer: Offer;
  bundle: BundleEconomics;
  canonicalKind: MeasureKind;
  canonicalAmountReceived: number;
  centsPerCanonicalUnit: number;
}

export interface OfferChoice {
  offer: Offer;
  checkoutPriceCents: MoneyCents;
  packagesReceived: number;
}

export interface OfferComparison {
  lowestCashOutlay: OfferChoice;
  bestUnitValue: OfferEconomics;
  tradeoff: {
    sameOffer: boolean;
    additionalSpendCents: MoneyCents;
    additionalPackages: number;
    unitSavingsPercent: number;
  };
}
