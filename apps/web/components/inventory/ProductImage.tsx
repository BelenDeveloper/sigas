import { Package } from "lucide-react";

export type ProductImageSize = "sm" | "md" | "lg";

const PRODUCT_IMAGE_SIZE_PX: Record<ProductImageSize, number> = {
  sm: 32,
  md: 64,
  lg: 120,
};

const PRODUCT_IMAGE_ICON_SIZE: Record<ProductImageSize, string> = {
  sm: "size-3.5",
  md: "size-5",
  lg: "size-8",
};

const MAX_INITIALS = 2;

function getProductInitials(productName: string): string {
  return productName
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, MAX_INITIALS)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");
}

interface ProductImageProps {
  imageUrl?: string;
  productName: string;
  size?: ProductImageSize;
}

export function ProductImage({ imageUrl, productName, size = "md" }: ProductImageProps) {
  const sizePx = PRODUCT_IMAGE_SIZE_PX[size];
  const style = { width: sizePx, height: sizePx };

  if (imageUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- product photos are external/user-uploaded, not build-time assets
      <img
        src={imageUrl}
        alt={productName}
        style={style}
        className="shrink-0 rounded-md border border-border object-cover"
      />
    );
  }

  return (
    <div
      style={style}
      className="flex shrink-0 flex-col items-center justify-center gap-0.5 rounded-md border border-border bg-muted text-muted-foreground"
    >
      <Package className={PRODUCT_IMAGE_ICON_SIZE[size]} />
      {size !== "sm" ? (
        <span className="text-xs font-medium">{getProductInitials(productName)}</span>
      ) : null}
    </div>
  );
}
