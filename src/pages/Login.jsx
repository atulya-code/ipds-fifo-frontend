import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Eye, EyeOff, Wheat } from "lucide-react";
import { apiRequest } from "../services/api";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const data = await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      onLogin(data.user);
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-brand-panel">
        <div className="brand-lockup">
          <span className="brand-mark"><Wheat size={27} /></span>
          <span>GrainFlow<small>iPDS MANAGEMENT</small></span>
        </div>

        <div className="brand-message">
          <span className="eyebrow-light">SMART PUBLIC DISTRIBUTION</span>
          <h1>Every grain.<br />Accounted for.</h1>
          <p>
            Intelligent FIFO inventory management for transparent,
            traceable and efficient public food distribution.
          </p>
        </div>

        <div className="auth-brand-footer">
          <span>Inventory control</span>
          <span>·</span>
          <span>FIFO allocation</span>
          <span>·</span>
          <span>Full traceability</span>
        </div>
      </section>

      <section className="auth-form-panel">
        <div className="auth-form-wrap">
          <div className="mobile-brand">
            <span className="brand-mark"><Wheat size={23} /></span>
            <strong>GrainFlow</strong>
          </div>

          <span className="eyebrow">WELCOME BACK</span>
          <h2>Sign in to your account</h2>
          <p className="auth-description">
            Enter your credentials to access your workspace.
          </p>

          <form onSubmit={handleSubmit} className="auth-form">
            <label>
              Email address
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </label>

            <label>
              Password
              <span className="password-input">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </span>
            </label>

            {error && <div className="form-error">{error}</div>}

            <button className="primary-button auth-submit" disabled={submitting}>
              {submitting ? "Signing in..." : "Sign in"}
              {!submitting && <ArrowRight size={17} />}
            </button>
          </form>

          <p className="auth-switch">
            Don't have an account? <Link to="/signup">Create account</Link>
          </p>

          <p className="auth-security">Secure access · Authorized personnel only</p>
        </div>
      </section>
    </main>
  );
}