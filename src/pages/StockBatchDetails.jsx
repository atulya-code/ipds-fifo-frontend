
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiRequest } from "../services/api";

function StockBatchDetails() {
  const { batchId } = useParams();

  const [batch, setBatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function fetchBatch() {
      try {
        setLoading(true);
        setError("");

        const data = await apiRequest(
          `/api/stock/batches/${batchId}`
        );

        if (cancelled) return;

        if (data?.success && data.batch) {
          setBatch(data.batch);
        } else {
          setError(data?.message || "Batch details not found.");
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err?.message || "Unable to load batch details."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchBatch();

    return () => {
      cancelled = true;
    };
  }, [batchId]);

  const formatDate = (date) => {
    if (!date) return "Not available";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Not available";
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const details = batch
    ? [
        ["Batch Number", batch.batchNumber],
        ["Commodity", batch.commodity?.name],
        ["Supplier", batch.supplier?.name],
        ["Supplier Code", batch.supplier?.supplierCode],
        ["Godown", batch.godown?.name],
        ["Godown Code", batch.godown?.godownCode],
        ["District", batch.godown?.district],
        ["State", batch.godown?.state],
        ["Receipt Date", formatDate(batch.receiptDate)],
        ["Expiry Date", formatDate(batch.expiryDate)],
        [
          "Quantity Received",
          batch.quantityReceived != null
            ? `${batch.quantityReceived} ${batch.unit || ""}`.trim()
            : "Not available",
        ],
        [
          "Remaining Quantity",
          batch.remainingQuantity != null
            ? `${batch.remainingQuantity} ${batch.unit || ""}`.trim()
            : "Not available",
        ],
        ["Received By", batch.receivedBy?.name],
        ["Received By Email", batch.receivedBy?.email],
      ]
    : [];

  const cardStyle = {
    padding: "16px",
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "10px",
    overflowWrap: "anywhere",
  };

  if (loading) {
    return <div style={{ padding: "24px" }}>Loading batch details...</div>;
  }

  if (error) {
    return (
      <div style={{ padding: "24px" }}>
        <h2>Unable to open batch</h2>
        <p>{error}</p>
        <Link to="/stock">Back to Stock Batches</Link>
      </div>
    );
  }

  if (!batch) {
    return (
      <div style={{ padding: "24px" }}>
        <h2>Batch not found</h2>
        <Link to="/stock">Back to Stock Batches</Link>
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: "1100px",
        margin: "0 auto",
        padding: "24px",
        color: "#0f172a",
      }}
    >
      <div style={{ marginBottom: "24px" }}>
        <Link to="/stock">← Back to Stock Batches</Link>
        <h1 style={{ marginBottom: "8px" }}>Stock Batch Traceability</h1>
        <p style={{ color: "#64748b" }}>
          Batch source, receipt information and current stock status.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "14px",
          marginBottom: "28px",
        }}
      >
        <div style={cardStyle}>
          <p style={{ color: "#64748b", marginTop: 0 }}>Batch Number</p>
          <strong>{batch.batchNumber || "Not available"}</strong>
        </div>

        <div style={cardStyle}>
          <p style={{ color: "#64748b", marginTop: 0 }}>Quality Status</p>
          <strong>{batch.qualityStatus || "Not available"}</strong>
        </div>

        <div style={cardStyle}>
          <p style={{ color: "#64748b", marginTop: 0 }}>Stock Status</p>
          <strong>{batch.status || "Not available"}</strong>
        </div>

        <div style={cardStyle}>
          <p style={{ color: "#64748b", marginTop: 0 }}>Remaining Stock</p>
          <strong>
            {batch.remainingQuantity ?? "Not available"} {batch.unit || ""}
          </strong>
        </div>
      </div>

      <h2>Batch Information</h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "14px",
        }}
      >
        {details.map(([label, value]) => (
          <div key={label} style={cardStyle}>
            <div style={{ color: "#64748b", fontSize: "13px", marginBottom: "8px" }}>
              {label}
            </div>
            <strong>
              {value !== null && value !== undefined && value !== ""
                ? value
                : "Not available"}
            </strong>
          </div>
        ))}
      </div>

      <h2 style={{ marginTop: "28px" }}>Notes</h2>
      <div style={cardStyle}>
        {batch.notes || "No notes recorded for this batch."}
      </div>

      <p style={{ color: "#64748b", fontSize: "13px", marginTop: "24px" }}>
        Movement and allocation history has not yet been added to this page.
      </p>
    </div>
  );
}

export default StockBatchDetails;
