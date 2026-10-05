import {
  BKASH_FETCH_TIMEOUT_MS,
  getBkashCheckoutEnv,
  type BkashCheckoutEnv,
} from "@/lib/payments/bkash/config";

export class BkashApiError extends Error {
  constructor(
    message: string,
    readonly statusCode?: string,
    readonly statusMessage?: string,
  ) {
    super(message);
    this.name = "BkashApiError";
  }
}

type BkashFetchOptions = {
  path: string;
  body: Record<string, unknown>;
  /** When set, sends Authorization + X-App-Key (payment APIs). */
  idToken?: string;
  /** When true, sends username/password headers (grant/refresh). */
  withCredentials?: boolean;
};

export async function bkashFetchJson<T>(options: BkashFetchOptions): Promise<T> {
  const env = getBkashCheckoutEnv();
  return bkashFetchJsonWithEnv<T>(env, options);
}

export async function bkashFetchJsonWithEnv<T>(
  env: BkashCheckoutEnv,
  options: BkashFetchOptions,
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  if (options.withCredentials) {
    headers.username = env.username;
    headers.password = env.password;
  }

  if (options.idToken) {
    headers.Authorization = options.idToken;
    headers["X-App-Key"] = env.appKey;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), BKASH_FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(`${env.baseUrl}${options.path}`, {
      method: "POST",
      headers,
      body: JSON.stringify(options.body),
      signal: controller.signal,
    });

    const text = await response.text();
    let data: T & { statusCode?: string; statusMessage?: string };

    try {
      data = JSON.parse(text) as T & { statusCode?: string; statusMessage?: string };
    } catch {
      throw new BkashApiError(
        `bKash returned a non-JSON response (HTTP ${response.status}).`,
      );
    }

    if (!response.ok) {
      throw new BkashApiError(
        data.statusMessage ?? `bKash HTTP ${response.status}`,
        data.statusCode,
        data.statusMessage,
      );
    }

    return data;
  } catch (error) {
    if (error instanceof BkashApiError) {
      throw error;
    }
    if (error instanceof Error && error.name === "AbortError") {
      throw new BkashApiError("bKash request timed out.");
    }
    throw new BkashApiError(
      error instanceof Error ? error.message : "bKash request failed.",
    );
  } finally {
    clearTimeout(timeout);
  }
}
