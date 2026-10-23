import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiRequest } from "../services/api";

function StockBatchDetails() {
  const { batchId } = useParams();

  const [batch, setBatch] = useState(null);
  const [movementHistory, setMovementHistory] = useState([]);
  const [allocationHistory, setAllocationHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function fetchBatch() {
      try {
        setLoading(true);
        setError("");

        const data = await apiRequest(`/api/stock/batches/${batchId}`);

        if (cancelled) return;

        if (data?.success && data.batch) {
          setBatch(data.batch);
          setMovementHistory(
            Array.isArray(data.movementHistory) ? data.movementHistory : []
          );
          setAllocationHistory(
            Array.isArray(data.allocationHistory) ? data.allocationHistory : []
          );
        } else {
          setError(data?.message || "Batch details not found.");
        }
      } catch (err) {
        if (!cancelled) {
          setError(err?.message || "Unable to load batch details.");
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

  const formatDateTime = (date) => {
    if (!date) return "Not available";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Not available";
    }

    return parsedDate.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const displayValue = (value) => {
    if (value === null || value === undefined || value === "") {
      return "Not available";
    }

    if (typeof value === "object") {
      return value.name || value.challanNumber || "Not available";
    }

    return value;
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

  const sectionStyle = {
    marginTop: "28px",
    marginBottom: "14px",
  };

  const tableWrapperStyle = {
    overflowX: "auto",
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "10px",
  };

  const tableStyle = {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "700px",
  };

  const headerCellStyle = {
    textAlign: "left",
    padding: "12px",
    background: "#f1f5f9",
    borderBottom: "1px solid #e2e8f0",
    fontSize: "13px",
    whiteSpace: "nowrap",
  };

  const cellStyle = {
    textAlign: "left",
    padding: "12px",
    borderBottom: "1px solid #e2e8f0",
    fontSize: "14px",
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
            <div
              style={{
                color: "#64748b",
                fontSize: "13px",
                marginBottom: "8px",
              }}
            >
              {label}
            </div>
            <strong>{displayValue(value)}</strong>
          </div>
        ))}
      </div>

      <h2 style={sectionStyle}>Notes</h2>
      <div style={cardStyle}>
        {batch.notes || "No notes recorded for this batch."}
      </div>

      <h2 style={sectionStyle}>Stock Movement History</h2>
      <p style={{ color: "#64748b" }}>
        Record of stock received, dispatched or otherwise moved for this batch.
      </p>

      {movementHistory.length === 0 ? (
        <div style={cardStyle}>No stock movement records found for this batch.</div>
      ) : (
        <div style={tableWrapperStyle}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={headerCellStyle}>Date</th>
                <th style={headerCellStyle}>Movement</th>
                <th style={headerCellStyle}>Direction</th>
                <th style={headerCellStyle}>Quantity</th>
                <th style={headerCellStyle}>Challan</th>
                <th style={headerCellStyle}>Performed By</th>
                <th style={headerCellStyle}>Reason</th>
              </tr>
            </thead>
            <tbody>
              {movementHistory.map((movement, index) => (
                <tr key={movement._id || index}>
                  <td style={cellStyle}>{formatDateTime(movement.createdAt)}</td>
                  <td style={cellStyle}>{displayValue(movement.movementType)}</td>
                  <td style={cellStyle}>{displayValue(movement.direction)}</td>
                  <td style={cellStyle}>
                    {movement.quantity ?? "Not available"}{" "}
                    {movement.unit || ""}
                  </td>
                  <td style={cellStyle}>
                    {movement.challan?.challanNumber || "—"}
                    {movement.challan?.status
                      ? ` (${movement.challan.status})`
                      : ""}
                  </td>
                  <td style={cellStyle}>
                    {movement.performedBy?.name || "Not available"}
                  </td>
                  <td style={cellStyle}>{displayValue(movement.reason)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <h2 style={sectionStyle}>FIFO Allocation History</h2>
      <p style={{ color: "#64748b" }}>
        Delivery challans that used stock from this batch.
      </p>

      {allocationHistory.length === 0 ? (
        <div style={cardStyle}>
          No dispatched or delivered challans have used this batch yet.
        </div>
      ) : (
        <div style={tableWrapperStyle}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={headerCellStyle}>Challan Number</th>
                <th style={headerCellStyle}>Status</th>
                <th style={headerCellStyle}>FPS</th>
                <th style={headerCellStyle}>Godown</th>
                <th style={headerCellStyle}>Commodity</th>
                <th style={headerCellStyle}>Requested</th>
                <th style={headerCellStyle}>Allocated From Batch</th>
                <th style={headerCellStyle}>Dispatch Date</th>
                <th style={headerCellStyle}>Delivery Date</th>
              </tr>
            </thead>
            <tbody>
              {allocationHistory.map((allocation, index) => (
                <tr key={`${allocation.challanId || allocation.challanNumber || "allocation"}-${index}`}>
                  <td style={cellStyle}>
                    {displayValue(allocation.challanNumber)}
                  </td>
                  <td style={cellStyle}>
                    {displayValue(allocation.challanStatus)}
                  </td>
                  <td style={cellStyle}>
                    {allocation.fps?.name || "Not available"}
                    {allocation.fps?.fpsCode
                      ? ` (${allocation.fps.fpsCode})`
                      : ""}
                  </td>
                  <td style={cellStyle}>
                    {allocation.godown?.name || "Not available"}
                    {allocation.godown?.godownCode
                      ? ` (${allocation.godown.godownCode})`
                      : ""}
                  </td>
                  <td style={cellStyle}>
                    {allocation.commodity?.name || "Not available"}
                  </td>
                  <td style={cellStyle}>
                    {allocation.requestedQuantity ?? "Not available"}{" "}
                    {allocation.unit || ""}
                  </td>
                  <td style={cellStyle}>
                    {allocation.allocatedQuantity ?? "Not available"}{" "}
                    {allocation.unit || ""}
                  </td>
                  <td style={cellStyle}>
                    {formatDateTime(allocation.dispatchedAt)}
                  </td>
                  <td style={cellStyle}>
                    {formatDateTime(allocation.deliveredAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p style={{ color: "#64748b", fontSize: "13px", marginTop: "24px" }}>
        History is based on recorded stock movements and dispatched or delivered
        challans.
      </p>
    </div>
  );
}

export default StockBatchDetails;