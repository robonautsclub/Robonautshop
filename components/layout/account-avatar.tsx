"use client";

import { UserRound } from "lucide-react";

import { useAuth } from "@/components/auth/auth-provider";
import { cn } from "@/lib/utils";

type AccountAvatarProps = {
  className?: string;
  /** Icon size class when no image (matches lucide default in icon buttons). */
  iconClassName?: string;
};

/**
 * Profile control avatar: Google/Microsoft `user.image` when present,
 * otherwise the generic user icon.
 */
export function AccountAvatar({ className, iconClassName }: AccountAvatarProps) {
  const { user } = useAuth();

  if (user?.image) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- OAuth CDN hosts vary (Google, Microsoft)
      <img
        src={user.image}
        alt=""
        referrerPolicy="no-referrer"
        className={cn("size-7 rounded-full object-cover", className)}
      />
    );
  }

  return <UserRound className={iconClassName} aria-hidden />;
}
