import type {
  Offer,
  OfferChoice,
  OfferComparison,
  OfferEconomics,
} from "./types.ts";
import { promotionBundle, priceForAtLeastPackages } from "./promotions.ts";
import { toCanonical } from "./units.ts";

function assertOffersComparable(offers: Offer[]): void {
  if (offers.length === 0) {
    throw new RangeError("At least one offer is required");
  }

  const productId = offers[0]!.productId;
  const kind = offers[0]!.package.kind;

  for (const offer of offers) {
    if (offer.productId !== productId) {
      throw new TypeError("Offers must refer to the same canonical product");
    }

    if (offer.package.kind !== kind) {
      throw new TypeError(
        "Comparable offers must use the same measurement dimension",
      );
    }

    if (
      !Number.isInteger(offer.basePriceCents) ||
      offer.basePriceCents < 0
    ) {
      throw new RangeError("Offer prices must be non-negative integer cents");
    }
  }
}

export function economicsForOffer(offer: Offer): OfferEconomics {
  const bundle = promotionBundle(
    offer.basePriceCents,
    offer.promotion,
  );
  const canonicalPackage = toCanonical(offer.package);
  const canonicalAmountReceived =
    canonicalPackage.amount * bundle.packagesReceived;

  return {
    offer,
    bundle,
    canonicalKind: canonicalPackage.kind,
    canonicalAmountReceived,
    centsPerCanonicalUnit:
      bundle.checkoutPriceCents / canonicalAmountReceived,
  };
}

export function lowestCashChoice(
  offers: Offer[],
  desiredPackages = 1,
): OfferChoice {
  assertOffersComparable(offers);

  return offers
    .map((offer) => {
      const price = priceForAtLeastPackages(
        offer.basePriceCents,
        desiredPackages,
        offer.promotion,
      );

      return {
        offer,
        checkoutPriceCents: price.checkoutPriceCents,
        packagesReceived: price.packagesReceived,
      };
    })
    .sort(
      (a, b) =>
        a.checkoutPriceCents - b.checkoutPriceCents ||
        b.packagesReceived - a.packagesReceived ||
        a.offer.id.localeCompare(b.offer.id),
    )[0]!;
}

export function bestUnitValue(offers: Offer[]): OfferEconomics {
  assertOffersComparable(offers);

  return offers
    .map(economicsForOffer)
    .sort(
      (a, b) =>
        a.centsPerCanonicalUnit - b.centsPerCanonicalUnit ||
        a.bundle.checkoutPriceCents - b.bundle.checkoutPriceCents ||
        a.offer.id.localeCompare(b.offer.id),
    )[0]!;
}

export function compareOffers(
  offers: Offer[],
  desiredPackages = 1,
): OfferComparison {
  const lowestCashOutlay = lowestCashChoice(
    offers,
    desiredPackages,
  );
  const bestValue = bestUnitValue(offers);
  const cashEconomics = economicsForOffer(
    lowestCashOutlay.offer,
  );

  const sameOffer =
    lowestCashOutlay.offer.id === bestValue.offer.id;

  const additionalSpendCents = Math.max(
    0,
    bestValue.bundle.checkoutPriceCents -
      lowestCashOutlay.checkoutPriceCents,
  );

  const additionalPackages = Math.max(
    0,
    bestValue.bundle.packagesReceived -
      lowestCashOutlay.packagesReceived,
  );

  const unitSavingsPercent =
    cashEconomics.centsPerCanonicalUnit === 0
      ? 0
      : Math.max(
          0,
          ((cashEconomics.centsPerCanonicalUnit -
            bestValue.centsPerCanonicalUnit) /
            cashEconomics.centsPerCanonicalUnit) *
            100,
        );

  return {
    lowestCashOutlay,
    bestUnitValue: bestValue,
    tradeoff: {
      sameOffer,
      additionalSpendCents,
      additionalPackages,
      unitSavingsPercent,
    },
  };
}
