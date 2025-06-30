
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Download, 
  Trash2, 
  Eye,
  Calendar,
  HardDrive
} from 'lucide-react';
import { Document } from '@/hooks/useDocuments';
import { formatDistanceToNow } from 'date-fns';

interface DocumentsListProps {
  documents: Document[];
  onDelete: (id: string) => void;
  onView: (document: Document) => void;
  isDeleting: boolean;
}

const DocumentsList = ({ documents, onDelete, onView, isDeleting }: DocumentsListProps) => {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (documents.length === 0) {
    return (
      <Card className="w-full">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FileText className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No documents uploaded</h3>
          <p className="text-muted-foreground text-center">
            Upload your first document to get started with AI-powered analysis.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full space-y-4">
      {documents.map((document) => (
        <Card key={document.id} className="w-full">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-4 items-center">
              {/* Document info section */}
              <div className="min-w-0 overflow-hidden">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                  </div>
                  
                  <div className="min-w-0 flex-1 overflow-hidden">
                    <h3 className="font-medium text-sm truncate mb-1">{document.file_name}</h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1 min-w-0">
                        <HardDrive className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">{formatFileSize(document.file_size)}</span>
                      </div>
                      
                      <div className="flex items-center gap-1 min-w-0">
                        <Calendar className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">{formatDistanceToNow(new Date(document.created_at), { addSuffix: true })}</span>
                      </div>
                    </div>

                    {/* Show error message for failed documents */}
                    {document.status === 'failed' && document.error_message && (
                      <div className="mt-2">
                        <p className="text-xs text-red-600 truncate">
                          Error: {document.error_message}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions section */}
              <div className="flex items-center justify-end gap-2 flex-shrink-0">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onView(document)}
                  className="h-8 w-8 p-0 flex-shrink-0"
                  title="View"
                >
                  <Eye className="h-4 w-4" />
                </Button>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onDelete(document.id)}
                  disabled={isDeleting}
                  className="h-8 w-8 p-0 flex-shrink-0"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DocumentsList;
