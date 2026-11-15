
from pathlib import Path

import joblib
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import shap


# --------------------------------------------------
# CONFIGURATION
# --------------------------------------------------

ROOT_DIR = Path(__file__).resolve().parent.parent

MODEL_PATH = ROOT_DIR / "models" / "churn_model_pipeline.joblib"
FEATURE_PATH = ROOT_DIR / "data" / "processed" / "feature_names.npy"
TEST_PATH = ROOT_DIR / "data" / "processed" / "X_test.npy"

OUTPUT_DIR = ROOT_DIR / "reports" / "shap"

OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


# --------------------------------------------------
# LOAD MODEL AND DATA
# --------------------------------------------------

def load_explainability_data():

    print("Loading trained pipeline...")

    pipeline = joblib.load(MODEL_PATH)

    if "classifier" not in pipeline.named_steps:
        raise ValueError("Classifier step not found in pipeline.")

    classifier = pipeline.named_steps["classifier"]

    print("Loading transformed test data...")

    X_test = np.load(TEST_PATH)

    feature_names = np.load(
        FEATURE_PATH,
        allow_pickle=True
    ).astype(str)

    if X_test.shape[1] != len(feature_names):
        raise ValueError(
            "Feature count does not match test data."
        )

    if not np.isfinite(X_test).all():
        raise ValueError("Test data contains non-finite values.")

    if X_test.shape[1] != classifier.n_features_in_:
        raise ValueError(
            "Input feature count does not match classifier."
        )

    print("Model:", type(classifier).__name__)
    print("Test samples:", X_test.shape[0])
    print("Features:", X_test.shape[1])

    return pipeline, classifier, X_test, feature_names


# --------------------------------------------------
# GENERATE SHAP EXPLANATIONS
# --------------------------------------------------

def generate_shap_explanations(classifier, X_test, feature_names):

    print("\nCreating SHAP TreeExplainer...")

    explainer = shap.TreeExplainer(classifier)

    print("Calculating SHAP values...")

    explanation = explainer(X_test)

    values = explanation.values
    base_values = explanation.base_values

    # Handle SHAP output dimensions.
    if values.ndim == 3:

        class_index = 1

        values = values[:, :, class_index]

        if np.ndim(base_values) == 2:
            base_values = base_values[:, class_index]

    if values.ndim != 2:
        raise ValueError(
            f"Unexpected SHAP output shape: {values.shape}"
        )

    print("SHAP calculation completed.")

    return values, base_values


# --------------------------------------------------
# GLOBAL FEATURE IMPORTANCE
# --------------------------------------------------

def generate_global_importance(values, feature_names):

    print("\nGenerating global feature importance...")

    importance = np.abs(values).mean(axis=0)

    importance_df = pd.DataFrame({
        "feature": feature_names,
        "mean_absolute_shap": importance,
        "mean_shap": values.mean(axis=0)
    })

    importance_df = importance_df.sort_values(
        by="mean_absolute_shap",
        ascending=False
    )

    output_path = OUTPUT_DIR / "global_feature_importance.csv"

    importance_df.to_csv(output_path, index=False)

    print("\nTop 10 important features:")

    print(importance_df.head(10).to_string(index=False))

    # Global bar plot
    plt.figure()

    shap.summary_plot(
        values,
        feature_names=feature_names,
        plot_type="bar",
        max_display=20,
        show=False
    )

    plt.title("RetainAI - Global Feature Importance")

    plt.tight_layout()

    plt.savefig(
        OUTPUT_DIR / "shap_global_importance.png",
        dpi=300,
        bbox_inches="tight"
    )

    plt.close()

    # Global beeswarm plot
    plt.figure()

    shap.summary_plot(
        values,
        X_test_global,
        feature_names=feature_names,
        max_display=20,
        show=False
    )

    plt.title("RetainAI - SHAP Summary Plot")

    plt.tight_layout()

    plt.savefig(
        OUTPUT_DIR / "shap_summary.png",
        dpi=300,
        bbox_inches="tight"
    )

    plt.close()

    print("Global SHAP reports saved.")

    return importance_df


# --------------------------------------------------
# INDIVIDUAL CUSTOMER EXPLANATION
# --------------------------------------------------

def explain_customer(
    classifier,
    X_test,
    feature_names,
    values,
    base_values,
    customer_index
):

    print(f"\nExplaining customer at index {customer_index}...")

    customer_values = values[customer_index]

    customer_data = X_test[customer_index]

    probability = classifier.predict_proba(
        customer_data.reshape(1, -1)
    )[0]

    classes = list(classifier.classes_)

    churn_index = classes.index(1)

    churn_probability = float(probability[churn_index])

    print(f"Churn probability: {churn_probability:.4f}")

    # Create individual SHAP explanation
    customer_base = np.asarray(base_values)

    if customer_base.ndim > 0:
        customer_base = customer_base[customer_index]

    customer_explanation = shap.Explanation(
        values=customer_values,
        base_values=float(np.asarray(customer_base).item()),
        data=customer_data,
        feature_names=feature_names
    )

    # Waterfall plot
    plt.figure()

    shap.plots.waterfall(
        customer_explanation,
        max_display=15,
        show=False
    )

    plt.title("RetainAI - Individual Customer Explanation")

    plt.tight_layout()

    plt.savefig(
        OUTPUT_DIR / "customer_waterfall.png",
        dpi=300,
        bbox_inches="tight"
    )

    plt.close()

    # Separate factors increasing and decreasing churn output
    customer_df = pd.DataFrame({
        "feature": feature_names,
        "feature_value": customer_data,
        "shap_value": customer_values
    })

    customer_df["direction"] = np.where(
        customer_df["shap_value"] > 0,
        "Increases churn output",
        "Reduces churn output"
    )

    customer_df["absolute_impact"] = np.abs(
        customer_df["shap_value"]
    )

    customer_df = customer_df.sort_values(
        by="absolute_impact",
        ascending=False
    )

    customer_df.to_csv(
        OUTPUT_DIR / "customer_explanation.csv",
        index=False
    )

    print("\nFactors increasing churn output:")

    print(
        customer_df[
            customer_df["shap_value"] > 0
        ].head(10).to_string(index=False)
    )

    print("\nFactors reducing churn output:")

    print(
        customer_df[
            customer_df["shap_value"] < 0
        ].head(10).to_string(index=False)
    )

    print("\nIndividual explanation saved.")

    return customer_df


# --------------------------------------------------
# MAIN EXECUTION
# --------------------------------------------------

def main():

    global X_test_global

    (
        pipeline,
        classifier,
        X_test,
        feature_names
    ) = load_explainability_data()

    X_test_global = X_test

    values, base_values = generate_shap_explanations(
        classifier,
        X_test,
        feature_names
    )

    importance_df = generate_global_importance(
        values,
        feature_names
    )

    # Select the customer with the highest predicted
    # churn probability in the test dataset.
    probabilities = classifier.predict_proba(X_test)

    classes = list(classifier.classes_)

    churn_index = classes.index(1)

    customer_index = int(
        np.argmax(probabilities[:, churn_index])
    )

    print("\nSelected highest-risk test customer:")
    print("Customer index:", customer_index)
    print(
        "Churn probability:",
        probabilities[customer_index, churn_index]
    )

    explain_customer(
        classifier,
        X_test,
        feature_names,
        values,
        base_values,
        customer_index
    )

    print("\n===================================")
    print("RETAINAI SHAP EXPLANATIONS COMPLETE")
    print("===================================")

    print("Reports saved at:", OUTPUT_DIR)


if __name__ == "__main__":
    main()
