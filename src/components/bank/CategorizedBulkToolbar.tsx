
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface CategorizedBulkToolbarProps {
  selectedCount: number;
  isProcessing: boolean;
  onBulkPost: () => void;
  onBulkDelete: () => void;
}

const CategorizedBulkToolbar = ({
  selectedCount,
  isProcessing,
  onBulkPost,
  onBulkDelete
}: CategorizedBulkToolbarProps) => {
  if (selectedCount === 0) return null;

  return (
    <Card className="w-full">
      <CardContent className="py-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <Badge variant="secondary" className="text-xs w-fit">
            {selectedCount} selected for posting
          </Badge>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button 
              onClick={onBulkDelete} 
              disabled={isProcessing} 
              variant="destructive"
              className="w-full sm:w-auto"
            >
              Delete Selected
            </Button>
            <Button 
              onClick={onBulkPost} 
              disabled={isProcessing} 
              className="w-full sm:w-auto"
            >
              {isProcessing ? 'Posting...' : 'Post Selected to Journal'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CategorizedBulkToolbar;
