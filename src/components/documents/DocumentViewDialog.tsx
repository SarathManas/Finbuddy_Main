
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  FileText, 
  Calendar, 
  HardDrive, 
  Clock,
  CheckCircle,
  AlertCircle,
  User
} from 'lucide-react';
import { Document } from '@/hooks/useDocuments';
import { formatDistanceToNow, format } from 'date-fns';

interface DocumentViewDialogProps {
  document: Document | null;
  open: boolean;
  onClose: () => void;
}

const DocumentViewDialog = ({ document, open, onClose }: DocumentViewDialogProps) => {
  if (!document) return null;

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderExtractedData = (data: any) => {
    if (!data || typeof data !== 'object') {
      return <p className="text-muted-foreground">No extracted data available</p>;
    }

    return (
      <div className="space-y-4">
        {Object.entries(data).map(([key, value]) => (
          <div key={key}>
            <h4 className="font-medium capitalize mb-2">
              {key.replace(/_/g, ' ')}
            </h4>
            <div className="bg-muted p-3 rounded-lg">
              <pre className="text-sm whitespace-pre-wrap font-mono">
                {typeof value === 'object' 
                  ? JSON.stringify(value, null, 2)
                  : String(value)
                }
              </pre>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <div className="flex items-center space-x-3">
            <FileText className="h-6 w-6" />
            <div>
              <DialogTitle className="text-left">{document.file_name}</DialogTitle>
              <div className="flex items-center space-x-2 mt-1">
                <Badge className={getStatusColor(document.status)}>
                  {document.status}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {document.file_type}
                </span>
              </div>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="h-[70vh] pr-4">
          <div className="space-y-6">
            {/* Document Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Document Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <HardDrive className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">File Size</p>
                      <p className="text-sm text-muted-foreground">
                        {formatFileSize(document.file_size)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Uploaded</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(document.created_at), 'MMM dd, yyyy HH:mm')}
                      </p>
                    </div>
                  </div>

                  {document.processed_at && (
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Processed</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(document.processed_at), 'MMM dd, yyyy HH:mm')}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center space-x-3">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Last Updated</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(document.updated_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Error Message for Failed Documents */}
            {document.status === 'failed' && document.error_message && (
              <>
                <Separator />
                <Card className="border-red-200">
                  <CardHeader>
                    <CardTitle className="text-lg text-red-700 flex items-center">
                      <AlertCircle className="h-5 w-5 mr-2" />
                      Processing Error
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-red-50 p-3 rounded-lg">
                      <p className="text-sm text-red-700">{document.error_message}</p>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            <Separator />

            {/* Extracted Data */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">AI Analysis Results</CardTitle>
              </CardHeader>
              <CardContent>
                {document.status === 'completed' ? (
                  renderExtractedData(document.extracted_data)
                ) : document.status === 'processing' ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
                      <p className="text-muted-foreground">Processing document...</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-center">
                      <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
                      <p className="text-muted-foreground">Processing failed</p>
                      {document.error_message && (
                        <p className="text-sm text-red-600 mt-2">{document.error_message}</p>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentViewDialog;
