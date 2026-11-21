
import { useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ReferenceLine,
} from "recharts";

import { explainCustomer } from "./services/api";
import "./CustomerExplainability.css";

function formatFeatureName(feature) {
  return feature
    .replace(/^(num__|cat__)/, "")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function CustomerExplainability({ customerData, predictionResult }) {
  const [explanation, setExplanation] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleExplain = async () => {
    setLoading(true);
    setError("");
    setExplanation(null);

    try {
      const response = await explainCustomer(customerData);
      setExplanation(response);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          err.message ||
          "Unable to generate the SHAP explanation."
      );
    } finally {
      setLoading(false);
    }
  };

  const chartData = explanation?.top_factors?.map((factor) => ({
    ...factor,
    displayFeature: formatFeatureName(factor.feature),
  })) || [];

  return (
    <div className="explainability-page">
      <div className="explainability-heading">
        <h2>SHAP Explainability</h2>
        <p>
          Understand which customer attributes influence the
          churn prediction made by the XGBoost model.
        </p>
      </div>

      <div className="explainability-action">
        <div>
          <h3>Customer Analysis</h3>
          <p>
            {predictionResult
              ? `Latest prediction: ${predictionResult.prediction_label}`
              : "Using the current customer information from Churn Prediction."}
          </p>
        </div>

        <button
          className="explain-button"
          onClick={handleExplain}
          disabled={loading}
        >
          {loading ? "Generating Explanation..." : "Generate SHAP Explanation"}
        </button>
      </div>

      {error && (
        <div className="explain-error">
          <strong>Explanation Error:</strong> {String(error)}
        </div>
      )}

      {explanation && (
        <>
          <div className="explain-summary-grid">
            <div className="explain-summary-card">
              <span>Prediction</span>
              <strong>{explanation.prediction_label}</strong>
            </div>

            <div className="explain-summary-card">
              <span>Churn Probability</span>
              <strong>
                {(explanation.churn_probability * 100).toFixed(2)}%
              </strong>
            </div>

            <div className="explain-summary-card">
              <span>Explanation Method</span>
              <strong>{explanation.explanation_method}</strong>
            </div>
          </div>

          <div className="shap-panel">
            <div className="shap-panel-heading">
              <div>
                <h3>Top Factors Influencing Churn</h3>
                <p>
                  SHAP contributions for this customer's prediction.
                </p>
              </div>
              <span className="shap-tag">TOP 5 FACTORS</span>
            </div>

            <div className="shap-legend">
              <span>
                <i className="legend-positive"></i>
                Increases churn risk
              </span>
              <span>
                <i className="legend-negative"></i>
                Decreases churn risk
              </span>
            </div>

            <ResponsiveContainer width="100%" height={320}>
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 10, right: 25, left: 20, bottom: 10 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#29354a"
                  horizontal={false}
                />

                <XAxis
                  type="number"
                  stroke="#8290a8"
                  tick={{ fontSize: 11 }}
                />

                <YAxis
                  type="category"
                  dataKey="displayFeature"
                  stroke="#aab6ca"
                  tick={{ fontSize: 11 }}
                  width={125}
                />

                <Tooltip
                  contentStyle={{
                    background: "#172238",
                    border: "1px solid #394765",
                    borderRadius: "8px",
                    color: "#ffffff",
                  }}
                  formatter={(value) => [
                    Number(value).toFixed(6),
                    "SHAP contribution",
                  ]}
                />

                <ReferenceLine x={0} stroke="#8290a8" />

                <Bar dataKey="shap_value" radius={[0, 5, 5, 0]}>
                  {chartData.map((factor, index) => (
                    <Cell
                      key={`factor-${index}`}
                      fill={
                        factor.shap_value > 0
                          ? "#f87171"
                          : "#34d399"
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            <p className="shap-note">
              Positive SHAP values increase the model's churn output;
              negative values decrease it. These values describe model
              contributions, not causal effects.
            </p>
          </div>

          <div className="recommendations-panel">
            <div className="shap-panel-heading">
              <div>
                <h3>Retention Recommendations</h3>
                <p>
                  Suggested actions based on the model's positive
                  churn-risk factors.
                </p>
              </div>
            </div>

            {explanation.retention_recommendations?.length > 0 ? (
              <div className="recommendation-list">
                {explanation.retention_recommendations.map(
                  (item, index) => (
                    <div
                      className="recommendation-card"
                      key={`${item.feature}-${index}`}
                    >
                      <div className="recommendation-number">
                        {String(index + 1).padStart(2, "0")}
                      </div>

                      <div>
                        <h4>{formatFeatureName(item.feature)}</h4>
                        <strong>{item.recommendation}</strong>
                        <p>{item.reason}</p>
                      </div>
                    </div>
                  )
                )}
              </div>
            ) : (
              <p className="no-recommendations">
                No retention recommendations were returned for this customer.
              </p>
            )}
          </div>

          <div className="explain-disclaimer">
            {explanation.disclaimer}
          </div>
        </>
      )}
    </div>
  );
}

export default CustomerExplainability;
