UPDATE "cash_entries" SET "cash_context" = 'projects' WHERE "reference_type" IN ('project_payment', 'project_expense');
