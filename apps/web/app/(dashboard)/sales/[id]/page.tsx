import { SaleDetailPage } from "@/components/sales/SaleDetailPage";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  return <SaleDetailPage saleId={id} />;
}
