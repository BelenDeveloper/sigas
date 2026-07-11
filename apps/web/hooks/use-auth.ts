"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { supabase } from "@/lib/supabase-client";

const INVALID_CREDENTIALS_MESSAGE = "Correo o contraseña inválidos.";
const HOME_ROUTE = "/";
const LOGIN_ROUTE = "/login";

interface LoginCredentials {
  email: string;
  password: string;
}

interface UseAuthResult {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  errorMessage: string | null;
}

export function useAuth(): UseAuthResult {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const login = async ({ email, password }: LoginCredentials) => {
    setIsLoading(true);
    setErrorMessage(null);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    setIsLoading(false);

    if (error) {
      setErrorMessage(INVALID_CREDENTIALS_MESSAGE);
      return;
    }

    router.push(HOME_ROUTE);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    router.push(LOGIN_ROUTE);
  };

  return { login, logout, isLoading, errorMessage };
}
