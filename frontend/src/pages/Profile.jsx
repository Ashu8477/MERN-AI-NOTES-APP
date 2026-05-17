import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import api from "../api/api";

export default function Profile() {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState(user?.fullName || "");
  const [email] = useState(user?.email || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const initials = user?.fullName
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U";

  const handleSave = async () => {
    if (!fullName.trim()) {
      setError("Name cannot be empty");
      return;
    }

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await api.put("/auth/profile", { fullName });
      // Update auth context with new user data
      login({ ...user, ...res.data, token: user.token });
      setSuccess("Profile updated successfully");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="settings-page">
      <div className="settings-container">
        {/* Header */}
        <div className="settings-header">
          <button className="btn btn-ghost" onClick={() => navigate("/")}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            Back
          </button>
          <h1>Profile</h1>
        </div>

        {/* Profile Card */}
        <div className="settings-card">
          <div className="profile-hero">
            <div className="avatar avatar-xl">{initials}</div>
            <div className="profile-hero-info">
              <h2>{user?.fullName}</h2>
              <p>{user?.email}</p>
            </div>
          </div>

          {error && <div className="alert">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <div className="settings-section">
            <h3 className="settings-section-title">Personal Information</h3>

            <div className="settings-field">
              <label className="settings-label">Full Name</label>
              <input
                type="text"
                className="settings-input"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your name"
              />
            </div>

            <div className="settings-field">
              <label className="settings-label">Email</label>
              <input
                type="email"
                className="settings-input"
                value={email}
                disabled
                placeholder="Your email"
              />
              <span className="settings-hint">Email cannot be changed</span>
            </div>
          </div>

          <div className="settings-actions">
            <button
              className="btn btn-primary"
              onClick={handleSave}
              disabled={loading || fullName === user?.fullName}
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="settings-card settings-card-danger">
          <h3 className="settings-section-title">Danger Zone</h3>
          <p className="settings-description">
            Once you delete your account, there is no going back. Please be certain.
          </p>
          <button className="btn btn-red">Delete Account</button>
        </div>
      </div>
    </div>
  );
}