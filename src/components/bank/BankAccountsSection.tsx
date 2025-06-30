
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight, Plus, CreditCard } from 'lucide-react';
import { BankAccount } from '@/hooks/useBankTransactions';
import BankAccountsList from './BankAccountsList';

interface BankAccountsSectionProps {
  accounts: BankAccount[];
  isLoading: boolean;
  onAddAccount: () => void;
}

const BankAccountsSection = ({ accounts, isLoading, onAddAccount }: BankAccountsSectionProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Manage Bank Accounts
                <span className="text-sm font-normal text-muted-foreground">
                  ({accounts.length} account{accounts.length !== 1 ? 's' : ''})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddAccount();
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Account
                </Button>
                {isOpen ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </div>
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0">
            <BankAccountsList accounts={accounts} isLoading={isLoading} />
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};

export default BankAccountsSection;
