# Payonify Node.js Library

[![Version](https://img.shields.io/npm/v/payonify.svg)](https://www.npmjs.org/package/payonify)
[![Build Status](https://github.com/payonify/payonify-node/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/payonify/payonify-node/actions?query=branch%3Amain)
[![Downloads](https://img.shields.io/npm/dm/payonify.svg)](https://www.npmjs.com/package/payonify)

The official Payonify client for Node.js and TypeScript - a fully typed way to work with the Payonify API from your server, covering charges, refunds, checkout sessions, payouts, and Relay transfers.

## Installation

```bash
bun add payonify
```

## Setup

```typescript
import { Payonify } from "payonify";

const payonify = new Payonify({
  publishableKey: "pk_test_...",
  secretKey: "sk_test_...",
});
```

Use environment variables to keep your keys secure:

```typescript
const payonify = new Payonify({
  publishableKey: process.env.PAYONIFY_PUBLISHABLE_KEY!,
  secretKey: process.env.PAYONIFY_SECRET_KEY!,
});
```

## Charges

The `Charge` object represents a payment transaction.

### Create a charge

```typescript
const charge = await payonify.charges.create({
  amount: 1000, // $10.00
  currency: "usd",
  source: "web",
  description: "Order #1234",
  payment_method: {
    mobile_money: {
      ecocash: { mobile_number: "771111111" },
    },
  },
  confirm: true,
});
```

### List all charges

```typescript
const result = await payonify.charges.list({
  limit: 10,
  status: "succeeded",
  currency: "usd",
  start_date: "2025-01-01",
  end_date: "2025-12-31",
});

for (const charge of result.data) {
  console.log(charge.id, charge.status);
}
```

### Retrieve a charge

```typescript
const charge = await payonify.charges.retrieve("ch_...");
console.log(charge.status);
```

### Confirm a charge

Use this to complete a charge created without payment details:

```typescript
const charge = await payonify.charges.confirm("ch_...", {
  payment_method: {
    mobile_money: {
      ecocash: { mobile_number: "771111111" },
    },
  },
  receipt_email: "customer@example.com",
});
```

### Cancel a charge

```typescript
const charge = await payonify.charges.cancel("ch_...", {
  cancellation_reason: "requested_by_customer",
});
```

Cancellation reasons: `duplicate`, `fraudulent`, `abandoned`, `requested_by_customer`.

## Refunds

The `Refund` object represents a reversal of funds from a previously created charge.

### Create a refund

```typescript
const refund = await payonify.refunds.create({
  charge: "ch_...",
  reason: "Customer returned the item",
});
```

### List all refunds

```typescript
const result = await payonify.refunds.list({
  limit: 10,
  status: "succeeded",
});

for (const refund of result.data) {
  console.log(refund.id, refund.amount);
}
```

### Retrieve a refund

```typescript
const refund = await payonify.refunds.retrieve("re_...");
console.log(refund.status);
```

## Checkout Sessions

A `Checkout Session` represents your customer's session as they pay for one-time purchases through Checkout.

### Create a checkout session

```typescript
const session = await payonify.checkoutSessions.create({
  line_items: [
    {
      unit_amount: 1500,
      name: "Premium Subscription",
      quantity: 1,
    },
  ],
  mode: "payment",
  success_url: "https://example.com/success?session_id={CHECKOUT_SESSION_ID}",
  cancel_url: "https://example.com/cancel",
  currency: "usd",
  customer_email: "customer@example.com",
});

// Redirect the customer to the checkout URL
console.log(session.url);
```

### Create a session with options

```typescript
const session = await payonify.checkoutSessions.create({
  line_items: [
    {
      unit_amount: 5000,
      name: "Product A",
      description: "A great product",
      quantity: 2,
      images: ["https://example.com/image.png"],
    },
  ],
  mode: "payment",
  success_url: "https://example.com/success",
  cancel_url: "https://example.com/cancel",
  currency: "usd",
  source: "web",
  metadata: { order_id: "12345" },
  submit_type: "pay",
  payment_method_types: ["ecocash", "card"],
  expand: ["line_items"],
});
```

### List all checkout sessions

```typescript
const result = await payonify.checkoutSessions.list({
  limit: 10,
  status: "open",
});

for (const session of result.data) {
  console.log(session.id, session.status, session.url);
}
```

### Retrieve a checkout session

```typescript
const session = await payonify.checkoutSessions.retrieve("cs_...");
console.log(session.payment_status);
```

### Retrieve with expanded line items

```typescript
const session = await payonify.checkoutSessions.retrieve("cs_...", {
  expand: "line_items",
});

console.log(session.line_items);
```

### Expire a checkout session

```typescript
const session = await payonify.checkoutSessions.expire("cs_...");
console.log(session.status); // "expired"
```

## Payouts

A `Payout` object represents a disbursement of funds to a recipient.

> **Note:** The Payouts API requires prior approval. Your account must be approved for B2C services.

### Validate a payout recipient

```typescript
const result = await payonify.payouts.validateRecipient({
  destination: {
    mobile_money: {
      ecocash: { mobile_number: "771111111" },
    },
  },
});

if (result.valid) {
  console.log(result.recipient);
}
```

### Create a payout

```typescript
const payout = await payonify.payouts.create({
  amount: 5000,
  currency: "usd",
  destination: {
    mobile_money: {
      ecocash: { mobile_number: "771111111" },
    },
  },
  description: "Monthly salary payment",
  metadata: { employee_id: "12345" },
});
```

### List all payouts

```typescript
const result = await payonify.payouts.list({
  limit: 10,
  status: "paid",
});

for (const payout of result.data) {
  console.log(payout.id, payout.status, payout.amount);
}
```

### Retrieve a payout

```typescript
const payout = await payonify.payouts.retrieve("po_...");
console.log(payout.status);
```

## Transfers (Relay)

Relay lets marketplaces and platforms collect with charges and pay out to recipients with `Transfer` objects, keeping a commission on each one. Transfers are paid from the funds you've collected.

> **Note:** Relay must be enabled on your project.

### Validate a transfer recipient

The validate call takes `mobile_money` directly (no `destination` wrapper).

```typescript
const result = await payonify.transfers.validateRecipient({
  mobile_money: {
    ecocash: { mobile_number: "772111111" },
  },
});

if (result.valid) {
  console.log(result.recipient);
}
```

### Create a transfer

```typescript
const transfer = await payonify.transfers.create({
  amount: 5000,
  currency: "usd",
  application_fee_amount: 500, // your commission
  destination: {
    mobile_money: {
      ecocash: { mobile_number: "772111111" },
    },
  },
  description: "Driver payout - trip 8841",
});

console.log(transfer.status); // "pending"
console.log(transfer.net_amount); // what the recipient receives, after fees
```

### Check your relay balance

```typescript
const balance = await payonify.transfers.balance();

for (const pool of balance.balances) {
  console.log(pool.provider, pool.currency, pool.available);
}
```

### List all transfers

```typescript
const result = await payonify.transfers.list({
  limit: 10,
  status: "succeeded",
  currency: "usd",
});

for (const transfer of result.data) {
  console.log(transfer.id, transfer.status, transfer.net_amount);
}
```

### Retrieve a transfer

```typescript
const transfer = await payonify.transfers.retrieve("tr_...");
console.log(transfer.status);
```

## Error Handling

The SDK throws typed errors for different failure scenarios:

```typescript
import {
  PayonifyError,
  AuthenticationError,
  NotFoundError,
  ValidationError,
  RateLimitError,
} from "payonify";

try {
  await payonify.charges.retrieve("ch_...");
} catch (error) {
  if (error instanceof AuthenticationError) {
    console.error("Invalid API credentials");
  } else if (error instanceof NotFoundError) {
    console.error("Charge not found");
  } else if (error instanceof ValidationError) {
    console.error("Invalid request:", error.errors);
  } else if (error instanceof RateLimitError) {
    console.error("Too many requests, retry later");
  } else if (error instanceof PayonifyError) {
    console.error(`API error ${error.status}: ${error.message}`);
  }
}
```

## API Reference

| Resource | Methods |
| --- | --- |
| `charges` | `list`, `create`, `retrieve`, `confirm`, `cancel` |
| `refunds` | `list`, `create`, `retrieve` |
| `checkoutSessions` | `list`, `create`, `retrieve`, `expire` |
| `payouts` | `validateRecipient`, `list`, `create`, `retrieve` |

## Pagination

All list endpoints support cursor-based pagination:

```typescript
const firstPage = await payonify.charges.list({ limit: 10 });

if (firstPage.paging.has_next_page) {
  const nextPage = await payonify.charges.list({
    limit: 10,
    after: firstPage.paging.end_cursor!,
  });
}
```

## Testing

Use test keys for development. Test transactions won't move real money:

```typescript
const payonify = new Payonify({
  publishableKey: "pk_test_...",
  secretKey: "sk_test_...",
});
```

Switch to live keys for production:

```typescript
const payonify = new Payonify({
  publishableKey: "pk_live_...",
  secretKey: "sk_live_...",
});
```
