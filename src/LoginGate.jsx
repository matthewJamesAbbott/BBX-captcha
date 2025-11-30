import ShadowCapture from "./ShadowCapture";

export default function LoginGate({ onCaptchaVerified }) {
  return (
    <div style={{
      minHeight: "100vh",
      background: "#000",
      color: "#fff",
      overflowY: "auto"
    }}>
      <div style={{ maxWidth: 520, margin: "0 auto", paddingTop: 32 }}>
        {/* BugBox logo, titles, instructions, etc */}

        <ShadowCapture onVerified={onCaptchaVerified} />

        {/* Remember Me, Login Button, etc */}
        <form>
          <div style={{ margin: "32px 0 12px 0", textAlign: "left" }}>
            <label style={{ fontWeight: 500, fontSize: 16 }}>
              <input type="checkbox" /> Remember Me (30 days)
            </label>
          </div>
          <div style={{ textAlign: "center" }}>
            <button
              type="submit"
              style={{
                background: "#8d5c14",
                color: "#fff",
                border: "none",
                borderRadius: 5,
                padding: "14px 42px",
                fontSize: "18px",
                fontWeight: 600,
                cursor: "pointer"
              }}
              // disable until onVerified fires if needed
            >
              Complete CAPTCHA First
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
