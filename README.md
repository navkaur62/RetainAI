

<div align="center">

<img src="docs/banner.svg" alt="RetainAI banner" width="100%">


An end-to-end machine learning application that predicts customer churn, explains the prediction with SHAP, and suggests retention actions through a FastAPI backend and a React dashboard.

🟦 **Python 3.12** &nbsp; 🟩 **FastAPI** &nbsp; 🟧 **XGBoost** &nbsp; 🟪 **SHAP** &nbsp; 🟦 **React + Vite** &nbsp; 🟩 **Pytest (3 passing)**

</div>

---

## Table of Contents

1. [📌 Project Overview](#-1-project-overview)
2. [✨ Key Features](#-2-key-features)
3. [🧰 Technology Stack](#-3-technology-stack)
4. [🧱 Project Architecture](#-4-project-architecture)
5. [🔬 Machine Learning Workflow](#-5-machine-learning-workflow)
6. [📊 Model Evaluation Results](#-6-model-evaluation-results)
7. [🔍 SHAP Explainability](#-7-shap-explainability)
8. [💡 Retention Recommendations](#-8-retention-recommendations)
9. [📋 Local Investigation Assistant](#-9-local-investigation-assistant)
10. [🔌 FastAPI Endpoints](#-10-fastapi-endpoints)
11. [🎨 Frontend Functionality](#-11-frontend-functionality)
12. [📁 Project Structure](#-12-project-structure)
13. [📦 Installation and Setup](#-13-installation-and-setup)
14. [🚀 Running the Application](#-14-running-the-application)
15. [📖 API Documentation](#-15-api-documentation)
16. [🧪 Testing](#-16-testing)
17. [🚧 Important Limitations](#-17-important-limitations)
18. [📈 Development Progress](#-18-development-progress)
19. [🔮 Future Improvements](#-19-future-improvements)
20. [👤 Author](#-20-author)

---

## 📌 1. Project Overview

Customer churn, when a customer stops using a service, is a costly problem for subscription-based businesses. **RetainAI** is a machine learning application that:

- predicts whether a customer is likely to churn,
- estimates the churn probability,
- identifies the factors that influenced the prediction, and
- provides retention recommendations for human review.

The project combines Machine Learning, Explainable AI (SHAP), a Python/FastAPI backend, a React dashboard, and a local rule-based investigation assistant. Its purpose is to demonstrate an end-to-end machine learning application integrated with a full-stack web interface.

The model is trained on the public **IBM Telco Customer Churn** dataset. RetainAI is a learning and portfolio project and does not use live customer data.

---

## ✨ 2. Key Features

| Feature | Description |
|---|---|
| 🎯 **Churn prediction** | An XGBoost classifier predicts churn and returns the churn probability. |
| 🔍 **SHAP explainability** | Shows which features pushed a prediction towards or away from churn. |
| 💡 **Retention recommendations** | Rule-based suggestions generated from churn-related factors and explainability results. |
| 🧾 **Investigation assistant** | A local, rule-based assistant that produces a structured investigation summary. |
| 🔌 **REST API** | FastAPI backend with interactive Swagger documentation. |
| 📊 **React dashboard** | Pages for prediction, explainability, investigation, and backend health/settings. |
| 🧪 **Automated tests** | Pytest tests for the investigation assistant logic. |

---

## 🧰 3. Technology Stack

**Backend and Machine Learning**


| Area | Technologies |
|---|---|
| Data analysis and visualisation | Pandas, NumPy, Matplotlib, Seaborn |
| Machine learning | Scikit-learn, XGBoost, Joblib |
| Explainability | SHAP |
| API | FastAPI, Uvicorn, Pydantic |
| Testing | Pytest |

**Frontend**

| Area | Technologies |
|---|---|
| Framework and tooling | React.js, Vite, JavaScript |
| API communication | Axios |
| Charts and icons | Recharts, Lucide React |
| Styling | CSS |

**Development Tools:** Visual Studio Code, Jupyter Notebook, Git and GitHub, PowerShell, Node.js, npm.

---

## 🧱 4. Project Architecture

```text
+-----------+      +------------------------------+
|   User    | ---> |   React + Vite Frontend      |
+-----------+      |   (Axios, Recharts, Lucide)  |
                   +--------------+---------------+
                                  |  HTTP requests (JSON)
                                  v
                   +------------------------------+
                   |   FastAPI Backend            |
                   |   src/api.py                 |
                   |   /  /health  /predict       |
                   |   /explain  /investigate     |
                   +--------------+---------------+
                                  |
        +-------------------------+-------------------------+
        |                         |                         |
        v                         v                         v
+----------------+     +--------------------+     +------------------------+
| Trained model  |     | SHAP explainability|     | Retention              |
| pipeline       |<----| src/explainability |---->| recommendations        |
| models/*.joblib|     | .py                |     | src/recommendations.py |
+-------+--------+     +----------+---------+     +-----------+------------+
        |                         |                           |
        +-------------------------+---------------------------+
                                  |
                                  v
                   +------------------------------+
                   |   Local rule-based           |
                   |   investigation assistant    |
                   |   src/investigation_         |
                   |   assistant.py               |
                   +------------------------------+
```

**Request flow**

1. The user enters customer details in the React dashboard.
2. The frontend sends the data to the FastAPI backend through Axios.
3. The backend loads the trained model pipeline and returns a churn prediction and probability.
4. For explanation and investigation requests, the backend adds SHAP results, recommendations, and the rule-based investigation summary.
5. The frontend displays the results.

---

## 🔬 5. Machine Learning Workflow

**Dataset:** IBM Telco Customer Churn (`Telco-Customer-Churn.csv`), expected at `data/raw/Telco-Customer-Churn.csv`.

The workflow is documented in three Jupyter notebooks:

| Order | Notebook | Purpose |
|---|---|---|
| 1 | `notebooks/01_eda.ipynb` | Exploratory Data Analysis |
| 2 | `notebooks/02_data_preprocessing.ipynb` | Data cleaning and preprocessing |
| 3 | `notebooks/03_model_training.ipynb` | Model training and comparison |

The dataset is used for exploratory analysis, cleaning, preprocessing, feature preparation, model training, and model evaluation. The selected final model is an **XGBoost classifier**.

Trained artifacts used by the backend:

- `models/churn_model_pipeline.joblib`
- `models/preprocessor.joblib`

---

## 📊 6. Model Evaluation Results

### Final held-out test metrics

Source: `reports/model/test_metrics.json`

| Metric | Score | Visual (each block = 10%) |
|---|---:|:---|
| Accuracy | 75.4436% | 🟩🟩🟩🟩🟩🟩🟩🟩⬜⬜ |
| Precision | 52.5455% | 🟩🟩🟩🟩🟩⬜⬜⬜⬜⬜ |
| Recall | 77.2727% | 🟩🟩🟩🟩🟩🟩🟩🟩⬜⬜ |
| F1-Score | 62.5541% | 🟩🟩🟩🟩🟩🟩⬜⬜⬜⬜ |
| ROC-AUC | 84.1918% | 🟩🟩🟩🟩🟩🟩🟩🟩⬜⬜ |

### Model comparison

A separate comparison of the candidate models is stored in `reports/model/model_comparison.csv`. These comparison results are kept separate from the final held-out test metrics above and should not be read as the same evaluation.

### Interpreting the results

The model has a higher recall than precision. It identifies most customers who churn (about 77%) but also flags some customers who would not have churned. For a retention use case, where the cost of contacting an extra customer is often lower than the cost of losing one, this is a reasonable trade-off, but it depends on the business context. The decision threshold used in the tested API example is 0.5.

---

## 🔍 7. SHAP Explainability

RetainAI uses **SHAP (SHapley Additive exPlanations)** to explain individual model predictions. The explainability module (`src/explainability.py`):

- identifies the features that influenced a churn prediction,
- displays positive contributions (towards churn) and negative contributions (away from churn),
- helps interpret why the model predicts a customer may churn, and
- gives understandable evidence for retention analysis.

Features that are important in this dataset include `Tenure`, `Contract`, `MonthlyCharges`, `TotalCharges`, `InternetService`, `PaymentMethod`, `OnlineSecurity`, and `TechSupport`.

> [!NOTE]
> SHAP values describe how much each feature contributed to the **model's** output. They do **not** prove that a feature causes a customer to churn.

---

## 💡 8. Retention Recommendations

`src/recommendations.py` generates retention suggestions based on churn-related factors and explainability results. Examples include:

- offering suitable annual contract incentives,
- improving customer onboarding and engagement,
- reviewing customer pricing,
- considering relevant online security packages,
- considering technical support packages, and
- exploring suitable payment options.

These are **suggestions that require human review**. The application does not change customer accounts or execute any business action automatically.

---

## 📋 9. Local Investigation Assistant

`src/investigation_assistant.py` is a **local, rule-based** investigation assistant. It is **not** a generative AI assistant or an LLM, and it does not require a paid OpenAI API or any external AI API.

It builds on existing outputs:

- churn predictions and churn probabilities,
- SHAP explanation results,
- evidence interpretations, and
- retention recommendations.

It produces structured information including an investigation summary, evidence interpretation, limitations, recommended actions, and a human review requirement.

The assistant **never modifies or overrides** the original machine learning prediction or probability. This behaviour is covered by an automated test (`test_prediction_is_not_changed`).

---

## 🔌 10. FastAPI Endpoints

The backend is implemented in `src/api.py`.

| Method | Endpoint | Function |
|---|---|---|
| `GET` | `/` | API welcome/status |
| `GET` | `/health` | Backend and model health |
| `POST` | `/predict` | Predict customer churn |
| `POST` | `/explain` | Generate SHAP explanation |
| `POST` | `/investigate` | Generate investigation summary |

**Example `/health` response**

```json
{
  "status": "healthy",
  "model_loaded": true,
  "model": "XGBClassifier",
  "input_features": 19
}
```

**Example `/predict` result (one tested case)**

| Field | Value |
|---|---|
| Prediction | `1` |
| Churn probability | `0.724` |
| Prediction label | `Churn` |
| Model | `XGBClassifier` |
| Threshold | `0.5` |

> [!NOTE]
> This is a single test result for illustration only. It is not a fixed or universal prediction.

---

## 🎨 11. Frontend Functionality

The frontend is built with React and Vite and communicates with the FastAPI backend using Axios. Charts use Recharts and icons use Lucide React.

| Page | File | Description |
|---|---|---|
| Customer Prediction | `CustomerPrediction.jsx` | Enter customer information and receive churn prediction results. |
| Customer Explainability | `CustomerExplainability.jsx` | View the factors influencing the prediction using SHAP explanations. |
| Customer Investigation | `CustomerInvestigation.jsx` | View investigation summaries, evidence interpretations, limitations, and recommended retention actions. |
| Settings | `Settings.jsx` | View backend health and model status. |

Other frontend files include `App.jsx`, `main.jsx`, `App.css`, `index.css`, a CSS file for each page, and a `services/` folder for API communication.

---

## 📁 12. Project Structure

Simplified structure. Not every directory or file is tracked by Git (see [Important Limitations](#17-important-limitations)).

```text
RetainAI/
|
|-- data/
|   |-- raw/
|   |   |-- Telco-Customer-Churn.csv
|   |-- processed/
|
|-- frontend/
|   |-- public/
|   |-- src/
|   |   |-- assets/
|   |   |-- services/
|   |   |-- App.css
|   |   |-- App.jsx
|   |   |-- CustomerExplainability.css
|   |   |-- CustomerExplainability.jsx
|   |   |-- CustomerInvestigation.css
|   |   |-- CustomerInvestigation.jsx
|   |   |-- CustomerPrediction.css
|   |   |-- CustomerPrediction.jsx
|   |   |-- index.css
|   |   |-- main.jsx
|   |   |-- Settings.css
|   |   |-- Settings.jsx
|   |-- package.json
|   |-- package-lock.json
|   |-- vite.config.js
|
|-- models/
|   |-- churn_model_pipeline.joblib
|   |-- preprocessor.joblib
|
|-- notebooks/
|   |-- 01_eda.ipynb
|   |-- 02_data_preprocessing.ipynb
|   |-- 03_model_training.ipynb
|
|-- reports/
|   |-- model/
|       |-- model_comparison.csv
|       |-- test_metrics.json
|
|-- src/
|   |-- api.py
|   |-- explainability.py
|   |-- investigation_assistant.py
|   |-- recommendations.py
|
|-- tests/
|
|-- requirements.txt
|-- .gitignore
|-- README.md
```

---

## 📦 13. Installation and Setup

> [!IMPORTANT]
> Cloning this repository alone is **not** enough to run the full application. The dataset and trained model files are excluded from Git, so you must prepare them first (steps 4 and 5).

**Prerequisites:** Python 3.12, Node.js with npm, Git, and Windows PowerShell.

### 1. Clone the repository

```powershell
git clone <https://github.com/navkaur62/RetainAI>
cd RetainAI
```

### 2. Create and activate a virtual environment

```powershell
py -3.12 -m venv .venv
.\.venv\Scripts\Activate.ps1
```

If PowerShell blocks the activation script, you may need to allow scripts for the current session before activating:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

### 3. Install Python dependencies

```powershell
python -m pip install --upgrade pip
pip install -r requirements.txt
```

The pinned versions in `requirements.txt` were used during development on Windows with Python 3.12.10. Compatibility on other operating systems or Python versions has not been verified.

### 4. Obtain the dataset

Download the IBM Telco Customer Churn dataset and place it at:

```text
data/raw/Telco-Customer-Churn.csv
```

### 5. Generate the model artifacts

Run the notebooks in order (for example in Jupyter Notebook or VS Code) to reproduce preprocessing and model training:

1. `notebooks/01_eda.ipynb`
2. `notebooks/02_data_preprocessing.ipynb`
3. `notebooks/03_model_training.ipynb`

The backend requires these files to exist after training:

```text
models/churn_model_pipeline.joblib
models/preprocessor.joblib
```

Confirm that both files are present before starting the backend.

### 6. Install frontend dependencies

Open a second PowerShell terminal:

```powershell
cd frontend
npm install
```

Create `frontend/.env`:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

---

## 🚀 14. Running the Application

> [!TIP]
> The backend and frontend must **both** be running for the application to work. Start the backend first.

**Terminal 1: backend** (from the project root, with the virtual environment active)

```powershell
uvicorn src.api:app --reload
```

| Service | URL |
|---|---|
| Backend | http://127.0.0.1:8000 |
| Swagger UI | http://127.0.0.1:8000/docs |

**Terminal 2: frontend**

```powershell
cd frontend
npm run dev
```

Open the URL printed by Vite, usually http://localhost:5173.

**Production build of the frontend**

```powershell
npm run build
```

---

## 📖 15. API Documentation

FastAPI generates interactive Swagger documentation. With the backend running, open:

```text
http://127.0.0.1:8000/docs
```

From there you can inspect request and response schemas and try each endpoint (`/`, `/health`, `/predict`, `/explain`, `/investigate`) directly in the browser.

---

## 🧪 16. Testing

### Backend tests

```powershell
python -m pytest -v
```

**Result: 3 tests passed.**

| Test | What it checks |
|---|---|
| `test_generate_investigation` | The investigation assistant generates a structured investigation. |
| `test_prediction_is_not_changed` | The assistant does not alter the original prediction. |
| `test_invalid_probability_is_rejected` | An invalid probability value is rejected. |

### API testing

The `/`, `/health`, `/predict`, `/explain`, and `/investigate` endpoints were tested and returned successful responses in the tested workflow.

### Frontend build

```powershell
npm run build
```

The production build completed successfully. A non-fatal warning about a large JavaScript bundle was shown; bundle optimisation has **not** been done yet.

> [!NOTE]
> ESLint and other additional checks have not been run or verified.

---

## 🚧 17. Important Limitations

> [!WARNING]
> RetainAI is a portfolio project that runs locally. It is not production-ready and its predictions and recommendations must be reviewed by a human.

- **A fresh clone cannot run the full app.** The raw dataset (`data/raw/`), processed datasets, and trained model artifacts (`models/*.joblib`) are excluded by `.gitignore`. Only `models/.gitkeep` is tracked. You must obtain the dataset and run the training notebooks to generate the model files.
- **Dataset scope.** The model is trained on the public IBM Telco Customer Churn dataset, not live customer data. Performance on other customer populations is unknown.
- **Moderate precision.** Precision on the held-out test set is about 52.5%, so a number of customers flagged as likely to churn will not actually churn.
- **SHAP is not causal.** Explanations show model contributions, not proven causes of churn.
- **Rule-based assistant.** The investigation assistant is not an LLM and only reorganises existing model outputs using fixed rules.
- **Human review required.** Recommendations are suggestions and do not trigger any automatic action.
- **Not deployed.** The application has not been deployed publicly. It runs locally only.
- **No authentication or database.** The current project has no user authentication, database integration, or cloud deployment.
- **Frontend bundle size** has not been optimised.

---

## 📈 18. Development Progress

| Phase | Description | Status |
|---|---|---|
| 1–3 | Project setup, EDA, data cleaning and preprocessing | 🟢 Completed |
| 4 | Machine learning model development | 🟢 Completed |
| 5 | SHAP explainability and retention recommendations | 🟢 Completed |
| 6 | FastAPI backend integration | 🟢 Completed |
| 7 | Local rule-based investigation assistant | 🟢 Completed |
| 8 | React dashboard integration | 🟢 Completed |
| 9 | Investigation frontend | 🟢 Completed |
| 10 | Settings and backend health monitoring | 🟢 Completed |
| 11 | Testing and quality checks | 🟢 Completed |
| 12 | Documentation and deployment preparation | 🟢 Completed |

---

## 🔮 19. Future Improvements

The following are possible enhancements, not existing functionality:

- Deploy the React frontend.
- Deploy the FastAPI backend.
- Optimise the frontend bundle size.
- Expand automated test coverage.
- Add additional customer analytics.
- Improve retention recommendation strategies.
- Explore additional model explainability features.

---

## 👤 20. Author

**Navdeep Kaur**

- GitHub: `<https://github.com/navkaur62/>`
- LinkedIn: `<https://www.linkedin.com/in/navdeep-kaur-32b2a631b/>` 