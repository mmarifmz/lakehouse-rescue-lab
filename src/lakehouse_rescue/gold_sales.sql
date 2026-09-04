-- Business contract: one row per order date and sales channel.
CREATE OR REPLACE VIEW rescue_lab.gold.channel_performance AS
SELECT
  CAST(event_timestamp AS DATE) AS order_date,
  channel,
  COUNT(DISTINCT order_id) AS order_count,
  ROUND(SUM(amount), 2) AS gross_revenue,
  ROUND(AVG(amount), 2) AS average_order_value
FROM rescue_lab.silver.orders
GROUP BY CAST(event_timestamp AS DATE), channel;
