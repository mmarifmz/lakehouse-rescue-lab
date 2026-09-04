# Databricks multi-cloud delivery matrix

Databricks supports workspaces hosted on Amazon Web Services, Microsoft Azure and Google Cloud. The Lakehouse Rescue pattern keeps its transformations, Delta contracts, Unity Catalog model and job orchestration consistent, while cloud-specific infrastructure is adapted to the client's environment.

## What changes by cloud

| Delivery concern | AWS | Microsoft Azure | Google Cloud |
|---|---|---|---|
| Object storage | Amazon S3 | Azure Data Lake Storage Gen2 | Google Cloud Storage |
| Identity and access | AWS IAM roles and policies | Microsoft Entra ID and managed identities | Cloud IAM and service accounts |
| Private connectivity | AWS PrivateLink and VPC controls | Azure Private Link and VNet controls | Private Service Connect and VPC controls |
| Secrets and keys | AWS Secrets Manager and KMS | Azure Key Vault | Secret Manager and Cloud KMS |
| Monitoring integration | Amazon CloudWatch | Azure Monitor | Cloud Monitoring |
| Infrastructure delivery | Terraform or approved cloud tooling | Terraform, Bicep or approved Azure tooling | Terraform or approved Google Cloud tooling |

## What stays consistent

- PySpark transformation logic and data-quality rules
- Bronze, Silver, quarantine and Gold data contracts
- Delta table semantics
- Unity Catalog governance and lineage approach
- Lakeflow Jobs orchestration
- Automated tests, deployment gates and operational runbooks

## Typical client delivery path

1. Confirm the target cloud, region, data residency and network boundary.
2. Map approved identity groups and service principals to least-privilege roles.
3. Connect approved object storage and encryption controls.
4. Configure private networking, egress and dependency access.
5. Deploy development, test and production targets through the client's CI/CD process.
6. Validate data contracts, recovery procedures, monitoring and cost controls before handover.

## Evidence boundary

The repository's notebook and serverless Job were executed successfully in Databricks Free Edition. This document demonstrates a delivery-ready adaptation model for AWS, Azure and Google Cloud; it does not claim that this portfolio workload has been deployed into three production cloud accounts.

Cloud services, supported regions and feature availability should be confirmed against current Databricks and cloud-provider documentation during solution design.

## Official platform references

- [Databricks on AWS documentation](https://docs.databricks.com/aws/en)
- [Azure Databricks documentation](https://learn.microsoft.com/en-us/azure/databricks/)
- [Databricks clouds and regions on Google Cloud](https://docs.databricks.com/gcp/en/resources/supported-regions)
