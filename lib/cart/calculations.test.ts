import { describe, expect, it } from "vitest";

import {
  calculateCartItemCount,
  calculateCartSubtotal,
  cartLineKey,
  clampQuantityToStock,
  mergeCartLines,
  resolveCartLine,
  resolveCartLines,
} from "@/lib/cart/calculations";
import { mockProducts, mockVariants } from "@/lib/catalog/mock-data";

const simpleProduct = mockProducts.find(
  (product) => !mockVariants.some((variant) => variant.productId === product.id),
);
const variant = mockVariants.find((item) => item.price !== null)!;
const variantPrice = variant.price!;

describe("resolveCartLine", () => {
  it("prices a product-level line from the catalog, not the input", () => {
    expect(simpleProduct).toBeDefined();
    const line = resolveCartLine({
      productId: simpleProduct!.id,
      variantId: null,
      quantity: 3,
    });
    expect(line?.unitPrice).toBe(simpleProduct!.price);
    expect(line?.lineTotal).toBe(simpleProduct!.price * 3);
  });

  it("uses the variant price when a variant is chosen", () => {
    const line = resolveCartLine({
      productId: variant.productId,
      variantId: variant.id,
      quantity: 2,
    });
    expect(line?.unitPrice).toBe(variantPrice);
    expect(line?.lineTotal).toBe(variantPrice * 2);
  });

  it("rejects unknown products and mismatched variants", () => {
    expect(resolveCartLine({ productId: "nope", variantId: null, quantity: 1 })).toBeNull();
    expect(
      resolveCartLine({ productId: simpleProduct!.id, variantId: variant.id, quantity: 1 }),
    ).toBeNull();
  });
});

describe("calculateCartSubtotal", () => {
  it("sums line totals and drops zero-quantity lines", () => {
    const lines = resolveCartLines([
      { productId: simpleProduct!.id, variantId: null, quantity: 2 },
      { productId: variant.productId, variantId: variant.id, quantity: 1 },
      { productId: simpleProduct!.id, variantId: null, quantity: 0 },
    ]);
    expect(lines).toHaveLength(2);
    expect(calculateCartSubtotal(lines)).toBe(simpleProduct!.price * 2 + variantPrice);
  });

  it("is 0 for an empty cart", () => {
    expect(calculateCartSubtotal([])).toBe(0);
  });
});

describe("calculateCartItemCount", () => {
  it("sums quantities and ignores negatives", () => {
    expect(
      calculateCartItemCount([
        { productId: "a", variantId: null, quantity: 2 },
        { productId: "b", variantId: "v", quantity: 3 },
        { productId: "c", variantId: null, quantity: -4 },
      ]),
    ).toBe(5);
  });
});

describe("mergeCartLines", () => {
  it("sums matching product + variant and appends guest-only lines", () => {
    const merged = mergeCartLines(
      [
        { productId: "a", variantId: null, quantity: 1 },
        { productId: "b", variantId: "v1", quantity: 2 },
      ],
      [
        { productId: "a", variantId: null, quantity: 4 },
        { productId: "b", variantId: "v2", quantity: 1 },
      ],
    );
    expect(merged).toEqual([
      { productId: "a", variantId: null, quantity: 5 },
      { productId: "b", variantId: "v1", quantity: 2 },
      { productId: "b", variantId: "v2", quantity: 1 },
    ]);
  });

  it("does not mutate its inputs", () => {
    const user = [{ productId: "a", variantId: null, quantity: 1 }];
    mergeCartLines(user, [{ productId: "a", variantId: null, quantity: 1 }]);
    expect(user[0].quantity).toBe(1);
  });

  it("keys lines by product and variant", () => {
    expect(cartLineKey("a", null)).not.toBe(cartLineKey("a", "v"));
  });
});

describe("clampQuantityToStock", () => {
  it("never exceeds available stock", () => {
    expect(clampQuantityToStock(5, 3)).toBe(3);
    expect(clampQuantityToStock(2, 3)).toBe(2);
    expect(clampQuantityToStock(2, 0)).toBe(0);
    expect(clampQuantityToStock(0, 10)).toBe(0);
  });
});
