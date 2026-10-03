"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

import { useCart } from "@/components/cart/cart-provider";
import { SkillLevelBadge } from "@/components/catalog/skill-level-badge";
import { PriceDisplay } from "@/components/product/price-display";
import { StockBadge } from "@/components/product/stock-badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  calculateBuildTotal,
  getAvailableLines,
  getUnavailableLines,
} from "@/lib/builder/pricing";
import {
  formatBdt,
  getImagesForProduct,
  type Kit,
  type RequirementLine,
  type RobotProject,
} from "@/lib/catalog";
import { cn } from "@/lib/utils";

type BuilderWorkspaceProps = {
  project: RobotProject;
  lines: RequirementLine[];
  linkedKit: Kit | null;
  kitLines: RequirementLine[];
};

export function BuilderWorkspace({
  project,
  lines,
  linkedKit,
  kitLines,
}: BuilderWorkspaceProps) {
  const { addItems } = useCart();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => {
    return new Set(
      lines.filter((line) => !line.optional).map((line) => line.id),
    );
  });
  const [message, setMessage] = useState<string | null>(null);

  const selectedLines = useMemo(
    () => lines.filter((line) => selectedIds.has(line.id)),
    [lines, selectedIds],
  );

  const selectedTotal = calculateBuildTotal(selectedLines);
  const unavailableSelected = getUnavailableLines(selectedLines);
  const availableSelected = getAvailableLines(selectedLines);
  const availableProjectLines = getAvailableLines(lines);
  const canAddSelected = availableSelected.length > 0;
  const canAddKit =
    Boolean(linkedKit) && getAvailableLines(kitLines).length > 0;
  const canAddAllAvailable = availableProjectLines.length > 0;

  function toggleLine(lineId: string) {
    setMessage(null);
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(lineId)) {
        next.delete(lineId);
      } else {
        next.add(lineId);
      }
      return next;
    });
  }

  function selectRequiredOnly() {
    setMessage(null);
    setSelectedIds(
      new Set(lines.filter((line) => !line.optional).map((line) => line.id)),
    );
  }

  function selectAll() {
    setMessage(null);
    setSelectedIds(new Set(lines.map((line) => line.id)));
  }

  function addRequirementLines(
    targetLines: RequirementLine[],
    successLabel: string,
  ) {
    const available = getAvailableLines(targetLines);
    const unavailable = getUnavailableLines(targetLines);

    if (available.length === 0) {
      setMessage("No components are available in stock to add.");
      return;
    }

    const addedCount = addItems(
      available.map((line) => ({
        productId: line.product.id,
        variantId: line.variant?.id ?? null,
        quantity: line.quantity,
      })),
    );

    const skipped = unavailable.length;
    setMessage(
      skipped > 0
        ? `${successLabel} Added ${addedCount}. ${skipped} unavailable line${skipped === 1 ? " was" : "s were"} skipped.`
        : `${successLabel} Added ${addedCount} component${addedCount === 1 ? "" : "s"} to cart.`,
    );
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,0.9fr)]">
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">
              Customize components
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Toggle parts before adding. Optional items start unchecked.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={selectRequiredOnly}
            >
              Required only
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={selectAll}>
              Select all
            </Button>
          </div>
        </div>

        <ul className="divide-y rounded-xl border">
          {lines.map((line) => {
            const label = line.variant
              ? `${line.product.name} · ${line.variant.name}`
              : line.product.name;
            const selected = selectedIds.has(line.id);
            const enoughStock = line.availableQuantity >= line.quantity;
            const image = getImagesForProduct(line.product.id)[0];

            return (
              <li key={line.id} className="flex gap-3 p-4">
                <input
                  id={`builder-line-${line.id}`}
                  type="checkbox"
                  checked={selected}
                  onChange={() => toggleLine(line.id)}
                  className="mt-1 size-4 rounded border"
                />
                <div className="relative size-16 shrink-0 overflow-hidden rounded-lg border bg-muted">
                  {image ? (
                    <Image
                      src={image.url}
                      alt={image.alt}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <label
                        htmlFor={`builder-line-${line.id}`}
                        className="font-medium tracking-tight"
                      >
                        <Link
                          href={`/products/${line.product.slug}`}
                          className="hover:underline"
                        >
                          {label}
                        </Link>
                      </label>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Qty {line.quantity} · {formatBdt(line.unitPrice)} each
                        {line.optional ? " · Optional" : ""}
                      </p>
                    </div>
                    <PriceDisplay price={line.lineTotal} size="sm" />
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <StockBadge
                      availableQuantity={line.availableQuantity}
                      lowStockThreshold={line.lowStockThreshold}
                    />
                    {!enoughStock ? (
                      <span className="text-xs font-medium text-destructive">
                        Need {line.quantity}, available {line.availableQuantity}
                      </span>
                    ) : null}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <aside className="h-fit space-y-5 rounded-xl border p-5">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">
              {project.name}
            </h1>
            <SkillLevelBadge skillLevel={project.skillLevel} />
          </div>
          <p className="text-sm text-muted-foreground">
            {project.shortDescription}
          </p>
        </div>

        <div className="relative aspect-[4/3] overflow-hidden rounded-lg border bg-muted">
          <Image
            src={project.imageUrl}
            alt={project.imageAlt}
            fill
            sizes="(max-width: 1024px) 100vw, 30vw"
            className="object-cover"
          />
        </div>

        <div>
          <p className="text-sm text-muted-foreground">Selected build total</p>
          <p className="mt-1 text-2xl font-semibold tracking-tight">
            {formatBdt(selectedTotal)}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {selectedLines.length} selected ·{" "}
            {unavailableSelected.length > 0
              ? `${unavailableSelected.length} short on stock`
              : "all selected lines in stock"}
          </p>
        </div>

        {unavailableSelected.length > 0 ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
            Some selected parts are unavailable. Add will skip out-of-stock
            lines, or reduce your selection.
          </div>
        ) : null}

        <div className="space-y-2">
          <Button
            type="button"
            className="w-full"
            disabled={!canAddSelected}
            onClick={() =>
              addRequirementLines(selectedLines, "Selected components.")
            }
          >
            Add selected components to cart
          </Button>

          {linkedKit ? (
            <Button
              type="button"
              variant="outline"
              className="w-full"
              disabled={!canAddKit}
              onClick={() =>
                addRequirementLines(
                  kitLines,
                  `Complete kit (${linkedKit.name}).`,
                )
              }
            >
              Add complete kit ({linkedKit.name})
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              className="w-full"
              disabled={!canAddAllAvailable}
              onClick={() =>
                addRequirementLines(
                  availableProjectLines,
                  "All available components.",
                )
              }
            >
              Add all available components to cart
            </Button>
          )}

          {linkedKit ? (
            <Link
              href={`/kits/${linkedKit.slug}`}
              className={cn(buttonVariants({ variant: "ghost" }), "w-full")}
            >
              View kit page
            </Link>
          ) : null}
        </div>

        {message ? (
          <p className="text-sm text-muted-foreground" role="status">
            {message}
          </p>
        ) : null}
      </aside>
    </div>
  );
}
