
import React from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DocumentUploadZoneProps {
  onUpload: (files: File[]) => void;
  isUploading: boolean;
}

const DocumentUploadZone = ({ onUpload, isUploading }: DocumentUploadZoneProps) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'text/plain': ['.txt'],
      'text/csv': ['.csv']
    },
    maxSize: 50 * 1024 * 1024, // 50MB
    onDrop: onUpload,
    disabled: isUploading
  });

  return (
    <Card className="border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors">
      <CardContent className="p-8">
        <div
          {...getRootProps()}
          className={cn(
            "flex flex-col items-center justify-center text-center cursor-pointer transition-colors",
            isDragActive && "text-primary",
            isUploading && "opacity-50 cursor-not-allowed"
          )}
        >
          <input {...getInputProps()} />
          
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
            {isUploading ? (
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            ) : (
              <Upload className="h-8 w-8 text-muted-foreground" />
            )}
          </div>

          <h3 className="text-lg font-medium mb-2">
            {isUploading ? 'Uploading...' : 'Upload Documents'}
          </h3>
          
          <p className="text-muted-foreground mb-4">
            {isDragActive
              ? 'Drop the files here...'
              : 'Drag & drop files here, or click to select files'
            }
          </p>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <FileText className="h-4 w-4" />
            <span>
              Supports: Images, PDF, Word, Excel, Text files (max 50MB)
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentUploadZone;
