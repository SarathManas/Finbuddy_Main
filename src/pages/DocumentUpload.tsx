import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useDocuments, Document } from '@/hooks/useDocuments';
import DocumentUploadZone from '@/components/documents/DocumentUploadZone';
import DocumentsList from '@/components/documents/DocumentsList';
import CategorizedDocumentDisplay from '@/components/documents/CategorizedDocumentDisplay';
import DocumentViewDialog from '@/components/documents/DocumentViewDialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Grid3X3 } from 'lucide-react';

const DocumentUpload = () => {
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  
  const {
    documents,
    isLoading,
    uploadDocument,
    deleteDocument,
    isUploading,
    isDeleting
  } = useDocuments();

  const handleUpload = (files: File[]) => {
    files.forEach(file => uploadDocument(file));
  };

  const handleView = (document: Document) => {
    setSelectedDocument(document);
    setViewDialogOpen(true);
  };

  const handleCloseView = () => {
    setViewDialogOpen(false);
    setSelectedDocument(null);
  };

  // Filter completed documents for categorized view
  const completedDocuments = documents.filter(doc => doc.status === 'completed');

  return (
    <div className="w-full max-w-none space-y-6 overflow-hidden">
      <div>
        <h1 className="text-3xl font-bold">Document Upload & AI Analysis</h1>
        <p className="text-muted-foreground">
          Upload documents and let AI extract key information automatically
        </p>
      </div>

      {/* Upload Zone */}
      <DocumentUploadZone onUpload={handleUpload} isUploading={isUploading} />

      <Separator />

      {/* Documents Display */}
      <Tabs defaultValue="categorized" className="w-full">
        <TabsList>
          <TabsTrigger value="categorized" className="flex items-center gap-2">
            <Grid3X3 className="h-4 w-4" />
            Categorized View
          </TabsTrigger>
          <TabsTrigger value="all" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            All Documents
          </TabsTrigger>
        </TabsList>

        <TabsContent value="categorized" className="mt-6">
          {isLoading ? (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </CardContent>
            </Card>
          ) : (
            <CategorizedDocumentDisplay documents={completedDocuments} />
          )}
        </TabsContent>

        <TabsContent value="all" className="mt-6">
          <Card className="w-full">
            <CardHeader>
              <CardTitle>All Documents</CardTitle>
            </CardHeader>
            <CardContent className="overflow-hidden">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </div>
              ) : (
                <DocumentsList
                  documents={documents}
                  onDelete={deleteDocument}
                  onView={handleView}
                  isDeleting={isDeleting}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Document View Dialog */}
      <DocumentViewDialog
        document={selectedDocument}
        open={viewDialogOpen}
        onClose={handleCloseView}
      />
    </div>
  );
};

export default DocumentUpload;
