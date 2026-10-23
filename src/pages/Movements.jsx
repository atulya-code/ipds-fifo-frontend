
import { useEffect, useState } from "react";
import { apiRequest } from "../services/api";

export default function Movements() {
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMovements = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await apiRequest("/api/movements");

        const list = Array.isArray(data)
          ? data
          : data.movements || data.data || [];

        setMovements(list);
      } catch (err) {
        setError(err.message || "Failed to load stock movements.");
      } finally {
        setLoading(false);
      }
    };

    fetchMovements();
  }, []);

  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">INVENTORY OPERATIONS</span>
          <h1>Stock Movements</h1>
          <p>
            Track commodity receipts, dispatches and stock adjustments.
          </p>
        </div>
      </div>

      <div className="panel">
        <h3>Stock Movement History</h3>

        {loading ? (
          <p>Loading stock movements...</p>
        ) : error ? (
          <p role="alert">Unable to load movements: {error}</p>
        ) : movements.length === 0 ? (
          <p>No stock movements found.</p>
        ) : (
          <>
            <p>{movements.length} movement(s) found</p>

            <div style={{ overflowX: "auto" }}>
              <table>
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Commodity</th>
                    <th>Batch</th>
                    <th>Godown</th>
                    <th>Quantity</th>
                    <th>Direction</th>
                    <th>Reason</th>
                    <th>Date</th>
                  </tr>
                </thead>

                <tbody>
                  {movements.map((movement) => (
                    <tr key={movement._id}>
                      <td>{movement.movementType || "—"}</td>
                      <td>
                        {movement.commodity?.name ||
                          movement.commodity?.commodityName ||
                          movement.commodity?.commodityCode ||
                          "—"}
                      </td>
                      <td>
                        {movement.batch?.batchNumber || "—"}
                      </td>
                      <td>
                        {movement.godown?.name ||
                          movement.godown?.godownName ||
                          "—"}
                      </td>
                      <td>
                        {movement.quantity ?? "—"}{" "}
                        {movement.unit || ""}
                      </td>
                      <td>{movement.direction || "—"}</td>
                      <td>{movement.reason || "—"}</td>
                      <td>
                        {movement.createdAt
                          ? new Date(
                              movement.createdAt
                            ).toLocaleDateString("en-IN")
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
