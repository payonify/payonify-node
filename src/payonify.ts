import { HttpClient, type PayonifyClientConfig } from "./core/client.js";
import { Charges } from "./resources/charges.js";
import { Refunds } from "./resources/refunds.js";
import { CheckoutSessions } from "./resources/checkout-sessions.js";
import { Payouts } from "./resources/payouts.js";
import { Transfers } from "./resources/transfers.js";

export class Payonify {
  readonly charges: Charges;
  readonly refunds: Refunds;
  readonly checkoutSessions: CheckoutSessions;
  readonly payouts: Payouts;
  readonly transfers: Transfers;

  constructor(config: PayonifyClientConfig) {
    const client = new HttpClient(config);
    this.charges = new Charges(client);
    this.refunds = new Refunds(client);
    this.checkoutSessions = new CheckoutSessions(client);
    this.payouts = new Payouts(client);
    this.transfers = new Transfers(client);
  }
}
