import { atom } from "jotai";

import type { CashContext } from "@/lib/cash-types";

export const cashContextAtom = atom<CashContext>("sigas");
