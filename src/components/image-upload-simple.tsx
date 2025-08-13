"use client";

import { UploadButton } from "@uploadthing/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { X } from "lucide-react";
import Image from "next/image";
import type { OurFileRouter } from "@/app/api/uploadthing/core";

interface SimpleImageUploadProps {
  currentImageUrl?: string;
  onImageChange: (imageUrl: string) => void;
}

export default function SimpleImageUpload({
  currentImageUrl,
  onImageChange,
}: SimpleImageUploadProps) {
  const [uploading, setUploading] = useState(false);

  const handleRemoveImage = () => {
    onImageChange("");
  };

  if (currentImageUrl) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <div className="relative h-48 rounded-lg overflow-hidden">
              <Image
                src={currentImageUrl}
                alt="Vista previa"
                fill
                className="object-cover"
              />
            </div>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute top-2 right-2"
              onClick={handleRemoveImage}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-lg p-8">
      <UploadButton<OurFileRouter, "eventImageUploader">
        endpoint="eventImageUploader"
        onClientUploadComplete={(res) => {
          if (res?.[0]?.url) {
            onImageChange(res[0].url);
          }
        }}
        onUploadError={(error: Error) => {
          alert(`ERROR! ${error.message}`);
        }}
        onUploadBegin={() => {
          setUploading(true);
        }}
        appearance={{
          button: "bg-primary hover:bg-primary/90 text-primary-foreground",
          allowedContent: "text-muted-foreground text-sm",
        }}
        content={{
          button: uploading ? "Subiendo..." : "Seleccionar imagen",
          allowedContent: "PNG, JPG hasta 4MB",
        }}
      />
    </div>
  );
}
