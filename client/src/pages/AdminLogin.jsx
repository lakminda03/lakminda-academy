import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/auth.jsx";

export default function AdminLogin() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const user = await login(form.email, form.password);
      if (user.role !== "admin") {
        setError("This account is not an admin.");
        return;
      }
      navigate("/admin");
    } catch (err) {
      setError(err.message || "Admin login failed");
    }
  };

  return (
    <main className="page auth">
      <div className="card auth__card">
        <h3>Admin Login</h3>
        <form className="form" onSubmit={submit}>
          <input
            placeholder="Admin email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <input
            placeholder="Password"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
          {error && <div className="error">{error}</div>}
          <button className="btn btn--primary" type="submit">
            Enter Admin
          </button>
        </form>
      </div>
    </main>
  );
}
