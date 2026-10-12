import { headers } from "next/headers";

import { createLogger, requestIdFromHeaders, type Logger } from "@/lib/logger";

/** Logger bound to the current Server Action / Server Component request. */
export async function loggerForAction(): Promise<Logger> {
  return createLogger({ requestId: requestIdFromHeaders(await headers()) });
}
