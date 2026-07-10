import { ClientDetailPage } from "@/components/clients/ClientDetailPage";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  return <ClientDetailPage clientId={id} />;
}
