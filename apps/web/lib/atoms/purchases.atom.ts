import { atom } from "jotai";

import { MOCK_PURCHASES, type Purchase } from "@/lib/mocks/purchases.mock";

export const purchasesAtom = atom<Purchase[]>(MOCK_PURCHASES);
