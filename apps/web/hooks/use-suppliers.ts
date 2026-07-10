"use client";

import { useMemo, useState } from "react";

import { MOCK_SUPPLIERS, type Supplier } from "@/lib/mocks/suppliers.mock";

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
}

export function useSuppliers(): UseSuppliersResult {
  const [suppliers, setSuppliers] = useState<Supplier[]>(MOCK_SUPPLIERS);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredSuppliers = useMemo(() => {
    const normalizedSearchTerm = searchTerm.trim().toLowerCase();

    if (!normalizedSearchTerm) {
      return suppliers;
    }

    return suppliers.filter(
      (supplier) =>
        supplier.companyName.toLowerCase().includes(normalizedSearchTerm) ||
        supplier.contactName.toLowerCase().includes(normalizedSearchTerm) ||
        supplier.nit.toLowerCase().includes(normalizedSearchTerm),
    );
  }, [suppliers, searchTerm]);

  const createSupplier = (input: SupplierInput) => {
    const newSupplier: Supplier = {
      ...input,
      id: crypto.randomUUID(),
      isActive: true,
    };

    setSuppliers((previous) => [...previous, newSupplier]);
  };

  const updateSupplier = (supplierId: string, input: SupplierInput) => {
    setSuppliers((previous) =>
      previous.map((supplier) =>
        supplier.id === supplierId ? { ...supplier, ...input } : supplier,
      ),
    );
  };

  const toggleSupplierActive = (supplierId: string) => {
    setSuppliers((previous) =>
      previous.map((supplier) =>
        supplier.id === supplierId ? { ...supplier, isActive: !supplier.isActive } : supplier,
      ),
    );
  };

  return {
    suppliers: filteredSuppliers,
    searchTerm,
    setSearchTerm,
    createSupplier,
    updateSupplier,
    toggleSupplierActive,
  };
}
