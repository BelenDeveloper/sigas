"use client";

import { Button } from "@repo/ui/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import { Plus } from "lucide-react";
import { useState } from "react";

import type { DocumentInput, ProjectDetail } from "@/hooks/use-projects";
import { getStageByKey } from "@/lib/constants/project-stages";
import type { GetProjectUploadUrl } from "@/lib/project-file-upload";
import type { AdminUser } from "@/lib/user-permissions";

import { ApprovalChecklist } from "./ApprovalChecklist";
import { DocumentGallery } from "./DocumentGallery";
import { UploadDocumentDialog } from "./UploadDocumentDialog";

const DESIGN_INSPECTION_STAGE_KEY = "design_inspection";

interface DocumentsTabProps {
  project: ProjectDetail;
  users: AdminUser[];
  canEdit: boolean;
  getUploadUrl: GetProjectUploadUrl;
  onAddDocument: (input: DocumentInput) => void;
  onToggleApprovalStep: (checklistItemId: string, nextIsCompleted: boolean) => void;
}

export function DocumentsTab({
  project,
  users,
  canEdit,
  getUploadUrl,
  onAddDocument,
  onToggleApprovalStep,
}: DocumentsTabProps) {
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      {canEdit ? (
        <div className="flex justify-end">
          <Button variant="outline" onClick={() => setIsUploadDialogOpen(true)}>
            <Plus className="size-4" />
            Subir documento
          </Button>
        </div>
      ) : null}

      <DocumentGallery documents={project.documents} users={users} />

      <Card>
        <CardHeader>
          <CardTitle>{getStageByKey(DESIGN_INSPECTION_STAGE_KEY).label}</CardTitle>
        </CardHeader>
        <CardContent>
          <ApprovalChecklist steps={project.approvalChecklist} onToggleStep={onToggleApprovalStep} />
        </CardContent>
      </Card>

      <UploadDocumentDialog
        open={isUploadDialogOpen}
        onOpenChange={setIsUploadDialogOpen}
        currentStage={project.stage}
        getUploadUrl={getUploadUrl}
        onCreate={onAddDocument}
      />
    </div>
  );
}
