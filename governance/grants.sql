-- Illustrative Unity Catalog access model. Replace principals with account-level groups.
GRANT USE CATALOG ON CATALOG rescue_lab TO `rescue_data_engineers`;
GRANT USE SCHEMA, SELECT, MODIFY ON SCHEMA rescue_lab.bronze TO `rescue_data_engineers`;
GRANT USE SCHEMA, SELECT, MODIFY ON SCHEMA rescue_lab.silver TO `rescue_data_engineers`;
GRANT USE SCHEMA, SELECT, MODIFY ON SCHEMA rescue_lab.gold TO `rescue_data_engineers`;

GRANT USE CATALOG ON CATALOG rescue_lab TO `rescue_analysts`;
GRANT USE SCHEMA ON SCHEMA rescue_lab.gold TO `rescue_analysts`;
GRANT SELECT ON SCHEMA rescue_lab.gold TO `rescue_analysts`;

-- Auditors receive the masked view rather than direct Silver-table access.
CREATE OR REPLACE VIEW rescue_lab.gold.orders_audit_masked AS
SELECT
  order_id,
  CONCAT(SUBSTRING(customer_name, 1, 1), '***') AS customer_name,
  channel,
  amount,
  event_timestamp,
  quality_status
FROM rescue_lab.silver.orders;

GRANT USE CATALOG ON CATALOG rescue_lab TO `rescue_auditors`;
GRANT USE SCHEMA ON SCHEMA rescue_lab.gold TO `rescue_auditors`;
GRANT SELECT ON VIEW rescue_lab.gold.orders_audit_masked TO `rescue_auditors`;
