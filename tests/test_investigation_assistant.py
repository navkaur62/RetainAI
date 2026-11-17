
from src.investigation_assistant import generate_investigation


def test_generate_investigation():
    explanation = {
        "prediction": 1,
        "prediction_label": "Churn",
        "churn_probability": 0.8175,
        "model": "XGBClassifier",
        "top_factors": [
            {
                "feature": "num__tenure",
                "shap_value": 0.714983,
                "direction": "Increases churn risk"
            },
            {
                "feature": "cat__Contract_Month-to-month",
                "shap_value": 0.590048,
                "direction": "Increases churn risk"
            }
        ],
        "retention_recommendations": [
            {
                "feature": "num__tenure",
                "recommendation": (
                    "Introduce an onboarding and early-loyalty program."
                ),
                "reason": (
                    "Customer tenure is below the training-data average."
                )
            }
        ]
    }

    report = generate_investigation(explanation)

    assert report["prediction"]["value"] == 1
    assert report["prediction"]["churn_probability"] == 0.8175

    assert "81.75%" in report["summary"]

    assert len(report["evidence_interpretation"]) == 2
    assert len(report["recommended_actions"]) == 1

    assert report["human_review_required"] is True


def test_prediction_is_not_changed():
    explanation = {
        "prediction": 0,
        "prediction_label": "No Churn",
        "churn_probability": 0.25,
        "top_factors": [],
        "retention_recommendations": []
    }

    report = generate_investigation(explanation)

    assert report["prediction"]["value"] == 0
    assert report["prediction"]["churn_probability"] == 0.25


def test_invalid_probability_is_rejected():
    explanation = {
        "prediction": 1,
        "prediction_label": "Churn",
        "churn_probability": 1.5,
        "top_factors": [],
        "retention_recommendations": []
    }

    try:
        generate_investigation(explanation)
        assert False, "Expected ValueError"
    except ValueError:
        pass
