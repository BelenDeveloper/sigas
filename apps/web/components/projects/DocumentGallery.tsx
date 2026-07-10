import { Card, CardContent } from "@repo/ui/components/ui/card";
import { FileText } from "lucide-react";

import { getStageByKey } from "@/lib/constants/project-stages";
import type { ProjectDocument } from "@/lib/mocks/projects.mock";
import { MOCK_USERS } from "@/lib/mocks/users.mock";

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

function getUploaderName(userId: string): string {
  return MOCK_USERS.find((user) => user.id === userId)?.name ?? UNKNOWN_UPLOADER_LABEL;
}

interface DocumentGalleryProps {
  documents: ProjectDocument[];
}

export function DocumentGallery({ documents }: DocumentGalleryProps) {
  if (documents.length === 0) {
    return <p className="text-sm text-muted-foreground">{NO_DOCUMENTS_MESSAGE}</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {documents.map((document) => (
        <Card key={document.id}>
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
      ))}
    </div>
  );
}
