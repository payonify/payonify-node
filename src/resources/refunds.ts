import type { HttpClient } from "../core/client.js";
import type {
  Amount,
  Currency,
  ListResponse,
  Metadata,
  PaginationParams,
  DateRangeParams,
  RefundStatus,
} from "../core/types.js";

export interface RefundDetails {
  type: string;
  mobile_money?: {
    type: string;
    refund_reference: string;
    original_reference: string;
    brand: string;
    customer_number: string;
    merchant_code: string;
    merchant_number: string;
    merchant_name: string;
    head_name: string;
    network: string;
  };
}

export interface Refund {
  id: string;
  object: "refund";
  amount: Amount;
  created: number;
  charge: string;
  reason: string | null;
  status: RefundStatus;
  metadata: Metadata | null;
  failure_code: string | null;
  failure_reason: string | null;
  refund_details: RefundDetails | null;
}

export interface CreateRefundParams {
  charge: string;
  reason?: string;
  metadata?: Metadata;
}

export interface ListRefundsParams
  extends PaginationParams,
    DateRangeParams {
  status?: RefundStatus;
  currency?: Currency;
}

export class Refunds {
  constructor(private readonly client: HttpClient) {}

  async list(params?: ListRefundsParams): Promise<ListResponse<Refund>> {
    return this.client.request<ListResponse<Refund>>({
      method: "GET",
      path: "/refunds",
      query: params as Record<string, string | number | undefined>,
    });
  }

  async create(params: CreateRefundParams): Promise<Refund> {
    return this.client.request<Refund>({
      method: "POST",
      path: "/refunds",
      body: params as unknown as Record<string, unknown>,
    });
  }

  async retrieve(id: string): Promise<Refund> {
    return this.client.request<Refund>({
      method: "GET",
      path: `/refunds/${id}`,
    });
  }
}
