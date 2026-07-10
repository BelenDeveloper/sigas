"use client";

import { useAtom } from "jotai";
import { useMemo, useState } from "react";

import { projectsAtom } from "@/lib/atoms/projects.atom";
import { INITIAL_STAGE_KEY, type ProjectStageKey } from "@/lib/constants/project-stages";
import {
  buildDefaultApprovalChecklist,
  MOCK_PROJECT_COMPANIES,
  type Project,
  type ProjectCategory,
  type ProjectCompany,
  type ProjectDocument,
  type ProjectExpense,
  type ProjectTask,
  type RecordedPayment,
} from "@/lib/mocks/projects.mock";
import type { PaymentMethod } from "@/lib/payment-method";

export const ALL_COMPANIES_OPTION = "all";
export const ALL_CATEGORIES_OPTION = "all";
export const ALL_STAGES_OPTION = "all";

export interface ProjectFilterState {
  companyId: string;
  category: ProjectCategory | typeof ALL_CATEGORIES_OPTION;
  stage: ProjectStageKey | typeof ALL_STAGES_OPTION;
}

export interface ProjectInput {
  name: string;
  category: ProjectCategory;
  companyId: string;
  clientId: string;
  isPrivate: boolean;
  totalValueBOB: number;
  firstPaymentAmountBOB: number;
  secondPaymentAmountBOB: number;
  startDate: string;
  description: string;
}

export interface TaskInput {
  stage: ProjectStageKey;
  description: string;
  assignedTo: string;
}

export interface ExpenseInput {
  stage: ProjectStageKey;
  description: string;
  amountBOB: number;
  method: PaymentMethod;
  receiptUrl: string;
}

export interface DocumentInput {
  stage: ProjectStageKey;
  fileName: string;
  uploadedBy: string;
}

export type PaymentInstallment = "first" | "second";

export interface PaymentInput {
  amountBOB: number;
  date: string;
  method: PaymentMethod;
}

const DEFAULT_FILTERS: ProjectFilterState = {
  companyId: ALL_COMPANIES_OPTION,
  category: ALL_CATEGORIES_OPTION,
  stage: ALL_STAGES_OPTION,
};

const CODE_PREFIX = "PRY";
const CODE_SEQUENCE_LENGTH = 4;

function generateProjectCode(projects: Project[]): string {
  const matchingNumbers = projects
    .filter((project) => project.code.startsWith(`${CODE_PREFIX}-`))
    .map((project) => Number(project.code.slice(CODE_PREFIX.length + 1)))
    .filter((value) => !Number.isNaN(value));

  const nextNumber = matchingNumbers.length > 0 ? Math.max(...matchingNumbers) + 1 : 1;

  return `${CODE_PREFIX}-${String(nextNumber).padStart(CODE_SEQUENCE_LENGTH, "0")}`;
}

function nowISO(): string {
  return new Date().toISOString();
}

interface UseProjectsResult {
  projects: Project[];
  companies: ProjectCompany[];
  filters: ProjectFilterState;
  setFilters: (filters: Partial<ProjectFilterState>) => void;
  createProject: (input: ProjectInput) => Project;
  getProjectById: (projectId: string) => Project | undefined;
  changeStage: (projectId: string, nextStage: ProjectStageKey, note: string) => void;
  addTask: (projectId: string, input: TaskInput) => void;
  toggleTaskCompleted: (projectId: string, taskId: string) => void;
  addExpense: (projectId: string, input: ExpenseInput) => void;
  addDocument: (projectId: string, input: DocumentInput) => void;
  recordPayment: (projectId: string, installment: PaymentInstallment, input: PaymentInput) => void;
  toggleApprovalStep: (projectId: string, stepKey: string) => void;
}

export function useProjects(): UseProjectsResult {
  const [allProjects, setAllProjects] = useAtom(projectsAtom);
  const [filters, setFiltersState] = useState<ProjectFilterState>(DEFAULT_FILTERS);

  const setFilters = (partialFilters: Partial<ProjectFilterState>) => {
    setFiltersState((previous) => ({ ...previous, ...partialFilters }));
  };

  const filteredProjects = useMemo(() => {
    return allProjects.filter((project) => {
      if (filters.companyId !== ALL_COMPANIES_OPTION && project.companyId !== filters.companyId) {
        return false;
      }

      if (filters.category !== ALL_CATEGORIES_OPTION && project.category !== filters.category) {
        return false;
      }

      if (filters.stage !== ALL_STAGES_OPTION && project.stage !== filters.stage) {
        return false;
      }

      return true;
    });
  }, [allProjects, filters]);

  const getProjectById = (projectId: string) => allProjects.find((project) => project.id === projectId);

  const createProject = (input: ProjectInput): Project => {
    const newProject: Project = {
      ...input,
      id: crypto.randomUUID(),
      code: generateProjectCode(allProjects),
      firstPaymentReceived: null,
      secondPaymentReceived: null,
      stage: INITIAL_STAGE_KEY,
      stageHistory: [
        { id: crypto.randomUUID(), stage: INITIAL_STAGE_KEY, changedAt: nowISO(), note: "Proyecto creado." },
      ],
      tasks: [],
      expenses: [],
      documents: [],
      approvalChecklist: buildDefaultApprovalChecklist(),
    };

    setAllProjects((previous) => [newProject, ...previous]);
    return newProject;
  };

  const changeStage = (projectId: string, nextStage: ProjectStageKey, note: string) => {
    setAllProjects((previous) =>
      previous.map((project) =>
        project.id === projectId
          ? {
              ...project,
              stage: nextStage,
              stageHistory: [
                ...project.stageHistory,
                { id: crypto.randomUUID(), stage: nextStage, changedAt: nowISO(), note },
              ],
            }
          : project,
      ),
    );
  };

  const addTask = (projectId: string, input: TaskInput) => {
    const newTask: ProjectTask = { ...input, id: crypto.randomUUID(), isCompleted: false };

    setAllProjects((previous) =>
      previous.map((project) =>
        project.id === projectId ? { ...project, tasks: [...project.tasks, newTask] } : project,
      ),
    );
  };

  const toggleTaskCompleted = (projectId: string, taskId: string) => {
    setAllProjects((previous) =>
      previous.map((project) =>
        project.id === projectId
          ? {
              ...project,
              tasks: project.tasks.map((task) =>
                task.id === taskId ? { ...task, isCompleted: !task.isCompleted } : task,
              ),
            }
          : project,
      ),
    );
  };

  const addExpense = (projectId: string, input: ExpenseInput) => {
    const newExpense: ProjectExpense = { ...input, id: crypto.randomUUID(), date: nowISO().slice(0, 10) };

    setAllProjects((previous) =>
      previous.map((project) =>
        project.id === projectId ? { ...project, expenses: [...project.expenses, newExpense] } : project,
      ),
    );
  };

  const addDocument = (projectId: string, input: DocumentInput) => {
    const newDocument: ProjectDocument = { ...input, id: crypto.randomUUID(), uploadedAt: nowISO() };

    setAllProjects((previous) =>
      previous.map((project) =>
        project.id === projectId ? { ...project, documents: [...project.documents, newDocument] } : project,
      ),
    );
  };

  const recordPayment = (projectId: string, installment: PaymentInstallment, input: PaymentInput) => {
    const recordedPayment: RecordedPayment = { ...input };
    const fieldName = installment === "first" ? "firstPaymentReceived" : "secondPaymentReceived";

    setAllProjects((previous) =>
      previous.map((project) =>
        project.id === projectId ? { ...project, [fieldName]: recordedPayment } : project,
      ),
    );
  };

  const toggleApprovalStep = (projectId: string, stepKey: string) => {
    setAllProjects((previous) =>
      previous.map((project) =>
        project.id === projectId
          ? {
              ...project,
              approvalChecklist: project.approvalChecklist.map((step) =>
                step.key === stepKey ? { ...step, isCompleted: !step.isCompleted } : step,
              ),
            }
          : project,
      ),
    );
  };

  return {
    projects: filteredProjects,
    companies: MOCK_PROJECT_COMPANIES,
    filters,
    setFilters,
    createProject,
    getProjectById,
    changeStage,
    addTask,
    toggleTaskCompleted,
    addExpense,
    addDocument,
    recordPayment,
    toggleApprovalStep,
  };
}
