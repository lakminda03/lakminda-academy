import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/auth.jsx";

export default function Login() {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [resending, setResending] = useState(false);
  const [showResend, setShowResend] = useState(false);
  const { login, register, resendVerification } = useAuth();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setShowResend(false);
    try {
      if (mode === "register") {
        if (form.password.length < 8) {
          setError("Password must be at least 8 characters");
          return;
        }
        const data = await register(form.name, form.email, form.password);
        setSuccess(data.message || "Registration successful. Check your email for verification.");
        setMode("login");
        setForm((prev) => ({ ...prev, password: "" }));
        return;
      } else {
        await login(form.email, form.password);
      }
      navigate("/dashboard");
    } catch (err) {
      if (err.data?.code === "EMAIL_NOT_VERIFIED") {
        setShowResend(true);
      }
      setError(err.message || "Failed to authenticate");
    }
  };

  const onResend = async () => {
    try {
      setResending(true);
      setError("");
      const data = await resendVerification(form.email);
      setSuccess(data.message || "Verification email sent.");
      setShowResend(false);
    } catch (err) {
      setError(err.message || "Failed to resend verification email");
    } finally {
      setResending(false);
    }
  };

  return (
    <main className="page auth">
      <div className="card auth__card">
        <div className="auth__tabs">
          <button className={mode === "login" ? "active" : ""} onClick={() => setMode("login")}
            type="button">
            Sign In
          </button>
          <button className={mode === "register" ? "active" : ""} onClick={() => setMode("register")}
            type="button">
            Sign Up
          </button>
        </div>
        <form className="form" onSubmit={submit}>
          {mode === "register" && (
            <input
              placeholder="Full name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          )}
          <input
            placeholder="Email address"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <div className="password-field">
            <input
              placeholder="Password (min 8 chars)"
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
            <button
              type="button"
              className="password-field__toggle"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
          {error && <div className="error">{error}</div>}
          {success && <div className="success">{success}</div>}
          <button className="btn btn--primary" type="submit">
            {mode === "login" ? "Sign In" : "Create Account"}
          </button>
          {mode === "login" && (
            <Link className="auth__link" to="/forgot-password">
              Forgot password?
            </Link>
          )}
          {showResend && (
            <button className="btn btn--ghost" type="button" onClick={onResend} disabled={resending}>
              {resending ? "Sending..." : "Resend Verification Email"}
            </button>
          )}
        </form>
      </div>
    </main>
  );
}
