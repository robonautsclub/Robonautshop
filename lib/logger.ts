/**
 * Structured logger (task 150). Writes one JSON line per event to the
 * console, which Cloudflare Workers Logs captures and makes searchable. No
 * external monitoring vendor is involved.
 *
 * Never log secrets, tokens, passwords, or full phone / card numbers: values
 * under secret-looking keys are replaced, phone values are masked, and
 * error stacks are kept but messages are trimmed. Callers should still pass
 * only what they need.
 */

export type LogContext = Record<string, unknown>;
type Level = "info" | "warn" | "error";

const SECRET_SUBSTRING = /pass(word)?|secret|token|api[-_]?key|authorization|cookie|card|cvv/i;
// "pin" and "otp" are short, so match them only as whole words or camelCase
// segments ("pin", "bkash_pin", "userOtp") — never inside "shipping".
const SECRET_WORD = /(^|[_-])(pin|otp)($|[_-])/i;
const SECRET_CAMEL_WORD = /[a-z](Pin|Otp)($|[A-Z])/; // case-sensitive on purpose

/** True when a field name looks like it holds a secret. Shared with the audit log. */
export function isSecretKey(key: string): boolean {
  return SECRET_SUBSTRING.test(key) || SECRET_WORD.test(key) || SECRET_CAMEL_WORD.test(key);
}
const PHONE_KEY = /phone|mobile|msisdn/i;
const MAX_STRING = 500;

/** Keeps the last three digits: "01712345678" → "********678". */
export function maskPhone(value: string): string {
  const digits = value.replace(/\D/g, "");
  return digits.length <= 3 ? "***" : `${"*".repeat(digits.length - 3)}${digits.slice(-3)}`;
}

function redact(key: string, value: unknown): unknown {
  if (isSecretKey(key)) return "[redacted]";
  if (PHONE_KEY.test(key) && typeof value === "string") return maskPhone(value);
  if (typeof value === "string" && value.length > MAX_STRING) return `${value.slice(0, MAX_STRING)}…`;
  return value;
}

function serializeError(error: unknown): LogContext {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message.slice(0, MAX_STRING),
      stack: error.stack?.split("\n").slice(0, 8).join("\n"),
    };
  }
  return { message: String(error).slice(0, MAX_STRING) };
}

export function formatLogLine(
  level: Level,
  event: string,
  context: LogContext = {},
  error?: unknown,
  now: Date = new Date(),
): string {
  const fields: LogContext = {};
  for (const [key, value] of Object.entries(context)) {
    fields[key] = redact(key, value);
  }
  return JSON.stringify({
    level,
    time: now.toISOString(),
    event,
    ...fields,
    ...(error === undefined ? {} : { error: serializeError(error) }),
  });
}

export type Logger = {
  info: (event: string, context?: LogContext) => void;
  warn: (event: string, context?: LogContext) => void;
  error: (event: string, error?: unknown, context?: LogContext) => void;
};

/** A logger that stamps every line with `base` (e.g. a request ID). */
export function createLogger(base: LogContext = {}): Logger {
  return {
    info: (event, context) => console.log(formatLogLine("info", event, { ...base, ...context })),
    warn: (event, context) => console.warn(formatLogLine("warn", event, { ...base, ...context })),
    error: (event, error, context) =>
      console.error(formatLogLine("error", event, { ...base, ...context }, error)),
  };
}

export const logger = createLogger();

/**
 * Request ID for correlating log lines: the caller's `x-request-id`, else
 * Cloudflare's `cf-ray`, else a fresh UUID.
 */
export function requestIdFromHeaders(headers: Headers | null | undefined): string {
  const incoming = headers?.get("x-request-id") ?? headers?.get("cf-ray");
  return incoming && /^[\w.-]{1,64}$/.test(incoming) ? incoming : crypto.randomUUID();
}

/** Logger bound to a route handler's request. */
export function loggerForRequest(request: Request): Logger {
  return createLogger({ requestId: requestIdFromHeaders(request.headers) });
}
