# Operations runbook

## Duplicate delivery

**Signal:** Bronze input count increases while distinct order count does not; the duplicate-rate quality metric breaches its threshold.

**Response:** Confirm the source batch identifier, inspect the duplicate order IDs, and verify that Silver retained the newest event by `event_timestamp` and `ingested_at`.

**Recovery:** No destructive cleanup is required in Silver because the transformation is deterministic. Correct the upstream delivery issue and replay the affected Bronze batch. Reconcile Gold revenue to trusted Silver orders.

## Invalid records

**Signal:** Quarantine count increases for `invalid_amount`, `invalid_timestamp` or `missing_order_id`.

**Response:** Group quarantined records by reason and source batch. Do not silently delete or coerce source values.

**Recovery:** Correct the records upstream or through an approved remediation dataset, append the corrected events, then rerun the affected date. Retain the original Bronze events for auditability.

## Late-arriving orders

**Signal:** A valid event arrives after its business-date Gold partition has completed.

**Response:** Confirm that it is genuinely late rather than a clock or timezone defect.

**Recovery:** Merge the valid event into Silver using the deterministic order key, then refresh only the affected Gold date partitions. Record the KPI restatement in the incident log.

## Validation checklist

- Bronze source count reconciles to received input.
- Silver trusted plus quarantined counts explain Bronze input after duplicate classification.
- Gold order count and revenue reconcile to the applicable Silver contract.
- Access checks confirm that analysts cannot query Bronze or Silver PII.
- The job run, commit SHA, target and remediation decision are recorded.
