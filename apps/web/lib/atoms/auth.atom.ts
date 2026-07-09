import { atom } from "jotai";

import type { MockUser } from "@/lib/mocks/users.mock";

export type AuthenticatedUser = Omit<MockUser, "password">;

export const authUserAtom = atom<AuthenticatedUser | null>(null);

export const isAuthenticatedAtom = atom((get) => get(authUserAtom) !== null);
