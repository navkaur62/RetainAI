import numpy as np
import shap

from src.recommendations import get_retention_action
from pathlib import Path

import joblib
import pandas as pd
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, ConfigDict, Field
from src.investigation_assistant import generate_investigation

# --------------------------------------------------
# CONFIGURATION
# --------------------------------------------------

ROOT_DIR = Path(__file__).resolve().parent.parent

MODEL_PATH = ROOT_DIR / "models" / "churn_model_pipeline.joblib"

FEATURE_COLUMNS = [
    "gender",
    "SeniorCitizen",
    "Partner",
    "Dependents",
    "tenure",
    "PhoneService",
    "MultipleLines",
    "InternetService",
    "OnlineSecurity",
    "OnlineBackup",
    "DeviceProtection",
    "TechSupport",
    "StreamingTV",
    "StreamingMovies",
    "Contract",
    "PaperlessBilling",
    "PaymentMethod",
    "MonthlyCharges",
    "TotalCharges"
]


# --------------------------------------------------
# FASTAPI APPLICATION
# --------------------------------------------------

app = FastAPI(
    title="RetainAI API",
    description="Customer Churn Prediction and Retention API",
    version="1.0.0"
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --------------------------------------------------
# LOAD TRAINED MODEL
# --------------------------------------------------

pipeline = None
model_load_error = None

try:
    pipeline = joblib.load(MODEL_PATH)

    if not hasattr(pipeline, "feature_names_in_"):
        raise ValueError("Model does not contain expected feature names.")

    if list(pipeline.feature_names_in_) != FEATURE_COLUMNS:
        raise ValueError("Model input columns do not match API schema.")

    print("RetainAI model loaded successfully.")

except Exception as error:
    model_load_error = str(error)
    print(f"Model loading failed: {model_load_error}")


# --------------------------------------------------
# CUSTOMER INPUT SCHEMA
# --------------------------------------------------

class CustomerInput(BaseModel):

    model_config = ConfigDict(extra="forbid")

    gender: str = Field(min_length=1)
    SeniorCitizen: int = Field(ge=0, le=1)
    Partner: str = Field(min_length=1)
    Dependents: str = Field(min_length=1)

    tenure: int = Field(ge=0)

    PhoneService: str = Field(min_length=1)
    MultipleLines: str = Field(min_length=1)
    InternetService: str = Field(min_length=1)
    OnlineSecurity: str = Field(min_length=1)
    OnlineBackup: str = Field(min_length=1)
    DeviceProtection: str = Field(min_length=1)
    TechSupport: str = Field(min_length=1)
    StreamingTV: str = Field(min_length=1)
    StreamingMovies: str = Field(min_length=1)

    Contract: str = Field(min_length=1)
    PaperlessBilling: str = Field(min_length=1)
    PaymentMethod: str = Field(min_length=1)

    MonthlyCharges: float = Field(ge=0, allow_inf_nan=False)
    TotalCharges: float = Field(ge=0, allow_inf_nan=False)


# --------------------------------------------------
# MODEL STATUS CHECK
# --------------------------------------------------

def get_pipeline():

    if pipeline is None:
        raise HTTPException(
            status_code=503,
            detail=f"Model unavailable: {model_load_error}"
        )

    return pipeline


# --------------------------------------------------
# ROOT ENDPOINT
# --------------------------------------------------

@app.get("/")
def home():

    return {
        "project": "RetainAI",
        "message": "Customer Churn Prediction API is running.",
        "version": "1.0.0"
    }


# --------------------------------------------------
# HEALTH ENDPOINT
# --------------------------------------------------

@app.get("/health")
def health():

    if pipeline is None:
        raise HTTPException(
            status_code=503,
            detail="Model is not loaded."
        )

    return {
        "status": "healthy",
        "model_loaded": True,
        "model": "XGBClassifier",
        "input_features": len(FEATURE_COLUMNS)
    }


# --------------------------------------------------
# CHURN PREDICTION ENDPOINT
# --------------------------------------------------

@app.post("/predict")
def predict_churn(customer: CustomerInput):

    trained_pipeline = get_pipeline()

    try:

        customer_data = pd.DataFrame(
            [customer.model_dump()],
            columns=FEATURE_COLUMNS
        )

        probabilities = trained_pipeline.predict_proba(
            customer_data
        )[0]

        classes = list(trained_pipeline.classes_)

        churn_index = classes.index(1)

        churn_probability = float(
            probabilities[churn_index]
        )

        prediction = int(churn_probability >= 0.5)

        return {
            "prediction": prediction,
            "churn_probability": round(
                churn_probability, 4
            ),
            "prediction_label": (
                "Churn" if prediction == 1 else "No Churn"
            ),
            "model": "XGBClassifier",
            "threshold": 0.5,
            "disclaimer": (
                "Educational prediction only; "
                "not a final business decision."
            )
        }

    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=f"Prediction failed: {str(error)}"
        )
# --------------------------------------------------
# SHAP EXPLAINABILITY ENDPOINT
# --------------------------------------------------

@app.post("/explain")
def explain_customer(customer: CustomerInput):

    trained_pipeline = get_pipeline()

    try:
        # Prepare customer input
        customer_data = pd.DataFrame(
            [customer.model_dump()],
            columns=FEATURE_COLUMNS
        )

        # Get prediction from the complete pipeline
        probabilities = trained_pipeline.predict_proba(
            customer_data
        )[0]

        classes = list(trained_pipeline.classes_)
        churn_index = classes.index(1)

        churn_probability = float(
            probabilities[churn_index]
        )

        prediction = int(churn_probability >= 0.5)

        # Separate preprocessing and classifier
        preprocessor = trained_pipeline.named_steps["preprocessor"]
        classifier = trained_pipeline.named_steps["classifier"]

        # Transform customer using the existing preprocessor
        transformed_customer = preprocessor.transform(
            customer_data
        )

        if hasattr(transformed_customer, "toarray"):
            transformed_customer = transformed_customer.toarray()

        feature_names = preprocessor.get_feature_names_out()

        # Generate SHAP explanation
        explainer = shap.TreeExplainer(classifier)
        shap_explanation = explainer(transformed_customer)

        shap_values = np.asarray(shap_explanation.values)
        base_values = np.asarray(shap_explanation.base_values)

        # Extract contributions for the churn class
        if shap_values.ndim == 3:

            churn_values = shap_values[0, :, churn_index]

            if base_values.ndim >= 2:
                base_value = float(
                    base_values[0, churn_index]
                )
            else:
                base_value = float(base_values.reshape(-1)[0])

        elif shap_values.ndim == 2:

            churn_values = shap_values[0]

            base_value = float(
                base_values.reshape(-1)[0]
            )

        else:
            raise ValueError(
                "Unexpected SHAP output dimensions."
            )

        if len(feature_names) != len(churn_values):
            raise ValueError(
                "SHAP values and feature names do not match."
            )

        # Build explanation DataFrame
        explanation_df = pd.DataFrame({
            "feature": feature_names,
            "shap_value": churn_values,
            "absolute_impact": np.abs(churn_values)
        })

        explanation_df["direction"] = np.where(
            explanation_df["shap_value"] > 0,
            "Increases churn risk",
            "Decreases churn risk"
        )

        explanation_df = explanation_df.sort_values(
            by="absolute_impact",
            ascending=False
        )

        # Generate retention recommendations
        recommendations = []

        positive_factors = explanation_df[
            explanation_df["shap_value"] > 0
        ].sort_values(
            by="absolute_impact",
            ascending=False
        )

        transformed_values = np.asarray(
            transformed_customer
        )[0]

        feature_value_map = dict(
            zip(feature_names, transformed_values)
        )

        for _, row in positive_factors.iterrows():

            action = get_retention_action(
                row["feature"],
                feature_value_map[row["feature"]]
            )

            if action is not None:

                recommendation, reason = action

                recommendations.append({
                    "feature": row["feature"],
                    "recommendation": recommendation,
                    "reason": reason
                })

            if len(recommendations) >= 5:
                break

        # Prepare top contributing factors
        top_factors = []

        for _, row in explanation_df.head(5).iterrows():

            top_factors.append({
                "feature": row["feature"],
                "shap_value": round(
                    float(row["shap_value"]), 6
                ),
                "direction": row["direction"]
            })

        return {
            "prediction": prediction,
            "prediction_label": (
                "Churn" if prediction == 1 else "No Churn"
            ),
            "churn_probability": round(
                churn_probability, 4
            ),
            "model": "XGBClassifier",
            "explanation_method": "SHAP TreeExplainer",
            "base_value": round(base_value, 6),
            "top_factors": top_factors,
            "retention_recommendations": recommendations,
            "disclaimer": (
                "SHAP values describe model contributions, "
                "not causal effects. Recommendations are "
                "suggestions for human review."
            )
        }

    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=f"Explanation failed: {str(error)}"
        )



# --------------------------------------------------
# LOCAL CUSTOMER INVESTIGATION ENDPOINT
# --------------------------------------------------

@app.post("/investigate")
def investigate_customer(customer: CustomerInput):

    try:
        # Generate the existing model prediction and SHAP explanation
        explanation_response = explain_customer(customer)

        # Convert the explanation into a dictionary
        investigation = generate_investigation(
            explanation_response
        )

        return investigation

    except HTTPException:
        raise

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Investigation failed: {str(error)}"
        )
