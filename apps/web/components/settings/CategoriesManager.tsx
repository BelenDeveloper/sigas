"use client";

import { Badge } from "@repo/ui/components/ui/badge";
import { Button } from "@repo/ui/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import { Input } from "@repo/ui/components/ui/input";
import { Switch } from "@repo/ui/components/ui/switch";
import { Plus } from "lucide-react";
import { useState } from "react";

import type { CategoryInput, SubcategoryInput } from "@/hooks/use-settings";
import type { SettingsCategory, SettingsSubcategory } from "@/lib/mocks/settings.mock";

const ACTIVE_LABEL = "Activa";
const INACTIVE_LABEL = "Inactiva";
const ACTIVE_BADGE_CLASSES = "bg-emerald-100 text-emerald-800";
const NEW_CATEGORY_PLACEHOLDER = "Nombre de la nueva categoría";
const NEW_SUBCATEGORY_PLACEHOLDER = "Nombre de la subcategoría";
const NO_SUBCATEGORIES_MESSAGE = "Todavía no hay subcategorías.";

interface CategoriesManagerProps {
  categories: SettingsCategory[];
  subcategories: SettingsSubcategory[];
  onCreateCategory: (input: CategoryInput) => void;
  onToggleCategoryActive: (categoryId: string) => void;
  onCreateSubcategory: (input: SubcategoryInput) => void;
  onToggleSubcategoryActive: (subcategoryId: string) => void;
}

export function CategoriesManager({
  categories,
  subcategories,
  onCreateCategory,
  onToggleCategoryActive,
  onCreateSubcategory,
  onToggleSubcategoryActive,
}: CategoriesManagerProps) {
  const [newCategoryName, setNewCategoryName] = useState("");
  const [addingSubcategoryForId, setAddingSubcategoryForId] = useState<string | null>(null);
  const [newSubcategoryName, setNewSubcategoryName] = useState("");

  const handleCreateCategory = () => {
    if (newCategoryName.trim() === "") {
      return;
    }

    onCreateCategory({ name: newCategoryName.trim() });
    setNewCategoryName("");
  };

  const handleStartAddSubcategory = (categoryId: string) => {
    setAddingSubcategoryForId(categoryId);
    setNewSubcategoryName("");
  };

  const handleConfirmAddSubcategory = (categoryId: string) => {
    if (newSubcategoryName.trim() === "") {
      return;
    }

    onCreateSubcategory({ categoryId, name: newSubcategoryName.trim() });
    setAddingSubcategoryForId(null);
    setNewSubcategoryName("");
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          placeholder={NEW_CATEGORY_PLACEHOLDER}
          className="sm:max-w-xs"
          value={newCategoryName}
          onChange={(event) => setNewCategoryName(event.target.value)}
        />
        <Button variant="outline" onClick={handleCreateCategory} className="w-fit">
          <Plus className="size-4" />
          Agregar categoría
        </Button>
      </div>

      <div className="flex flex-col gap-4">
        {categories.map((category) => (
          <Card key={category.id}>
            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <CardTitle>{category.name}</CardTitle>
                <Badge
                  variant={category.isActive ? undefined : "secondary"}
                  className={category.isActive ? ACTIVE_BADGE_CLASSES : undefined}
                >
                  {category.isActive ? ACTIVE_LABEL : INACTIVE_LABEL}
                </Badge>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Switch
                  checked={category.isActive}
                  onCheckedChange={() => onToggleCategoryActive(category.id)}
                />
                <Button variant="ghost" size="sm" onClick={() => handleStartAddSubcategory(category.id)}>
                  <Plus className="size-4" />
                  Agregar subcategoría
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {subcategories.filter((subcategory) => subcategory.categoryId === category.id).length ===
              0 ? (
                <p className="pl-4 text-sm text-muted-foreground">{NO_SUBCATEGORIES_MESSAGE}</p>
              ) : (
                subcategories
                  .filter((subcategory) => subcategory.categoryId === category.id)
                  .map((subcategory) => (
                    <div
                      key={subcategory.id}
                      className="flex items-center justify-between rounded-md border border-border p-2 pl-4"
                    >
                      <span className="text-sm text-foreground">{subcategory.name}</span>
                      <Switch
                        checked={subcategory.isActive}
                        onCheckedChange={() => onToggleSubcategoryActive(subcategory.id)}
                      />
                    </div>
                  ))
              )}

              {addingSubcategoryForId === category.id ? (
                <div className="flex flex-col gap-2 pl-4 sm:flex-row">
                  <Input
                    placeholder={NEW_SUBCATEGORY_PLACEHOLDER}
                    className="sm:max-w-xs"
                    value={newSubcategoryName}
                    onChange={(event) => setNewSubcategoryName(event.target.value)}
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleConfirmAddSubcategory(category.id)}>
                      Guardar
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setAddingSubcategoryForId(null)}>
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
