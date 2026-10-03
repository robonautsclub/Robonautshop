import { StatusPage } from "@/components/shared/status-page";

type CatalogEmptyStateProps = {
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
  className?: string;
};

export function CatalogEmptyState({
  title,
  description,
  actionHref,
  actionLabel,
  className,
}: CatalogEmptyStateProps) {
  return (
    <StatusPage
      title={title}
      titleAs="h2"
      description={description}
      primaryAction={
        actionHref && actionLabel
          ? { href: actionHref, label: actionLabel, variant: "outline" }
          : undefined
      }
      className={className}
    />
  );
}
