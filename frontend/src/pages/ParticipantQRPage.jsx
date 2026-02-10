import React, { useState } from "react";

const API_BASE = "/api";

export default function ParticipantQRPage() {
  const [email, setEmail] = useState("");
  const [eventId, setEventId] = useState("");
  const [participant, setParticipant] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchQR = async () => {
    if (!email || !eventId) {
      setError("Please enter both email and event ID");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch(
        `${API_BASE}/qr/display?email=${encodeURIComponent(
          email
        )}&eventId=${eventId}`
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Participant not found");
      }
      const data = await res.json();
      setParticipant(data);
    } catch (err) {
      setParticipant(null);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const onKeyPress = (e) => {
    if (e.key === "Enter") fetchQR();
  };

  return (
    <div className="page participant-page">
      <h2>My QR Code</h2>
      <p className="subtitle">Show this QR at event entry.</p>
      <div className="card">
        {!participant && (
          <div className="form-grid">
            <label>
              Email
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={onKeyPress}
              />
            </label>
            <label>
              Event ID
              <input
                type="text"
                value={eventId}
                onChange={(e) => setEventId(e.target.value)}
                onKeyPress={onKeyPress}
              />
            </label>
            <button onClick={fetchQR} disabled={loading}>
              {loading ? "Loading..." : "Get My QR Code"}
            </button>
            {error && <div className="alert alert-error">{error}</div>}
          </div>
        )}

        {participant && (
          <div className="qr-display">
            <div className="participant-summary">
              <div className="row">
                <span className="label">Name</span>
                <span className="value">{participant.name}</span>
              </div>
              <div className="row">
                <span className="label">Email</span>
                <span className="value">{participant.email}</span>
              </div>
              <div className="row">
                <span className="label">Student ID</span>
                <span className="value">{participant.studentId}</span>
              </div>
              <div className="row">
                <span className="label">Status</span>
                <span className="value">
                  <span
                    className={`badge ${
                      participant.checkedIn ? "badge-success" : "badge-error"
                    }`}
                  >
                    {participant.checkedIn ? "Checked In" : "Not Checked In"}
                  </span>
                </span>
              </div>
              {participant.checkedIn &&
                (participant.checkedInAt || participant.checkinTime) && (
                <div className="row">
                  <span className="label">Check-in Time</span>
                  <span className="value">
                    {new Date(
                      participant.checkedInAt || participant.checkinTime
                    ).toLocaleString()}
                  </span>
                </div>
              )}
            </div>
            <div className="qr-panel">
              <p className="hint">Show this QR at entry:</p>
              <div className="qr-image-large">
                <img src={participant.qrImage} alt="Your QR Code" />
              </div>
              <div className="instructions">
                1. Keep this page open on your phone. <br />
                2. Go to the event entrance. <br />
                3. Show the QR to the volunteer for scanning.
              </div>
              <button onClick={() => window.print()}>Print QR</button>
              <button
                className="secondary"
                onClick={() => {
                  setParticipant(null);
                  setError("");
                }}
              >
                Back
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

