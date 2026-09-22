# Snowflake Finance Close Business Case

This folder is an inspectable, synthetic-data Snowflake implementation plan for the same duplicate-order incident shown in the public lab.

## Business outcome

A Finance Director needs a daily sales number that can be acted on. The source retry sends `ORD-1043` twice, which would overstate revenue by RM420.00. The delivery path preserves the received records, identifies the duplicate, records it for operations and publishes only trusted sales to Finance.

| Report | Without the control | With the control |
|---|---:|---:|
| Daily revenue | RM1,417.60 | RM997.60 |
| Duplicate order | Hidden in the total | Quarantined with a reason |
| Finance response | Spreadsheet investigation | Review the trusted number and exception |

## Assets

1. `01_finance_close_demo.sql` creates the synthetic source, Snowflake layers, trusted daily sales mart, quarantine output and reconciliation query.
2. `02_governance.sql` defines the illustrative Finance, operations and auditor access model, including masking for customer names.

## Run boundary

These are Snowflake SQL assets, not execution evidence. Run only in a disposable trial or approved non-production account, after replacing role names and warehouse sizing with the account owner's choices. No client data, credentials or production-account details belong in this repository.
