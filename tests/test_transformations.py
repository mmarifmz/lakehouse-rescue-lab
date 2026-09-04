from datetime import UTC, datetime

import pytest

from lakehouse_rescue.transformations import classify_quality, daily_sales, trusted_orders


@pytest.fixture(scope="session")
def spark():
    pyspark = pytest.importorskip("pyspark")
    session = pyspark.sql.SparkSession.builder.master("local[1]").appName("rescue-tests").getOrCreate()
    yield session
    session.stop()


def frame(spark, rows):
    return spark.createDataFrame(
        rows,
        "order_id string, customer_id string, customer_name string, "
        "channel string, amount double, event_ts string, ingested_at timestamp",
    )


def test_invalid_amount_is_classified_not_silently_dropped(spark):
    source = frame(
        spark,
        [("O-1", "C-1", "Amina", "Web", -1.0, "2026-09-04 09:00:00", datetime(2026, 9, 4, 9, 1, tzinfo=UTC))],
    )
    result = classify_quality(source).first()
    assert result.quality_status == "invalid_amount"


def test_duplicate_order_keeps_latest_event(spark):
    source = frame(spark, [
        ("O-1", "C-1", "Amina", "Web", 10.0, "2026-09-04 09:00:00", datetime(2026, 9, 4, 9, 1, tzinfo=UTC)),
        ("O-1", "C-1", "Amina", "Web", 12.0, "2026-09-04 09:05:00", datetime(2026, 9, 4, 9, 6, tzinfo=UTC)),
    ])
    rows = trusted_orders(classify_quality(source)).collect()
    assert len(rows) == 1
    assert rows[0].amount == 12.0


def test_gold_revenue_reconciles_to_trusted_orders(spark):
    source = frame(spark, [
        ("O-1", "C-1", "Amina", "Web", 10.0, "2026-09-04 09:00:00", datetime(2026, 9, 4, 9, 1, tzinfo=UTC)),
        ("O-2", "C-2", "Daniel", "Web", 15.5, "2026-09-04 10:00:00", datetime(2026, 9, 4, 10, 1, tzinfo=UTC)),
    ])
    gold = daily_sales(trusted_orders(classify_quality(source))).first()
    assert gold.order_count == 2
    assert gold.gross_revenue == 25.5
