
from pathlib import Path

import pandas as pd


# --------------------------------------------------
# CONFIGURATION
# --------------------------------------------------

ROOT_DIR = Path(__file__).resolve().parent.parent

EXPLANATION_PATH = (
    ROOT_DIR
    / "reports"
    / "shap"
    / "customer_explanation.csv"
)

OUTPUT_DIR = ROOT_DIR / "reports" / "shap"

OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


# --------------------------------------------------
# RETENTION ACTION RULES
# --------------------------------------------------

def get_retention_action(feature, feature_value):

    feature = str(feature)
    value = float(feature_value)

    # Contract-related recommendations
    if feature.endswith("Contract_Month-to-month"):
        return (
            "Offer an annual contract incentive.",
            "The customer has a month-to-month contract. "
            "A suitable long-term plan may improve retention."
        )

    # Customer tenure
    if feature == "num__tenure" and value < 0:
        return (
            "Introduce an onboarding and early-loyalty program.",
            "Customer tenure is below the training-data average. "
            "Early engagement may help strengthen the relationship."
        )

    # Monthly charges
    if feature == "num__MonthlyCharges" and value > 0:
        return (
            "Review the customer's subscription pricing.",
            "Monthly charges are above the training-data average. "
            "Consider suitable plans or discounts."
        )

    # Online security
    if feature.endswith("OnlineSecurity_No"):
        return (
            "Offer an optional online security package.",
            "The customer does not currently have online security."
        )

    # Technical support
    if feature.endswith("TechSupport_No"):
        return (
            "Offer a technical support package.",
            "The customer does not currently have technical support."
        )

    # Online backup
    if feature.endswith("OnlineBackup_No"):
        return (
            "Introduce available online backup services.",
            "The customer does not currently have online backup."
        )

    # Device protection
    if feature.endswith("DeviceProtection_No"):
        return (
            "Explain the benefits of optional device protection.",
            "The customer does not currently have device protection."
        )

    # Payment method
    if feature.endswith("PaymentMethod_Electronic check"):
        return (
            "Offer convenient automatic payment options.",
            "The customer currently uses electronic check payment."
        )

    return None


# --------------------------------------------------
# GENERATE RETENTION RECOMMENDATIONS
# --------------------------------------------------

def generate_recommendations():

    print("\nLoading customer SHAP explanations...")

    if not EXPLANATION_PATH.exists():
        raise FileNotFoundError(
            f"Explanation file not found: {EXPLANATION_PATH}"
        )

    explanation_df = pd.read_csv(EXPLANATION_PATH)

    required_columns = {
        "feature",
        "feature_value",
        "shap_value",
        "direction",
        "absolute_impact"
    }

    missing = required_columns - set(explanation_df.columns)

    if missing:
        raise ValueError(
            f"Missing columns in explanation file: {missing}"
        )

    if explanation_df.empty:
        raise ValueError("Customer explanation file is empty.")

    if not pd.to_numeric(
        explanation_df["shap_value"],
        errors="coerce"
    ).notna().all():
        raise ValueError("Invalid SHAP values found.")

    # Only consider factors pushing the model
    # towards its churn prediction.
    risk_factors = explanation_df[
        explanation_df["shap_value"] > 0
    ].copy()

    risk_factors = risk_factors.sort_values(
        by="absolute_impact",
        ascending=False
    )

    recommendations = []

    print("\nGenerating retention actions...")

    for _, row in risk_factors.iterrows():

        feature = row["feature"]

        action = get_retention_action(
            feature,
            row["feature_value"]
        )

        if action is None:
            continue

        recommendation, reason = action

        recommendations.append({
            "priority": len(recommendations) + 1,
            "feature": feature,
            "shap_value": row["shap_value"],
            "recommendation": recommendation,
            "reason": reason
        })

    # Save recommendations
    recommendations_df = pd.DataFrame(
        recommendations,
        columns=[
            "priority",
            "feature",
            "shap_value",
            "recommendation",
            "reason"
        ]
    )

    output_path = (
        OUTPUT_DIR / "retention_recommendations.csv"
    )

    recommendations_df.to_csv(
        output_path,
        index=False
    )

    # Save protective factors separately.
    protective_factors = explanation_df[
        explanation_df["shap_value"] < 0
    ].sort_values(
        by="absolute_impact",
        ascending=False
    )

    protective_path = (
        OUTPUT_DIR / "customer_protective_factors.csv"
    )

    protective_factors.to_csv(
        protective_path,
        index=False
    )

    # Display results
    print("\n====================================")
    print("RETAINAI RETENTION RECOMMENDATIONS")
    print("====================================")

    if recommendations_df.empty:

        print(
            "\nNo predefined retention actions matched "
            "the customer's positive SHAP factors."
        )

        print(
            "Review the explanation manually rather "
            "than inventing recommendations."
        )

    else:

        for _, row in recommendations_df.iterrows():

            print(f"\nPriority: {row['priority']}")
            print(f"Risk factor: {row['feature']}")
            print(f"SHAP value: {row['shap_value']:.5f}")
            print(f"Action: {row['recommendation']}")
            print(f"Reason: {row['reason']}")

    print("\nProtective factors:", len(protective_factors))

    print("\nReports saved successfully:")
    print(output_path)
    print(protective_path)

    return recommendations_df


# --------------------------------------------------
# MAIN
# --------------------------------------------------

if __name__ == "__main__":

    generate_recommendations()
