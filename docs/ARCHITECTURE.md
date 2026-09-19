# Architecture

## Design rule

**AI interprets intent. Deterministic systems calculate truth.**

An LLM may convert "I'm broke and need high-protein food for the week" into structured constraints. It must not become the source of truth for prices, promotion arithmetic, unit conversion, optimization, or verified savings.

## Planned system boundaries

### pricing-engine

Pure deterministic domain logic:

- money represented in integer cents
- physical-unit conversion
- package normalization
- promotion economics
- lowest-cash versus best-unit-value comparison

This package must remain independent of retailer scraping, databases, and UI code.

### catalog

Canonical products, variants, brands, packages, categories, and equivalence relationships.

Product matching will distinguish:

- exact
- same product, different size
- same brand equivalent
- category equivalent
- user-acceptable substitute
- not comparable

### retailer-ingestion

One adapter per retailer/source. Adapters convert external data into internal observations.

Every price observation records:

- source
- store
- observed timestamp
- validity window when known
- promotion conditions
- confidence

### optimizer

Consumes already-normalized offers and user constraints.

Initial objective modes:

- lowest spend
- best unit value
- practical cart
- budget constrained

Later objectives can include nutritional value.

### receipt-engine

Preserves the original receipt and extracts structured purchase evidence.

### market-intelligence

Builds price history, local medians, stock-up thresholds, and personal price indexes from observations and verified purchases.

### api / web

Presentation and orchestration only. Domain arithmetic stays in deterministic packages.

## Money

Store currency values as integer cents. Avoid floating-point dollar arithmetic.

Rates such as cents per gram are derived values and may be floating point because they are not ledger amounts. Ledger totals remain integers.

## Canonical measurement

Mass is normalized to grams.

Volume is normalized to milliliters.

Discrete items are normalized to count.

Human-facing units such as $/lb, $/oz, $/100 g, $/dozen, or $/L are calculated from canonical quantities.

## Promotion representation

Promotions are structured data, not display strings.

Initial supported forms:

- no promotion
- buy X get Y
- multi-buy fixed total
- percent off
- fixed amount off

Future promotion conditions will include membership, digital coupon activation, quantity limits, and minimum-spend requirements.

## Optimization discipline

The optimizer must preserve both:

- checkout cash required
- normalized value obtained

A cheaper unit rate is not automatically the correct recommendation if it requires significantly more cash, food the user cannot use, excess travel, or more stores than allowed.
