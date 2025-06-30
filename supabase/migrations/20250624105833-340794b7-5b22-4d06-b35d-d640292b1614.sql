
-- Update existing transactions to align with the new logic
-- Set category to NULL for transactions that should be uncategorized
UPDATE bank_transactions 
SET category = NULL 
WHERE status IN ('pending', 'uncategorized') AND category IS NOT NULL;

-- Update status to 'categorized' for transactions that have a category but aren't posted
UPDATE bank_transactions 
SET status = 'categorized' 
WHERE category IS NOT NULL AND category != '' AND status NOT IN ('posted', 'categorized');
