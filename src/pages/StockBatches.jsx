import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { apiRequest } from "../services/api";

export default function StockBatches({ user }) {
  const [batches, setBatches] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [qualityStatus, setQualityStatus] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [retryCount, setRetryCount] = useState(0);
  const [actionId, setActionId] = useState("");

  const [qrBatch, setQrBatch] = useState(null);
  const [qrImage, setQrImage] = useState("");
  const [qrLoading, setQrLoading] = useState(false);
  const [qrError, setQrError] = useState("");

  const role = user?.role;

  const canReviewQuality = [
    "admin",
    "godown_manager",
    "approver",
  ].includes(role);

  useEffect(() => {
    let cancelled = false;

    const fetchBatches = async () => {
      setLoading(true);
      setError("");

      try {
        const params = new URLSearchParams({
          page: String(page),
          limit: "20",
        });

        if (qualityStatus) {
          params.set("qualityStatus", qualityStatus);
        }

        if (status) {
          params.set("status", status);
        }

        const data = await apiRequest(
          `/api/stock/batches?${params.toString()}`
        );

        if (cancelled) return;

        setBatches(data.batches || []);
        setPagination(
          data.pagination || {
            total: 0,
            page: 1,
            limit: 20,
            totalPages: 0,
          }
        );
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Failed to load stock batches.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchBatches();

    return () => {
      cancelled = true;
    };
  }, [page, qualityStatus, status, retryCount]);

  const formatDate = (date) => {
    if (!date) return "—";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) return "—";

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatQuantity = (quantity) => {
    if (quantity === undefined || quantity === null) {
      return "—";
    }

    return Number(quantity).toLocaleString("en-IN", {
      maximumFractionDigits: 3,
    });
  };

  const getStatusClass = (value) => {
    switch (value) {
      case "approved":
      case "available":
        return "status-approved";

      case "pending":
        return "status-pending";

      case "hold":
      case "blocked":
        return "status-hold";

      case "rejected":
      case "depleted":
        return "status-rejected";

      default:
        return "";
    }
  };

  const handleQualityApproval = async (batch) => {
    setError("");
    setSuccess("");

    try {
      setActionId(batch._id);

      const result = await apiRequest(
        `/api/stock/batches/${batch._id}/quality`,
        {
          method: "PATCH",
          body: JSON.stringify({
            qualityStatus: "approved",
          }),
        }
      );

      setSuccess(
        result.message || "Batch quality approved successfully."
      );

      setRetryCount((current) => current + 1);
    } catch (err) {
      setError(err.message || "Failed to approve batch quality.");
    } finally {
      setActionId("");
    }
  };

  const handleGenerateQR = async (batch) => {
    setQrBatch(batch);
    setQrImage("");
    setQrError("");
    setQrLoading(true);

    try {
      const batchUrl =
        `${window.location.origin}/stock/${batch._id}`;

      const image = await QRCode.toDataURL(batchUrl, {
        width: 260,
        margin: 2,
        errorCorrectionLevel: "M",
      });

      setQrImage(image);
    } catch {
      setQrError("Failed to generate QR code.");
    } finally {
      setQrLoading(false);
    }
  };

  const handleDownloadQR = () => {
    if (!qrImage || !qrBatch) return;

    const link = document.createElement("a");
    link.href = qrImage;
    link.download = `${qrBatch.batchNumber}-QR.png`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const closeQR = () => {
    setQrBatch(null);
    setQrImage("");
    setQrError("");
    setQrLoading(false);
  };

  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">INVENTORY OPERATIONS</span>
          <h1>Stock Batches</h1>
          <p>
            View commodity stock batches, quality status and
            available quantities.
          </p>
        </div>
      </div>

      {error && (
        <div className="panel challan-message error" role="alert">
          <p>{error}</p>
          <button
            type="button"
            onClick={() => setRetryCount((current) => current + 1)}
          >
            Retry
          </button>
        </div>
      )}

      {success && (
        <div className="panel challan-message success" role="status">
          <p>{success}</p>
        </div>
      )}

      <div className="panel">
        <div className="panel-heading">
          <div>
            <h3>Stock Batch Inventory</h3>
            <p>
              {pagination.total} batch
              {pagination.total === 1 ? "" : "es"} found
            </p>
          </div>

          <div className="stock-filters">
            <select
              value={qualityStatus}
              onChange={(e) => {
                setQualityStatus(e.target.value);
                setPage(1);
              }}
              aria-label="Filter by quality status"
            >
              <option value="">All Quality Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="hold">On Hold</option>
              <option value="rejected">Rejected</option>
            </select>

            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              aria-label="Filter by batch status"
            >
              <option value="">All Batch Statuses</option>
              <option value="available">Available</option>
              <option value="blocked">Blocked</option>
              <option value="depleted">Depleted</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="stock-message">
            Loading stock batches...
          </div>
        ) : error && batches.length === 0 ? (
          <div className="stock-message stock-error">
            <p>Unable to load stock batches.</p>
          </div>
        ) : batches.length === 0 ? (
          <div className="stock-message">
            <h3>No stock batches found</h3>
            <p>
              There are no batches matching the selected filters.
            </p>
          </div>
        ) : (
          <>
            <div className="stock-table-wrapper">
              <table className="stock-table">
                <thead>
                  <tr>
                    <th>Batch Number</th>
                    <th>Commodity</th>
                    <th>Supplier</th>
                    <th>Godown</th>
                    <th>Received</th>
                    <th>Remaining</th>
                    <th>Receipt Date</th>
                    <th>Quality</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {batches.map((batch) => (
                    <tr key={batch._id}>
                      <td>
                        <strong>{batch.batchNumber || "—"}</strong>
                      </td>

                      <td>{batch.commodity?.name || "—"}</td>
                      <td>{batch.supplier?.name || "—"}</td>
                      <td>{batch.godown?.name || "—"}</td>

                      <td>
                        {formatQuantity(batch.quantityReceived)}{" "}
                        {batch.unit || ""}
                      </td>

                      <td>
                        <strong>
                          {formatQuantity(batch.remainingQuantity)}{" "}
                          {batch.unit || ""}
                        </strong>
                      </td>

                      <td>{formatDate(batch.receiptDate)}</td>

                      <td>
                        <span
                          className={`stock-status ${getStatusClass(
                            batch.qualityStatus
                          )}`}
                        >
                          {batch.qualityStatus || "Unknown"}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`stock-status ${getStatusClass(
                            batch.status
                          )}`}
                        >
                          {batch.status || "Unknown"}
                        </span>
                      </td>

                      <td>
                        <div className="stock-actions">
                          <button
                            type="button"
                            onClick={() => handleGenerateQR(batch)}
                          >
                            View QR
                          </button>

                          {canReviewQuality &&
                            batch.qualityStatus === "pending" && (
                              <button
                                type="button"
                                disabled={Boolean(actionId)}
                                onClick={() =>
                                  handleQualityApproval(batch)
                                }
                              >
                                {actionId === batch._id
                                  ? "Approving..."
                                  : "Approve Quality"}
                              </button>
                            )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="stock-pagination">
              <span>
                Page {pagination.page} of{" "}
                {Math.max(pagination.totalPages, 1)}
              </span>

              <div>
                <button
                  type="button"
                  disabled={page <= 1 || loading}
                  onClick={() =>
                    setPage((current) => current - 1)
                  }
                >
                  Previous
                </button>

                <button
                  type="button"
                  disabled={
                    page >= pagination.totalPages || loading
                  }
                  onClick={() =>
                    setPage((current) => current + 1)
                  }
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {qrBatch && (
        <div
          className="panel qr-panel"
          role="dialog"
          aria-modal="true"
          aria-labelledby="qr-heading"
        >
          <div className="panel-heading">
            <div>
              <h3 id="qr-heading">Batch QR Code</h3>
              <p>
                Batch: <strong>{qrBatch.batchNumber}</strong>
              </p>
            </div>

            <button type="button" onClick={closeQR}>
              Close
            </button>
          </div>

          {qrLoading && <p>Generating QR code...</p>}

          {qrError && (
            <p className="stock-error" role="alert">
              {qrError}
            </p>
          )}

          {qrImage && (
            <div className="qr-content">
              <img
                src={qrImage}
                alt={`QR code for ${qrBatch.batchNumber}`}
                width="260"
                height="260"
              />

              <p>
                Scan this code to open the batch traceability page.
              </p>

              <button
                type="button"
                onClick={handleDownloadQR}
              >
                Download QR Code
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
