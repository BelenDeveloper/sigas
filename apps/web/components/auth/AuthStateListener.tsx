"use client";

import { useSetAtom } from "jotai";
import { useEffect } from "react";

import { authUserAtom, isAuthLoadingAtom } from "@/lib/atoms/auth.atom";
import { supabase } from "@/lib/supabase-client";
import { trpc } from "@/lib/trpc/client";

const SESSION_EVENTS_TO_SYNC = new Set(["INITIAL_SESSION", "SIGNED_IN"]);

interface AuthStateListenerProps {
  children: React.ReactNode;
}

export function AuthStateListener({ children }: AuthStateListenerProps) {
  const setAuthUser = useSetAtom(authUserAtom);
  const setIsAuthLoading = useSetAtom(isAuthLoadingAtom);
  const utils = trpc.useUtils();

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        setAuthUser(null);
        setIsAuthLoading(false);
        return;
      }

      if (!SESSION_EVENTS_TO_SYNC.has(event)) {
        return;
      }

      setIsAuthLoading(true);

      utils.users.me
        .fetch()
        .then((user) => {
          setAuthUser(user);
        })
        .catch(() => {
          setAuthUser(null);
          void supabase.auth.signOut();
        })
        .finally(() => {
          setIsAuthLoading(false);
        });
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <>{children}</>;
}
