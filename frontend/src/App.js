import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import Navbar from "./components/Navbar";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import OrderForm from "./components/OrderForm";
import Portfolio from "./components/Portfolio";
import Reports from "./components/Reports";
import Analytics from "./components/Analytics";
import TestTrading from "./components/TestTrading";
import AIChatbot from "./components/AIChatbot";
import ReportsAnalytics from "./pages/ReportsAnalytics";
import News from "./components/News";

// Utility function to safely get user from localStorage
const getSafeUser = () => {
  try {
    const userData = localStorage.getItem("user");
    if (!userData || userData === "undefined" || userData === "null") {
      return null;
    }
    return JSON.parse(userData);
  } catch (error) {
    console.error("Error parsing user data:", error);
    localStorage.removeItem("user");
    return null;
  }
};

function PrivateRoute({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const userData = getSafeUser();
      setUser(userData);
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <div>Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function App() {
  // Clear any invalid localStorage data on app start
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData === "undefined" || userData === "null") {
      console.log("Clearing invalid user data from localStorage");
      localStorage.removeItem("user");
    }
  }, []);

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Navbar />
      <div style={{ padding: "30px" }}>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/order"
            element={
              <PrivateRoute>
                <OrderForm />
              </PrivateRoute>
            }
          />
          <Route
            path="/portfolio"
            element={
              <PrivateRoute>
                <Portfolio />
              </PrivateRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <PrivateRoute>
                <Reports />
              </PrivateRoute>
            }
          />
          <Route
            path="/analytics"
            element={
              <PrivateRoute>
                <Analytics />
              </PrivateRoute>
            }
          />
          <Route
            path="/test-trading"
            element={
              <PrivateRoute>
                <TestTrading />
              </PrivateRoute>
            }
          />
          <Route
            path="/ai"
            element={
              <PrivateRoute>
                <AIChatbot />
              </PrivateRoute>
            }
          />
          <Route path="/reports-analytics" element={<ReportsAnalytics />} />
          <Route path="/news" element={<News />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
