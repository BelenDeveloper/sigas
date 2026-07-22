"use client";

import { Button } from "@repo/ui/components/ui/button";
import { Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { ProductImage } from "./ProductImage";

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const ACCEPTED_IMAGE_TYPES_ATTR = "image/jpeg,image/png,image/webp";
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const UPLOAD_BUTTON_LABEL = "Subir imagen";
const INVALID_TYPE_MESSAGE = "Formato no soportado. Usa JPG, PNG o WEBP.";
const FILE_TOO_LARGE_MESSAGE = "La imagen no debe superar los 5MB.";

interface ProductImageUploadProps {
  productName: string;
  currentImageUrl?: string | null;
}

export function ProductImageUpload({ productName, currentImageUrl }: ProductImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    event.target.value = "";

    if (!file) {
      return;
    }

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      setErrorMessage(INVALID_TYPE_MESSAGE);
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setErrorMessage(FILE_TOO_LARGE_MESSAGE);
      return;
    }

    setErrorMessage(null);
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  return (
    <div className="flex items-center gap-4">
      <ProductImage imageUrl={previewUrl ?? currentImageUrl ?? undefined} productName={productName} size="md" />

      <div className="flex flex-col gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_IMAGE_TYPES_ATTR}
          capture="environment"
          className="hidden"
          onChange={handleFileChange}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-fit"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="size-4" />
          {UPLOAD_BUTTON_LABEL}
        </Button>
        {selectedFile ? <span className="text-xs text-muted-foreground">{selectedFile.name}</span> : null}
        {errorMessage ? <p className="text-sm text-destructive">{errorMessage}</p> : null}
      </div>
    </div>
  );
}
