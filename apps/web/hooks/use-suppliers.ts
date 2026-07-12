"use client";

import { useMemo, useState } from "react";

import type { Supplier } from "@/lib/supplier-types";
import { trpc } from "@/lib/trpc/client";

export interface SupplierInput {
  companyName: string;
  contactName: string;
  nit: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  country: string;
  notes: string;
}

interface UseSuppliersResult {
  suppliers: Supplier[];
  searchTerm: string;
  setSearchTerm: (searchTerm: string) => void;
  createSupplier: (input: SupplierInput) => void;
  updateSupplier: (supplierId: string, input: SupplierInput) => void;
  toggleSupplierActive: (supplierId: string) => void;
  isLoading: boolean;
}

function toSupplierInput(input: SupplierInput) {
  return {
    companyName: input.companyName,
    contactName: input.contactName || undefined,
    nit: input.nit || undefined,
    phone: input.phone || undefined,
    email: input.email || undefined,
    address: input.address || undefined,
    city: input.city || undefined,
    country: input.country || undefined,
    notes: input.notes || undefined,
  };
}

export function useSuppliers(): UseSuppliersResult {
  const utils = trpc.useUtils();

  const [searchTerm, setSearchTerm] = useState("");

  const { data: rawSuppliers } = trpc.suppliers.list.useQuery({
    search: searchTerm || undefined,
  });

  const invalidateSuppliers = () => void utils.suppliers.list.invalidate();

  const createMutation = trpc.suppliers.create.useMutation({ onSuccess: invalidateSuppliers });
  const updateMutation = trpc.suppliers.update.useMutation({ onSuccess: invalidateSuppliers });
  const toggleActiveMutation = trpc.suppliers.toggleActive.useMutation({
    onSuccess: invalidateSuppliers,
  });

  const toSupplier = (supplier: {
    id: string;
    companyName: string;
    contactName: string | null;
    nit: string | null;
    phone: string | null;
    email: string | null;
    address: string | null;
    city: string | null;
    country: string;
    notes: string | null;
    isActive: boolean;
  }): Supplier => ({
    id: supplier.id,
    companyName: supplier.companyName,
    contactName: supplier.contactName ?? "",
    nit: supplier.nit ?? "",
    phone: supplier.phone ?? "",
    email: supplier.email ?? "",
    address: supplier.address ?? "",
    city: supplier.city ?? "",
    country: supplier.country,
    notes: supplier.notes ?? "",
    isActive: supplier.isActive,
  });

  const suppliers = useMemo(() => (rawSuppliers ?? []).map(toSupplier), [rawSuppliers]);

  const getSupplierById = (supplierId: string) =>
    suppliers.find((supplier) => supplier.id === supplierId);

  const createSupplier = (input: SupplierInput) => {
    createMutation.mutate(toSupplierInput(input));
  };

  const updateSupplier = (supplierId: string, input: SupplierInput) => {
    const currentSupplier = getSupplierById(supplierId);

    updateMutation.mutate({
      id: supplierId,
      ...toSupplierInput(input),
      isActive: currentSupplier?.isActive ?? true,
    });
  };

  const toggleSupplierActive = (supplierId: string) => {
    toggleActiveMutation.mutate({ id: supplierId });
  };

  return {
    suppliers,
    searchTerm,
    setSearchTerm,
    createSupplier,
    updateSupplier,
    toggleSupplierActive,
    isLoading: rawSuppliers === undefined,
  };
}
