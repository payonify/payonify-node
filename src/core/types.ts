export type Currency = "usd" | "zwg";

export type Source = "pos" | "web" | "mobile" | "ussd";

export type ChargeStatus =
  | "requires_payment_method"
  | "requires_authorization"
  | "pending"
  | "succeeded"
  | "failed"
  | "cancelled";

export type RefundStatus =
  | "pending"
  | "processing"
  | "succeeded"
  | "failed"
  | "cancelled";

export type CheckoutSessionStatus = "open" | "complete" | "expired";

export type CheckoutSessionPaymentStatus =
  | "requires_payment_method"
  | "pending"
  | "succeeded"
  | "failed"
  | "cancelled";

export type PayoutStatus = "pending" | "paid" | "failed";

export type CancellationReason =
  | "duplicate"
  | "fraudulent"
  | "abandoned"
  | "requested_by_customer";

export type SubmitType = "pay" | "donate" | "book";

export type PaymentMethodType = "ecocash" | "onemoney" | "card" | "zimswitch";

export interface Amount {
  value: number;
  currency: Currency;
}

export interface Address {
  city: string;
  country: string;
  line1: string;
  line2?: string;
  province?: string;
}

export interface Shipping {
  name: string;
  carrier?: string;
  tracking_number?: string;
  phone?: string;
  address?: Address;
}

export interface Paging {
  has_previous_page: boolean;
  has_next_page: boolean;
  start_cursor: string | null;
  end_cursor: string | null;
  page_size: number;
}

export interface ListResponse<T> {
  object: "list";
  data: T[];
  paging: Paging;
}

export interface PaginationParams {
  limit?: number;
  first?: number;
  after?: string;
  last?: number;
  before?: string;
}

export interface DateRangeParams {
  start_date?: string;
  end_date?: string;
}

export interface Metadata {
  [key: string]: string;
}
