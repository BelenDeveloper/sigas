import { atom } from "jotai";

import { MOCK_SALES, type Sale } from "@/lib/mocks/sales.mock";

export const salesAtom = atom<Sale[]>(MOCK_SALES);
