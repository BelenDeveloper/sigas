"use client";

import { Button } from "@repo/ui/components/ui/button";
import { Checkbox } from "@repo/ui/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/components/ui/table";

import { MODULE_LABELS, type ModulePermission } from "@/lib/mocks/users-admin.mock";
import { buildAdminPreset, buildLogisticsPreset, buildSalesPreset } from "@/lib/permission-helpers";

interface PermissionsEditorProps {
  permissions: ModulePermission[];
  onPermissionsChange: (permissions: ModulePermission[]) => void;
}

export function PermissionsEditor({ permissions, onPermissionsChange }: PermissionsEditorProps) {
  const handleCanViewChange = (module: ModulePermission["module"], canView: boolean) => {
    onPermissionsChange(
      permissions.map((permission) =>
        permission.module === module
          ? { ...permission, canView, canCreate: canView && permission.canCreate, canEdit: canView && permission.canEdit }
          : permission,
      ),
    );
  };

  const handleCanCreateChange = (module: ModulePermission["module"], canCreate: boolean) => {
    onPermissionsChange(
      permissions.map((permission) =>
        permission.module === module ? { ...permission, canCreate } : permission,
      ),
    );
  };

  const handleCanEditChange = (module: ModulePermission["module"], canEdit: boolean) => {
    onPermissionsChange(
      permissions.map((permission) =>
        permission.module === module ? { ...permission, canEdit } : permission,
      ),
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" size="sm" onClick={() => onPermissionsChange(buildAdminPreset())}>
          Aplicar preset Admin
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onPermissionsChange(buildLogisticsPreset())}
        >
          Aplicar preset Logística
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={() => onPermissionsChange(buildSalesPreset())}>
          Aplicar preset Ventas
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Módulo</TableHead>
            <TableHead>Puede ver</TableHead>
            <TableHead>Puede crear</TableHead>
            <TableHead>Puede editar</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {permissions.map((permission) => (
            <TableRow key={permission.module}>
              <TableCell className="font-medium text-foreground">
                {MODULE_LABELS[permission.module]}
              </TableCell>
              <TableCell>
                <Checkbox
                  checked={permission.canView}
                  onCheckedChange={(checked) => handleCanViewChange(permission.module, checked)}
                />
              </TableCell>
              <TableCell>
                <Checkbox
                  checked={permission.canCreate}
                  disabled={!permission.canView}
                  onCheckedChange={(checked) => handleCanCreateChange(permission.module, checked)}
                />
              </TableCell>
              <TableCell>
                <Checkbox
                  checked={permission.canEdit}
                  disabled={!permission.canView}
                  onCheckedChange={(checked) => handleCanEditChange(permission.module, checked)}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
