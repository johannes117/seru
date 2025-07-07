import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { UploadCloud } from "lucide-react";

interface FileUploaderProps {
  title: string;
  onFileSelect: (file: File | null) => void;
  acceptedFileTypes?: string;
}

export default function FileUploader({
  title,
  onFileSelect,
  acceptedFileTypes = ".xlsx, .xls, .csv",
}: FileUploaderProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    onFileSelect(file);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center space-y-4 rounded-lg border-2 border-dashed border-muted p-8 text-center">
          <UploadCloud className="h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground">
            Drag & drop or click to upload
          </p>
          <Input
            type="file"
            className="w-full max-w-sm"
            onChange={handleFileChange}
            accept={acceptedFileTypes}
          />
        </div>
      </CardContent>
    </Card>
  );
} 