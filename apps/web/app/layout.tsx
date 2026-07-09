import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

import { TrpcProvider } from "../lib/trpc/provider";
import { cn } from "@repo/ui/lib/utils";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "SIGAS ERP",
  description: "Sistema ERP interno para instalaciones de gas de SIGAS",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={cn("font-sans", geistSans.variable, geistMono.variable)}>
      <body>
        <TrpcProvider>{children}</TrpcProvider>
      </body>
    </html>
  );
}
