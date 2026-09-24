import KomiStorefront from "@/components/store/KomiStorefront";

interface StorePageProps {
  params: Promise<{ slug: string }> | { slug: string };
}

export default async function TenantStorePage({ params }: StorePageProps) {
  const resolved = await params;
  const slug = resolved?.slug || "quebravazo";

  return <KomiStorefront slug={slug} />;
}
