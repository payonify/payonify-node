import type { HttpClient } from "../core/client.js";
import type {
  Currency,
  ListResponse,
  Metadata,
  PaginationParams,
  DateRangeParams,
  PayoutStatus,
} from "../core/types.js";

export interface PayoutDestination {
  mobile_money?: {
    ecocash?: { mobile_number: string };
    onemoney?: { mobile_number: string };
  };
}

export interface PayoutDestinationDetails {
  type: string;
  mobile_money?: {
    brand: string;
    reference: string | null;
    recipient_number: string;
    recipient_name: string;
    channel_number: string;
    network: string;
  };
}

export interface Payout {
  id: string;
  object: "payout";
  amount: { value: number; currency: Currency };
  livemode: boolean;
  created: number;
  status: PayoutStatus;
  description: string | null;
  metadata: Metadata | null;
  destination_details: PayoutDestinationDetails | null;
  failure_code: string | null;
  failure_message: string | null;
}

export interface PayoutRecipient {
  first_name: string;
  last_name: string;
  account_status: string;
  mobile_number: string;
}

export interface ValidatePayoutRecipientResponse {
  valid: boolean;
  recipient?: PayoutRecipient;
}

export interface ValidatePayoutRecipientParams {
  destination: PayoutDestination;
}

export interface CreatePayoutParams {
  amount: number;
  currency: Currency;
  destination: PayoutDestination;
  description?: string;
  metadata?: Metadata;
}

export interface ListPayoutsParams
  extends PaginationParams,
    DateRangeParams {
  status?: PayoutStatus;
  currency?: Currency;
}

export class Payouts {
  constructor(private readonly client: HttpClient) {}

  async validateRecipient(
    params: ValidatePayoutRecipientParams,
  ): Promise<ValidatePayoutRecipientResponse> {
    return this.client.request<ValidatePayoutRecipientResponse>({
      method: "POST",
      path: "/payouts/validate",
      body: params as unknown as Record<string, unknown>,
    });
  }

  async list(params?: ListPayoutsParams): Promise<ListResponse<Payout>> {
    return this.client.request<ListResponse<Payout>>({
      method: "GET",
      path: "/payouts",
      query: params as Record<string, string | number | undefined>,
    });
  }

  async create(params: CreatePayoutParams): Promise<Payout> {
    return this.client.request<Payout>({
      method: "POST",
      path: "/payouts",
      body: params as unknown as Record<string, unknown>,
    });
  }

  async retrieve(id: string): Promise<Payout> {
    return this.client.request<Payout>({
      method: "GET",
      path: `/payouts/${id}`,
    });
  }
}
