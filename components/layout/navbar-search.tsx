"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";

export function NavbarSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = query.trim();
    const params = new URLSearchParams();
    if (trimmed) {
      params.set("q", trimmed);
    }
    const suffix = params.toString();
    router.push(suffix ? `/products?${suffix}` : "/products");
  }

  return (
    <form
      onSubmit={onSubmit}
      className="hidden items-center gap-1 lg:flex"
      role="search"
    >
      <label htmlFor="navbar-search" className="sr-only">
        Search products
      </label>
      <input
        id="navbar-search"
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search parts…"
        className="h-8 w-44 rounded-lg border bg-background px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 xl:w-56"
      />
      <Button type="submit" variant="ghost" size="icon" aria-label="Search">
        <Search />
      </Button>
    </form>
  );
}
