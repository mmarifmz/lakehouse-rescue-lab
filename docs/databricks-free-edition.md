# Databricks Free Edition onboarding

This path creates genuine Databricks execution evidence using synthetic data only. Free Edition is quota-limited, serverless-only and intended for non-commercial learning and experimentation; it is not evidence of enterprise networking, SSO, compliance controls or production SLAs.

## 1. Create or open the workspace

Use the official Databricks Free Edition signup flow. Sign in with a personal Google or Microsoft account, or email OTP. Do not upload client or proprietary data.

## 2. Import the notebook

1. Download `notebooks/lakehouse_rescue_lab.py` from this repository.
2. In the workspace sidebar, open **Workspace**.
3. Choose a personal workspace folder and select **Import**.
4. Import the Python file. Databricks recognises the `# Databricks notebook source` and `# COMMAND ----------` markers.
5. Attach the notebook to the default serverless environment.

## 3. Run and verify

Run all cells. The final cell must display:

| Check | Expected |
|---|---:|
| Bronze records | 6 |
| Trusted Silver records | 5 |
| Quarantined records | 1 |
| Gold revenue | RM997.60 |
| Result | VERIFIED |

The notebook stops with an assertion error if any contract fails.

## 4. Create a serverless Job

From the notebook, schedule or create a Job using serverless compute. Name it `Lakehouse Rescue Lab - Free Edition`, run it once, and retain the successful run details.

The optional bundle under `examples/free-edition/` expresses the same notebook task without defining a classic cluster. Validate it only after configuring Databricks CLI authentication for the workspace.

## 5. Captured evidence

The reference run was completed on **4 September 2026** in Databricks Free Edition:

- All seven executable notebook cells succeeded on serverless compute.
- The assertion result was `6 / 5 / 1 / 997.60 / VERIFIED`.
- Four managed tables were created in the `lakehouse_rescue_lab` schema.
- The saved serverless Job completed successfully in 1 minute 18 seconds.
- No recurring trigger was enabled.

See the [sanitized run manifest](../evidence/databricks-run/2026-09-04/run-manifest.md). Workspace URLs, account identifiers and authentication details are intentionally not published.

For a future evidence refresh, create `evidence/databricks-run/YYYY-MM-DD/` and add:

- Executed notebook exported as HTML with outputs
- Screenshot of the successful Lakeflow Job run
- Screenshot of the four managed tables in Catalog Explorer
- Screenshot of table lineage if available
- `run-manifest.md` containing workspace type, timestamp, Git commit SHA, table counts and limitations

Never add workspace tokens, cookies, account identifiers or private URLs to the repository.

## 6. Update public claims

Only show **Verified in Databricks** when the asserted counts have passed in the workspace and a sanitized run manifest is committed. Refresh the date and runtime after any material notebook change.
