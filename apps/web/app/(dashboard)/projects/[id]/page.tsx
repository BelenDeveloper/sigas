import { ProjectDetailPage } from "@/components/projects/ProjectDetailPage";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  return <ProjectDetailPage projectId={id} />;
}
