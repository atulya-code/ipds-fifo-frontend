
import { useEffect, useState } from "react";
import { apiRequest } from "../services/api";

export default function Challans({ user }) {
  const [challans, setChallans] = useState([]);
  const [commodities, setCommodities] = useState([]);
  const [fpsList, setFpsList] = useState([]);

  const [fps, setFps] = useState("");
  const [commodity, setCommodity] = useState("");
  const [quantity, setQuantity] = useState("");
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(true);
  const [optionsLoading, setOptionsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [actionId, setActionId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const role = user?.role;

  const fetchChallans = async () => {
    const data = await apiRequest("/api/challans");
    const list = Array.isArray(data)
      ? data
      : data.challans || data.data || [];

    setChallans(list);
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setOptionsLoading(true);
        setError("");

        const [challanData, commodityData, fpsData] =
          await Promise.all([
            apiRequest("/api/challans"),
            apiRequest("/api/reference/commodities"),
            apiRequest("/api/reference/fps"),
          ]);

        const challanList = Array.isArray(challanData)
          ? challanData
          : challanData.challans || challanData.data || [];

        setChallans(challanList);
        setCommodities(commodityData.commodities || []);
        setFpsList(fpsData.fpsList || []);
      } catch (err) {
        setError(err.message || "Failed to load challan data.");
      } finally {
        setLoading(false);
        setOptionsLoading(false);
      }
    };

    loadData();
  }, []);

  const handleCreateChallan = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!fps || !commodity || !quantity) {
      setError("Please select an FPS, commodity and quantity.");
      return;
    }

    const selectedCommodity = commodities.find(
      (item) => item._id === commodity
    );

    if (!selectedCommodity) {
      setError("Please select a valid commodity.");
      return;
    }

    if (!Number.isFinite(Number(quantity)) || Number(quantity) <= 0) {
      setError("Quantity must be greater than zero.");
      return;
    }

    try {
      setSubmitting(true);

      const result = await apiRequest("/api/challans", {
        method: "POST",
        body: JSON.stringify({
          fps,
          items: [
            {
              commodity,
              requestedQuantity: Number(quantity),
              unit: selectedCommodity.defaultUnit,
            },
          ],
          notes: notes.trim(),
        }),
      });

      setSuccess(result.message || "Draft challan created successfully.");

      setFps("");
      setCommodity("");
      setQuantity("");
      setNotes("");

      await fetchChallans();
    } catch (err) {
      setError(err.message || "Failed to create challan.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleChallanAction = async (challan, action) => {
    setError("");
    setSuccess("");

    try {
      setActionId(`${challan._id}-${action}`);

      const result = await apiRequest(
        `/api/challans/${challan._id}/${action}`,
        { method: "PATCH" }
      );

      await fetchChallans();

      const actionMessages = {
        approve: "Challan approved successfully.",
        dispatch: "Challan dispatched successfully.",
        deliver: "Challan marked as delivered successfully.",
      };

      setSuccess(
        result.message || actionMessages[action] || "Action completed."
      );
    } catch (err) {
      setError(err.message || `Failed to ${action} challan.`);
    } finally {
      setActionId("");
    }
  };

  const getActions = (challan) => {
    const status = String(challan.status || "").toLowerCase();
    const actions = [];

    if (
      status === "draft" &&
      ["admin", "approver"].includes(role)
    ) {
      actions.push({
        key: "approve",
        label: "Approve",
        className: "challan-action-approve",
      });
    }

    if (
      status === "approved" &&
      ["admin", "godown_manager"].includes(role)
    ) {
      actions.push({
        key: "dispatch",
        label: "Dispatch",
        className: "challan-action-dispatch",
      });
    }

    if (
      ["dispatched", "in_transit"].includes(status) &&
      ["admin", "godown_manager", "operator"].includes(role)
    ) {
      actions.push({
        key: "deliver",
        label: "Mark Delivered",
        className: "challan-action-deliver",
      });
    }

    return actions;
  };

  const canCreate = ["admin", "godown_manager", "operator"].includes(role);

  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">INVENTORY OPERATIONS</span>
          <h1>Delivery Challans</h1>
          <p>
            Create delivery challans and track FIFO stock dispatches.
          </p>
        </div>
      </div>

      {error && (
        <div className="panel challan-message error" role="alert">
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="panel challan-message success" role="status">
          <p>{success}</p>
        </div>
      )}

      {canCreate && (
        <div className="panel challan-create-panel">
          <div className="challan-create-header">
            <div className="challan-create-icon">
              <span style={{ fontSize: "23px" }}>＋</span>
            </div>

            <div>
              <h3>Create Delivery Challan</h3>
              <p>
                Request commodity stock for an FPS. FIFO allocation is
                previewed before dispatch, and stock is not deducted
                when the draft is created.
              </p>
            </div>
          </div>

          {optionsLoading ? (
            <p>Loading FPS shops and commodities...</p>
          ) : (
            <form className="challan-form" onSubmit={handleCreateChallan}>
              <div className="form-group">
                <label htmlFor="fps">Fair Price Shop (FPS)</label>

                <select
                  id="fps"
                  value={fps}
                  onChange={(event) => setFps(event.target.value)}
                  required
                >
                  <option value="">Select an FPS</option>
                  {fpsList.map((item) => (
                    <option key={item._id} value={item._id}>
                      {item.fpsCode} - {item.name} ({item.district})
                    </option>
                  ))}
                </select>

                {fpsList.length === 0 && (
                  <p className="challan-unit-hint">
                    No active FPS shops found.
                  </p>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="commodity">Commodity</label>

                <select
                  id="commodity"
                  value={commodity}
                  onChange={(event) => {
                    setCommodity(event.target.value);
                    setQuantity("");
                  }}
                  required
                >
                  <option value="">Select a commodity</option>
                  {commodities.map((item) => (
                    <option key={item._id} value={item._id}>
                      {item.name.replace("_", " ")} ({item.defaultUnit})
                    </option>
                  ))}
                </select>

                {commodities.length === 0 && (
                  <p className="challan-unit-hint">
                    No active commodities found. Check the commodities API.
                  </p>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="quantity">
                  Requested Quantity
                  {commodity &&
                    ` (${
                      commodities.find((item) => item._id === commodity)
                        ?.defaultUnit || ""
                    })`}
                </label>

                <input
                  id="quantity"
                  type="number"
                  min="0.01"
                  step="any"
                  value={quantity}
                  onChange={(event) => setQuantity(event.target.value)}
                  placeholder="Enter requested quantity"
                  required
                />

                <p className="challan-unit-hint">
                  Enter the quantity required by the selected FPS.
                </p>
              </div>

              <div className="form-group">
                <label htmlFor="notes">Delivery Notes (Optional)</label>

                <textarea
                  id="notes"
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Add any special delivery instructions..."
                  rows={3}
                />
              </div>

              <div className="challan-form-actions">
                <p className="challan-form-note">
                  <strong>FIFO enabled</strong>
                  <br />
                  Stock will only be deducted when the challan is dispatched.
                </p>

                <button
                  type="submit"
                  disabled={
                    submitting ||
                    fpsList.length === 0 ||
                    commodities.length === 0
                  }
                >
                  {submitting ? "Creating Draft..." : "＋ Create Draft Challan"}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      <div className="panel">
        <h3>Delivery Challan History</h3>

        {loading ? (
          <p>Loading delivery challans...</p>
        ) : challans.length === 0 ? (
          <p>No delivery challans found.</p>
        ) : (
          <>
            <p>{challans.length} challan(s) found</p>

            <div className="challan-table-wrapper">
              <table className="challan-table">
                <thead>
                  <tr>
                    <th>Challan Number</th>
                    <th>Godown</th>
                    <th>FPS</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Items</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {challans.map((challan) => {
                    const actions = getActions(challan);

                    return (
                      <tr key={challan._id}>
                        <td>{challan.challanNumber || challan._id}</td>

                        <td>
                          {challan.godown?.name ||
                            challan.godown?.godownName ||
                            "—"}
                        </td>

                        <td>
                          {challan.fps?.name ||
                            challan.fps?.fpsCode ||
                            "—"}
                        </td>

                        <td>
                          <span
                            className={`challan-status status-${String(
                              challan.status || ""
                            ).toLowerCase()}`}
                          >
                            {challan.status || "—"}
                          </span>
                        </td>

                        <td>
                          {challan.createdAt
                            ? new Date(challan.createdAt).toLocaleDateString(
                                "en-IN"
                              )
                            : "—"}
                        </td>

                        <td>
                          {Array.isArray(challan.items)
                            ? challan.items
                                .map((item) => {
                                  const name =
                                    item.commodity?.name ||
                                    item.commodity?.commodityName ||
                                    "Commodity";

                                  const qty =
                                    item.requestedQuantity ??
                                    item.quantity ??
                                    "—";

                                  return `${name}: ${qty} ${item.unit || ""}`;
                                })
                                .join(", ")
                            : "—"}
                        </td>

                        <td>
                          {actions.length === 0 ? (
                            <span>—</span>
                          ) : (
                            <div className="challan-row-actions">
                              {actions.map((action) => {
                                const busy =
                                  actionId === `${challan._id}-${action.key}`;

                                return (
                                  <button
                                    key={action.key}
                                    type="button"
                                    className={action.className}
                                    disabled={Boolean(actionId)}
                                    onClick={() =>
                                      handleChallanAction(
                                        challan,
                                        action.key
                                      )
                                    }
                                  >
                                    {busy
                                      ? "Please wait..."
                                      : action.label}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
