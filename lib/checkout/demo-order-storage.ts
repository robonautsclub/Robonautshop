import {
  DEMO_ORDER_STORAGE_KEY,
  type DemoOrderSnapshot,
} from "@/lib/checkout/types";

export function writeDemoOrder(snapshot: DemoOrderSnapshot): void {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(
    DEMO_ORDER_STORAGE_KEY,
    JSON.stringify(snapshot),
  );
}

export function readDemoOrder(): DemoOrderSnapshot | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.sessionStorage.getItem(DEMO_ORDER_STORAGE_KEY);
    if (!raw) {
      return null;
    }

    return JSON.parse(raw) as DemoOrderSnapshot;
  } catch {
    return null;
  }
}

export function clearDemoOrder(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.removeItem(DEMO_ORDER_STORAGE_KEY);
}
