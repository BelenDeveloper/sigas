import { Badge } from "@repo/ui/components/ui/badge";

import { getStageByKey, type ProjectStageKey } from "@/lib/constants/project-stages";

const COMPLETED_STAGE_CLASSES = "bg-emerald-100 text-emerald-800";
const CANCELLED_STAGE_CLASSES = "bg-red-100 text-red-800";
const IN_PROGRESS_STAGE_CLASSES = "bg-blue-100 text-blue-800";

function getStageBadgeClassName(stage: ProjectStageKey): string {
  if (stage === "completed") {
    return COMPLETED_STAGE_CLASSES;
  }

  if (stage === "cancelled") {
    return CANCELLED_STAGE_CLASSES;
  }

  return IN_PROGRESS_STAGE_CLASSES;
}

interface ProjectStageBadgeProps {
  stage: ProjectStageKey;
}

export function ProjectStageBadge({ stage }: ProjectStageBadgeProps) {
  return <Badge className={getStageBadgeClassName(stage)}>{getStageByKey(stage).label}</Badge>;
}
