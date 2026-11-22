
import { useState } from "react";
import { investigateCustomer } from "./services/api";
import "./CustomerInvestigation.css";

function CustomerInvestigation({ customerData }) {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleInvestigation = async () => {
    setLoading(true);
    setError("");
    setReport(null);

    try {
      const data = await investigateCustomer(customerData);
      setReport(data);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        err.message ||
        "Unable to generate investigation report."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="investigation-page">
      <div className="investigation-header">
        <div>
          <h1>Customer Investigation</h1>
          <p>
            Generate an evidence-based customer churn investigation
            using RetainAI's existing prediction and SHAP results.
          </p>
        </div>

        <button
          className="investigate-button"
          onClick={handleInvestigation}
          disabled={loading}
        >
          {loading ? "Generating Report..." : "Generate Investigation"}
        </button>
      </div>

      {error && (
        <div className="investigation-error">
          <strong>Investigation Error:</strong> {String(error)}
        </div>
      )}

      {report && (
        <div className="investigation-report">
          <section className="investigation-card">
            <h2>Investigation Summary</h2>
            <p>{report.summary}</p>

            <div className="investigation-stats">
              <div>
                <span>Prediction</span>
                <strong>{report.prediction.label}</strong>
              </div>

              <div>
                <span>Churn Probability</span>
                <strong>
                  {(report.prediction.churn_probability * 100).toFixed(2)}%
                </strong>
              </div>

              <div>
                <span>Model</span>
                <strong>{report.prediction.model}</strong>
              </div>
            </div>
          </section>

          <section className="investigation-card">
            <h2>Evidence Interpretation</h2>

            {report.evidence_interpretation.length === 0 ? (
              <p>No evidence factors were returned.</p>
            ) : (
              <div className="evidence-list">
                {report.evidence_interpretation.map((item, index) => (
                  <div className="evidence-item" key={index}>
                    <h3>{item.readable_feature}</h3>
                    <p>{item.interpretation}</p>
                    <span>
                      SHAP value: {Number(item.shap_value).toFixed(4)}
                    </span>
                    <span>{item.direction}</span>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="investigation-card">
            <h2>Recommended Retention Actions</h2>

            {report.recommended_actions.map((item, index) => (
              <div className="recommendation-item" key={index}>
                <h3>{item.feature}</h3>
                <p>{item.recommendation}</p>
                {item.reason && <span>{item.reason}</span>}
              </div>
            ))}
          </section>

          <section className="investigation-card">
            <h2>Investigation Limitations</h2>

            <ul>
              {report.limitations.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>

            {report.human_review_required && (
              <p className="human-review-notice">
                Human review is required before taking customer retention
                decisions.
              </p>
            )}
          </section>

          <p className="assistant-type">
            Assistant: {report.assistant_type}
          </p>
        </div>
      )}
    </div>
  );
}

export default CustomerInvestigation;
