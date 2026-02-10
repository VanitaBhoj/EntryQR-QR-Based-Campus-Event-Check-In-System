import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

export default function ScannerPage() {
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("idle"); // idle | success | error
  const [token, setToken] = useState(() => localStorage.getItem("token") || "");
  const lastScannedRef = useRef(null);
  const qrRef = useRef(null);

  useEffect(() => {
    const html5QrCode = new Html5Qrcode("qr-reader");

    const onScanSuccess = (decodedText) => {
      if (decodedText === lastScannedRef.current) return;
      lastScannedRef.current = decodedText;

      setStatus("idle");
      setMessage("Checking...");

      fetch(`/api/checkin/${decodedText}`, {
        method: "POST",
        headers: {
          Authorization: token ? `Bearer ${token}` : ""
        }
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.status === "success") {
            setStatus("success");
            setMessage(`Checked in: ${data.name}`);
          } else if (data.status === "already_checked_in") {
            setStatus("error");
            setMessage("Already checked in");
          } else if (data.status === "invalid_qr") {
            setStatus("error");
            setMessage("Invalid QR");
          } else {
            setStatus("error");
            setMessage("Unexpected response");
          }
        })
        .catch(() => {
          setStatus("error");
          setMessage("Server error");
        })
        .finally(() => {
          setTimeout(() => {
            lastScannedRef.current = null;
          }, 2000);
        });
    };

    const onScanError = () => {};

    html5QrCode
      .start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 }
        },
        onScanSuccess,
        onScanError
      )
      .then(() => {
        qrRef.current = html5QrCode;
      })
      .catch(() => {
        setStatus("error");
        setMessage("Unable to access camera");
      });

    return () => {
      if (qrRef.current) {
        qrRef.current.stop().catch(() => {});
      }
    };
  }, [token]);

  return (
    <div className="page scanner-page">
      <h2>Scanner</h2>
      <p className="subtitle">
        Allow camera access and show a participant QR code.
      </p>
      <div className="card" style={{ marginBottom: 12 }}>
        <label>
          Admin/Volunteer JWT (from Admin login)
          <input
            type="password"
            placeholder="Paste JWT token here"
            value={token}
            onChange={(e) => {
              const v = e.target.value;
              setToken(v);
              localStorage.setItem("token", v);
            }}
          />
        </label>
        <div className="subtitle" style={{ marginBottom: 0 }}>
          Tip: if you login on the Admin page in the same browser, this is auto-filled.
        </div>
      </div>
      <div id="qr-reader" className="qr-reader" />
      <div className={`scan-result scan-result-${status}`}>
        {message || "Waiting for scan..."}
      </div>
    </div>
  );
}

