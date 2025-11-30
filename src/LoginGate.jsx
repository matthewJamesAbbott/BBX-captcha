import React, { useState, useEffect } from "react";
import ShadowCapture from "./components/ShadowCapture";

export default function LoginGate({ children }) {
  const [loggedIn, setLoggedIn] = useState(false);
  const [captchaPassed, setCaptchaPassed] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check existing token on load
  useEffect(() => {
    const token =
      localStorage.getItem("authToken") || sessionStorage.getItem("authToken");

    if (token) {
      fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token })
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.valid) {
            setLoggedIn(true);
          } else {
            localStorage.removeItem("authToken");
            sessionStorage.removeItem("authToken");
          }
          setLoading(false);
        })
        .catch(() => {
          localStorage.removeItem("authToken");
          sessionStorage.removeItem("authToken");
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogin = async () => {
    setError(null);
    
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verified: captchaPassed, rememberMe })
      });

      const data = await res.json();

      if (data.success) {
        if (rememberMe) {
          localStorage.setItem("authToken", data.token);
        } else {
          sessionStorage.setItem("authToken", data.token);
        }
        setLoggedIn(true);
      } else {
        setError("Login failed. Please try again.");
      }
    } catch (err) {
      setError("Connection error. Please try again.");
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        height: "100vh",
        background: "black",
        color: "white"
      }}>
        <p>Loading...</p>
      </div>
    );
  }

  if (loggedIn) return children;

  // Main login UI with scrollable area
  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100vw",
        background: "black",
        color: "white",
        overflowY: "auto",
        padding: 0,
      }}
    >
      <div
        style={{
          maxWidth: 600,
          margin: "0 auto",
          padding: "40px 16px 40px 16px",
        }}
      >
        <div style={{ backgroundColor: "white", textAlign: "center", padding: "18px 0 8px 0", borderRadius: 10 }}>
          <img
            src="/Assets/Images/logo.png"
            alt="BugBox Logo"
            style={{
              width: "180px",
              height: "auto",
              marginBottom: 10,
            }}
          />
        </div>
        <h2 style={{
          color: "orange",
          textAlign: "center",
          margin: "28px 0 22px 0",
          fontWeight: 800
        }}>
          BugBox Login Gate
        </h2>
        <ShadowCapture onVerified={() => setCaptchaPassed(true)} />

        {error && (
          <div style={{
            padding: 12,
            backgroundColor: "#fee2e2",
            color: "#991b1b",
            borderRadius: 8,
            marginTop: 15,
            marginBottom: 15
          }}>
            {error}
          </div>
        )}
        <p style={{
          color: "white",
          marginBottom: 22,
          fontSize: 16,
          textAlign: "center"
        }}>
          <b>Complete the CAPTCHA to continue</b>
        </p>

        <div style={{
          marginTop: 10,
          marginBottom: 15,
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}>
          <label style={{
            display: "flex",
            alignItems: "center",
            cursor: "pointer",
            fontSize: 15,
            color: "orange"
          }}>
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              style={{
                marginRight: 8,
                width: 18,
                height: 18,
                cursor: "pointer"
              }}
            />
            Remember Me (30 days)
          </label>
        </div>

        <button
          disabled={!captchaPassed}
          onClick={handleLogin}
          style={{
            width: "100%",
            padding: "15px 24px",
            fontSize: 17,
            fontWeight: 700,
            backgroundColor: captchaPassed ? "green" : "orange",
            color: "white",
            border: "none",
            borderRadius: 8,
            cursor: captchaPassed ? "pointer" : "not-allowed",
            transition: "all 0.2s",
            opacity: captchaPassed ? 1 : 0.6,
            marginTop: 14,
          }}
        >
          {captchaPassed ? "Login" : "Complete CAPTCHA First"}
        </button>
        <p style={{
          marginTop: 20,
          fontSize: 12,
          color: "white",
          textAlign: "center"
        }}>
          <b>
            {rememberMe
              ? "You'll stay logged in for 30 days"
              : "You'll stay logged in until you close your browser"}
          </b>
        </p>
      </div>
    </div>
  );
}
