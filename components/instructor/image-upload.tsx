"use client";

import { useState, useRef, useEffect } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Image from "next/image";

interface ImageUploadProps {
  value?: string;
  onChange: (file: File | null) => void;
  onRemove: () => void;
}

export function ImageUpload({ value, onChange, onRemove }: ImageUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [isRemoved, setIsRemoved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    console.log("[IMAGE UPLOAD] File selected:", file.name, file.size, "bytes", file.type);

    // Clean up old preview if exists
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      setPreviewUrl("");
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      setPreviewUrl("");
      return;
    }

    // Create local preview
    const localPreview = URL.createObjectURL(file);
    setPreviewUrl(localPreview);
    setIsRemoved(false);
    console.log("[IMAGE UPLOAD] Preview URL created:", localPreview);

    // Pass file to parent
    console.log("[IMAGE UPLOAD] Passing file to parent");
    onChange(file);
  };

  const handleRemove = () => {
    console.log("[IMAGE UPLOAD] Remove button clicked");

    // Clean up preview
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl("");
    }

    // Mark as removed so we don't show the value prop
    setIsRemoved(true);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    onRemove();
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {!isRemoved && (value || previewUrl) ? (
        <div className="relative aspect-video overflow-hidden rounded-lg border bg-muted">
          <Image
            src={previewUrl || value || ""}
            alt="Course thumbnail"
            fill
            className="object-cover"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute right-2 top-2"
            onClick={handleRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div
          className="flex aspect-video cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50 transition-colors hover:border-muted-foreground/50"
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="rounded-full bg-primary/10 p-4">
            <ImageIcon className="h-6 w-6 text-primary" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium">Click to upload thumbnail</p>
            <p className="text-xs text-muted-foreground">
              PNG, JPG, GIF up to 5MB
            </p>
          </div>
          <Button type="button" variant="outline" size="sm">
            <Upload className="mr-2 h-4 w-4" />
            Choose File
          </Button>
        </div>
      )}
    </div>
  );
}
