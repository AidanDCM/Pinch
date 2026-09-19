import type {
  MeasureKind,
  MeasureUnit,
  PackageMeasure,
} from "./types.ts";

const GRAMS_PER_UNIT: Partial<Record<MeasureUnit, number>> = {
  g: 1,
  kg: 1000,
  oz: 28.349523125,
  lb: 453.59237,
};

const MILLILITERS_PER_UNIT: Partial<Record<MeasureUnit, number>> = {
  ml: 1,
  l: 1000,
  fl_oz: 29.5735295625,
  cup: 236.5882365,
  pint: 473.176473,
  quart: 946.352946,
  gallon: 3785.411784,
};

const COUNT_PER_UNIT: Partial<Record<MeasureUnit, number>> = {
  count: 1,
  dozen: 12,
};

const UNIT_KIND: Record<MeasureUnit, MeasureKind> = {
  g: "mass",
  kg: "mass",
  oz: "mass",
  lb: "mass",
  ml: "volume",
  l: "volume",
  fl_oz: "volume",
  cup: "volume",
  pint: "volume",
  quart: "volume",
  gallon: "volume",
  count: "count",
  dozen: "count",
};

export interface CanonicalMeasure {
  kind: MeasureKind;
  amount: number;
  unit: "g" | "ml" | "count";
}

function assertPositiveFinite(value: number, label: string): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new RangeError(`${label} must be a positive finite number`);
  }
}

function factorFor(unit: MeasureUnit): number {
  const kind = UNIT_KIND[unit];

  if (kind === "mass") return GRAMS_PER_UNIT[unit]!;
  if (kind === "volume") return MILLILITERS_PER_UNIT[unit]!;
  return COUNT_PER_UNIT[unit]!;
}

export function kindForUnit(unit: MeasureUnit): MeasureKind {
  return UNIT_KIND[unit];
}

export function convertAmount(
  amount: number,
  fromUnit: MeasureUnit,
  toUnit: MeasureUnit,
): number {
  assertPositiveFinite(amount, "amount");

  const fromKind = kindForUnit(fromUnit);
  const toKind = kindForUnit(toUnit);

  if (fromKind !== toKind) {
    throw new TypeError(
      `Cannot convert ${fromUnit} (${fromKind}) to ${toUnit} (${toKind})`,
    );
  }

  return (amount * factorFor(fromUnit)) / factorFor(toUnit);
}

export function toCanonical(measure: PackageMeasure): CanonicalMeasure {
  assertPositiveFinite(measure.amount, "package amount");

  if (kindForUnit(measure.unit) !== measure.kind) {
    throw new TypeError(
      `Package kind ${measure.kind} does not match unit ${measure.unit}`,
    );
  }

  if (measure.kind === "mass") {
    return {
      kind: "mass",
      amount: convertAmount(measure.amount, measure.unit, "g"),
      unit: "g",
    };
  }

  if (measure.kind === "volume") {
    return {
      kind: "volume",
      amount: convertAmount(measure.amount, measure.unit, "ml"),
      unit: "ml",
    };
  }

  return {
    kind: "count",
    amount: convertAmount(measure.amount, measure.unit, "count"),
    unit: "count",
  };
}

export function pricePerRequestedUnitCents(
  priceCents: number,
  measure: PackageMeasure,
  targetUnit: MeasureUnit,
): number {
  assertPositiveFinite(priceCents, "priceCents");

  if (kindForUnit(targetUnit) !== measure.kind) {
    throw new TypeError(
      `Target unit ${targetUnit} is not compatible with ${measure.kind}`,
    );
  }

  const amountInTargetUnit = convertAmount(
    measure.amount,
    measure.unit,
    targetUnit,
  );

  return priceCents / amountInTargetUnit;
}
