# Product Contract

## North Star

Pinch turns a food need into the smartest practical purchase plan.

Inputs may include:

- exact grocery items
- a meal idea
- a weekly food budget
- a nutritional target
- preferred brands or acceptable substitutes
- maximum store count
- travel radius
- shopping priority

Outputs must remain explainable and auditable.

## The four prices Pinch must not confuse

1. **Lowest cash outlay** — the least money that must leave the user's account now.
2. **Best unit value** — the lowest normalized cost per comparable quantity.
3. **Best practical cart** — the best total outcome after store count, travel, and time constraints.
4. **Best nutritional value** — the best relevant nutrition per dollar when nutrition mode is enabled.

A product may win one category and lose another.

Example:

- Store A pasta: one 16 oz box for $1.50.
- Store B pasta: 16 oz boxes at $2.00 BOGO, requiring two.

Pinch should report:

- Lowest cash outlay: Store A, $1.50.
- Best unit value: Store B, $2.00 for two, $1.00/box.
- Tradeoff: spend $0.50 more and receive one additional box.

## Personal V1 market

Initial retailer scope:

- Sedano's
- Fresco y Más
- ALDI
- Walmart
- Publix

Initial operating area is the user's local Miami market. Nationwide abstractions should not be allowed to delay a reliable local product.

## Trust rules

- Never call a promotion a deal merely because a retailer labels it a sale.
- Never compare package totals without normalizing size.
- Never hide quantity requirements.
- Never hide membership, coupon, app activation, or purchase-minimum requirements.
- Never use stale prices without showing freshness.
- Never invent a package total when only a weighted price is known.
- Every savings claim must record its baseline.
- Estimated savings and receipt-verified savings are different ledgers.
- The original receipt remains evidence even after structured extraction.

## Nutrition

Nutrition is optional in the interface.

Display modes:

- Off
- Basic: calories and protein
- Detailed: calories, protein, carbohydrates, fat, fiber, sugar, and sodium

Nutrition may change optimization objectives, but it never replaces price truth.

## Long-term user questions

The architecture should eventually answer questions such as:

- Where should I buy this list?
- Can you get this under $70?
- I want Alfredo tonight. What do I need and where is it cheapest?
- What is the cheapest way to hit 180 g protein per day?
- What did I pay for eggs six months ago?
- Are my groceries more expensive, or am I buying more?
- How much have I actually saved this year?
