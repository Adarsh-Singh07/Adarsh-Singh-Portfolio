# Building Scalable ETL Pipelines with Azure Databricks for Financial Data

Moving financial data is different from moving anything else. A late or wrong number here doesn't just break a dashboard — it breaks trust, and in finance, trust is the product. This post walks through how to design ETL pipelines with Python and Azure Databricks that stay fast, accurate, and auditable as the data grows.

## Why ETL Still Matters

Before anything else, a quick refresher on the three letters:

- **Extract** — pull raw data out of wherever it lives: bank feeds, market-data vendors, internal databases.
- **Transform** — clean it, standardize it, and reshape it into something analysts can trust.
- **Load** — write it into a destination that your BI tools and models can query fast.

Sounds simple. The hard part is doing that reliably when the same pipeline runs every day against data that never behaves the same way twice.

## The Architecture: From Raw Sources to BI

A pipeline that holds up in production is layered, not a single giant script. A pattern that works well is the **medallion architecture**:

| Layer | What lives there | Rules |
|-------|------------------|-------|
| **Bronze** | Raw, untouched source files | Immutable. Never edited, only appended. |
| **Silver** | Cleaned, deduplicated, type-validated data | One record per event, normalized. |
| **Gold** | Aggregates and business-level facts | Safe to build dashboards and models on. |

Each layer only reads from the layer below it. That separation means a bug in your cleaning logic can never corrupt the raw evidence — you can always re-derive.

## Where Databricks Fits

Databricks brings three things to this setup:

1. **Apache Spark** — the engine that splits a big job across many machines, so a pipeline that took hours on one box finishes in minutes.
2. **Notebooks** — the same workspace for exploration and production jobs, which keeps the "why" of each step next to the "how".
3. **Unity Catalog** — a single place that tracks who can see which table, which matters a lot when financial data is involved.

## A Typical Pipeline, in Pseudocode

The bronze layer is intentionally dumb. It just lands data:

```python
# Bronze: land the raw feed, keep the source filename for audit
raw = spark.read.parquet(f"abfss://landing@{storage}.dfs.fabrik.net/trades_2026-09-15/")
raw.write.mode("append").format("delta").save("bronze.raw_trades")
```

The silver layer is where you earn your keep:

```python
# Silver: dedupe + type-validate before anything else touches it
silver = (
    spark.read.table("bronze.raw_trades")
    .dropDuplicates(["trade_id"])
    .withColumn("price", F.col("price").cast("decimal(18,4)"))
)
silver.write.mode("overwrite").format("delta").save("silver.trades")
```

Two details in that snippet are not trivial:

- **Dedupe on a business key** (`trade_id`), not row identity. Feeds re-send; double-counted trades are the classic financial-data failure.
- **Cast money to `decimal`**, not `float`. Floating point is a convenience for science and a liability for currency — `0.1 + 0.2` is not `0.3` in binary. Use fixed-point decimals for anything with a price tag.

## The Financial-Specific Concerns

These are the requirements that separate a toy pipeline from one a finance team will sign off on:

- **Idempotency** — re-running today's job must not double-count today's trades. Delta tables with `MERGE` and stable business keys make re-runs safe.
- **Audit trail** — keep the source filename and load timestamp on every record. When someone asks "why is this number different?", you can trace it back to the exact file it came from.
- **Sensitive fields** — PII and account numbers don't need to live in every layer. Strip or mask them at bronze → silver so downstream analysts never see them.
- **Late data** — financial feeds are famously late. Design silver/gold as re-computable: when yesterday's corrected file arrives, re-run that day's slice instead of patching tables by hand.

## Scaling From Batch to Streaming

Batch (every hour or every day) is the right starting point. But the moment a trader needs a number that's two hours stale, you'll feel the pressure. Databricks handles the leap to streaming with the same abstraction — the same Delta table can be written by a batch job or a streaming query, and consumers of that table don't notice the difference.

## Key Takeaways

- Layer your pipeline (bronze → silver → gold) so raw evidence is never lost.
- Use `decimal` for money. Always.
- Make every job idempotent so re-runs are safe.
- Keep audit metadata with the data, not in a separate note.
- Design gold as re-computable — late corrections are a fact of financial data, not an edge case.
