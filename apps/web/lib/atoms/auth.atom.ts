import { atom } from "jotai";

import type { AdminUser } from "@/lib/user-permissions";

export type AuthenticatedUser = AdminUser;

export const authUserAtom = atom<AuthenticatedUser | null>(null);
export const isAuthLoadingAtom = atom<boolean>(true);

export const isAuthenticatedAtom = atom((get) => get(authUserAtom) !== null);
