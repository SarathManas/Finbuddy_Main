
-- Clear all existing data safely
DELETE FROM journal_entry_lines;
DELETE FROM day_book_entries;
DELETE FROM journal_entries;
DELETE FROM bank_transactions;
DELETE FROM documents WHERE file_type IN ('pdf', 'csv', 'xlsx') AND status IN ('processing', 'completed');
DELETE FROM bank_accounts;
DELETE FROM transaction_categories;

-- Reset sequences if they exist
SELECT setval(pg_get_serial_sequence('bank_accounts', 'id'), 1, false) WHERE pg_get_serial_sequence('bank_accounts', 'id') IS NOT NULL;
SELECT setval(pg_get_serial_sequence('bank_transactions', 'id'), 1, false) WHERE pg_get_serial_sequence('bank_transactions', 'id') IS NOT NULL;

-- Insert fresh transaction categories (these don't need user_id)
INSERT INTO transaction_categories (name, type, description) VALUES
('Salary', 'income', 'Monthly salary and wages'),
('Business Income', 'income', 'Revenue from business operations'),
('Interest Income', 'income', 'Interest earned from banks and investments'),
('Office Rent', 'expense', 'Monthly office rent payments'),
('Utilities', 'expense', 'Electricity, water, internet bills'),
('Office Supplies', 'expense', 'Stationery and office equipment'),
('Travel & Transportation', 'expense', 'Business travel and transport costs'),
('Marketing & Advertising', 'expense', 'Promotional and advertising expenses'),
('Professional Services', 'expense', 'Legal, accounting, and consulting fees'),
('Bank Charges', 'expense', 'Bank fees and service charges'),
('Equipment Purchase', 'expense', 'Computer and office equipment'),
('Insurance', 'expense', 'Business and health insurance'),
('Food & Dining', 'expense', 'Restaurant and food expenses'),
('Shopping', 'expense', 'General shopping and purchases'),
('Cash Withdrawal', 'expense', 'ATM withdrawals and cash transactions'),
('Loan Payment', 'expense', 'Loan EMI and interest payments'),
('Tax Payment', 'expense', 'Income tax and GST payments'),
('Bank Transfer', 'expense', 'Inter-bank transfers'),
('Petty Cash', 'expense', 'Small cash expenses');

-- Note: Bank accounts and transactions with user_id should be created when a user is authenticated
-- The application will create sample data when users log in and use the banking features
