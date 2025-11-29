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

  // Show loading state while checking token
  if (loading) {
    return (
      <div style={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        height: "100vh" 
      }}>
        <p>Loading...</p>
      </div>
    );
  }

  // If user is verified, render full BugBox UI
  if (loggedIn) return children;

  // Otherwise show login UI
  return (

    <div style={{ 
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "black",
      padding: 20
    }}>
     <div style={{
        maxWidth: 600,
        width: "100%",
        backgroundColor: "black",
        boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
        padding: 40
      }}>

<div style={{ backgroundColor: "white",  width: "100%"}}>
<img 
  src="/Assets/Images/logo.png" 
  alt="BugBox Logo"
  style={{ 
    width: "200px",  // adjust size as needed
    height: "auto",
    marginBottom: 20
  }}
/>
</div>
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
          marginBottom: 30,
          fontSize: 16
        }}><b>
          Complete the CAPTCHA to continue
        </b></p>

        <div style={{ 
          marginTop: 20,
          marginBottom: 20,
          display: "flex",
          alignItems: "center"
        }}>
          <label style={{ 
            display: "flex", 
            alignItems: "center",
            cursor: "pointer",
            fontSize: 14,
            color: "orange"
          }}>
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              style={{ 
                marginRight: 8,
                width: 16,
                height: 16,
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
            padding: "14px 24px",
            fontSize: 16,
            fontWeight: 600,
            backgroundColor: captchaPassed ? "green" : "orange",
            color: "white",
            border: "none",
            borderRadius: 8,
            cursor: captchaPassed ? "pointer" : "not-allowed",
            transition: "all 0.2s",
            opacity: captchaPassed ? 1 : 0.6
          }}
          onMouseOver={(e) => {
            if (captchaPassed) {
              e.target.style.backgroundColor = "green";
            }
          }}
          onMouseOut={(e) => {
            if (captchaPassed) {
              e.target.style.backgroundColor = "green";
            }
          }}
        >
          {captchaPassed ? "Login" : "Complete CAPTCHA First"}
        </button>

        <p style={{
          marginTop: 20,
          fontSize: 12,
          color: "white",
          textAlign: "center"
        }}><b>
          {rememberMe 
            ? "You'll stay logged in for 30 days" 
            : "You'll stay logged in until you close your browser"}
           </b>
        </p>
      </div>
    </div>
  );
}
