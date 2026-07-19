"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

import { useClients } from "@/hooks/use-clients";
import { useSale } from "@/hooks/use-sales";
import { useSettings } from "@/hooks/use-settings";
import { formatCurrencyBOB } from "@/lib/format-currency";
import { PAYMENT_METHOD_LABELS } from "@/lib/payment-method";

const LOGO_WIDTH_PX = 140;
const LOGO_HEIGHT_PX = 42;
const DATE_LOCALE = "es-BO";
const RECEIPT_TITLE = "RECIBO";
const SALE_NOT_FOUND_MESSAGE = "No se encontró la venta solicitada.";
const CLIENT_LABEL = "Cliente";
const CODE_LABEL = "Código";
const DATE_LABEL = "Fecha";
const ITEMS_HEADERS = ["Producto", "Cantidad", "Precio unitario", "Subtotal"];
const SUBTOTAL_LABEL = "Subtotal";
const DISCOUNT_LABEL = "Descuento";
const TOTAL_LABEL = "Total";
const PAYMENTS_TITLE = "Pagos registrados";
const PAYMENTS_HEADERS = ["Fecha", "Método", "Monto"];
const PENDING_BALANCE_LABEL = "Saldo pendiente";
const THANK_YOU_MESSAGE = "Gracias por su compra";

function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString(DATE_LOCALE, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

interface SaleReceiptViewProps {
  saleId: string;
}

export function SaleReceiptView({ saleId }: SaleReceiptViewProps) {
  const { sale, isLoading } = useSale(saleId);
  const { getClientById } = useClients();
  const { companyInfo } = useSettings();
  const hasPrintedRef = useRef(false);

  useEffect(() => {
    if (sale && !hasPrintedRef.current) {
      hasPrintedRef.current = true;
      window.print();
    }
  }, [sale]);

  if (isLoading || !sale) {
    return <p className="p-6 text-muted-foreground">{isLoading ? "" : SALE_NOT_FOUND_MESSAGE}</p>;
  }

  const client = sale.clientId ? getClientById(sale.clientId) : undefined;

  return (
    <div id="receipt" className="mx-auto flex max-w-2xl flex-col gap-6 bg-white p-8 text-black">
      <div className="flex items-start justify-between">
        <Image src="/logo.svg" alt="SIGAS" width={LOGO_WIDTH_PX} height={LOGO_HEIGHT_PX} priority />
        <div className="text-right text-sm">
          <p className="font-semibold">{companyInfo.name}</p>
          <p>{companyInfo.phone}</p>
          <p>{companyInfo.address}</p>
        </div>
      </div>

      <h1 className="text-center text-xl font-bold tracking-wide">{RECEIPT_TITLE}</h1>

      <div className="flex justify-between text-sm">
        <div>
          <p>
            <span className="text-muted-foreground">{CODE_LABEL}: </span>
            {sale.code}
          </p>
          <p>
            <span className="text-muted-foreground">{DATE_LABEL}: </span>
            {formatDate(sale.saleDate)}
          </p>
        </div>
        <div className="text-right">
          <p>
            <span className="text-muted-foreground">{CLIENT_LABEL}: </span>
            {client?.name ?? "—"}
          </p>
        </div>
      </div>

      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-black/20 text-left">
            {ITEMS_HEADERS.map((header) => (
              <th key={header} className="py-2 font-semibold">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sale.items.map((item) => (
            <tr key={item.id} className="border-b border-black/10">
              <td className="py-2">{item.productName}</td>
              <td className="py-2">{item.quantity}</td>
              <td className="py-2">{formatCurrencyBOB(item.unitPriceBOB)}</td>
              <td className="py-2">{formatCurrencyBOB(item.subtotalBOB)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="ml-auto flex w-56 flex-col gap-1 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">{SUBTOTAL_LABEL}</span>
          <span>{formatCurrencyBOB(sale.subtotalBOB)}</span>
        </div>
        {sale.discountBOB > 0 ? (
          <div className="flex justify-between">
            <span className="text-muted-foreground">{DISCOUNT_LABEL}</span>
            <span>-{formatCurrencyBOB(sale.discountBOB)}</span>
          </div>
        ) : null}
        <div className="flex justify-between border-t border-black/20 pt-1 text-base font-bold">
          <span>{TOTAL_LABEL}</span>
          <span>{formatCurrencyBOB(sale.totalBOB)}</span>
        </div>
      </div>

      {sale.payments.length > 0 ? (
        <div className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold">{PAYMENTS_TITLE}</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-black/20 text-left">
                {PAYMENTS_HEADERS.map((header) => (
                  <th key={header} className="py-2 font-semibold">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sale.payments.map((payment) => (
                <tr key={payment.id} className="border-b border-black/10">
                  <td className="py-2">{formatDate(payment.paidAt)}</td>
                  <td className="py-2">{PAYMENT_METHOD_LABELS[payment.paymentMethod]}</td>
                  <td className="py-2">{formatCurrencyBOB(payment.amountBOB)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {sale.pendingBOB > 0 ? (
        <div className="ml-auto flex w-56 justify-between text-sm font-semibold">
          <span>{PENDING_BALANCE_LABEL}</span>
          <span>{formatCurrencyBOB(sale.pendingBOB)}</span>
        </div>
      ) : null}

      <p className="mt-4 text-center text-sm text-muted-foreground">{THANK_YOU_MESSAGE}</p>
    </div>
  );
}
