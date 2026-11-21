
import { useState } from "react";
import { predictCustomer } from "./services/api";
import "./CustomerPrediction.css";

export const initialForm = {
  gender: "Male",
  SeniorCitizen: 0,
  Partner: "Yes",
  Dependents: "No",
  tenure: 12,
  PhoneService: "Yes",
  MultipleLines: "No",
  InternetService: "Fiber optic",
  OnlineSecurity: "No",
  OnlineBackup: "No",
  DeviceProtection: "No",
  TechSupport: "No",
  StreamingTV: "No",
  StreamingMovies: "No",
  Contract: "Month-to-month",
  PaperlessBilling: "Yes",
  PaymentMethod: "Electronic check",
  MonthlyCharges: 70,
  TotalCharges: 840,
};

const fields = [
  { name: "gender", label: "Gender", options: ["Male", "Female"] },
  { name: "SeniorCitizen", label: "Senior Citizen", options: ["0", "1"] },
  { name: "Partner", label: "Has Partner", options: ["Yes", "No"] },
  { name: "Dependents", label: "Has Dependents", options: ["Yes", "No"] },
  { name: "PhoneService", label: "Phone Service", options: ["Yes", "No"] },
  {
    name: "MultipleLines",
    label: "Multiple Lines",
    options: ["Yes", "No", "No phone service"],
  },
  {
    name: "InternetService",
    label: "Internet Service",
    options: ["DSL", "Fiber optic", "No"],
  },
  {
    name: "OnlineSecurity",
    label: "Online Security",
    options: ["Yes", "No", "No internet service"],
  },
  {
    name: "OnlineBackup",
    label: "Online Backup",
    options: ["Yes", "No", "No internet service"],
  },
  {
    name: "DeviceProtection",
    label: "Device Protection",
    options: ["Yes", "No", "No internet service"],
  },
  {
    name: "TechSupport",
    label: "Tech Support",
    options: ["Yes", "No", "No internet service"],
  },
  {
    name: "StreamingTV",
    label: "Streaming TV",
    options: ["Yes", "No", "No internet service"],
  },
  {
    name: "StreamingMovies",
    label: "Streaming Movies",
    options: ["Yes", "No", "No internet service"],
  },
  {
    name: "Contract",
    label: "Contract Type",
    options: ["Month-to-month", "One year", "Two year"],
  },
  {
    name: "PaperlessBilling",
    label: "Paperless Billing",
    options: ["Yes", "No"],
  },
  {
    name: "PaymentMethod",
    label: "Payment Method",
    options: [
      "Electronic check",
      "Mailed check",
      "Bank transfer (automatic)",
      "Credit card (automatic)",
    ],
  },
];

const numberFields = [
  { name: "tenure", label: "Tenure (months)", min: 0, max: 1000 },
  { name: "MonthlyCharges", label: "Monthly Charges", min: 0 },
  { name: "TotalCharges", label: "Total Charges", min: 0 },
];

function CustomerPrediction({
  customerData,
  setCustomerData,
  predictionResult,
  setPredictionResult,
}) {
  const form = customerData;
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
  const { name, value } = event.target;

  setCustomerData((previous) => ({
    ...previous,
    [name]:
      name === "SeniorCitizen" ||
      name === "tenure" ||
      name === "MonthlyCharges" ||
      name === "TotalCharges"
        ? Number(value)
        : value,
  }));

  setPredictionResult(null);
  setError("");
};

  const handleSubmit = async (event) => {
    event.preventDefault();

    setLoading(true);
    setError("");
    setPredictionResult(null);

    try {
      const response = await predictCustomer(form);
      setPredictionResult(response);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          err.message ||
          "Unable to connect to the prediction API."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="prediction-page">
      <div className="prediction-heading">
        <h1>Customer Churn Prediction</h1>
        <p>
          Enter customer information to predict the likelihood of customer
          churn using the trained XGBoost model.
        </p>
      </div>

      <form className="prediction-form" onSubmit={handleSubmit}>
        <h2>Customer Information</h2>

        <div className="prediction-grid">
          {fields.map((field) => (
            <div className="prediction-field" key={field.name}>
              <label htmlFor={field.name}>{field.label}</label>

              <select
                id={field.name}
                name={field.name}
                value={form[field.name]}
                onChange={handleChange}
                required
              >
                {field.options.map((option) => (
                  <option key={option} value={option}>
                    {field.name === "SeniorCitizen"
                      ? option === "1"
                        ? "Yes"
                        : "No"
                      : option}
                  </option>
                ))}
              </select>
            </div>
          ))}

          {numberFields.map((field) => (
            <div className="prediction-field" key={field.name}>
              <label htmlFor={field.name}>{field.label}</label>

              <input
                id={field.name}
                type="number"
                name={field.name}
                min={field.min}
                max={field.max}
                step="any"
                value={form[field.name]}
                onChange={handleChange}
                required
              />
            </div>
          ))}
        </div>

        <button
          className="predict-button"
          type="submit"
          disabled={loading}
        >
          {loading ? "Analyzing Customer..." : "Predict Churn"}
        </button>
      </form>

      {error && (
        <div className="prediction-error">
          <strong>Prediction Error:</strong> {String(error)}
        </div>
      )}

      
      {predictionResult && (
        <div className="prediction-result">
          <h2>Prediction Result</h2>

        <div className="result-details">
         <div>
          <span>Prediction</span>
           <strong>{predictionResult.prediction_label}</strong>
        </div>

        <div>
           <span>Churn Probability</span>
            <strong>
              {(predictionResult.churn_probability * 100).toFixed(2)}%
            </strong>
        </div>

        <div>
           <span>Model</span>
             <strong>{predictionResult.model}</strong>
        </div>
    </div>

    <p className="prediction-disclaimer">
      {predictionResult.disclaimer ||
        "Educational prediction only; not a final business decision."}
    </p>
  </div>
)}
    </div>
  );
}

export default CustomerPrediction;
