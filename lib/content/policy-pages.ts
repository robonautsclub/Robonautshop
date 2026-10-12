import { estimateShippingBdt } from "@/lib/checkout/types";
import { formatBdt } from "@/lib/catalog/money";

/**
 * Store trust pages (task 142). All wording lives here, apart from routes and
 * business logic, so it can be translated later (Bangla) or moved to a CMS.
 *
 * These are PLACEHOLDERS: no legal claims are made. Anything in [square
 * brackets] is a value the store owner must fill in, and the owner must have
 * the privacy, terms and returns text reviewed before launch.
 */

export type PolicySlug = "privacy" | "terms" | "returns" | "shipping" | "about" | "faq";

export type PolicySection = {
  heading: string;
  paragraphs: string[];
};

export type PolicyPageContent = {
  slug: PolicySlug;
  path: `/${PolicySlug}`;
  title: string;
  description: string;
  /** Show the "owner must review" banner. */
  needsReview: boolean;
  sections: PolicySection[];
};

export const POLICY_REVIEW_NOTICE =
  "Draft text — the store owner must review and complete this page before launch. Items in [brackets] are placeholders.";

function shippingSection(): PolicySection[] {
  const dhaka = estimateShippingBdt("Dhaka").amount;
  const outside = estimateShippingBdt("Chattogram").amount;
  return [
    {
      heading: "Delivery charge",
      paragraphs: [
        `Delivery is a flat charge based on your delivery city: ${formatBdt(dhaka)} for Dhaka and ${formatBdt(outside)} for everywhere else in Bangladesh. The exact charge is shown at checkout before you pay.`,
      ],
    },
    {
      heading: "Delivery time",
      paragraphs: [
        "Estimated delivery time: [owner to fill in, e.g. X–Y working days]. Delivery times are estimates and are not guaranteed.",
      ],
    },
    {
      heading: "Tracking your order",
      paragraphs: [
        "Sign in and open Account → Orders to see the current status of each order.",
      ],
    },
  ];
}

function buildPages(): Record<PolicySlug, PolicyPageContent> {
  return {
    privacy: {
      slug: "privacy",
      path: "/privacy",
      title: "Privacy policy",
      description: "How Robonautsshop handles your personal information.",
      needsReview: true,
      sections: [
        {
          heading: "What we collect",
          paragraphs: [
            "When you create an account or place an order we store your name, email address, phone number and delivery addresses, along with your order history.",
          ],
        },
        {
          heading: "How we use it",
          paragraphs: [
            "We use this information to process and deliver orders, send order and account emails, and respond to your messages. Payments are completed on bKash; we do not store your bKash PIN or wallet credentials.",
          ],
        },
        {
          heading: "Your choices",
          paragraphs: [
            "You can edit your profile and addresses from your account, and you can delete your account at any time. Order records are kept for our business records with your personal details removed.",
          ],
        },
        {
          heading: "Contact",
          paragraphs: ["Privacy questions: [owner to add contact email]."],
        },
      ],
    },
    terms: {
      slug: "terms",
      path: "/terms",
      title: "Terms of service",
      description: "The terms for using the Robonautsshop store.",
      needsReview: true,
      sections: [
        {
          heading: "Using the store",
          paragraphs: [
            "By placing an order you agree to provide accurate information and to pay the total shown at checkout in Bangladeshi taka (৳).",
          ],
        },
        {
          heading: "Prices and availability",
          paragraphs: [
            "Prices and stock are confirmed when you place your order. If an item cannot be supplied we will contact you. [Owner to add any further terms.]",
          ],
        },
        {
          heading: "Payments",
          paragraphs: ["Orders are currently paid for with bKash."],
        },
        {
          heading: "Changes to these terms",
          paragraphs: ["We may update these terms. [Owner to add effective date and notice process.]"],
        },
      ],
    },
    returns: {
      slug: "returns",
      path: "/returns",
      title: "Returns & warranty",
      description: "Returns, refunds and warranty at Robonautsshop.",
      needsReview: true,
      sections: [
        {
          heading: "Returns",
          paragraphs: [
            "Return window: [owner to fill in]. Items must be [condition requirements — owner to fill in]. Contact us before sending anything back.",
          ],
        },
        {
          heading: "Refunds",
          paragraphs: [
            "Refunds for bKash payments are processed manually by our team. Refund timing: [owner to fill in].",
          ],
        },
        {
          heading: "Warranty",
          paragraphs: [
            "Warranty coverage by product type: [owner to fill in]. Warranty does not cover [exclusions — owner to fill in].",
          ],
        },
        {
          heading: "Contact",
          paragraphs: ["Start a return or warranty claim through our contact page."],
        },
      ],
    },
    shipping: {
      slug: "shipping",
      path: "/shipping",
      title: "Shipping & delivery",
      description: "Delivery charges and times for Robonautsshop orders.",
      needsReview: true,
      sections: shippingSection(),
    },
    about: {
      slug: "about",
      path: "/about",
      title: "About Robonautsshop",
      description: "Robotics parts, kits and guided builds for Bangladesh.",
      needsReview: true,
      sections: [
        {
          heading: "Who we are",
          paragraphs: [
            "Robonautsshop sells robotics parts, robot kits and guided builds for students, makers and competition teams across Bangladesh.",
          ],
        },
        {
          heading: "Our story",
          paragraphs: ["[Owner to add the store's story, team and location.]"],
        },
      ],
    },
    faq: {
      slug: "faq",
      path: "/faq",
      title: "Frequently asked questions",
      description: "Answers to common questions about ordering from Robonautsshop.",
      needsReview: true,
      sections: [
        {
          heading: "How do I pay?",
          paragraphs: ["We currently accept bKash at checkout."],
        },
        {
          heading: "How much is delivery?",
          paragraphs: [
            `Delivery is a flat charge by city: ${formatBdt(estimateShippingBdt("Dhaka").amount)} in Dhaka and ${formatBdt(estimateShippingBdt("Chattogram").amount)} elsewhere in Bangladesh.`,
          ],
        },
        {
          heading: "How do I track my order?",
          paragraphs: ["Sign in and open Account → Orders."],
        },
        {
          heading: "Can I cancel an order?",
          paragraphs: [
            "Yes, from the order page in your account, until the order has been packed.",
          ],
        },
        {
          heading: "Which parts do I need for my robot?",
          paragraphs: [
            "Try the Robot Builder or browse our robot projects and kits — each lists the exact components you need.",
          ],
        },
      ],
    },
  };
}

export function getPolicyPage(slug: PolicySlug): PolicyPageContent {
  return buildPages()[slug];
}

/** Paths of every policy page, for the footer and sitemap. */
export const POLICY_LINKS: ReadonlyArray<{ href: `/${PolicySlug}`; label: string }> = [
  { href: "/about", label: "About us" },
  { href: "/faq", label: "FAQ" },
  { href: "/shipping", label: "Shipping & delivery" },
  { href: "/returns", label: "Returns & warranty" },
  { href: "/privacy", label: "Privacy policy" },
  { href: "/terms", label: "Terms of service" },
];
