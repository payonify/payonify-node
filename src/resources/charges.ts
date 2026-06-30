import type { HttpClient } from "../core/client.js";
import type {
  Amount,
  ChargeStatus,
  CancellationReason,
  Currency,
  ListResponse,
  Metadata,
  PaginationParams,
  DateRangeParams,
  Shipping,
  Source,
} from "../core/types.js";

export interface PaymentMethodDetails {
  type: string;
  mobile_money?: {
    type: string;
    reference: string | null;
    brand: string;
    customer_number: string;
    merchant_code: string;
    merchant_number: string;
    merchant_name: string;
    head_name: string;
    network: string;
  };
}

export interface Charge {
  id: string;
  object: "charge";
  amount: Amount;
  livemode: boolean;
  created: number;
  paid: boolean;
  metadata: Metadata | null;
  client_secret: string;
  payment_method: string;
  description: string | null;
  receipt_email: string | null;
  return_url: string | null;
  statement_descriptor: string | null;
  shipping: Shipping | null;
  refund_reference: string | null;
  status: ChargeStatus;
  failure_code: string | null;
  failure_reason: string | null;
  cancelled_at: number | null;
  cancellation_reason: CancellationReason | null;
  payment_method_details: PaymentMethodDetails | null;
}

export interface CreateChargeParams {
  amount: number;
  currency: Currency;
  source: Source;
  description?: string;
  payment_method?: {
    mobile_money?: {
      ecocash?: { mobile_number: string };
      onemoney?: { mobile_number: string };
    };
  };
  metadata?: Metadata;
  confirm?: boolean;
  receipt_email?: string;
  statement_descriptor?: string;
  shipping?: Shipping;
  return_url?: string;
}

export interface ConfirmChargeParams {
  payment_method: {
    mobile_money?: {
      ecocash?: { mobile_number: string };
      onemoney?: { mobile_number: string };
    };
  };
  description?: string;
  metadata?: Metadata;
  receipt_email?: string;
  statement_descriptor?: string;
  shipping?: Shipping;
  return_url?: string;
}

export interface CancelChargeParams {
  cancellation_reason?: CancellationReason;
}

export interface ListChargesParams
  extends PaginationParams,
    DateRangeParams {
  status?: ChargeStatus;
  currency?: Currency;
}

export class Charges {
  constructor(private readonly client: HttpClient) {}

  async list(params?: ListChargesParams): Promise<ListResponse<Charge>> {
    return this.client.request<ListResponse<Charge>>({
      method: "GET",
      path: "/charges",
      query: params as Record<string, string | number | undefined>,
    });
  }

  async create(params: CreateChargeParams): Promise<Charge> {
    return this.client.request<Charge>({
      method: "POST",
      path: "/charges",
      body: params as unknown as Record<string, unknown>,
    });
  }

  async retrieve(id: string): Promise<Charge> {
    return this.client.request<Charge>({
      method: "GET",
      path: `/charges/${id}`,
    });
  }

  async confirm(id: string, params: ConfirmChargeParams): Promise<Charge> {
    return this.client.request<Charge>({
      method: "POST",
      path: `/charges/${id}/confirm`,
      body: params as unknown as Record<string, unknown>,
    });
  }

  async cancel(id: string, params?: CancelChargeParams): Promise<Charge> {
    return this.client.request<Charge>({
      method: "POST",
      path: `/charges/${id}/cancel`,
      body: params as unknown as Record<string, unknown> | undefined,
    });
  }
}
