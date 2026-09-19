import { convertAmount } from "@pinch/pricing-engine";
import type {
  ObservationFreshness,
  PriceObservation,
} from "./types.ts";

function parseTimestamp(value: string, label: string): number {
  const parsed = Date.parse(value);
  if (!Number.isFinite(parsed)) {
    throw new TypeError(`${label} must be a valid ISO-compatible timestamp`);
  }
  return parsed;
}

export function validateObservation(
  observation: PriceObservation,
): void {
  if (!observation.id.trim()) {
    throw new TypeError("observation.id is required");
  }
  if (!observation.retailerId.trim()) {
    throw new TypeError("retailerId is required");
  }
  if (!observation.storeId.trim()) {
    throw new TypeError("storeId is required");
  }
  if (!observation.productId.trim()) {
    throw new TypeError("productId is required");
  }

  const observedAt = parseTimestamp(
    observation.observedAt,
    "observedAt",
  );

  if (
    !Number.isFinite(observation.confidence) ||
    observation.confidence < 0 ||
    observation.confidence > 1
  ) {
    throw new RangeError("confidence must be between 0 and 1");
  }

  if (
    observation.price.kind === "PACKAGE" &&
    (!Number.isInteger(observation.price.packagePriceCents) ||
      observation.price.packagePriceCents < 0)
  ) {
    throw new RangeError(
      "packagePriceCents must be a non-negative integer",
    );
  }

  if (
    observation.price.kind === "WEIGHTED" &&
    (!Number.isInteger(observation.price.pricePerUnitCents) ||
      observation.price.pricePerUnitCents < 0)
  ) {
    throw new RangeError(
      "pricePerUnitCents must be a non-negative integer",
    );
  }

  if (observation.validFrom) {
    const validFrom = parseTimestamp(
      observation.validFrom,
      "validFrom",
    );
    if (validFrom < observedAt - 365 * 24 * 60 * 60 * 1000) {
      throw new RangeError(
        "validFrom is implausibly earlier than observedAt",
      );
    }
  }

  if (observation.validUntil) {
    const validUntil = parseTimestamp(
      observation.validUntil,
      "validUntil",
    );
    if (
      observation.validFrom &&
      validUntil <
        parseTimestamp(observation.validFrom, "validFrom")
    ) {
      throw new RangeError(
        "validUntil cannot be earlier than validFrom",
      );
    }
  }
}

export function observationFreshness(
  observation: PriceObservation,
  now: string,
  maxAgeMs: number,
): ObservationFreshness {
  validateObservation(observation);

  if (!Number.isFinite(maxAgeMs) || maxAgeMs < 0) {
    throw new RangeError("maxAgeMs must be non-negative");
  }

  const nowMs = parseTimestamp(now, "now");
  const observedMs = parseTimestamp(
    observation.observedAt,
    "observedAt",
  );

  if (
    observation.validFrom &&
    nowMs < parseTimestamp(observation.validFrom, "validFrom")
  ) {
    return "NOT_YET_VALID";
  }

  if (
    observation.validUntil &&
    nowMs > parseTimestamp(observation.validUntil, "validUntil")
  ) {
    return "EXPIRED";
  }

  return nowMs - observedMs <= maxAgeMs ? "FRESH" : "STALE";
}

export function weightedPriceCentsPerGram(
  observation: PriceObservation,
): number {
  if (observation.price.kind !== "WEIGHTED") {
    throw new TypeError(
      "weightedPriceCentsPerGram requires a WEIGHTED observation",
    );
  }

  const gramsPerAdvertisedUnit = convertAmount(
    1,
    observation.price.unit,
    "g",
  );

  return (
    observation.price.pricePerUnitCents /
    gramsPerAdvertisedUnit
  );
}
