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

import { ADMIN_USER_ROLE_LABELS, type AdminUser } from "@/lib/mocks/users-admin.mock";
import { formatModuleAccessSummary } from "@/lib/permission-helpers";

const NO_USERS_MESSAGE = "No se encontraron usuarios.";
const ACTIVE_LABEL = "Activo";
const INACTIVE_LABEL = "Inactivo";
const ACTIVE_BADGE_CLASSES = "bg-emerald-100 text-emerald-800";

interface UserTableProps {
  users: AdminUser[];
  onEdit: (user: AdminUser) => void;
  onToggleActive: (user: AdminUser) => void;
}

export function UserTable({ users, onEdit, onToggleActive }: UserTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nombre</TableHead>
          <TableHead>Correo electrónico</TableHead>
          <TableHead>Rol</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead>Módulos con acceso</TableHead>
          <TableHead className="text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.length === 0 ? (
          <TableRow>
            <TableCell colSpan={6} className="text-center text-muted-foreground">
              {NO_USERS_MESSAGE}
            </TableCell>
          </TableRow>
        ) : (
          users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium text-foreground">{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{ADMIN_USER_ROLE_LABELS[user.role]}</TableCell>
              <TableCell>
                <Badge
                  variant={user.isActive ? undefined : "secondary"}
                  className={user.isActive ? ACTIVE_BADGE_CLASSES : undefined}
                >
                  {user.isActive ? ACTIVE_LABEL : INACTIVE_LABEL}
                </Badge>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {formatModuleAccessSummary(user.permissions)}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Editar usuario"
                    onClick={() => onEdit(user)}
                  >
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={user.isActive ? "Desactivar usuario" : "Activar usuario"}
                    onClick={() => onToggleActive(user)}
                  >
                    <Power className="size-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
