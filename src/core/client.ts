import {
  PayonifyError,
  AuthenticationError,
  NotFoundError,
  ValidationError,
  RateLimitError,
} from "./errors.js";

export interface PayonifyClientConfig {
  publishableKey: string;
  secretKey: string;
  baseUrl?: string;
  timeout?: number;
}

export interface RequestOptions {
  method: "GET" | "POST" | "PUT" | "DELETE";
  path: string;
  body?: Record<string, unknown>;
  query?: Record<string, string | number | undefined>;
}

const DEFAULT_BASE_URL = "https://api.payonify.com";
const DEFAULT_TIMEOUT = 30_000;

export class HttpClient {
  private readonly credentials: string;
  private readonly baseUrl: string;
  private readonly timeout: number;

  constructor(config: PayonifyClientConfig) {
    if (!config.publishableKey) {
      throw new AuthenticationError("Publishable key is required");
    }
    if (!config.secretKey) {
      throw new AuthenticationError("Secret key is required");
    }
    this.credentials = btoa(`${config.publishableKey}:${config.secretKey}`);
    this.baseUrl = config.baseUrl ?? DEFAULT_BASE_URL;
    this.timeout = config.timeout ?? DEFAULT_TIMEOUT;
  }

  async request<T>(options: RequestOptions): Promise<T> {
    const url = new URL(`/v1${options.path}`, this.baseUrl);

    if (options.query) {
      for (const [key, value] of Object.entries(options.query)) {
        if (value !== undefined) {
          url.searchParams.set(key, String(value));
        }
      }
    }

    const headers: Record<string, string> = {
      Authorization: `Basic ${this.credentials}`,
      "Content-Type": "application/json",
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url.toString(), {
        method: options.method,
        headers,
        body: options.body ? JSON.stringify(options.body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        await this.handleError(response);
      }

      return (await response.json()) as T;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof PayonifyError) {
        throw error;
      }

      if (error instanceof DOMException && error.name === "AbortError") {
        throw new PayonifyError("Request timed out", 408, "timeout");
      }

      throw new PayonifyError(
        error instanceof Error ? error.message : "Unknown error",
        500,
        "network_error",
      );
    }
  }

  private async handleError(response: Response): Promise<never> {
    let body: Record<string, unknown> | undefined;
    try {
      body = (await response.json()) as Record<string, unknown>;
    } catch {
      // response body is not JSON
    }

    const message =
      (body?.error as string) ??
      (body?.message as string) ??
      `Request failed with status ${response.status}`;

    switch (response.status) {
      case 401:
        throw new AuthenticationError(message);
      case 404:
        throw new NotFoundError(message);
      case 400:
        throw new ValidationError(message, body?.errors as Record<string, string>);
      case 429:
        throw new RateLimitError(message);
      default:
        throw new PayonifyError(message, response.status);
    }
  }
}
