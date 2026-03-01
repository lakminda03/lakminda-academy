import React from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/auth.jsx";

const navItems = [
  { to: "/", label: "Home" },
  { to: "/courses", label: "Courses" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const profileImage = user?.photoUrl || user?.avatarUrl || user?.image || "";
  const profileLabel = user?.name || user?.email || "Guest";
  const profileInitials = (value) => {
    if (!value) return "G";
    const parts = value.trim().split(/\s+/).filter(Boolean);
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return value.slice(0, 2).toUpperCase();
  };

  return (
    <header className="nav">
      <div className="nav__inner">
        <Link className="logo" to="/">
          <span className="logo__mark">
            <img src="/assets/lakmindaverselogo.png" alt="Lakminda Academy logo" />
          </span>
          <span className="logo__text">Lakminda Academy</span>
        </Link>
        <nav className="nav__links">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} className="nav__link">
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="nav__actions">
          {!user && (
            <Link className="btn btn--ghost" to="/login">
              Sign In / Up
            </Link>
          )}
          {user && (
            <>
              <Link className="btn btn--ghost" to={user.role === "admin" ? "/admin" : "/dashboard"}>
                Dashboard
              </Link>
              <button className="btn btn--ghost" onClick={logout}>
                Logout
              </button>
            </>
          )}
          {user && (
            <div className="avatar" aria-label={`Profile: ${profileLabel}`}>
              {profileImage ? (
                <img src={profileImage} alt={`${profileLabel} profile`} />
              ) : (
                <span>{profileInitials(profileLabel)}</span>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
