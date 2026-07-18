export interface PendingPayment {
  id: string;
  clientName: string;
  amountBOB: number;
  dueDate: string;
}

export const MOCK_PENDING_PAYMENTS: PendingPayment[] = [
  { id: "pp1", clientName: "Constructora Andina S.R.L.", amountBOB: 12500, dueDate: "2026-07-15" },
  { id: "pp2", clientName: "Hotel Real Cochabamba", amountBOB: 8200, dueDate: "2026-07-20" },
  { id: "pp3", clientName: "Frigorífico San José", amountBOB: 5400, dueDate: "2026-07-28" },
];

export const MOCK_CLIENTS_WITH_DEBT_COUNT = 3;
