// Barrel re-export so `drizzle.config.ts` and `lib/db/index.ts` have one
// schema import path. Add new table files here as they're created.
export * from "@/lib/db/schema/health";
export * from "@/lib/db/schema/users";
export * from "@/lib/db/schema/categories";
export * from "@/lib/db/schema/products";
export * from "@/lib/db/schema/product-variants";
export * from "@/lib/db/schema/inventory";
export * from "@/lib/db/schema/product-images";
export * from "@/lib/db/schema/robot-projects";
export * from "@/lib/db/schema/project-components";
export * from "@/lib/db/schema/kits";
export * from "@/lib/db/schema/kit-components";
export * from "@/lib/db/schema/cart-items";
export * from "@/lib/db/schema/orders";
export * from "@/lib/db/schema/order-items";
export * from "@/lib/db/schema/bkash-tokens";
export * from "@/lib/db/schema/bkash-pending-payments";
export * from "@/lib/db/schema/user-addresses";
