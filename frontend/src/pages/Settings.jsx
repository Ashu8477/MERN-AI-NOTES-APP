import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function Settings() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Settings state (these would typically be saved to backend/localStorage)
  const [aiModel, setAiModel] = useState("nano-local");
  const [theme, setTheme] = useState("dark");
  const [autoSummarize, setAutoSummarize] = useState(false);
  const [compactMode, setCompactMode] = useState(false);

  const [success, setSuccess] = useState("");

  const handleSave = () => {
    // Save to localStorage for now
    localStorage.setItem("nano-settings", JSON.stringify({
      aiModel,
      theme,
      autoSummarize,
      compactMode
    }));
    setSuccess("Settings saved successfully");
    setTimeout(() => setSuccess(""), 3000);
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
          <h1>Settings</h1>
        </div>

        {success && <div className="alert alert-success">{success}</div>}

        {/* AI Settings */}
        <div className="settings-card">
          <div className="settings-section">
            <h3 className="settings-section-title">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2a4 4 0 0 1 4 4c0 1.1-.45 2.1-1.18 2.82L12 12l-2.82-3.18A4 4 0 0 1 12 2z" />
                <path d="M12 12l2.82 3.18A4 4 0 1 1 9.18 15.18L12 12z" />
              </svg>
              AI Model
            </h3>
            <p className="settings-description">
              Choose which AI model to use for summarization. Local models never send your data externally.
            </p>

            <div className="settings-options">
              <label className={`settings-option ${aiModel === "nano-local" ? "active" : ""}`}>
                <input
                  type="radio"
                  name="aiModel"
                  value="nano-local"
                  checked={aiModel === "nano-local"}
                  onChange={(e) => setAiModel(e.target.value)}
                />
                <div className="settings-option-content">
                  <span className="settings-option-title">Nano (Local)</span>
                  <span className="settings-option-desc">Fast, private, runs on your machine</span>
                </div>
                <span className="pill pill-green">Recommended</span>
              </label>

              <label className={`settings-option ${aiModel === "phi3-local" ? "active" : ""}`}>
                <input
                  type="radio"
                  name="aiModel"
                  value="phi3-local"
                  checked={aiModel === "phi3-local"}
                  onChange={(e) => setAiModel(e.target.value)}
                />
                <div className="settings-option-content">
                  <span className="settings-option-title">Phi-3 (Local)</span>
                  <span className="settings-option-desc">More capable, requires more resources</span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Appearance */}
        <div className="settings-card">
          <div className="settings-section">
            <h3 className="settings-section-title">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
              Appearance
            </h3>

            <div className="settings-field">
              <label className="settings-label">Theme</label>
              <select
                className="settings-select"
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
              >
                <option value="dark">Dark</option>
                <option value="light">Light</option>
                <option value="system">System</option>
              </select>
            </div>

            <div className="settings-toggle-row">
              <div className="settings-toggle-info">
                <span className="settings-toggle-title">Compact Mode</span>
                <span className="settings-toggle-desc">Reduce spacing and show more notes</span>
              </div>
              <label className="toggle">
                <input
                  type="checkbox"
                  checked={compactMode}
                  onChange={(e) => setCompactMode(e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>

        {/* Behavior */}
        <div className="settings-card">
          <div className="settings-section">
            <h3 className="settings-section-title">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
              </svg>
              Behavior
            </h3>

            <div className="settings-toggle-row">
              <div className="settings-toggle-info">
                <span className="settings-toggle-title">Auto-Summarize</span>
                <span className="settings-toggle-desc">Automatically summarize notes when created</span>
              </div>
              <label className="toggle">
                <input
                  type="checkbox"
                  checked={autoSummarize}
                  onChange={(e) => setAutoSummarize(e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>

        {/* About */}
        <div className="settings-card">
          <div className="settings-section">
            <h3 className="settings-section-title">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
              About
            </h3>
            <div className="settings-about">
              <div className="settings-about-row">
                <span>Version</span>
                <span className="text-muted">1.0.0</span>
              </div>
              <div className="settings-about-row">
                <span>AI Engine</span>
                <span className="text-muted">Nano (Local LLM)</span>
              </div>
              <div className="settings-about-row">
                <span>Logged in as</span>
                <span className="text-muted">{user?.email}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="settings-footer">
          <button className="btn btn-primary btn-lg" onClick={handleSave}>
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}