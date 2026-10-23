
import { useEffect, useState } from "react";
import {
  Package,
  Boxes,
  RefreshCw,
  AlertCircle,
  ArrowRight,
  Warehouse,
  Clock,
  BarChart3,
} from "lucide-react";
import { Link } from "react-router-dom";
import { apiRequest } from "../services/api";

export default function Dashboard({ user }) {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadDashboard() {
    setLoading(true);
    setError("");

    try {
      const data = await apiRequest("/api/dashboard");
      setDashboard(data);
    } catch (err) {
      setError(err.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  const summary = dashboard?.summary;

  const metrics = [
    {
      title: "Total Stock Batches",
      value: loading ? "..." : summary?.totalBatches ?? 0,
      note: "Eligible stock batches",
      icon: Package,
      color: "blue",
    },
    {
      title: "Available Quantity",
      value: loading
        ? "..."
        : summary
          ? Number(summary.totalQuantity || 0).toLocaleString()
          : "—",
      note: "Mixed units may be included",
      icon: Boxes,
      color: "green",
    },
    {
      title: "Commodity Types",
      value: loading
        ? "..."
        : dashboard?.commoditySummary?.length ?? 0,
      note: "Commodities with available stock",
      icon: BarChart3,
      color: "purple",
    },
    {
      title: "FIFO Stock Batches",
      value: loading ? "..." : dashboard?.oldestBatches?.length ?? 0,
      note: "Oldest eligible batches shown",
      icon: Clock,
      color: "amber",
    },
  ];

  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">OVERVIEW</span>
          <h1>Dashboard</h1>
          <p>Monitor stock availability and FIFO allocation.</p>
        </div>

        <button
          className="primary-button heading-action"
          onClick={loadDashboard}
          disabled={loading}
          type="button"
        >
          <RefreshCw size={16} />
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      <section className="welcome-banner">
        <div>
          <span className="welcome-kicker">IPDS STOCK MANAGEMENT</span>
          <h2>Welcome back, {user?.name || "User"}.</h2>
          <p>
            Manage government commodity inventory, monitor available stock,
            and maintain transparent First-In, First-Out allocation.
          </p>
        </div>

        <div className="welcome-icon">
          <Warehouse size={38} />
        </div>
      </section>

      {error && (
        <div className="panel" style={{ marginBottom: 22 }}>
          <div className="panel-heading">
            <h3>
              <AlertCircle
                size={18}
                style={{ verticalAlign: "middle", marginRight: 8 }}
              />
              Dashboard data unavailable
            </h3>
          </div>
          <p>{error}</p>
          {error.toLowerCase().includes("godown") && (
            <p>
              Please ensure your account has an assigned godown.
            </p>
          )}
          <button
            className="primary-button"
            onClick={loadDashboard}
            type="button"
          >
            Try again
          </button>
        </div>
      )}

      <section className="metrics-grid">
        {metrics.map((metric) => {
          const Icon = metric.icon;

          return (
            <div className="metric-card" key={metric.title}>
              <div className="metric-card-top">
                <div className={`metric-icon ${metric.color}`}>
                  <Icon size={21} />
                </div>
                <Package size={16} className="metric-arrow" />
              </div>

              <p className="metric-title">{metric.title}</p>
              <h2 className="metric-value">{metric.value}</h2>
              <p className="metric-note">{metric.note}</p>
            </div>
          );
        })}
      </section>

      <section className="dashboard-lower-grid">
        <div className="panel">
          <div className="panel-heading">
            <div>
              <h3>Commodity Summary</h3>
              <p>Available quantity by commodity</p>
            </div>
            <Boxes size={19} />
          </div>

          {loading ? (
            <p>Loading commodity data...</p>
          ) : dashboard?.commoditySummary?.length ? (
            <div style={{ overflowX: "auto" }}>
              <table>
                <thead>
                  <tr>
                    <th>Commodity</th>
                    <th>Quantity</th>
                    <th>Unit</th>
                    <th>Batches</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboard.commoditySummary.map((item) => (
                    <tr key={item.commodityId}>
                      <td>{item.commodityName}</td>
                      <td>{Number(item.totalQuantity).toLocaleString()}</td>
                      <td>{item.unit}</td>
                      <td>{item.batchCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>
              {error
                ? "Commodity data could not be loaded."
                : "No approved stock is currently available for this godown."}
            </p>
          )}
        </div>

        <div className="panel">
          <div className="panel-heading">
            <div>
              <h3>FIFO Allocation</h3>
              <p>Oldest eligible stock batches first</p>
            </div>
            <span className="fifo-badge">FIFO</span>
          </div>

          <div className="fifo-steps">
            <div className="fifo-step">
              <span className="fifo-step-number">01</span>
              <div>
                <strong>Check stock eligibility</strong>
                <p>Only approved batches with available quantity are included.</p>
              </div>
            </div>

            <div className="fifo-step">
              <span className="fifo-step-number">02</span>
              <div>
                <strong>Prioritize older batches</strong>
                <p>Eligible stock is considered in FIFO order.</p>
              </div>
            </div>

            <div className="fifo-step">
              <span className="fifo-step-number">03</span>
              <div>
                <strong>Track stock movements</strong>
                <p>Dispatch records help maintain inventory traceability.</p>
              </div>
            </div>
          </div>

          <Link className="text-link" to="/stock">
            View stock batches <ArrowRight size={15} />
          </Link>
        </div>
      </section>

      {dashboard && (
        <section className="panel" style={{ marginTop: 20 }}>
          <div className="panel-heading">
            <div>
              <h3>Oldest Stock Batches</h3>
              <p>Review stock in FIFO priority order</p>
            </div>
            <Clock size={19} />
          </div>

          {dashboard.oldestBatches?.length ? (
            <div style={{ overflowX: "auto" }}>
              <table>
                <thead>
                  <tr>
                    <th>Batch</th>
                    <th>Commodity</th>
                    <th>Receipt Date</th>
                    <th>Age (days)</th>
                    <th>Remaining</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboard.oldestBatches.map((batch) => (
                    <tr key={batch._id}>
                      <td>{batch.batchNumber || "—"}</td>
                      <td>{batch.commodity?.name || "—"}</td>
                      <td>
                        {batch.receiptDate
                          ? new Date(batch.receiptDate).toLocaleDateString()
                          : "—"}
                      </td>
                      <td>{batch.ageInDays ?? "—"}</td>
                      <td>
                        {batch.remainingQuantity} {batch.unit}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>No eligible stock batches to display yet.</p>
          )}
        </section>
      )}
    </div>
  );
}
