"""Pure PySpark transformations used by the Databricks job and unit tests."""

from pyspark.sql import DataFrame, Window
from pyspark.sql import functions as F


REQUIRED_COLUMNS = {"order_id", "customer_id", "customer_name", "channel", "amount", "event_ts", "ingested_at"}


def validate_contract(frame: DataFrame) -> None:
    """Fail early when the upstream schema is missing required fields."""
    missing = REQUIRED_COLUMNS.difference(frame.columns)
    if missing:
        raise ValueError(f"Missing required columns: {', '.join(sorted(missing))}")


def classify_quality(frame: DataFrame) -> DataFrame:
    """Attach an explicit quality status without discarding source records."""
    validate_contract(frame)
    parsed = frame.withColumn("event_timestamp", F.to_timestamp("event_ts"))
    return parsed.withColumn(
        "quality_status",
        F.when(F.col("order_id").isNull(), F.lit("missing_order_id"))
        .when(F.col("amount").isNull() | (F.col("amount") <= 0), F.lit("invalid_amount"))
        .when(F.col("event_timestamp").isNull(), F.lit("invalid_timestamp"))
        .otherwise(F.lit("valid")),
    )


def trusted_orders(classified: DataFrame) -> DataFrame:
    """Return valid, deterministically deduplicated Silver records."""
    valid = classified.filter(F.col("quality_status") == "valid")
    latest_event = Window.partitionBy("order_id").orderBy(
        F.col("event_timestamp").desc(), F.col("ingested_at").desc()
    )
    return (
        valid.withColumn("record_rank", F.row_number().over(latest_event))
        .filter(F.col("record_rank") == 1)
        .drop("record_rank")
    )


def quarantined_orders(classified: DataFrame) -> DataFrame:
    """Return rejected records together with their machine-readable reason."""
    return classified.filter(F.col("quality_status") != "valid")


def daily_sales(trusted: DataFrame) -> DataFrame:
    """Build the Gold daily/channel sales contract."""
    return (
        trusted.withColumn("order_date", F.to_date("event_timestamp"))
        .groupBy("order_date", "channel")
        .agg(
            F.countDistinct("order_id").alias("order_count"),
            F.round(F.sum("amount"), 2).alias("gross_revenue"),
        )
    )
