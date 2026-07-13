"use client";

import { useMemo, useState } from "react";

import { INITIAL_STAGE_KEY, type ProjectStageKey } from "@/lib/constants/project-stages";
import type { PaymentMethod } from "@/lib/payment-method";
import type { GetProjectUploadUrl } from "@/lib/project-file-upload";
import type { ProjectCategory } from "@/lib/project-types";
import { trpc } from "@/lib/trpc/client";

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
  receiptUrl?: string;
}

export interface DocumentInput {
  stage: ProjectStageKey;
  name: string;
  fileUrl: string;
  fileType?: string;
}

export type PaymentInstallment = "first" | "second";

export interface PaymentInput {
  amountBOB: number;
  date: string;
  method: PaymentMethod;
  accountDestination: string;
}

export interface ProjectListItem {
  id: string;
  code: string;
  name: string;
  category: ProjectCategory;
  companyId: string | null;
  companyName: string;
  clientId: string | null;
  clientName: string;
  isPrivate: boolean;
  stage: ProjectStageKey;
  totalValueBOB: number;
}

export interface RecordedPayment {
  amountBOB: number;
  date: string;
  method: PaymentMethod;
  accountDestination: string;
}

export interface ProjectTask {
  id: string;
  stage: ProjectStageKey;
  description: string;
  assignedTo: string;
  isCompleted: boolean;
}

export interface ProjectExpense {
  id: string;
  stage: ProjectStageKey;
  description: string;
  amountBOB: number;
  method: PaymentMethod;
  receiptUrl: string;
  date: string;
}

export interface ProjectDocument {
  id: string;
  stage: ProjectStageKey;
  fileName: string;
  fileUrl: string;
  uploadedBy: string;
  uploadedAt: string;
}

export interface ProjectApprovalStep {
  id: string;
  stepNumber: number;
  description: string;
  channel: string | null;
  isCompleted: boolean;
}

export interface ProjectDetail {
  id: string;
  code: string;
  name: string;
  category: ProjectCategory;
  companyId: string | null;
  companyName: string;
  clientId: string | null;
  clientName: string;
  isPrivate: boolean;
  stage: ProjectStageKey;
  description: string;
  totalValueBOB: number;
  firstPaymentAmountBOB: number;
  secondPaymentAmountBOB: number;
  firstPaymentReceived: RecordedPayment | null;
  secondPaymentReceived: RecordedPayment | null;
  startDate: string;
  tasks: ProjectTask[];
  expenses: ProjectExpense[];
  documents: ProjectDocument[];
  approvalChecklist: ProjectApprovalStep[];
}

const DEFAULT_FILTERS: ProjectFilterState = {
  companyId: ALL_COMPANIES_OPTION,
  category: ALL_CATEGORIES_OPTION,
  stage: ALL_STAGES_OPTION,
};

function toProjectListItem(project: {
  id: string;
  code: string;
  name: string;
  category: ProjectCategory;
  companyId: string | null;
  companyName: string | null;
  clientId: string | null;
  clientName: string | null;
  isPrivate: boolean;
  stage: ProjectStageKey;
  totalValue: string | null;
}): ProjectListItem {
  return {
    id: project.id,
    code: project.code,
    name: project.name,
    category: project.category,
    companyId: project.companyId,
    companyName: project.companyName ?? "",
    clientId: project.clientId,
    clientName: project.clientName ?? "",
    isPrivate: project.isPrivate,
    stage: project.stage,
    totalValueBOB: project.totalValue ? Number(project.totalValue) : 0,
  };
}

interface UseProjectsResult {
  projects: ProjectListItem[];
  filters: ProjectFilterState;
  setFilters: (filters: Partial<ProjectFilterState>) => void;
  createProject: (input: ProjectInput) => Promise<{ id: string }>;
  isLoading: boolean;
}

export function useProjects(): UseProjectsResult {
  const utils = trpc.useUtils();

  const [filters, setFiltersState] = useState<ProjectFilterState>(DEFAULT_FILTERS);

  const setFilters = (partialFilters: Partial<ProjectFilterState>) => {
    setFiltersState((previous) => ({ ...previous, ...partialFilters }));
  };

  const { data: rawProjects } = trpc.projects.list.useQuery({
    companyId: filters.companyId !== ALL_COMPANIES_OPTION ? filters.companyId : undefined,
    category: filters.category !== ALL_CATEGORIES_OPTION ? filters.category : undefined,
    stage: filters.stage !== ALL_STAGES_OPTION ? filters.stage : undefined,
  });

  const invalidateProjects = () => void utils.projects.list.invalidate();

  const createMutation = trpc.projects.create.useMutation({ onSuccess: invalidateProjects });

  const projects = useMemo(() => (rawProjects ?? []).map(toProjectListItem), [rawProjects]);

  const createProject = (input: ProjectInput): Promise<{ id: string }> => {
    return createMutation.mutateAsync({
      name: input.name,
      category: input.category,
      companyId: input.companyId || undefined,
      clientId: input.clientId || undefined,
      isPrivate: input.isPrivate,
      totalValue: input.totalValueBOB || undefined,
      firstPaymentAmount: input.firstPaymentAmountBOB || undefined,
      secondPaymentAmount: input.secondPaymentAmountBOB || undefined,
      startDate: input.startDate || undefined,
      description: input.description || undefined,
    });
  };

  return {
    projects,
    filters,
    setFilters,
    createProject,
    isLoading: rawProjects === undefined,
  };
}

interface UseProjectResult {
  project: ProjectDetail | undefined;
  isLoading: boolean;
  changeStage: (newStage: ProjectStageKey, notes: string) => void;
  addTask: (input: TaskInput) => void;
  toggleTaskCompleted: (taskId: string) => void;
  addExpense: (input: ExpenseInput) => void;
  addDocument: (input: DocumentInput) => void;
  recordPayment: (installment: PaymentInstallment, input: PaymentInput) => void;
  toggleApprovalStep: (checklistItemId: string, nextIsCompleted: boolean) => void;
  getUploadUrl: GetProjectUploadUrl;
}

export function useProject(projectId: string): UseProjectResult {
  const utils = trpc.useUtils();

  const { data: rawProject, isLoading } = trpc.projects.get.useQuery({ id: projectId });

  const invalidateProject = () => {
    void utils.projects.get.invalidate({ id: projectId });
    void utils.projects.list.invalidate();
  };

  const changeStageMutation = trpc.projects.changeStage.useMutation({ onSuccess: invalidateProject });
  const addTaskMutation = trpc.projects.addTask.useMutation({ onSuccess: invalidateProject });
  const completeTaskMutation = trpc.projects.completeTask.useMutation({ onSuccess: invalidateProject });
  const addExpenseMutation = trpc.projects.addExpense.useMutation({ onSuccess: invalidateProject });
  const uploadDocumentMutation = trpc.projects.uploadDocument.useMutation({ onSuccess: invalidateProject });
  const recordPaymentMutation = trpc.projects.recordPayment.useMutation({ onSuccess: invalidateProject });
  const updateChecklistMutation = trpc.projects.updateChecklist.useMutation({ onSuccess: invalidateProject });
  const getUploadUrlMutation = trpc.projects.getUploadUrl.useMutation();

  const project = useMemo<ProjectDetail | undefined>(() => {
    if (!rawProject) {
      return undefined;
    }

    const firstPayment = rawProject.paymentsReceived.find((payment) => payment.paymentNumber === 1);
    const secondPayment = rawProject.paymentsReceived.find((payment) => payment.paymentNumber === 2);

    const toRecordedPayment = (payment: {
      amount: string;
      paidAt: Date | string;
      paymentMethod: PaymentMethod;
      accountDestination: string | null;
    }): RecordedPayment => ({
      amountBOB: Number(payment.amount),
      date: String(payment.paidAt),
      method: payment.paymentMethod,
      accountDestination: payment.accountDestination ?? "",
    });

    return {
      id: rawProject.id,
      code: rawProject.code,
      name: rawProject.name,
      category: rawProject.category,
      companyId: rawProject.companyId,
      companyName: rawProject.companyName ?? "",
      clientId: rawProject.clientId,
      clientName: rawProject.clientName ?? "",
      isPrivate: rawProject.isPrivate,
      stage: rawProject.stage,
      description: rawProject.description ?? "",
      totalValueBOB: rawProject.totalValue ? Number(rawProject.totalValue) : 0,
      firstPaymentAmountBOB: rawProject.firstPaymentAmount ? Number(rawProject.firstPaymentAmount) : 0,
      secondPaymentAmountBOB: rawProject.secondPaymentAmount ? Number(rawProject.secondPaymentAmount) : 0,
      firstPaymentReceived: firstPayment ? toRecordedPayment(firstPayment) : null,
      secondPaymentReceived: secondPayment ? toRecordedPayment(secondPayment) : null,
      startDate: rawProject.startDate ?? "",
      tasks: rawProject.logisticsTasks.map((task) => ({
        id: task.id,
        stage: task.stage,
        description: task.description,
        assignedTo: task.assignedTo ?? "",
        isCompleted: task.isCompleted,
      })),
      expenses: rawProject.expenses.map((expense) => ({
        id: expense.id,
        stage: expense.stage ?? INITIAL_STAGE_KEY,
        description: expense.description,
        amountBOB: Number(expense.amount),
        method: expense.paymentMethod,
        receiptUrl: expense.receiptUrl ?? "",
        date: String(expense.createdAt).slice(0, 10),
      })),
      documents: rawProject.documents.map((document) => ({
        id: document.id,
        stage: document.stage ?? INITIAL_STAGE_KEY,
        fileName: document.name,
        fileUrl: document.fileUrl,
        uploadedBy: document.uploadedBy,
        uploadedAt: String(document.uploadedAt),
      })),
      approvalChecklist: rawProject.checklist
        .slice()
        .sort((a, b) => a.stepNumber - b.stepNumber)
        .map((item) => ({
          id: item.id,
          stepNumber: item.stepNumber,
          description: item.stepDescription,
          channel: item.channel,
          isCompleted: item.isCompleted,
        })),
    };
  }, [rawProject]);

  const changeStage = (newStage: ProjectStageKey, notes: string) => {
    changeStageMutation.mutate({ projectId, newStage, notes: notes || undefined });
  };

  const addTask = (input: TaskInput) => {
    addTaskMutation.mutate({
      projectId,
      stage: input.stage,
      description: input.description,
      assignedTo: input.assignedTo || undefined,
    });
  };

  const toggleTaskCompleted = (taskId: string) => {
    completeTaskMutation.mutate({ id: taskId });
  };

  const addExpense = (input: ExpenseInput) => {
    addExpenseMutation.mutate({
      projectId,
      stage: input.stage,
      description: input.description,
      amount: input.amountBOB,
      paymentMethod: input.method,
      receiptUrl: input.receiptUrl,
    });
  };

  const addDocument = (input: DocumentInput) => {
    uploadDocumentMutation.mutate({
      projectId,
      stage: input.stage,
      name: input.name,
      fileUrl: input.fileUrl,
      fileType: input.fileType,
    });
  };

  const recordPayment = (installment: PaymentInstallment, input: PaymentInput) => {
    recordPaymentMutation.mutate({
      projectId,
      paymentNumber: installment === "first" ? 1 : 2,
      amount: input.amountBOB,
      paymentMethod: input.method,
      accountDestination: input.accountDestination,
    });
  };

  const toggleApprovalStep = (checklistItemId: string, nextIsCompleted: boolean) => {
    updateChecklistMutation.mutate({ id: checklistItemId, isCompleted: nextIsCompleted });
  };

  const getUploadUrl: GetProjectUploadUrl = (fileName, contentType) => {
    return getUploadUrlMutation.mutateAsync({ projectId, fileName, contentType });
  };

  return {
    project,
    isLoading,
    changeStage,
    addTask,
    toggleTaskCompleted,
    addExpense,
    addDocument,
    recordPayment,
    toggleApprovalStep,
    getUploadUrl,
  };
}
