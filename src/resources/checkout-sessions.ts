import type { HttpClient } from "../core/client.js";
import type {
  CheckoutSessionPaymentStatus,
  CheckoutSessionStatus,
  Currency,
  ListResponse,
  Metadata,
  PaginationParams,
  DateRangeParams,
  PaymentMethodType,
  Shipping,
  SubmitType,
} from "../core/types.js";

export interface LineItem {
  id: string | null;
  name: string;
  description?: string;
  quantity: number;
  unit_amount: number;
  images?: string[];
}

export interface CheckoutSession {
  id: string;
  object: "checkout_session";
  status: CheckoutSessionStatus;
  mode: "payment";
  metadata: Metadata | null;
  currency: Currency;
  url: string;
  livemode: boolean;
  payment_method_types: PaymentMethodType[];
  client_secret: string;
  amount_total: number;
  client_reference_id: string | null;
  expires_at: number;
  charge_reference: string;
  created: number;
  amount_subtotal: number;
  cancel_url: string;
  customer_email: string | null;
  payment_status: CheckoutSessionPaymentStatus;
  failure_code: string | null;
  failure_reason: string | null;
  success_url: string;
  submit_type: SubmitType;
  shipping: Shipping | null;
  line_items?: LineItem[];
}

export interface LineItemInput {
  unit_amount: number;
  name: string;
  description?: string;
  quantity: number;
  images?: string[];
}

export interface CreateCheckoutSessionParams {
  line_items: LineItemInput[];
  mode: "payment";
  success_url: string;
  cancel_url: string;
  currency: Currency;
  customer_email?: string;
  client_reference_id?: string;
  source?: "pos" | "web" | "mobile" | "ussd";
  metadata?: Metadata;
  expand?: string[];
  submit_type?: SubmitType;
  payment_method_types?: PaymentMethodType[];
}

export interface ListCheckoutSessionsParams
  extends PaginationParams,
    DateRangeParams {
  status?: CheckoutSessionStatus;
  currency?: Currency;
}

export class CheckoutSessions {
  constructor(private readonly client: HttpClient) {}

  async list(
    params?: ListCheckoutSessionsParams,
  ): Promise<ListResponse<CheckoutSession>> {
    return this.client.request<ListResponse<CheckoutSession>>({
      method: "GET",
      path: "/checkout/sessions",
      query: params as Record<string, string | number | undefined>,
    });
  }

  async create(
    params: CreateCheckoutSessionParams,
  ): Promise<CheckoutSession> {
    return this.client.request<CheckoutSession>({
      method: "POST",
      path: "/checkout/sessions",
      body: params as unknown as Record<string, unknown>,
    });
  }

  async retrieve(
    id: string,
    params?: { expand?: string },
  ): Promise<CheckoutSession> {
    return this.client.request<CheckoutSession>({
      method: "GET",
      path: `/checkout/sessions/${id}`,
      query: params as Record<string, string | number | undefined>,
    });
  }

  async expire(id: string): Promise<CheckoutSession> {
    return this.client.request<CheckoutSession>({
      method: "POST",
      path: `/checkout/sessions/${id}/expire`,
    });
  }
}
