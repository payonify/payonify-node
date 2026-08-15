import type { HttpClient } from "../core/client.js";
import type {
  Amount,
  Currency,
  ListResponse,
  Metadata,
  PaginationParams,
  DateRangeParams,
  TransferStatus,
} from "../core/types.js";

export interface TransferDestination {
  mobile_money?: {
    ecocash?: { mobile_number: string };
    onemoney?: { mobile_number: string };
  };
}

export interface TransferDestinationDetails {
  type: string;
  mobile_money?: {
    brand: string;
    reference: string | null;
    recipient_number: string;
    recipient_name: string | null;
    network: string;
  };
}

export interface Transfer {
  id: string;
  object: "transfer";
  /** The amount you asked to send. */
  amount: Amount;
  /** What the recipient actually receives, after the transfer fee. */
  net_amount: Amount;
  /** Your commission on the transfer, in the smallest currency unit. */
  application_fee_amount: number;
  livemode: boolean;
  created: number;
  status: TransferStatus;
  description: string | null;
  metadata: Metadata | null;
  destination_details: TransferDestinationDetails | null;
  failure_code: string | null;
  failure_message: string | null;
}

export interface TransferRecipient {
  first_name: string;
  last_name: string;
  account_status: string;
  mobile_number: string;
}

export interface ValidateTransferRecipientResponse {
  valid: boolean;
  recipient?: TransferRecipient;
}

/**
 * Unlike payouts, the validate endpoint takes the `mobile_money` object at the
 * top level (there is no `destination` wrapper).
 */
export interface ValidateTransferRecipientParams {
  mobile_money: {
    ecocash?: { mobile_number: string };
    onemoney?: { mobile_number: string };
  };
}

export interface CreateTransferParams {
  amount: number;
  currency: Currency;
  destination: TransferDestination;
  /** Your commission on this transfer. Defaults to 0. */
  application_fee_amount?: number;
  description?: string;
  metadata?: Metadata;
}

export interface ListTransfersParams extends PaginationParams, DateRangeParams {
  status?: TransferStatus;
  currency?: Currency;
}

export interface TransferBalanceEntry {
  provider: string;
  currency: Currency;
  /** Funds ready to disburse now. */
  available: number;
  /** Collected funds still in the settlement hold. */
  pending: number;
  /** Funds set aside for in-flight transfers. */
  reserved: number;
}

export interface TransferBalance {
  object: "balance";
  livemode: boolean;
  balances: TransferBalanceEntry[];
}

/**
 * The Transfers API powers Payonify Relay. You collect with charges, then pay
 * out to recipients with transfers, keeping your commission on each one.
 * Transfers currently run on EcoCash only.
 */
export class Transfers {
  constructor(private readonly client: HttpClient) {}

  async validateRecipient(
    params: ValidateTransferRecipientParams,
  ): Promise<ValidateTransferRecipientResponse> {
    return this.client.request<ValidateTransferRecipientResponse>({
      method: "POST",
      path: "/transfers/validate",
      body: params as unknown as Record<string, unknown>,
    });
  }

  async balance(): Promise<TransferBalance> {
    return this.client.request<TransferBalance>({
      method: "GET",
      path: "/transfers/balance",
    });
  }

  async list(params?: ListTransfersParams): Promise<ListResponse<Transfer>> {
    return this.client.request<ListResponse<Transfer>>({
      method: "GET",
      path: "/transfers",
      query: params as Record<string, string | number | undefined>,
    });
  }

  async create(params: CreateTransferParams): Promise<Transfer> {
    return this.client.request<Transfer>({
      method: "POST",
      path: "/transfers",
      body: params as unknown as Record<string, unknown>,
    });
  }

  async retrieve(id: string): Promise<Transfer> {
    return this.client.request<Transfer>({
      method: "GET",
      path: `/transfers/${id}`,
    });
  }
}
