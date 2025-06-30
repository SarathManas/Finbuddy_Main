
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LucideIcon } from 'lucide-react';

interface ExpenseCategoryCardProps {
  title: string;
  amount: number;
  description: string;
  transactions: number;
  percentage: number;
  icon: LucideIcon;
  isPositive?: boolean;
}

const ExpenseCategoryCard = ({ 
  title, 
  amount, 
  description, 
  transactions, 
  percentage, 
  icon: Icon,
  isPositive = false 
}: ExpenseCategoryCardProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
              <Icon className="h-5 w-5 text-muted-foreground" />
            </div>
            <h3 className="font-medium text-lg">{title}</h3>
          </div>
          <Badge variant={isPositive ? "default" : "destructive"} className="text-xs">
            {isPositive ? '+' : ''}{percentage}%
          </Badge>
        </div>
        
        <div className="space-y-2">
          <div className="text-2xl font-bold text-foreground">
            {formatCurrency(amount)}
          </div>
          <p className="text-sm text-muted-foreground">
            {description}
          </p>
          <div className="flex justify-between items-center pt-2">
            <span className="text-sm text-muted-foreground">Transactions</span>
            <span className="text-sm font-medium">{transactions}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExpenseCategoryCard;
