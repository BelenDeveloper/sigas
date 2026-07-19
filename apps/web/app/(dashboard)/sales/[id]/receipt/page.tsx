import { SaleReceiptView } from "@/components/sales/SaleReceiptView";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;

  return (
    <>
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }

          #receipt,
          #receipt * {
            visibility: visible;
          }

          #receipt {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
      <SaleReceiptView saleId={id} />
    </>
  );
}
