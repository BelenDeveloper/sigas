import { PurchaseDetailPage } from "@/components/purchases/PurchaseDetailPage";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  return <PurchaseDetailPage purchaseId={id} />;
}
