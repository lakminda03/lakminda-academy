import React from "react";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <main className="page hero">
      <div className="hero__content">
        <p className="eyebrow">Build real tech skills</p>
        <h1>
          Learn by shipping
          <span> real projects.</span>
        </h1>
        <p className="lead">
          We help you go from beginner to job-ready - faster, smarter, and with confidence.
        </p>
        <div className="hero__actions">
          <Link className="btn btn--primary" to="/login">
            Sign In / Up
          </Link>
          <Link className="btn btn--ghost" to="/courses">
            Courses
          </Link>
        </div>
        <div className="hero__stats">
          <div>
            <strong>40+</strong>
            <span>Project-based lessons</span>
          </div>
          <div>
            <strong>12</strong>
            <span>Career-ready tracks</span>
          </div>
          <div>
            <strong>100%</strong>
            <span>Completion badge system</span>
          </div>
        </div>
      </div>
      <div className="hero__panel">
        <div className="panel__card">
          <h3>Next up</h3>
          <p>Software Development from zero to launch</p>
          <div className="panel__bar">
            <span style={{ width: "65%" }} />
          </div>
          <div className="panel__meta">65% journey mapped</div>
        </div>
        <div className="panel__card">
          <h3>Achievement</h3>
          <p>Finish every lesson to unlock your badge.</p>
          <div className="badge">
            <img src="/assets/award.png" alt="Achievement badge" />
          </div>
        </div>
      </div>
    </main>
  );
}
