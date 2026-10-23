
import { useEffect, useState } from "react";
import { apiRequest } from "../services/api";

function StockReceipt({ user }) {
  const [commodities, setCommodities] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [godowns, setGodowns] = useState([]);

  const [form, setForm] = useState({
    batchNumber: "",
    commodity: "",
    supplier: "",
    godown: "",
    receiptDate: new Date().toISOString().slice(0, 10),
    quantityReceived: "",
    unit: "",
    expiryDate: "",
    notes: "",
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function loadReferenceData() {
      try {
        const [commodityData, supplierData, godownData] =
          await Promise.all([
            apiRequest("/api/reference/commodities"),
            apiRequest("/api/reference/suppliers"),
            apiRequest("/api/reference/godowns"),
          ]);

        setCommodities(commodityData.commodities || []);
        setSuppliers(supplierData.suppliers || []);
        setGodowns(godownData.godowns || []);

        if (godownData.godowns?.length === 1) {
          setForm((prev) => ({
            ...prev,
            godown: godownData.godowns[0]._id,
          }));
        }
      } catch (err) {
        setError(err.message || "Failed to load receipt form data.");
      } finally {
        setLoading(false);
      }
    }

    loadReferenceData();
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((prev) => {
      const updated = { ...prev, [name]: value };

      if (name === "commodity") {
        const selectedCommodity = commodities.find(
          (item) => item._id === value
        );

        updated.unit = selectedCommodity?.defaultUnit || "";
      }

      return updated;
    });

    setError("");
    setSuccess("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!form.commodity || !form.supplier || !form.godown) {
      setError("Please select commodity, supplier and godown.");
      return;
    }

    if (Number(form.quantityReceived) <= 0) {
      setError("Quantity must be greater than zero.");
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        ...form,
        quantityReceived: Number(form.quantityReceived),
        expiryDate: form.expiryDate || undefined,
        notes: form.notes.trim() || undefined,
      };

      const data = await apiRequest("/api/stock/receipt", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setSuccess(
        data.message ||
          "Stock receipt recorded successfully. Quality approval is pending."
      );

      setForm((prev) => ({
        ...prev,
        batchNumber: "",
        quantityReceived: "",
        expiryDate: "",
        notes: "",
      }));
    } catch (err) {
      setError(err.message || "Failed to record stock receipt.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="receipt-page">
        <p>Loading stock receipt form...</p>
      </div>
    );
  }

  return (
    <div className="receipt-page">
      <div className="receipt-heading">
        <div>
          <p className="receipt-eyebrow">INVENTORY MANAGEMENT</p>
          <h1>Stock Receipt</h1>
          <p>Record newly received commodities into a godown.</p>
        </div>
      </div>

      <div className="receipt-card">
        <div className="receipt-card-heading">
          <h2>Receipt Details</h2>
          <p>Fields marked * are required.</p>
        </div>

        {error && <div className="receipt-alert receipt-error">{error}</div>}

        {success && (
          <div className="receipt-alert receipt-success">{success}</div>
        )}

        {godowns.length === 0 ? (
          <div className="receipt-alert receipt-error">
            No active godown is available for your account. Contact an
            administrator to configure your godown assignment.
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="receipt-form-grid">
              <div className="receipt-field">
                <label htmlFor="batchNumber">Batch Number *</label>
                <input
                  id="batchNumber"
                  name="batchNumber"
                  value={form.batchNumber}
                  onChange={handleChange}
                  placeholder="e.g. BATCH-2026-001"
                  required
                />
              </div>

              <div className="receipt-field">
                <label htmlFor="commodity">Commodity *</label>
                <select
                  id="commodity"
                  name="commodity"
                  value={form.commodity}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select commodity</option>
                  {commodities.map((item) => (
                    <option key={item._id} value={item._id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="receipt-field">
                <label htmlFor="supplier">Supplier *</label>
                <select
                  id="supplier"
                  name="supplier"
                  value={form.supplier}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select supplier</option>
                  {suppliers.map((item) => (
                    <option key={item._id} value={item._id}>
                      {item.supplierCode} - {item.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="receipt-field">
                <label htmlFor="godown">Godown *</label>
                <select
                  id="godown"
                  name="godown"
                  value={form.godown}
                  onChange={handleChange}
                  required
                  disabled={user?.role !== "admin" && godowns.length === 1}
                >
                  <option value="">Select godown</option>
                  {godowns.map((item) => (
                    <option key={item._id} value={item._id}>
                      {item.godownCode} - {item.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="receipt-field">
                <label htmlFor="receiptDate">Receipt Date *</label>
                <input
                  id="receiptDate"
                  type="date"
                  name="receiptDate"
                  value={form.receiptDate}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="receipt-field">
                <label htmlFor="quantityReceived">Quantity Received *</label>
                <input
                  id="quantityReceived"
                  type="number"
                  name="quantityReceived"
                  min="0.01"
                  step="any"
                  value={form.quantityReceived}
                  onChange={handleChange}
                  placeholder="Enter quantity"
                  required
                />
              </div>

              <div className="receipt-field">
                <label htmlFor="unit">Unit *</label>
                <select
                  id="unit"
                  name="unit"
                  value={form.unit}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select unit</option>
                  <option value="kg">Kilogram (kg)</option>
                  <option value="quintal">Quintal</option>
                  <option value="tonne">Tonne</option>
                  <option value="litre">Litre</option>
                </select>
              </div>

              <div className="receipt-field">
                <label htmlFor="expiryDate">Expiry Date (optional)</label>
                <input
                  id="expiryDate"
                  type="date"
                  name="expiryDate"
                  value={form.expiryDate}
                  min={form.receiptDate}
                  onChange={handleChange}
                />
              </div>

              <div className="receipt-field receipt-field-full">
                <label htmlFor="notes">Notes (optional)</label>
                <textarea
                  id="notes"
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  placeholder="Enter any additional details"
                  rows="3"
                />
              </div>
            </div>

            <div className="receipt-form-footer">
              <p>
                New stock remains unavailable for FIFO allocation until it
                passes quality approval.
              </p>

              <button
                type="submit"
                className="receipt-submit-button"
                disabled={submitting}
              >
                {submitting ? "Saving Receipt..." : "Record Stock Receipt"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default StockReceipt;
