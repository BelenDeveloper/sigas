"use client";

import { useSetAtom } from "jotai";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { authUserAtom, type AuthenticatedUser } from "@/lib/atoms/auth.atom";
import { MOCK_USERS, type MockUser } from "@/lib/mocks/users.mock";

const AUTH_SIMULATION_DELAY_MS = 800;
const INVALID_CREDENTIALS_MESSAGE = "Invalid email or password.";
const HOME_ROUTE = "/";

interface LoginCredentials {
  email: string;
  password: string;
}

interface UseAuthResult {
  login: (credentials: LoginCredentials) => Promise<void>;
  isLoading: boolean;
  errorMessage: string | null;
}

function wait(delayMs: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, delayMs));
}

function toAuthenticatedUser(user: MockUser): AuthenticatedUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

export function useAuth(): UseAuthResult {
  const router = useRouter();
  const setAuthUser = useSetAtom(authUserAtom);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const login = async ({ email, password }: LoginCredentials) => {
    setIsLoading(true);
    setErrorMessage(null);

    await wait(AUTH_SIMULATION_DELAY_MS);

    const matchedUser = MOCK_USERS.find(
      (user) => user.email === email && user.password === password,
    );

    if (!matchedUser) {
      setErrorMessage(INVALID_CREDENTIALS_MESSAGE);
      setIsLoading(false);
      return;
    }

    setAuthUser(toAuthenticatedUser(matchedUser));
    setIsLoading(false);
    router.push(HOME_ROUTE);
  };

  return { login, isLoading, errorMessage };
}
