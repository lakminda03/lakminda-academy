import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/auth.jsx";

export default function ForgotPassword() {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [sending, setSending] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      setSending(true);
      const data = await forgotPassword(email);
      setSuccess(data.message || "If that account exists, a reset link has been sent.");
    } catch (err) {
      setError(err.message || "Failed to request password reset");
    } finally {
      setSending(false);
    }
  };

  return (
    <main className="page auth">
      <div className="card auth__card">
        <h3>Forgot Password</h3>
        <form className="form" onSubmit={submit}>
          <input
            placeholder="Email address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          {error && <div className="error">{error}</div>}
          {success && <div className="success">{success}</div>}
          <button className="btn btn--primary" type="submit" disabled={sending}>
            {sending ? "Sending..." : "Send Reset Link"}
          </button>
          <Link className="auth__link" to="/login">
            Back to Sign In
          </Link>
        </form>
      </div>
    </main>
  );
}
