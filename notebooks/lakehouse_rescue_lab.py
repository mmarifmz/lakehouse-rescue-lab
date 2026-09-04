# Databricks notebook source
"""Lakehouse Rescue Lab: executable Databricks Free Edition demonstration.

This notebook uses synthetic data only. It creates managed tables in the current
Unity Catalog catalog and proves the duplicate-order outcome with assertions.
"""

# COMMAND ----------

from datetime import UTC, datetime

from pyspark.sql import Window
from pyspark.sql import functions as F
from pyspark.sql.types import DoubleType, StringType, StructField, StructType, TimestampType

# COMMAND ----------

catalog_name = spark.sql("SELECT current_catalog()").first()[0]
schema_name = "lakehouse_rescue_lab"
table_prefix = f"`{catalog_name}`.`{schema_name}`"

spark.sql(f"CREATE SCHEMA IF NOT EXISTS {table_prefix}")
print(f"Writing demonstration assets to {catalog_name}.{schema_name}")

# COMMAND ----------

source_schema = StructType(
    [
        StructField("order_id", StringType(), False),
        StructField("customer_id", StringType(), False),
        StructField("customer_name", StringType(), False),
        StructField("channel", StringType(), False),
        StructField("amount", DoubleType(), True),
        StructField("event_ts", StringType(), True),
        StructField("ingested_at", TimestampType(), False),
    ]
)

source_rows = [
    ("ORD-1041", "CUS-01", "Amina Rahman", "Web", 248.00, "2026-09-04 09:00:00", datetime(2026, 9, 4, 9, 1, tzinfo=UTC)),
    ("ORD-1042", "CUS-02", "Daniel Lee", "Store", 89.50, "2026-09-04 09:05:00", datetime(2026, 9, 4, 9, 6, tzinfo=UTC)),
    ("ORD-1043", "CUS-03", "Siti Nabila", "Marketplace", 420.00, "2026-09-04 09:10:00", datetime(2026, 9, 4, 9, 11, tzinfo=UTC)),
    ("ORD-1043", "CUS-03", "Siti Nabila", "Marketplace", 420.00, "2026-09-04 09:10:00", datetime(2026, 9, 4, 9, 12, tzinfo=UTC)),
    ("ORD-1044", "CUS-04", "Kumar Raj", "Web", 175.20, "2026-09-04 09:15:00", datetime(2026, 9, 4, 9, 16, tzinfo=UTC)),
    ("ORD-1045", "CUS-05", "Mei Chen", "Store", 64.90, "2026-09-04 09:20:00", datetime(2026, 9, 4, 9, 21, tzinfo=UTC)),
]

bronze = (
    spark.createDataFrame(source_rows, source_schema)
    .withColumn("source_system", F.lit("portfolio_demo"))
    .withColumn("source_batch_id", F.lit("BATCH-20260904-01"))
)

bronze.write.mode("overwrite").option("overwriteSchema", "true").saveAsTable(
    f"{catalog_name}.{schema_name}.bronze_orders_raw"
)
display(bronze.orderBy("ingested_at"))

# COMMAND ----------

parsed = bronze.withColumn("event_timestamp", F.to_timestamp("event_ts"))
quality_classified = parsed.withColumn(
    "quality_reason",
    F.when(F.col("order_id").isNull(), F.lit("missing_order_id"))
    .when(F.col("amount").isNull() | (F.col("amount") <= 0), F.lit("invalid_amount"))
    .when(F.col("event_timestamp").isNull(), F.lit("invalid_timestamp")),
)

latest_order = Window.partitionBy("order_id").orderBy(F.col("ingested_at").desc())
ranked = quality_classified.withColumn("order_rank", F.row_number().over(latest_order))

quarantine = ranked.filter(F.col("quality_reason").isNotNull() | (F.col("order_rank") > 1)).withColumn(
    "quality_reason",
    F.coalesce(F.col("quality_reason"), F.lit("duplicate_order")),
)

silver = ranked.filter(F.col("quality_reason").isNull() & (F.col("order_rank") == 1)).drop("order_rank")

silver.write.mode("overwrite").option("overwriteSchema", "true").saveAsTable(
    f"{catalog_name}.{schema_name}.silver_orders"
)
quarantine.write.mode("overwrite").option("overwriteSchema", "true").saveAsTable(
    f"{catalog_name}.{schema_name}.silver_orders_quarantine"
)

display(quarantine.select("order_id", "amount", "ingested_at", "quality_reason"))

# COMMAND ----------

gold = (
    silver.withColumn("order_date", F.to_date("event_timestamp"))
    .groupBy("order_date", "channel")
    .agg(
        F.countDistinct("order_id").alias("order_count"),
        F.round(F.sum("amount"), 2).alias("gross_revenue"),
    )
)

gold.write.mode("overwrite").option("overwriteSchema", "true").saveAsTable(
    f"{catalog_name}.{schema_name}.gold_daily_sales"
)
display(gold.orderBy("channel"))

# COMMAND ----------

bronze_count = bronze.count()
trusted_count = silver.count()
quarantine_count = quarantine.count()
gold_revenue = gold.agg(F.sum("gross_revenue").alias("revenue")).first()["revenue"]

assert bronze_count == 6, f"Expected 6 Bronze records, found {bronze_count}"
assert trusted_count == 5, f"Expected 5 trusted records, found {trusted_count}"
assert quarantine_count == 1, f"Expected 1 quarantined record, found {quarantine_count}"
assert round(gold_revenue, 2) == 997.60, f"Expected RM997.60, found {gold_revenue}"

result = spark.createDataFrame(
    [(bronze_count, trusted_count, quarantine_count, gold_revenue, "VERIFIED")],
    "bronze_count long, trusted_count long, quarantine_count long, gold_revenue double, result string",
)
display(result)
print("LAKEHOUSE RESCUE: VERIFIED")
