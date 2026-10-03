import { PageContainer } from "@/components/layout/page-container";

type PlaceholderPageProps = {
  title: string;
  description: string;
};

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <PageContainer as="section" className="py-16">
      <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-3 max-w-xl text-muted-foreground">{description}</p>
    </PageContainer>
  );
}
