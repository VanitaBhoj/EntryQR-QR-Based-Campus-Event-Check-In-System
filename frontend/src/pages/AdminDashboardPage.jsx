import React, { useEffect, useState } from "react";

const API_BASE = "/api";

export default function AdminDashboardPage() {
  const [token, setToken] = useState(() => localStorage.getItem("token") || "");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [authMode, setAuthMode] = useState("login"); // login | register
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [stats, setStats] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [creatingEvent, setCreatingEvent] = useState(false);
  const [eventName, setEventName] = useState("");
  const [eventLocation, setEventLocation] = useState("");
  const [eventStartTime, setEventStartTime] = useState("");

  useEffect(() => {
    if (token) {
      loadEvents();
    }
  }, [token]);

  const login = async () => {
    if (!email || !password) {
      setMessage("Please enter email and password");
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok && data.token) {
        localStorage.setItem("token", data.token);
        setToken(data.token);
        setMessage("");
      } else {
        setMessage(data.message || "Login failed");
      }
    } catch (err) {
      setMessage(err.message);
    }
  };

  const register = async () => {
    if (!name || !email || !password) {
      setMessage("Please enter name, email and password");
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password })
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Admin registered. Now login with the same credentials.");
        setAuthMode("login");
      } else {
        // If user already exists, allow login flow without blocking
        setMessage(data.message || "Registration failed");
      }
    } catch (err) {
      setMessage(err.message);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken("");
    setEvents([]);
    setSelectedEventId("");
    setStats(null);
    setParticipants([]);
  };

  const slugify = (s) =>
    (s || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  const createEvent = async () => {
    if (!eventName || !eventLocation || !eventStartTime) {
      setMessage("Please fill event name, location, and start time");
      return;
    }
    setCreatingEvent(true);
    setMessage("");
    try {
      const slug = `${slugify(eventName)}-${new Date().getTime()}`;
      const res = await fetch(`${API_BASE}/events`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: eventName,
          slug,
          location: eventLocation,
          startTime: new Date(eventStartTime).toISOString()
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Event creation failed");
      const createdId = data.eventId || data._id;
      setMessage(`Event created. Event ID: ${createdId}`);
      await loadEvents();
      if (createdId) {
        setSelectedEventId(createdId);
        await loadEventData(createdId);
      }
      setEventName("");
      setEventLocation("");
      setEventStartTime("");
    } catch (err) {
      setMessage(err.message);
    } finally {
      setCreatingEvent(false);
    }
  };

  const loadEvents = async () => {
    try {
      const res = await fetch(`${API_BASE}/events`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to load events");
      const data = await res.json();
      setEvents(data);
    } catch (err) {
      setMessage(err.message);
    }
  };

  const loadEventData = async (eventId) => {
    if (!eventId) {
      setStats(null);
      setParticipants([]);
      return;
    }
    setLoading(true);
    try {
      const [statsRes, qrsRes] = await Promise.all([
        fetch(`${API_BASE}/qr/stats/${eventId}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`${API_BASE}/qr/event/${eventId}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      const statsData = await statsRes.json();
      const qrsData = await qrsRes.json();
      setStats(statsData);
      setParticipants(qrsData.participants || []);
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  const onEventChange = (e) => {
    const id = e.target.value;
    setSelectedEventId(id);
    loadEventData(id);
  };

  const exportCSV = () => {
    if (!participants.length) return;
    let csv = "Name,Email,StudentID,Checked In,Check-in Time\n";
    participants.forEach((p) => {
      csv += `"${p.name}","${p.email}","${p.studentId}","${
        p.checkedIn ? "Yes" : "No"
      }","${p.checkedIn ? new Date(p.checkinTime).toLocaleString() : ""}"\n`;
    });
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `attendance_${selectedEventId}_${new Date()
      .toISOString()
      .split("T")[0]}.csv`;
    a.click();
  };

  const onUploadCSV = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !selectedEventId) {
      return;
    }
    setUploading(true);
    setMessage("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(
        `${API_BASE}/upload/participants/${selectedEventId}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData
        }
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Upload failed");
      }
      setMessage(
        `Uploaded ${data.count} participants. QR codes generated successfully.`
      );
      // reload participants/stats after upload
      await loadEventData(selectedEventId);
    } catch (err) {
      setMessage(err.message);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  if (!token) {
    return (
      <div className="page admin-page">
        <h2>{authMode === "login" ? "Admin Login" : "Admin Register"}</h2>
        <div className="card">
          {authMode === "register" && (
            <label>
              Name
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>
          )}
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          {authMode === "login" ? (
            <>
              <button onClick={login}>Login</button>
              <button className="secondary" onClick={() => setAuthMode("register")}>
                Create Admin Account
              </button>
            </>
          ) : (
            <>
              <button onClick={register}>Register</button>
              <button className="secondary" onClick={() => setAuthMode("login")}>
                Back to Login
              </button>
            </>
          )}
          {message && <div className="alert alert-error">{message}</div>}
        </div>
      </div>
    );
  }

  return (
    <div className="page admin-page">
      <div className="admin-header">
        <h2>Admin Dashboard</h2>
        <button onClick={logout}>Logout</button>
      </div>

      <div className="card">
        <div className="section-title">Create Event</div>
        <div className="form-row">
          <label>
            Event name
            <input
              type="text"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              placeholder="e.g. Tech Fest 2026"
            />
          </label>
          <label>
            Location
            <input
              type="text"
              value={eventLocation}
              onChange={(e) => setEventLocation(e.target.value)}
              placeholder="e.g. Auditorium"
            />
          </label>
          <label>
            Start time
            <input
              type="datetime-local"
              value={eventStartTime}
              onChange={(e) => setEventStartTime(e.target.value)}
            />
          </label>
          <button onClick={createEvent} disabled={creatingEvent}>
            {creatingEvent ? "Creating..." : "Create Event"}
          </button>
        </div>

        <div className="filters">
          <select value={selectedEventId} onChange={onEventChange}>
            <option value="">Select Event</option>
            {events.map((event) => (
              <option key={event._id} value={event._id}>
                {event.name}
              </option>
            ))}
          </select>
          <button onClick={() => loadEventData(selectedEventId)}>Refresh</button>
          <button onClick={exportCSV} disabled={!participants.length}>
            Export CSV
          </button>
          <label className="upload-label">
            <span>Upload CSV</span>
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={onUploadCSV}
              disabled={!selectedEventId || uploading}
            />
          </label>
        </div>

        {loading && <div className="loading">Loading...</div>}
        {message && <div className="alert alert-error">{message}</div>}

        {stats && (
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Total Participants</h3>
              <div className="stat-value">{stats.totalParticipants}</div>
            </div>
            <div className="stat-card">
              <h3>Checked In</h3>
              <div className="stat-value success">{stats.checkedIn}</div>
              <div className="stat-sub">{stats.percentage}%</div>
            </div>
            <div className="stat-card">
              <h3>Not Checked In</h3>
              <div className="stat-value error">{stats.notCheckedIn}</div>
            </div>
          </div>
        )}

        {participants.length > 0 && (
          <>
            <h3 className="section-title">
              Participants {stats?.eventName ? `- ${stats.eventName}` : ""}
            </h3>
            <div className="participants-grid">
              {participants.map((p) => (
                <div key={p._id} className="participant-card">
                  <div className="qr-thumb">
                    <img src={p.qrImage} alt={`QR for ${p.name}`} />
                  </div>
                  <div className="participant-info">
                    <h4>{p.name}</h4>
                    <p>ID: {p.studentId}</p>
                    <p>{p.email}</p>
                    <span
                      className={`badge ${
                        p.checkedIn ? "badge-success" : "badge-error"
                      }`}
                    >
                      {p.checkedIn ? "Checked In" : "Not Checked"}
                    </span>
                    {p.checkedIn && p.checkinTime && (
                      <div className="checkin-time">
                        at{" "}
                        {new Date(p.checkedInAt || p.checkinTime).toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

