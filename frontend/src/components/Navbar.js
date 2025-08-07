import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Don't show navbar on login/register pages
  if (location.pathname === "/" || location.pathname === "/register") {
    return null;
  }

  // Check if user is logged in
  const user = localStorage.getItem("user");
  if (!user || user === "undefined" || user === "null") {
    return null;
  }

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };
  return (
    <nav className="navbar">
      <div className="navbar-logo">TradeNom</div>
      <ul className="navbar-links">
        <li>
          <Link to="/dashboard">Dashboard</Link>
        </li>
        <li>
          <Link to="/portfolio">Portfolio</Link>
        </li>
        <li>
          <Link to="/order">Order</Link>
        </li>
        <li>
          <Link to="/reports">Reports</Link>
        </li>
        <li>
          <Link to="/analytics">Analytics</Link>
        </li>
        <li>
          <Link to="/news">News</Link>
        </li>
        <li>
          <Link to="/test-trading">Test Trading</Link>
        </li>
        <li>
          <Link to="/ai">AI</Link>
        </li>
        <li>
          <button onClick={handleLogout} className="navbar-logout-btn">
            Logout
          </button>
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;
