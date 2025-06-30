
import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Trash2 } from 'lucide-react';

interface DeleteTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  transactionCount: number;
  isDeleting: boolean;
}

const DeleteTransactionDialog = ({
  open,
  onOpenChange,
  onConfirm,
  transactionCount,
  isDeleting
}: DeleteTransactionDialogProps) => {
  const isBulkDelete = transactionCount > 1;

  const handleConfirm = () => {
    console.log('Delete dialog confirm clicked, transaction count:', transactionCount);
    onConfirm();
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-destructive" />
            {isBulkDelete ? 'Delete Transactions' : 'Delete Transaction'}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isBulkDelete
              ? `Are you sure you want to delete ${transactionCount} transactions? This action cannot be undone.`
              : 'Are you sure you want to delete this transaction? This action cannot be undone.'
            }
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteTransactionDialog;
