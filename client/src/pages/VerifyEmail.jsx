import React, { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/auth.jsx";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const { verifyEmail } = useAuth();
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("Verifying your email...");
  const hasVerifiedRef = useRef(false);

  useEffect(() => {
    if (hasVerifiedRef.current) return;
    hasVerifiedRef.current = true;

    const run = async () => {
      const token = searchParams.get("token");
      if (!token) {
        setStatus("error");
        setMessage("Verification token is missing.");
        return;
      }

      try {
        const data = await verifyEmail(token);
        setStatus("success");
        setMessage(data.message || "Email verified successfully.");
      } catch (err) {
        setStatus("error");
        setMessage(err.message || "Email verification failed.");
      }
    };

    run();
  }, [searchParams, verifyEmail]);

  return (
    <main className="page auth">
      <div className="card auth__card">
        <h3>Email Verification</h3>
        <div className={status === "success" ? "success" : status === "error" ? "error" : "muted"}>
          {message}
        </div>
        {status !== "loading" && (
          <Link className="btn btn--primary" to="/login">
            Go to Sign In
          </Link>
        )}
      </div>
    </main>
  );
}
