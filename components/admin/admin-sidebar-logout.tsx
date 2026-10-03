"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";

type AdminSidebarLogoutProps = {
  onLogout?: () => void;
};

export function AdminSidebarLogout({ onLogout }: AdminSidebarLogoutProps) {
  const router = useRouter();
  const { signOut, hydrated, isSignedIn, user } = useAuth();

  function handleLogout() {
    signOut();
    onLogout?.();
    router.push("/login");
  }

  return (
    <div className="border-t p-3">
      {hydrated && isSignedIn && user ? (
        <p className="mb-2 truncate px-2 text-xs text-muted-foreground">
          {user.name || user.email}
        </p>
      ) : null}
      <Button
        type="button"
        variant="outline"
        className="w-full justify-start gap-2"
        onClick={handleLogout}
      >
        <LogOut className="size-4" aria-hidden />
        Log out
      </Button>
      <Link
        href="/"
        className="mt-2 block px-2 text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
      >
        Back to store
      </Link>
    </div>
  );
}
