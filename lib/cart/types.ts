export type CartLineInput = {
  productId: string;
  variantId: string | null;
  quantity: number;
};

export type StoredCart = {
  version: 1;
  lines: CartLineInput[];
};
