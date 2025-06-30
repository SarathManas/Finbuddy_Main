import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, X } from 'lucide-react';
import { BankAccount } from '@/hooks/useBankTransactions';
import { useDocuments } from '@/hooks/useDocuments';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface StatementUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProcess: (documentId: string) => void;
  isProcessing: boolean;
  bankAccounts: BankAccount[];
}

const StatementUploadDialog = ({ 
  open, 
  onOpenChange, 
  onProcess, 
  isProcessing, 
  bankAccounts 
}: StatementUploadDialogProps) => {
  const [selectedAccount, setSelectedAccount] = useState<string>('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedDocumentId, setUploadedDocumentId] = useState<string>('');
  const [isLocalProcessing, setIsLocalProcessing] = useState(false);
  
  const { uploadDocument, isUploading } = useDocuments();
  const { toast } = useToast();

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg'],
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    },
    multiple: false,
    onDrop: async (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (file) {
        setUploadedFile(file);
        setUploadedDocumentId(''); // Reset document ID
        
        try {
          console.log('Starting file upload:', file.name);
          // Upload the file and get the document response
          const uploadPromise = new Promise((resolve, reject) => {
            uploadDocument(file, {
              onSuccess: (document: any) => {
                console.log('Upload successful, document ID:', document.id);
                setUploadedDocumentId(document.id);
                resolve(document);
              },
              onError: (error: Error) => {
                console.error('Upload failed:', error);
                setUploadedFile(null);
                reject(error);
              }
            });
          });
          
          await uploadPromise;
        } catch (error) {
          console.error('Upload failed:', error);
          setUploadedFile(null);
        }
      }
    }
  });

  const handleProcess = async () => {
    if (!uploadedDocumentId || !selectedAccount) return;
    
    setIsLocalProcessing(true);
    
    try {
      console.log('Processing statement with document ID:', uploadedDocumentId);
      
      // Call the AI document processor directly
      const { error } = await supabase.functions.invoke('ai-document-processor', {
        body: { documentId: uploadedDocumentId }
      });

      if (error) {
        console.error('Processing failed:', error);
        toast({
          title: "Processing failed",
          description: error.message || "Failed to process bank statement",
          variant: "destructive"
        });
      } else {
        console.log('Processing completed successfully');
        toast({
          title: "Statement processed",
          description: "Bank statement has been processed and transactions imported."
        });
        
        // Call the parent's onProcess to refresh data
        onProcess(uploadedDocumentId);
      }
    } catch (error) {
      console.error('Processing error:', error);
      toast({
        title: "Processing failed",
        description: "An error occurred while processing the statement",
        variant: "destructive"
      });
    } finally {
      setIsLocalProcessing(false);
      handleClose();
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setSelectedAccount('');
    setUploadedFile(null);
    setUploadedDocumentId('');
  };

  const removeFile = () => {
    setUploadedFile(null);
    setUploadedDocumentId('');
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Upload Bank Statement</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Select Bank Account</Label>
            <Select value={selectedAccount} onValueChange={setSelectedAccount}>
              <SelectTrigger>
                <SelectValue placeholder="Choose account" />
              </SelectTrigger>
              <SelectContent>
                {bankAccounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.account_name} - {account.bank_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Upload Statement</Label>
            {!uploadedFile ? (
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                  isDragActive 
                    ? 'border-primary bg-primary/5' 
                    : 'border-muted-foreground/25 hover:border-primary/50'
                }`}
              >
                <input {...getInputProps()} />
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  {isDragActive
                    ? 'Drop the statement here...'
                    : 'Drag & drop bank statement or click to browse'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Supports PDF, images, CSV, Excel files
                </p>
              </div>
            ) : (
              <div className="border rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{uploadedFile.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                      {uploadedDocumentId && (
                        <span className="ml-2 text-green-600">✓ Uploaded</span>
                      )}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={removeFile}
                  disabled={isUploading || isLocalProcessing}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleProcess}
              disabled={!uploadedFile || !selectedAccount || !uploadedDocumentId || isUploading || isProcessing || isLocalProcessing}
            >
              {isUploading ? 'Uploading...' : 
               isLocalProcessing || isProcessing ? 'Processing...' : 
               'Process Statement'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StatementUploadDialog;
