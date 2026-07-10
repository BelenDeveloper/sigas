import type { CashEntry } from "@/lib/mocks/cash.mock";

export interface DestinationBalance {
  destination: string;
  balanceBOB: number;
}

function getSignedAmountBOB(entry: CashEntry): number {
  return entry.type === "income" ? entry.amountBOB : -entry.amountBOB;
}

export function getBalanceByDestination(entries: CashEntry[]): DestinationBalance[] {
  const balancesByDestination = new Map<string, number>();

  entries
    .filter((entry) => !entry.isCancelled)
    .forEach((entry) => {
      const currentBalance = balancesByDestination.get(entry.accountDestination) ?? 0;
      balancesByDestination.set(entry.accountDestination, currentBalance + getSignedAmountBOB(entry));
    });

  return Array.from(balancesByDestination.entries()).map(([destination, balanceBOB]) => ({
    destination,
    balanceBOB,
  }));
}

export function getTotalCashBalanceBOB(entries: CashEntry[]): number {
  return entries
    .filter((entry) => !entry.isCancelled)
    .reduce((sum, entry) => sum + getSignedAmountBOB(entry), 0);
}
