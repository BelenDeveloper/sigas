"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@repo/ui/components/ui/alert-dialog";
import { Button } from "@repo/ui/components/ui/button";
import { Card, CardContent } from "@repo/ui/components/ui/card";
import { Input } from "@repo/ui/components/ui/input";
import { Label } from "@repo/ui/components/ui/label";
import { useState } from "react";

import type { CashSessionView } from "@/hooks/use-cash";

const TIME_LOCALE = "es-BO";
const NO_OPEN_SESSION_MESSAGE = "No hay sesión abierta";
const INVALID_CLOSING_AMOUNT_MESSAGE = "Ingresa un monto de cierre válido.";

function formatTime(isoDateTime: string): string {
  return new Date(isoDateTime).toLocaleTimeString(TIME_LOCALE, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface CashSessionHeaderProps {
  session: CashSessionView | null;
  onOpenSession: () => void;
  onCloseSession: (closingAmountBOB: number) => void;
}

export function CashSessionHeader({ session, onOpenSession, onCloseSession }: CashSessionHeaderProps) {
  const [isCloseDialogOpen, setIsCloseDialogOpen] = useState(false);
  const [closingAmountText, setClosingAmountText] = useState("");
  const [hasInvalidAmount, setHasInvalidAmount] = useState(false);

  const handleOpenCloseDialog = () => {
    setClosingAmountText("");
    setHasInvalidAmount(false);
    setIsCloseDialogOpen(true);
  };

  const handleConfirmClose = () => {
    const closingAmountBOB = Number(closingAmountText);

    if (closingAmountText.trim() === "" || Number.isNaN(closingAmountBOB)) {
      setHasInvalidAmount(true);
      return;
    }

    onCloseSession(closingAmountBOB);
    setIsCloseDialogOpen(false);
  };

  return (
    <Card>
      <CardContent className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col">
          <span className="text-sm font-medium text-foreground">
            {session?.isOpen
              ? `Sesión abierta desde las ${formatTime(session.openedAt)}`
              : NO_OPEN_SESSION_MESSAGE}
          </span>
        </div>

        {session?.isOpen ? (
          <Button variant="outline" onClick={handleOpenCloseDialog}>
            Cerrar sesión
          </Button>
        ) : (
          <Button className="bg-brand text-brand-foreground hover:bg-brand/90" onClick={onOpenSession}>
            Abrir sesión
          </Button>
        )}
      </CardContent>

      <AlertDialog open={isCloseDialogOpen} onOpenChange={setIsCloseDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cerrar sesión de caja</AlertDialogTitle>
            <AlertDialogDescription>
              Ingresa el monto final en caja para confirmar el cierre.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="flex flex-col gap-2">
            <Label htmlFor="closing-amount">Monto de cierre (Bs.)</Label>
            <Input
              id="closing-amount"
              type="number"
              step="0.01"
              value={closingAmountText}
              onChange={(event) => setClosingAmountText(event.target.value)}
            />
            {hasInvalidAmount ? (
              <p className="text-sm text-destructive">{INVALID_CLOSING_AMOUNT_MESSAGE}</p>
            ) : null}
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmClose}>Confirmar cierre</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
