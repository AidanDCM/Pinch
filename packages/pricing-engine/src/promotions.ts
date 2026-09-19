import type {
  BundleEconomics,
  MoneyCents,
  Promotion,
  QuantityPrice,
} from "./types.ts";

function assertMoney(value: number, label: string): void {
  if (!Number.isInteger(value) || value < 0) {
    throw new RangeError(`${label} must be a non-negative integer number of cents`);
  }
}

function assertPositiveInteger(value: number, label: string): void {
  if (!Number.isInteger(value) || value <= 0) {
    throw new RangeError(`${label} must be a positive integer`);
  }
}

export function promotionBundle(
  basePriceCents: MoneyCents,
  promotion: Promotion = { type: "NONE" },
): BundleEconomics {
  assertMoney(basePriceCents, "basePriceCents");

  switch (promotion.type) {
    case "NONE":
      return {
        checkoutPriceCents: basePriceCents,
        packagesReceived: 1,
        effectivePricePerPackageCents: basePriceCents,
      };

    case "BUY_X_GET_Y": {
      assertPositiveInteger(promotion.buyQuantity, "buyQuantity");
      assertPositiveInteger(promotion.freeQuantity, "freeQuantity");

      const packagesReceived =
        promotion.buyQuantity + promotion.freeQuantity;
      const checkoutPriceCents =
        basePriceCents * promotion.buyQuantity;

      return {
        checkoutPriceCents,
        packagesReceived,
        effectivePricePerPackageCents:
          checkoutPriceCents / packagesReceived,
      };
    }

    case "MULTIBUY":
      assertPositiveInteger(promotion.quantity, "quantity");
      assertMoney(promotion.totalPriceCents, "totalPriceCents");

      return {
        checkoutPriceCents: promotion.totalPriceCents,
        packagesReceived: promotion.quantity,
        effectivePricePerPackageCents:
          promotion.totalPriceCents / promotion.quantity,
      };

    case "PERCENT_OFF": {
      if (
        !Number.isFinite(promotion.percent) ||
        promotion.percent < 0 ||
        promotion.percent > 100
      ) {
        throw new RangeError("percent must be between 0 and 100");
      }

      const checkoutPriceCents = Math.round(
        basePriceCents * (1 - promotion.percent / 100),
      );

      return {
        checkoutPriceCents,
        packagesReceived: 1,
        effectivePricePerPackageCents: checkoutPriceCents,
      };
    }

    case "AMOUNT_OFF": {
      assertMoney(promotion.amountOffCents, "amountOffCents");
      const checkoutPriceCents = Math.max(
        0,
        basePriceCents - promotion.amountOffCents,
      );

      return {
        checkoutPriceCents,
        packagesReceived: 1,
        effectivePricePerPackageCents: checkoutPriceCents,
      };
    }
  }
}

export function priceForAtLeastPackages(
  basePriceCents: MoneyCents,
  desiredPackages: number,
  promotion: Promotion = { type: "NONE" },
): QuantityPrice {
  assertMoney(basePriceCents, "basePriceCents");
  assertPositiveInteger(desiredPackages, "desiredPackages");

  if (promotion.type === "NONE") {
    return {
      checkoutPriceCents: basePriceCents * desiredPackages,
      packagesReceived: desiredPackages,
    };
  }

  if (promotion.type === "PERCENT_OFF") {
    const bundle = promotionBundle(basePriceCents, promotion);
    return {
      checkoutPriceCents:
        bundle.checkoutPriceCents * desiredPackages,
      packagesReceived: desiredPackages,
    };
  }

  if (promotion.type === "AMOUNT_OFF") {
    const bundle = promotionBundle(basePriceCents, promotion);
    return {
      checkoutPriceCents:
        bundle.checkoutPriceCents * desiredPackages,
      packagesReceived: desiredPackages,
    };
  }

  const bundle = promotionBundle(basePriceCents, promotion);

  const promotionRequiresFullGroup =
    promotion.type === "BUY_X_GET_Y"
      ? promotion.requiresFullGroup
      : promotion.requiresFullQuantity;

  if (!promotionRequiresFullGroup) {
    const perPackage = bundle.effectivePricePerPackageCents;
    return {
      checkoutPriceCents: Math.round(perPackage * desiredPackages),
      packagesReceived: desiredPackages,
    };
  }

  let best: QuantityPrice = {
    checkoutPriceCents: basePriceCents * desiredPackages,
    packagesReceived: desiredPackages,
  };

  const maxGroups = Math.ceil(
    desiredPackages / bundle.packagesReceived,
  );

  for (let groups = 1; groups <= maxGroups; groups += 1) {
    const promoPackages = groups * bundle.packagesReceived;
    const remainder = Math.max(0, desiredPackages - promoPackages);
    const checkoutPriceCents =
      groups * bundle.checkoutPriceCents +
      remainder * basePriceCents;
    const packagesReceived = promoPackages + remainder;

    if (
      checkoutPriceCents < best.checkoutPriceCents ||
      (checkoutPriceCents === best.checkoutPriceCents &&
        packagesReceived > best.packagesReceived)
    ) {
      best = { checkoutPriceCents, packagesReceived };
    }
  }

  return best;
}
