
import { useEffect, useState } from "react";
import {
  Activity,
  Server,
  Database,
  Cpu,
  Globe,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Info,
} from "lucide-react";

import { checkBackendHealth } from "./services/api";
import "./Settings.css";

function Settings() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const apiUrl =
    import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

  const fetchHealth = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await checkBackendHealth();
      setHealth(data);
    } catch (err) {
      setHealth(null);
      setError(
        err.response?.data?.detail ||
          "Unable to connect to the backend. Make sure FastAPI is running."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  const backendHealthy = health?.status === "healthy";
  const modelLoaded = health?.model_loaded === true;

  return (
    <div className="settings-page">
      <div className="settings-heading">
        <div>
          <h1>Settings</h1>
          <p>Monitor your RetainAI application and backend configuration.</p>
        </div>

        <button
          className="settings-refresh-btn"
          onClick={fetchHealth}
          disabled={loading}
        >
          <RefreshCw size={16} className={loading ? "refresh-spin" : ""} />
          {loading ? "Checking..." : "Refresh Status"}
        </button>
      </div>

      <section className="settings-section">
        <div className="settings-section-title">
          <Activity size={19} />
          <h2>System Status</h2>
        </div>

        <div className="settings-status-grid">
          <div className="settings-card">
            <div className="settings-card-top">
              <Server size={21} />
              <span>Backend Connection</span>
            </div>

            {loading ? (
              <h3>Checking...</h3>
            ) : (
              <h3 className={backendHealthy ? "status-good" : "status-bad"}>
                {backendHealthy ? "Connected" : "Disconnected"}
              </h3>
            )}

            <p>
              {backendHealthy
                ? "FastAPI backend is responding."
                : "Backend connection is unavailable."}
            </p>
          </div>

          <div className="settings-card">
            <div className="settings-card-top">
              <Cpu size={21} />
              <span>Machine Learning Model</span>
            </div>

            {loading ? (
              <h3>Checking...</h3>
            ) : (
              <h3 className={modelLoaded ? "status-good" : "status-bad"}>
                {modelLoaded ? "Loaded" : "Not Loaded"}
              </h3>
            )}

            <p>
              {health?.model || "Model information unavailable"}
            </p>
          </div>
        </div>

        {error && (
          <div className="settings-error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {!loading && !error && backendHealthy && modelLoaded && (
          <div className="settings-success">
            <CheckCircle2 size={18} />
            <span>Backend and machine learning model are operational.</span>
          </div>
        )}
      </section>

      <section className="settings-section">
        <div className="settings-section-title">
          <Database size={19} />
          <h2>Model Information</h2>
        </div>

        <div className="settings-details-card">
          <div className="settings-detail-row">
            <span>Model Name</span>
            <strong>{health?.model || "Unavailable"}</strong>
          </div>

          <div className="settings-detail-row">
            <span>Input Features</span>
            <strong>
              {health?.input_features ?? "Unavailable"}
            </strong>
          </div>

          <div className="settings-detail-row">
            <span>Model Status</span>
            <strong>{modelLoaded ? "Loaded" : loading ? "Checking..." : "Not Loaded"}</strong>
          </div>

          <div className="settings-detail-row">
            <span>Prediction Type</span>
            <strong>Customer Churn Prediction</strong>
          </div>
        </div>
      </section>

      <section className="settings-section">
        <div className="settings-section-title">
          <Globe size={19} />
          <h2>API Configuration</h2>
        </div>

        <div className="settings-details-card">
          <div className="settings-detail-row">
            <span>API Base URL</span>
            <strong className="settings-url">{apiUrl}</strong>
          </div>

          <div className="settings-detail-row">
            <span>Health Endpoint</span>
            <strong>/health</strong>
          </div>

          <div className="settings-detail-row">
            <span>Backend Framework</span>
            <strong>FastAPI</strong>
          </div>
        </div>
      </section>

      <section className="settings-section settings-about">
        <div className="settings-section-title">
          <Info size={19} />
          <h2>About RetainAI</h2>
        </div>

        <p>
          RetainAI is a customer churn prediction and investigation
          platform that combines machine learning, SHAP explainability,
          retention recommendations, and a local rule-based investigation
          assistant.
        </p>

        <div className="settings-tech-list">
          <span>React</span>
          <span>FastAPI</span>
          <span>Python</span>
          <span>XGBoost</span>
          <span>SHAP</span>
        </div>
      </section>
    </div>
  );
}

export default Settings;
