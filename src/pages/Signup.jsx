import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Wheat } from "lucide-react";
import { apiRequest } from "../services/api";

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "operator",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function updateField(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (form.password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setSubmitting(true);

    try {
      await apiRequest("/auth/signup", {
        method: "POST",
        body: JSON.stringify(form),
      });

      setSuccess("Account created. You can now sign in.");
      setTimeout(() => navigate("/login"), 1000);
    } catch (err) {
      setError(err.message || "Signup failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="auth-page signup-page">
      <section className="auth-brand-panel">
        <div className="brand-lockup">
          <span className="brand-mark"><Wheat size={27} /></span>
          <span>GrainFlow<small>iPDS MANAGEMENT</small></span>
        </div>
        <div className="brand-message">
          <span className="eyebrow-light">ONE CONNECTED WORKSPACE</span>
          <h1>Manage stock<br />with confidence.</h1>
          <p>Track commodity receipts, quality approvals and FIFO dispatches in one place.</p>
        </div>
        <div className="auth-brand-footer">Transparent inventory · Reliable records</div>
      </section>

      <section className="auth-form-panel">
        <div className="auth-form-wrap">
          <div className="mobile-brand">
            <span className="brand-mark"><Wheat size={23} /></span>
            <strong>GrainFlow</strong>
          </div>

          <span className="eyebrow">GET STARTED</span>
          <h2>Create an account</h2>
          <p className="auth-description">
            Register for access to the inventory workspace.
          </p>

          <form onSubmit={handleSubmit} className="auth-form">
            <label>
              Full name
              <input
                name="name"
                value={form.name}
                onChange={updateField}
                placeholder="Your full name"
                autoComplete="name"
                required
              />
            </label>

            <label>
              Email address
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={updateField}
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </label>

            <label>
              Password
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={updateField}
                placeholder="At least 8 characters"
                autoComplete="new-password"
                minLength={8}
                required
              />
            </label>

            <label>
              Account role
              <select name="role" value={form.role} onChange={updateField}>
                <option value="operator">Operator</option>
                <option value="godown_manager">Godown Manager</option>
              </select>
            </label>

            {error && <div className="form-error">{error}</div>}
            {success && <div className="form-success">{success}</div>}

            <button className="primary-button auth-submit" disabled={submitting}>
              {submitting ? "Creating account..." : "Create account"}
              {!submitting && <ArrowRight size={17} />}
            </button>
          </form>

          <p className="auth-switch">
            Already registered? <Link to="/login">Sign in</Link>
          </p>
          <p className="auth-security">Only authorized roles can access protected operations.</p>
        </div>
      </section>
    </main>
  );
}