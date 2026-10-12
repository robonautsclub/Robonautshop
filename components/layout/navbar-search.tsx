"use client";

import { ProductSearchBox } from "@/components/layout/product-search-box";

export function NavbarSearch() {
  return (
    <ProductSearchBox
      inputId="navbar-search"
      label="Search products"
      placeholder="Search parts…"
      className="hidden lg:block"
      inputClassName="w-44 xl:w-56"
      showSubmitIcon
    />
  );
}
