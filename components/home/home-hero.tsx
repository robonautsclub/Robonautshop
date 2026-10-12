import { ArrowRight, Cpu, ShieldCheck, Truck, Wallet } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { SiteLogo } from "@/components/brand/site-logo";
import { PageContainer } from "@/components/layout/page-container";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Placeholder background — swap for a real store/robot photo (and give it alt text). */
const HERO_IMAGE_URL = "https://picsum.photos/seed/robonautsshop-hero/2400/1350";

/** Only claims the store can actually back up — no invented counts or ratings. */
const HIGHLIGHTS = [
  { icon: Wallet, label: "Pay securely with bKash" },
  { icon: Truck, label: "Delivery across Bangladesh" },
  { icon: ShieldCheck, label: "Live stock — no surprises" },
] as const;

export function HomeHero() {
  return (
    <section className="relative isolate overflow-hidden bg-neutral-950 text-white">
      <Image
        src={HERO_IMAGE_URL}
        alt=""
        fill
        priority
        sizes="100vw"
        className="-z-20 object-cover"
      />
      {/* Darkens the photo so the copy stays readable (WCAG contrast). */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-r from-neutral-950/95 via-neutral-950/75 to-neutral-950/30"
      />

      <PageContainer className="flex min-h-[78vh] flex-col justify-center gap-8 py-20 sm:py-28">
        <SiteLogo
          href={null}
          size="lg"
          priority
          wordmarkClassName="text-white"
        />

        <div className="max-w-2xl space-y-5">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium tracking-wide text-white/90 backdrop-blur">
            <Cpu className="size-3.5" aria-hidden />
            Parts · Kits · Robot Builder
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
            Build your next robot.
            <span className="block text-sky-300">We have every part.</span>
          </h1>
          <p className="max-w-xl text-base text-white/80 sm:text-lg">
            Microcontrollers, motors, sensors, and complete kits for STEM labs,
            students, and competition teams across Bangladesh.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/products"
            className={cn(
              buttonVariants({ size: "lg" }),
              "bg-white px-5 text-neutral-950 hover:bg-white/90",
            )}
          >
            Shop parts
            <ArrowRight className="size-4" aria-hidden />
          </Link>
          <Link
            href="/builder"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "border-white/30 bg-white/10 px-5 text-white backdrop-blur hover:bg-white/20 hover:text-white",
            )}
          >
            Start the Robot Builder
          </Link>
          <Link
            href="/kits"
            className={cn(
              buttonVariants({ variant: "ghost", size: "lg" }),
              "px-5 text-white hover:bg-white/10 hover:text-white",
            )}
          >
            View kits
          </Link>
        </div>

        <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/80">
          {HIGHLIGHTS.map(({ icon: Icon, label }) => (
            <li key={label} className="inline-flex items-center gap-2">
              <Icon className="size-4 text-sky-300" aria-hidden />
              {label}
            </li>
          ))}
        </ul>
      </PageContainer>
    </section>
  );
}
