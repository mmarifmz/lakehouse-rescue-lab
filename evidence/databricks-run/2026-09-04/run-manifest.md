# Databricks Free Edition run manifest

This manifest records the first real workspace execution of the Lakehouse Rescue Lab. The source data is entirely synthetic.

## Execution summary

| Item | Verified result |
|---|---|
| Workspace | Databricks Free Edition |
| Execution date | 4 September 2026 (Asia/Kuala_Lumpur) |
| Notebook compute | Serverless |
| Executable cells | 7 succeeded, 0 failed |
| Bronze records | 6 |
| Trusted Silver records | 5 |
| Quarantined records | 1 duplicate order |
| Gold revenue | RM997.60 |
| Final assertion | `VERIFIED` |
| Orchestration | Databricks Job, serverless notebook task |
| Successful Job duration | 1 minute 18 seconds |
| Recurring trigger | None |

## Managed tables created

- `bronze_orders_raw`
- `silver_orders`
- `silver_orders_quarantine`
- `gold_daily_sales`

All four tables were written to the `lakehouse_rescue_lab` schema in the workspace's current Unity Catalog catalog.

## What this proves

- The repository notebook imports and runs on Databricks serverless compute.
- The duplicate-delivery control preserves all raw events, retains one trusted order and quarantines the replay.
- The Gold result excludes the duplicate and produces the expected RM997.60 revenue.
- The same notebook can run as a saved Databricks Job without a classic cluster.

## Evidence boundary

This public record intentionally excludes workspace URLs, account and run identifiers, email addresses, cookies and credentials. It verifies the Free Edition transformation and orchestration path, not enterprise networking, SSO, compliance controls, production SLAs or client data.

The executable source of truth is [`notebooks/lakehouse_rescue_lab.py`](../../../notebooks/lakehouse_rescue_lab.py).
