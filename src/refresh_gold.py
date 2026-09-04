"""Databricks job entry point for the Gold sales mart."""

from pyspark.sql import SparkSession

from lakehouse_rescue.transformations import daily_sales

spark = SparkSession.getActiveSession() or SparkSession.builder.getOrCreate()
silver = spark.table("rescue_lab.silver.orders")
(daily_sales(silver).write.mode("overwrite").option("overwriteSchema", "true").saveAsTable("rescue_lab.gold.daily_sales"))
