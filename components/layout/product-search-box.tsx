"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  type ChangeEvent,
  type KeyboardEvent,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatBdt } from "@/lib/catalog/money";
import type { ProductSuggestion } from "@/lib/catalog/suggestions";
import { cn } from "@/lib/utils";

const DEBOUNCE_MS = 250;
const MIN_QUERY_LENGTH = 2;

type ProductSearchBoxProps = {
  inputId: string;
  label: string;
  placeholder: string;
  /** Called after navigating (e.g. to close a mobile sheet). */
  onNavigate?: () => void;
  className?: string;
  inputClassName?: string;
  showSubmitIcon?: boolean;
};

/**
 * Search input with an accessible product-suggestion combobox (task 136).
 * Without JS it is a plain GET form to /products. Debounced; stale responses
 * are ignored.
 */
export function ProductSearchBox({
  inputId,
  label,
  placeholder,
  onNavigate,
  className,
  inputClassName,
  showSubmitIcon = false,
}: ProductSearchBoxProps) {
  const router = useRouter();
  const listId = useId();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<ProductSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const requestId = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  function fetchSuggestions(value: string) {
    const current = ++requestId.current;
    void fetch(`/api/search/suggest?q=${encodeURIComponent(value)}`)
      .then((response) =>
        response.ok ? (response.json() as Promise<{ suggestions?: ProductSuggestion[] }>) : null,
      )
      .then((data) => {
        if (current !== requestId.current) return;
        const next = data?.suggestions ?? [];
        setSuggestions(next);
        setActiveIndex(-1);
        setOpen(next.length > 0);
      })
      .catch((error: unknown) => {
        console.error("[search] suggestion request failed:", error);
      });
  }

  function onChange(event: ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    setQuery(value);
    if (timer.current) clearTimeout(timer.current);

    if (value.trim().length < MIN_QUERY_LENGTH) {
      requestId.current++;
      setSuggestions([]);
      setOpen(false);
      return;
    }
    timer.current = setTimeout(() => fetchSuggestions(value.trim()), DEBOUNCE_MS);
  }

  function goTo(href: string) {
    setOpen(false);
    router.push(href);
    onNavigate?.();
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      setOpen(false);
      return;
    }
    if (!open || suggestions.length === 0) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % suggestions.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => (index <= 0 ? suggestions.length - 1 : index - 1));
    } else if (event.key === "Enter" && activeIndex >= 0) {
      event.preventDefault();
      goTo(`/products/${suggestions[activeIndex].slug}`);
    }
  }

  const optionId = (index: number) => `${listId}-option-${index}`;

  return (
    <form
      action="/products"
      method="get"
      role="search"
      className={cn("relative", className)}
      onSubmit={(event) => {
        event.preventDefault();
        const trimmed = query.trim();
        goTo(trimmed ? `/products?q=${encodeURIComponent(trimmed)}` : "/products");
      }}
    >
      <label htmlFor={inputId} className="sr-only">
        {label}
      </label>
      <div className="flex items-center gap-1">
        <input
          id={inputId}
          name="q"
          type="search"
          role="combobox"
          autoComplete="off"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={activeIndex >= 0 ? optionId(activeIndex) : undefined}
          value={query}
          onChange={onChange}
          onKeyDown={onKeyDown}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          onFocus={() => setOpen(suggestions.length > 0)}
          placeholder={placeholder}
          className={cn(
            "h-8 w-full rounded-lg border bg-background px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
            inputClassName,
          )}
        />
        {showSubmitIcon ? (
          <Button type="submit" variant="ghost" size="icon" aria-label="Search">
            <Search />
          </Button>
        ) : null}
      </div>

      <ul
        id={listId}
        role="listbox"
        aria-label="Product suggestions"
        hidden={!open}
        className="absolute left-0 top-full z-50 mt-1 w-full min-w-64 overflow-hidden rounded-lg border bg-popover text-popover-foreground shadow-md"
      >
        {suggestions.map((suggestion, index) => (
          <li
            key={suggestion.slug}
            id={optionId(index)}
            role="option"
            aria-selected={index === activeIndex}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => goTo(`/products/${suggestion.slug}`)}
            className={cn(
              "flex cursor-pointer items-center gap-3 px-3 py-2 text-sm",
              index === activeIndex ? "bg-accent" : "hover:bg-accent/60",
            )}
          >
            <span className="relative size-9 shrink-0 overflow-hidden rounded bg-muted">
              {suggestion.imageUrl ? (
                <Image src={suggestion.imageUrl} alt="" fill sizes="36px" className="object-cover" />
              ) : null}
            </span>
            <span className="min-w-0 flex-1 truncate">{suggestion.name}</span>
            <span className="shrink-0 text-muted-foreground">{formatBdt(suggestion.price)}</span>
          </li>
        ))}
      </ul>
    </form>
  );
}
