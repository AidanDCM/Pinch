# Pinch

Pinch is a food purchasing optimizer. It answers a simple question:

> Given what I want to buy, where I am, my budget, and what I value, what is the smartest way to spend my money on food?

The first product is intentionally personal and local: a Miami grocery optimizer that can compare Sedano's, Fresco y Más, ALDI, Walmart, and Publix, normalize prices and promotions, build practical carts, and remember what was actually paid.

## Current milestone

**M1 — Price Truth**

The first engine must reliably distinguish:

- lowest cash outlay today
- best normalized unit value
- promotional value versus regular price
- package-size differences
- the extra cash required to obtain a better-value package or promotion

No AI model is allowed to invent or perform authoritative price math. AI may interpret intent and explain results; deterministic code calculates truth.

## Repository layout

- `packages/pricing-engine` — unit conversion, promotion math, and offer comparison
- `docs` — product contract and architecture decisions
- `.github/workflows` — automated regression checks

Future packages will cover the catalog, retailer ingestion, optimizer, nutrition, receipts, market intelligence, API, and UI.

## Core principle

**AI interprets intent. Deterministic systems calculate truth.**

## Development gates

1. M1 Price Truth
2. M2 Item Comparison
3. M3 Cart Optimization
4. M4 Budget Mode
5. M5 Conversational Shopping
6. M6 Shopping Mode
7. M7 Receipt Verification
8. M8 Price History and Verified Savings
9. M9 Nutrition / Fitness
10. M10 Personal Production Use

The product is not considered ready for broader productization until it is useful enough to replace the manual grocery-deal workflow in normal weekly shopping.
