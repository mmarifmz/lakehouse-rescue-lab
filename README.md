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

## Explore locally

No build step is required. Open `index.html` in a browser, or serve the directory with any static web server.

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

## Publish to GitHub Pages

1. Create a public GitHub repository and push this project.
2. In **Settings → Pages**, choose **GitHub Actions** as the source.
3. The included Pages workflow publishes the static experience.

## Status

This first release is a portfolio demonstrator. Real workspace execution evidence—job-run screenshots, runtime output and a short walkthrough—should only be added after the bundle has been run in an actual Databricks workspace.
