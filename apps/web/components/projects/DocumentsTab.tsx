"use client";

import { Button } from "@repo/ui/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import { Plus } from "lucide-react";
import { useState } from "react";

import type { ChecklistItemInput, DocumentInput, ProjectDetail } from "@/hooks/use-projects";
import type { GetProjectUploadUrl } from "@/lib/project-file-upload";
import type { AdminUser } from "@/lib/user-permissions";

import { AddChecklistItemDialog } from "./AddChecklistItemDialog";
import { ApprovalChecklist } from "./ApprovalChecklist";
import { DocumentGallery } from "./DocumentGallery";
import { UploadDocumentDialog } from "./UploadDocumentDialog";

interface DocumentsTabProps {
  project: ProjectDetail;
  users: AdminUser[];
  canEdit: boolean;
  getUploadUrl: GetProjectUploadUrl;
  togglingChecklistItemId: string | null;
  removingChecklistItemId: string | null;
  isAddingChecklistItem: boolean;
  onAddDocument: (input: DocumentInput) => Promise<void>;
  onToggleApprovalStep: (checklistItemId: string, nextIsCompleted: boolean) => void;
  onEditApprovalStepDescription: (checklistItemId: string, description: string) => void;
  onAddChecklistItem: (input: ChecklistItemInput) => Promise<void>;
  onRemoveChecklistItem: (checklistItemId: string) => void;
  onReorderChecklistItems: (orderedIds: string[]) => void;
}

export function DocumentsTab({
  project,
  users,
  canEdit,
  getUploadUrl,
  togglingChecklistItemId,
  removingChecklistItemId,
  isAddingChecklistItem,
  onAddDocument,
  onToggleApprovalStep,
  onEditApprovalStepDescription,
  onAddChecklistItem,
  onRemoveChecklistItem,
  onReorderChecklistItems,
}: DocumentsTabProps) {
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isAddChecklistItemOpen, setIsAddChecklistItemOpen] = useState(false);

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
          <CardTitle>Checklist de aprobación</CardTitle>
        </CardHeader>
        <CardContent>
          <ApprovalChecklist
            steps={project.approvalChecklist}
            togglingChecklistItemId={togglingChecklistItemId}
            removingChecklistItemId={removingChecklistItemId}
            onToggleStep={onToggleApprovalStep}
            onEditDescription={onEditApprovalStepDescription}
            onRemoveStep={onRemoveChecklistItem}
            onReorderSteps={onReorderChecklistItems}
            onAddStep={() => setIsAddChecklistItemOpen(true)}
          />
        </CardContent>
      </Card>

      <UploadDocumentDialog
        open={isUploadDialogOpen}
        onOpenChange={setIsUploadDialogOpen}
        currentStage={project.stage}
        getUploadUrl={getUploadUrl}
        onCreate={onAddDocument}
      />

      <AddChecklistItemDialog
        open={isAddChecklistItemOpen}
        onOpenChange={setIsAddChecklistItemOpen}
        isAdding={isAddingChecklistItem}
        onCreate={onAddChecklistItem}
      />
    </div>
  );
}
