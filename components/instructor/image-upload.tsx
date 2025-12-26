"use client";

import { useState, useRef, useEffect } from "react";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Image from "next/image";

interface CloudinaryResult {
  url: string;
  publicId: string;
}

interface ImageUploadProps {
  value?: string;
  onChange: (result: CloudinaryResult | null) => void;
  onRemove: () => void;
}

export function ImageUpload({ value, onChange, onRemove }: ImageUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [isRemoved, setIsRemoved] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

    // Validate file size (10MB for direct upload)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image must be less than 10MB");
      setPreviewUrl("");
      return;
    }

    // Create local preview immediately
    const localPreview = URL.createObjectURL(file);
    setPreviewUrl(localPreview);
    setIsRemoved(false);

    // Upload to Cloudinary
    setIsUploading(true);
    try {
      console.log("[IMAGE UPLOAD] Fetching upload signature...");

      // Get signature from API
      const signatureRes = await fetch("/api/cloudinary/signature", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folder: "adaptly/courses" }),
      });

      if (!signatureRes.ok) {
        throw new Error("Failed to get upload signature");
      }

      const { signature, timestamp, cloudName, apiKey, folder } = await signatureRes.json();

      console.log("[IMAGE UPLOAD] Uploading to Cloudinary...");

      // Upload directly to Cloudinary
      const formData = new FormData();
      formData.append("file", file);
      formData.append("signature", signature);
      formData.append("timestamp", timestamp.toString());
      formData.append("api_key", apiKey);
      formData.append("folder", folder);
      formData.append("transformation", "w_1200,h_630,c_fill,q_auto");

      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!uploadRes.ok) {
        throw new Error("Failed to upload to Cloudinary");
      }

      const uploadData = await uploadRes.json();
      console.log("[IMAGE UPLOAD] Upload successful:", uploadData.secure_url);

      // Pass Cloudinary URL and publicId to parent
      onChange({
        url: uploadData.secure_url,
        publicId: uploadData.public_id,
      });

      toast.success("Image uploaded successfully");
    } catch (error) {
      console.error("[IMAGE UPLOAD] Upload error:", error);
      toast.error("Failed to upload image. Please try again.");

      // Clean up preview on error
      URL.revokeObjectURL(localPreview);
      setPreviewUrl("");
      onChange(null);
    } finally {
      setIsUploading(false);
    }
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
          {isUploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <div className="flex flex-col items-center gap-2 text-white">
                <Loader2 className="h-8 w-8 animate-spin" />
                <p className="text-sm font-medium">Uploading...</p>
              </div>
            </div>
          )}
          {!isUploading && (
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute right-2 top-2"
              onClick={handleRemove}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      ) : (
        <div
          className="flex aspect-video cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50 transition-colors hover:border-muted-foreground/50"
          onClick={() => !isUploading && fileInputRef.current?.click()}
        >
          <div className="rounded-full bg-primary/10 p-4">
            <ImageIcon className="h-6 w-6 text-primary" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium">Click to upload thumbnail</p>
            <p className="text-xs text-muted-foreground">
              PNG, JPG, GIF up to 10MB
            </p>
          </div>
          <Button type="button" variant="outline" size="sm" disabled={isUploading}>
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Choose File
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
