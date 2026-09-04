# Lakehouse Rescue Lab

An interactive, inspectable demonstration of production-minded Databricks delivery. The public GitHub Pages site lets a visitor inject data incidents and observe their effect across Bronze, Silver and Gold layers.

**Live experience:** https://mmarifmz.github.io/lakehouse-rescue-lab/

> The GitHub Pages experience is a browser simulation over synthetic data. It does not claim to execute Spark or connect to a Databricks workspace. The repository contains the corresponding PySpark, SQL, governance and deployment artifacts.

## What it demonstrates

- Medallion architecture and replayable raw ingestion
- Schema enforcement, deterministic deduplication and quarantine
- Incremental handling of late-arriving data
- Governed, persona-specific consumption
- Declarative Databricks deployment targets
- Unit tests and operational recovery guidance

## The example in plain English

Imagine that an online shop receives five genuine orders worth **RM997.60**. The source system accidentally sends one RM420 order twice.

| Stage | What happens |
|---|---|
| Incoming data | Six rows arrive because one order is duplicated. |
| Bronze | All six rows are preserved exactly as received so the delivery can be audited or replayed. |
| Silver | The pipeline recognises the repeated order ID, keeps one trusted version and marks the extra row as a duplicate. |
| Gold | The dashboard reports the correct revenue of **RM997.60**, not the incorrect RM1,417.60. |

This is the practical value of the project: a common data-delivery problem is detected before it becomes a misleading business report.

The interactive site also includes invalid amounts, broken timestamps and late-arriving orders. Each scenario explains what the pipeline did and why.

## 60-second guided tour

1. Open the [live experience](https://mmarifmz.github.io/lakehouse-rescue-lab/).
2. Select **Duplicate delivery** and press **Run pipeline**.
3. Observe six Bronze records become five trusted Silver records.
4. Confirm that one duplicate is quarantined and Gold revenue remains RM997.60.
5. Switch between **Engineer**, **Analyst** and **Auditor** to see how access changes the record view.
6. Return here and inspect the linked implementation, tests, deployment definition and recovery runbook.

## For recruiters and delivery managers

This repository provides evidence of more than notebook development:

- **Data engineering:** PySpark transformations, explicit contracts and business-ready SQL.
- **Reliability:** repeatable deduplication, quarantine and documented recovery procedures.
- **Platform delivery:** Databricks resources defined as code with separate development and production targets.
- **Governance:** role-oriented access and masking design rather than unrestricted table access.
- **Communication:** a non-technical stakeholder can experience the outcome without workspace credentials.

## For prospective clients

The demonstration answers a simple delivery question: **what prevents unreliable source data from reaching management reports?** The same patterns can be adapted to orders, finance, operations, education, manufacturing or other governed datasets. A real engagement would replace the synthetic example, principals and compute placeholders with the client's approved data contract, cloud environment and access model.

## Explore locally

No build step is required. Open `index.html` in a browser, or serve the directory with any static web server.

## Run the real example in Databricks Free Edition

The repository now includes an import-ready Databricks notebook that executes the same duplicate-order scenario on serverless Spark, persists managed tables and stops if the expected outcome is not met.

- Start with the [Free Edition onboarding guide](docs/databricks-free-edition.md).
- Import [the Databricks notebook](notebooks/lakehouse_rescue_lab.py).
- Use the optional [serverless bundle example](examples/free-edition/) after workspace authentication is configured.
- Compare the result with [the synthetic source CSV](sample-data/orders_duplicate_delivery.csv).

Expected execution contract: **6 Bronze records → 5 trusted Silver records + 1 quarantined duplicate → RM997.60 Gold revenue**.

This execution contract was verified in Databricks Free Edition on **4 September 2026**. All seven executable notebook cells succeeded, the final assertion returned `VERIFIED`, and the serverless Job completed successfully in **1 minute 18 seconds**. See the [sanitized run manifest](evidence/databricks-run/2026-09-04/run-manifest.md).

## Databricks-oriented implementation

The bundle is intentionally environment-neutral. Before deploying, supply workspace-specific values for `spark_version` and `node_type_id` or adapt the job to an approved serverless environment.

```bash
databricks bundle validate -t dev
databricks bundle deploy -t dev
databricks bundle run lakehouse_rescue_job -t dev
```

## Evidence map

| Claim | Evidence |
|---|---|
| Transformations | `src/lakehouse_rescue/transformations.py` |
| Gold business mart | `src/lakehouse_rescue/gold_sales.sql` |
| Deployment as code | `databricks.yml`, `resources/lakehouse_job.yml` |
| Access model | `governance/grants.sql` |
| Automated checks | `tests/test_transformations.py`, `.github/workflows/ci.yml` |
| Recovery procedure | `docs/runbook.md` |
| Free Edition execution | `notebooks/lakehouse_rescue_lab.py`, `examples/free-edition/` |
| Onboarding and evidence | `docs/databricks-free-edition.md` |

## Publish to GitHub Pages

1. Create a public GitHub repository and push this project.
2. In **Settings → Pages**, choose **GitHub Actions** as the source.
3. The included Pages workflow publishes the static experience.

## Status

The interactive site remains a transparent browser simulation, while the matching notebook and serverless Job have now been executed successfully in Databricks Free Edition. The evidence is deliberately sanitized: no workspace tokens, account identifiers or private run URLs are published. Free Edition validation demonstrates the transformation and orchestration path; it does not claim enterprise networking, SSO, production SLAs or client-data delivery.
