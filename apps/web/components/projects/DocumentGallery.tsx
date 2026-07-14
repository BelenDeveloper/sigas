import { Card, CardContent } from "@repo/ui/components/ui/card";
import { FileText } from "lucide-react";

import type { ProjectDocument } from "@/hooks/use-projects";
import { getStageByKey } from "@/lib/constants/project-stages";
import { getProjectFileUrl } from "@/lib/project-file-upload";
import type { AdminUser } from "@/lib/user-permissions";

const NO_DOCUMENTS_MESSAGE = "Todavía no hay documentos cargados.";
const UNKNOWN_UPLOADER_LABEL = "—";
const DATE_LOCALE = "es-BO";

function formatDateTime(isoDateTime: string): string {
  return new Date(isoDateTime).toLocaleDateString(DATE_LOCALE, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

interface DocumentGalleryProps {
  documents: ProjectDocument[];
  users: AdminUser[];
}

export function DocumentGallery({ documents, users }: DocumentGalleryProps) {
  if (documents.length === 0) {
    return <p className="text-sm text-muted-foreground">{NO_DOCUMENTS_MESSAGE}</p>;
  }

  const getUploaderName = (userId: string) =>
    users.find((user) => user.id === userId)?.name ?? UNKNOWN_UPLOADER_LABEL;

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {documents.map((document) => (
        <a
          key={document.id}
          href={getProjectFileUrl(document.fileUrl)}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Card className="transition-colors hover:bg-accent">
            <CardContent className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <FileText className="size-5 text-muted-foreground" />
                <span className="truncate text-sm font-medium text-foreground">{document.fileName}</span>
              </div>
              <span className="text-xs text-muted-foreground">{getStageByKey(document.stage).label}</span>
              <span className="text-xs text-muted-foreground">
                {formatDateTime(document.uploadedAt)} · {getUploaderName(document.uploadedBy)}
              </span>
            </CardContent>
          </Card>
        </a>
      ))}
    </div>
  );
}
