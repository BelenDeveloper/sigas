"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@repo/ui/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/ui/dialog";
import { Input } from "@repo/ui/components/ui/input";
import { Label } from "@repo/ui/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/ui/select";
import { Textarea } from "@repo/ui/components/ui/textarea";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import type { ProductInput } from "@/hooks/use-inventory";
import {
  PRODUCT_UNIT_LABELS,
  type Category,
  type Product,
  type ProductUnit,
  type Subcategory,
} from "@/lib/mocks/inventory.mock";

const REQUIRED_MESSAGE = "Este campo es obligatorio.";
const NON_NEGATIVE_MESSAGE = "Debe ser un número positivo.";
const MAX_STOCK_MESSAGE = "El stock máximo debe ser mayor o igual al mínimo.";

const PRODUCT_UNITS: ProductUnit[] = ["unit", "meter", "kg", "liter", "set"];

const productFormSchema = z
  .object({
    sku: z.string().min(1, REQUIRED_MESSAGE),
    name: z.string().min(1, REQUIRED_MESSAGE),
    categoryId: z.string().min(1, REQUIRED_MESSAGE),
    subcategoryId: z.string().min(1, REQUIRED_MESSAGE),
    unit: z.enum(["unit", "meter", "kg", "liter", "set"]),
    costPriceBOB: z.coerce.number().nonnegative(NON_NEGATIVE_MESSAGE),
    salePriceBOB: z.coerce.number().nonnegative(NON_NEGATIVE_MESSAGE),
    minimumStock: z.coerce.number().nonnegative(NON_NEGATIVE_MESSAGE),
    maximumStock: z.coerce.number().nonnegative(NON_NEGATIVE_MESSAGE),
    location: z.string().min(1, REQUIRED_MESSAGE),
    netWeightKg: z.coerce.number().nonnegative(NON_NEGATIVE_MESSAGE),
    grossWeightKg: z.coerce.number().nonnegative(NON_NEGATIVE_MESSAGE),
    description: z.string(),
  })
  .refine((values) => values.maximumStock >= values.minimumStock, {
    message: MAX_STOCK_MESSAGE,
    path: ["maximumStock"],
  });

type ProductFormInput = z.input<typeof productFormSchema>;
type ProductFormValues = z.infer<typeof productFormSchema>;

const EMPTY_VALUES: ProductFormInput = {
  sku: "",
  name: "",
  categoryId: "",
  subcategoryId: "",
  unit: "unit",
  costPriceBOB: 0,
  salePriceBOB: 0,
  minimumStock: 0,
  maximumStock: 0,
  location: "",
  netWeightKg: 0,
  grossWeightKg: 0,
  description: "",
};

function toFormValues(product: Product): ProductFormInput {
  return {
    sku: product.sku,
    name: product.name,
    categoryId: product.categoryId,
    subcategoryId: product.subcategoryId,
    unit: product.unit,
    costPriceBOB: product.costPriceBOB,
    salePriceBOB: product.salePriceBOB,
    minimumStock: product.minimumStock,
    maximumStock: product.maximumStock,
    location: product.location,
    netWeightKg: product.netWeightKg,
    grossWeightKg: product.grossWeightKg,
    description: product.description,
  };
}

interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
  categories: Category[];
  subcategories: Subcategory[];
  suggestSku: (categoryId: string, subcategoryId: string) => string;
  onCreate: (input: ProductInput) => void;
  onUpdate: (productId: string, input: ProductInput) => void;
}

export function ProductFormDialog({
  open,
  onOpenChange,
  product,
  categories,
  subcategories,
  suggestSku,
  onCreate,
  onUpdate,
}: ProductFormDialogProps) {
  const isEditMode = product !== null;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ProductFormInput, unknown, ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: EMPTY_VALUES,
  });

  const categoryId = watch("categoryId");
  const subcategoryId = watch("subcategoryId");

  useEffect(() => {
    if (open) {
      reset(product ? toFormValues(product) : EMPTY_VALUES);
    }
  }, [open, product, reset]);

  useEffect(() => {
    if (!isEditMode && categoryId && subcategoryId) {
      setValue("sku", suggestSku(categoryId, subcategoryId));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryId, subcategoryId, isEditMode]);

  const visibleSubcategories = subcategories.filter(
    (subcategory) => subcategory.categoryId === categoryId,
  );

  const onSubmit = (values: ProductFormValues) => {
    if (isEditMode && product) {
      onUpdate(product.id, values);
    } else {
      onCreate(values);
    }

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Editar producto" : "Nuevo producto"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="product-sku">SKU</Label>
              <Input id="product-sku" {...register("sku")} />
              {errors.sku ? <p className="text-sm text-destructive">{errors.sku.message}</p> : null}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="product-name">Nombre</Label>
              <Input id="product-name" {...register("name")} />
              {errors.name ? <p className="text-sm text-destructive">{errors.name.message}</p> : null}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="product-form-category">Categoría</Label>
              <Select
                modal={false}
                value={categoryId}
                onValueChange={(value) => {
                  setValue("categoryId", value ?? "");
                  setValue("subcategoryId", "");
                }}
              >
                <SelectTrigger id="product-form-category">
                  <SelectValue>
                    {() => categories.find((category) => category.id === categoryId)?.name}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.categoryId ? (
                <p className="text-sm text-destructive">{errors.categoryId.message}</p>
              ) : null}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="product-form-subcategory">Subcategoría</Label>
              <Select
                modal={false}
                value={subcategoryId}
                onValueChange={(value) => setValue("subcategoryId", value ?? "")}
              >
                <SelectTrigger id="product-form-subcategory">
                  <SelectValue>
                    {() =>
                      visibleSubcategories.find((subcategory) => subcategory.id === subcategoryId)
                        ?.name
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {visibleSubcategories.map((subcategory) => (
                    <SelectItem key={subcategory.id} value={subcategory.id}>
                      {subcategory.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.subcategoryId ? (
                <p className="text-sm text-destructive">{errors.subcategoryId.message}</p>
              ) : null}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="product-unit">Unidad</Label>
              <Select
                modal={false}
                value={watch("unit")}
                onValueChange={(value) => setValue("unit", (value ?? "unit") as ProductUnit)}
              >
                <SelectTrigger id="product-unit">
                  <SelectValue>{() => PRODUCT_UNIT_LABELS[watch("unit")]}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {PRODUCT_UNITS.map((unit) => (
                    <SelectItem key={unit} value={unit}>
                      {PRODUCT_UNIT_LABELS[unit]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="product-location">Ubicación</Label>
              <Input id="product-location" placeholder="Ej: A-01" {...register("location")} />
              {errors.location ? (
                <p className="text-sm text-destructive">{errors.location.message}</p>
              ) : null}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="product-cost-price">Precio de costo (Bs.)</Label>
              <Input id="product-cost-price" type="number" step="0.01" {...register("costPriceBOB")} />
              {errors.costPriceBOB ? (
                <p className="text-sm text-destructive">{errors.costPriceBOB.message}</p>
              ) : null}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="product-sale-price">Precio de venta (Bs.)</Label>
              <Input id="product-sale-price" type="number" step="0.01" {...register("salePriceBOB")} />
              {errors.salePriceBOB ? (
                <p className="text-sm text-destructive">{errors.salePriceBOB.message}</p>
              ) : null}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="product-min-stock">Stock mínimo</Label>
              <Input id="product-min-stock" type="number" {...register("minimumStock")} />
              {errors.minimumStock ? (
                <p className="text-sm text-destructive">{errors.minimumStock.message}</p>
              ) : null}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="product-max-stock">Stock máximo</Label>
              <Input id="product-max-stock" type="number" {...register("maximumStock")} />
              {errors.maximumStock ? (
                <p className="text-sm text-destructive">{errors.maximumStock.message}</p>
              ) : null}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="product-net-weight">Peso neto (kg)</Label>
              <Input id="product-net-weight" type="number" step="0.01" {...register("netWeightKg")} />
              {errors.netWeightKg ? (
                <p className="text-sm text-destructive">{errors.netWeightKg.message}</p>
              ) : null}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="product-gross-weight">Peso bruto (kg)</Label>
              <Input
                id="product-gross-weight"
                type="number"
                step="0.01"
                {...register("grossWeightKg")}
              />
              {errors.grossWeightKg ? (
                <p className="text-sm text-destructive">{errors.grossWeightKg.message}</p>
              ) : null}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="product-description">Descripción</Label>
            <Textarea id="product-description" rows={3} {...register("description")} />
          </div>

          <DialogFooter>
            <Button type="submit" className="bg-brand text-brand-foreground hover:bg-brand/90">
              {isEditMode ? "Guardar cambios" : "Crear producto"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
