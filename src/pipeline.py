"""Databricks job entry point for Bronze-to-Silver processing."""

from pyspark.sql import SparkSession

from lakehouse_rescue.transformations import classify_quality, quarantined_orders, trusted_orders

spark = SparkSession.getActiveSession() or SparkSession.builder.getOrCreate()

bronze = spark.table("rescue_lab.bronze.orders_raw")
classified = classify_quality(bronze)

(trusted_orders(classified).write.mode("overwrite").option("overwriteSchema", "true").saveAsTable("rescue_lab.silver.orders"))
(quarantined_orders(classified).write.mode("append").saveAsTable("rescue_lab.silver.orders_quarantine"))
