"use client";

import { Heart } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { toggleWishlistAction } from "@/lib/wishlist/actions";
import { cn } from "@/lib/utils";

type WishlistButtonProps = {
  productId: string;
  initialWishlisted: boolean;
  isSignedIn: boolean;
};

export function WishlistButton({
  productId,
  initialWishlisted,
  isSignedIn,
}: WishlistButtonProps) {
  const [wishlisted, setWishlisted] = useState(initialWishlisted);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function onClick() {
    if (!isSignedIn) {
      setMessage("Sign in to save items to your wishlist.");
      return;
    }

    setPending(true);
    setMessage(null);
    const result = await toggleWishlistAction(productId);
    setPending(false);

    if (!result.ok) {
      setMessage(result.error);
      return;
    }
    setWishlisted(result.wishlisted);
  }

  return (
    <div>
      <Button
        type="button"
        variant="outline"
        className="gap-2"
        onClick={onClick}
        disabled={pending}
        aria-pressed={wishlisted}
      >
        <Heart
          className={cn("size-4", wishlisted && "fill-destructive text-destructive")}
          aria-hidden
        />
        {wishlisted ? "Saved to wishlist" : "Add to wishlist"}
      </Button>
      {message ? (
        <p className="mt-1 text-sm text-muted-foreground" role="status">
          {message}
        </p>
      ) : null}
    </div>
  );
}
