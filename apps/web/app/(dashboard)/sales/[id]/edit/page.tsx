import { SaleEditPage } from "@/components/sales/SaleEditPage";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  return <SaleEditPage saleId={id} />;
}
