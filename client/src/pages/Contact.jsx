import React, { useState } from "react";
import { apiRequest } from "../utils/api.js";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);
    try {
      await apiRequest("/api/contact", {
        method: "POST",
        body: JSON.stringify(form),
      });
      setSuccess("Message sent. We will get back to you soon.");
      setForm({ name: "", email: "", message: "" });
    } catch (err) {
      setError(err.message || "Failed to send message");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="page">
      <div className="page__header">
        <h2>Contact</h2>
        <p>Tell us what you want to learn next.</p>
      </div>
      <div className="split contact-layout">
        <div className="card contact-form-card">
          <form className="form" onSubmit={submit}>
            <div className="form__row">
              <input
                placeholder="Full name"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <input
                placeholder="Email address"
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <textarea
              placeholder="Your message"
              rows="5"
              required
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
            />
            {error && <div className="error">{error}</div>}
            {success && <div className="success">{success}</div>}
            <button className="btn btn--primary" type="submit" disabled={submitting}>
              {submitting ? "Sending..." : "Send Message"}
            </button>
          </form>
        </div>

        <div className="contact-cards">
          <div className="card contact-card">
            <h3>Direct Support</h3>
            <p className="muted">Reach us directly for urgent questions.</p>
            <a href="mailto:lakmindaverse187@gmail.com">lakmindaverse187@gmail.com</a>
            <a href="tel:+94700000000">+94 70 000 0000</a>
          </div>

          <div className="card contact-card">
            <h3>Follow Us</h3>
            <p className="muted">Connect through social media.</p>
            <div className="contact-social-links">
              <a href="https://www.facebook.com/" target="_blank" rel="noreferrer">
                Facebook
              </a>
              <a href="https://www.instagram.com/" target="_blank" rel="noreferrer">
                Instagram
              </a>
              <a href="https://www.youtube.com/" target="_blank" rel="noreferrer">
                YouTube
              </a>
              <a href="https://www.linkedin.com/" target="_blank" rel="noreferrer">
                LinkedIn
              </a>
              <a href="https://github.com/" target="_blank" rel="noreferrer">
                GitHub
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
