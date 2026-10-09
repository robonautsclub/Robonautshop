import { formatBdt } from "@/lib/catalog";
import type { OrderItemRecord } from "@/lib/server-cart/order-queries";

/** Line items of a customer order — shared by the orders list and detail page. */
export function AccountOrderItems({ items }: { items: OrderItemRecord[] }) {
  return (
    <ul className="space-y-2 text-sm">
      {items.map((item) => (
        <li key={item.id} className="flex justify-between gap-3">
          <span className="text-muted-foreground">
            {item.productName} × {item.quantity}
          </span>
          <span className="font-medium">{formatBdt(item.lineTotal)}</span>
        </li>
      ))}
    </ul>
  );
}

