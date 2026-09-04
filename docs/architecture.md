# Architecture decision record

## Purpose

Demonstrate an inspectable Databricks delivery pattern while allowing anonymous visitors to experience the outcome without workspace credentials.

## Separation of concerns

The GitHub Pages site is a static simulation using synthetic data. It communicates behavior but does not impersonate Spark execution. The Databricks-oriented layer contains the implementation and deployment definition that must be validated in a real target workspace.

## Data flow

1. **Bronze** preserves source payloads, ingestion metadata and replay history.
2. **Silver** validates the schema, attaches explicit quality reasons, quarantines invalid rows and deterministically deduplicates orders.
3. **Gold** publishes stable daily and channel-level contracts for business consumption.

## Governance boundary

Engineers can operate all layers. Analysts consume Gold assets only. Auditors consume a masked audit view. Production principals must be account-level groups and should be reviewed by the platform owner before deployment.

## Known first-release gaps

- No real workspace execution evidence yet.
- The illustrative grants require target-workspace principals.
- Compute defaults are AWS-oriented placeholders and must be replaced with approved target values.
- The demo does not yet include Structured Streaming or change-data capture.
