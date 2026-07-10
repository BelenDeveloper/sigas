"use client";

import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { Label } from "@repo/ui/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/ui/select";
import { Plus, Trash2 } from "lucide-react";

import type { SalePaymentInput } from "@/hooks/use-sales";
import { formatCurrencyBOB } from "@/lib/format-currency";
import { PAYMENT_METHOD_LABELS, type PaymentMethod } from "@/lib/payment-method";

const PAYMENT_METHODS: PaymentMethod[] = ["cash", "qr", "bank_transfer", "check", "credit_card"];
const DEFAULT_PAYMENT_METHOD: PaymentMethod = "cash";
const NO_PAYMENTS_MESSAGE = "Todavía no registraste pagos.";

const EMPTY_PAYMENT: SalePaymentInput = {
  amountBOB: 0,
  method: DEFAULT_PAYMENT_METHOD,
  accountDestination: "",
};

interface SalePaymentSectionProps {
  payments: SalePaymentInput[];
  onPaymentsChange: (payments: SalePaymentInput[]) => void;
  totalBOB: number;
}

export function SalePaymentSection({
  payments,
  onPaymentsChange,
  totalBOB,
}: SalePaymentSectionProps) {
  const paidBOB = payments.reduce((sum, payment) => sum + payment.amountBOB, 0);
  const pendingBOB = totalBOB - paidBOB;

  const handleAddPayment = () => {
    onPaymentsChange([...payments, { ...EMPTY_PAYMENT }]);
  };

  const handleRemovePayment = (index: number) => {
    onPaymentsChange(payments.filter((_, paymentIndex) => paymentIndex !== index));
  };

  const handleAmountChange = (index: number, amountBOB: number) => {
    onPaymentsChange(
      payments.map((payment, paymentIndex) =>
        paymentIndex === index ? { ...payment, amountBOB } : payment,
      ),
    );
  };

  const handleMethodChange = (index: number, method: PaymentMethod) => {
    onPaymentsChange(
      payments.map((payment, paymentIndex) =>
        paymentIndex === index ? { ...payment, method } : payment,
      ),
    );
  };

  const handleAccountDestinationChange = (index: number, accountDestination: string) => {
    onPaymentsChange(
      payments.map((payment, paymentIndex) =>
        paymentIndex === index ? { ...payment, accountDestination } : payment,
      ),
    );
  };

  return (
    <div className="flex flex-col gap-4">
      {payments.length === 0 ? (
        <p className="text-sm text-muted-foreground">{NO_PAYMENTS_MESSAGE}</p>
      ) : (
        payments.map((payment, index) => (
          <div
            key={index}
            className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_1fr_1.5fr_auto] sm:items-end"
          >
            <div className="flex flex-col gap-2">
              <Label htmlFor={`payment-amount-${index}`}>Monto (Bs.)</Label>
              <Input
                id={`payment-amount-${index}`}
                type="number"
                step="0.01"
                value={payment.amountBOB}
                onChange={(event) => handleAmountChange(index, Number(event.target.value))}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor={`payment-method-${index}`}>Método</Label>
              <Select
                value={payment.method}
                onValueChange={(value) =>
                  handleMethodChange(index, (value ?? DEFAULT_PAYMENT_METHOD) as PaymentMethod)
                }
              >
                <SelectTrigger id={`payment-method-${index}`}>
                  <SelectValue>{() => PAYMENT_METHOD_LABELS[payment.method]}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map((method) => (
                    <SelectItem key={method} value={method}>
                      {PAYMENT_METHOD_LABELS[method]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor={`payment-account-${index}`}>Cuenta destino</Label>
              <Input
                id={`payment-account-${index}`}
                value={payment.accountDestination}
                onChange={(event) => handleAccountDestinationChange(index, event.target.value)}
              />
            </div>

            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Quitar pago"
              onClick={() => handleRemovePayment(index)}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        ))
      )}

      <Button variant="outline" onClick={handleAddPayment} className="w-fit">
        <Plus className="size-4" />
        Agregar pago
      </Button>

      <div className="flex flex-col gap-1 text-sm">
        <span className="text-muted-foreground">Total: {formatCurrencyBOB(totalBOB)}</span>
        <span className="text-muted-foreground">Pagado: {formatCurrencyBOB(paidBOB)}</span>
        <span className="font-semibold text-foreground">
          Saldo pendiente: {formatCurrencyBOB(pendingBOB)}
        </span>
      </div>
    </div>
  );
}
