
from typing import Any


def format_feature_name(feature: str) -> str:
    """
    Convert transformed model feature names into readable labels.
    Does not attempt to assign meaning to encoded values.
    """

    name = feature.replace("num__", "")
    name = name.replace("cat__", "")

    if name == "tenure":
        return "Customer tenure"

    if name == "MonthlyCharges":
        return "Monthly charges"

    if name == "TotalCharges":
        return "Total charges"

    if "_" in name:
        parts = name.split("_", 1)
        return f"{parts[0]}: {parts[1]}"

    return name.replace("_", " ").strip()


def build_summary(
    prediction: int,
    churn_probability: float
) -> str:
    """
    Generate a summary using the existing model output.
    The assistant does not make a new prediction.
    """

    probability_percent = churn_probability * 100

    if prediction == 1:
        return (
            f"The existing RetainAI model classified this customer "
            f"as likely to churn, with a churn probability of "
            f"{probability_percent:.2f}%. The customer should be "
            f"considered for a retention review."
        )

    return (
        f"The existing RetainAI model classified this customer "
        f"as unlikely to churn, with a churn probability of "
        f"{probability_percent:.2f}%. Continue normal customer "
        f"engagement and monitor future changes."
    )


def interpret_evidence(top_factors: list[dict]) -> list[dict]:
    """
    Convert supplied SHAP factors into readable evidence.
    SHAP directions are preserved without recalculation.
    """

    evidence = []

    for factor in top_factors:

        feature = factor.get("feature")
        direction = factor.get("direction")
        shap_value = factor.get("shap_value")

        if not feature or not direction or shap_value is None:
            continue

        evidence.append({
            "feature": feature,
            "readable_feature": format_feature_name(feature),
            "shap_value": shap_value,
            "direction": direction,
            "interpretation": (
                f"The model indicates that the feature"
                f"{format_feature_name(feature)} "
                f"{'increases' if direction == 'Increases churn risk' else 'decreases'} "
                f"the predicted churn risk."
            )
        })

    return evidence


def build_limitations() -> list[str]:
    """
    Explain the boundaries of the investigation report.
    """

    return [
        "The churn prediction and probability come from the "
        "existing XGBoost model. The assistant does not modify them.",

        "SHAP values describe how features contribute to the "
        "model output. They do not establish cause and effect.",

        "Categorical features may be one-hot encoded and numerical "
        "features may be transformed. Their SHAP contributions "
        "should not be interpreted as raw customer measurements.",

        "Retention recommendations are general suggestions based "
        "on existing project rules. Their effectiveness is not guaranteed.",

        "The model's output is an estimate, not a confirmed future "
        "customer decision. Human review is required."
    ]


def generate_investigation(explanation: dict[str, Any]) -> dict:
    """
    Build a structured customer investigation from the
    existing prediction and SHAP explanation response.
    """

    required_fields = [
        "prediction",
        "prediction_label",
        "churn_probability",
        "top_factors",
        "retention_recommendations"
    ]

    for field in required_fields:
        if field not in explanation:
            raise ValueError(
                f"Missing required explanation field: {field}"
            )

    prediction = explanation["prediction"]
    probability = explanation["churn_probability"]

    if prediction not in (0, 1):
        raise ValueError("Prediction must be either 0 or 1.")

    if not isinstance(probability, (int, float)):
        raise ValueError("Churn probability must be numeric.")

    if not 0 <= probability <= 1:
        raise ValueError("Churn probability must be between 0 and 1.")

    evidence = interpret_evidence(
        explanation["top_factors"]
    )

    recommendations = explanation[
        "retention_recommendations"
    ]

    return {
        "project": "RetainAI",
        "assistant_type": "Local Rule-Based Investigation Assistant",

        "prediction": {
            "value": prediction,
            "label": explanation["prediction_label"],
            "churn_probability": probability,
            "model": explanation.get("model", "XGBClassifier")
        },

        "summary": build_summary(
            prediction,
            probability
        ),

        "evidence_interpretation": evidence,

        "limitations": build_limitations(),

        "recommended_actions": recommendations,

        "human_review_required": True
    }
