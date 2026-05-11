-- Normalize legacy account roles to the simplified USER/ADMIN model.
UPDATE "User"
SET role = 'USER'
WHERE role IS NULL
   OR TRIM(role) = ''
   OR role IN ('CLIENT', 'AGENT_BUYER', 'BUYER_AGENT', 'SOURCER', 'INTERMEDIARY');

-- Keep admin role canonical.
UPDATE "User"
SET role = 'ADMIN'
WHERE role IN ('admin', 'Admin');
