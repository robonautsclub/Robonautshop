export type CartLineInput = {
  productId: string;
  variantId: string | null;
  quantity: number;
};

export type StoredCart = {
  version: 1;
  lines: CartLineInput[];
};

export const CART_STORAGE_KEY = "robonautshop.cart.v1";
