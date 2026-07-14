import { Badge } from "@repo/ui/components/ui/badge";
import { Button } from "@repo/ui/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/components/ui/table";
import { Pencil, Power } from "lucide-react";

import type { Supplier } from "@/lib/supplier-types";

import { TableSkeleton } from "../shared/TableSkeleton";

const NO_SUPPLIERS_MESSAGE = "No se encontraron proveedores con estos filtros.";
const ACTIVE_LABEL = "Activo";
const INACTIVE_LABEL = "Inactivo";
const ACTIVE_BADGE_CLASSES = "bg-emerald-100 text-emerald-800";
const COLUMN_COUNT = 8;

interface SupplierTableProps {
  suppliers: Supplier[];
  isLoading: boolean;
  canEdit: boolean;
  canToggleActive: boolean;
  onEdit: (supplier: Supplier) => void;
  onToggleActive: (supplier: Supplier) => void;
}

export function SupplierTable({
  suppliers,
  isLoading,
  canEdit,
  canToggleActive,
  onEdit,
  onToggleActive,
}: SupplierTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Empresa</TableHead>
          <TableHead>Persona de contacto</TableHead>
          <TableHead>NIT</TableHead>
          <TableHead>Teléfono</TableHead>
          <TableHead>Correo electrónico</TableHead>
          <TableHead>País</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead className="text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading ? (
          <TableSkeleton columns={COLUMN_COUNT} />
        ) : suppliers.length === 0 ? (
          <TableRow>
            <TableCell colSpan={COLUMN_COUNT} className="text-center text-muted-foreground">
              {NO_SUPPLIERS_MESSAGE}
            </TableCell>
          </TableRow>
        ) : (
          suppliers.map((supplier) => (
            <TableRow key={supplier.id}>
              <TableCell className="font-medium text-foreground">
                {supplier.companyName}
              </TableCell>
              <TableCell>{supplier.contactName}</TableCell>
              <TableCell className="font-mono text-xs">{supplier.nit}</TableCell>
              <TableCell>{supplier.phone}</TableCell>
              <TableCell>{supplier.email}</TableCell>
              <TableCell>{supplier.country}</TableCell>
              <TableCell>
                <Badge
                  variant={supplier.isActive ? undefined : "secondary"}
                  className={supplier.isActive ? ACTIVE_BADGE_CLASSES : undefined}
                >
                  {supplier.isActive ? ACTIVE_LABEL : INACTIVE_LABEL}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  {canEdit ? (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Editar proveedor"
                      onClick={() => onEdit(supplier)}
                    >
                      <Pencil className="size-4" />
                    </Button>
                  ) : null}
                  {canToggleActive ? (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={supplier.isActive ? "Desactivar proveedor" : "Activar proveedor"}
                      onClick={() => onToggleActive(supplier)}
                    >
                      <Power className="size-4" />
                    </Button>
                  ) : null}
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
