
import { useState } from "react";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

import {
  LayoutDashboard,
  Users,
  BrainCircuit,
  ShieldCheck,
  Settings,
  Bell,
  Activity,
  ChevronRight,
  Menu,
  X,
  Sparkles,
  Database,
} from "lucide-react";
import CustomerPrediction, {
  initialForm,
} from "./CustomerPrediction";

import CustomerExplainability from "./CustomerExplainability";
import CustomerInvestigation from "./CustomerInvestigation";
import SettingsPage from "./Settings";
import "./App.css";

const modelComparisonData = [
  {
    model: "XGBoost",
    Accuracy: 76.06,
    Precision: 53.38,
    Recall: 77.19,
    F1: 63.1,
    "ROC-AUC": 84.3,
  },
  {
    model: "Logistic Regression",
    Accuracy: 74.85,
    Precision: 51.69,
    Recall: 80.13,
    F1: 62.83,
    "ROC-AUC": 84.6,
  },
  {
    model: "Random Forest",
    Accuracy: 78.54,
    Precision: 62.73,
    Recall: 47.16,
    F1: 53.8,
    "ROC-AUC": 82.23,
  },
  {
    model: "Decision Tree",
    Accuracy: 73.64,
    Precision: 50.4,
    Recall: 48.7,
    F1: 49.51,
    "ROC-AUC": 65.7,
  },
];

const selectedModelMetrics = [
  { metric: "Accuracy", score: 75.44 },
  { metric: "Precision", score: 52.55 },
  { metric: "Recall", score: 77.27 },
  { metric: "F1 Score", score: 62.55 },
  { metric: "ROC-AUC", score: 84.19 },
];

function App() {
  const [activePage, setActivePage] = useState("Overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [customerData, setCustomerData] = useState(initialForm);
  const [predictionResult, setPredictionResult] = useState(null);
  const navigation = [
    { name: "Overview", icon: LayoutDashboard },
    { name: "Churn Prediction", icon: Users },
    { name: "Explainability", icon: BrainCircuit },
    { name: "Investigation", icon: ShieldCheck },
  ];

  const stats = [
    {
      title: "ML Model",
      value: "XGBoost",
      description: "Trained churn prediction model",
      icon: BrainCircuit,
    },
    {
      title: "Input Features",
      value: "19",
      description: "Customer attributes supported",
      icon: Database,
    },
    {
      title: "Explainability",
      value: "SHAP",
      description: "Feature contribution analysis",
      icon: Activity,
    },
    {
      title: "AI Assistant",
      value: "Local",
      description: "Rule-based investigation engine",
      icon: Sparkles,
    },
  ];

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="app-layout">
      {/* SIDEBAR */}
      <aside className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-icon">
            <Activity size={24} />
          </div>

          <div>
            <h2>RetainAI</h2>
            <span>Customer Intelligence</span>
          </div>

          <button
            className="mobile-close"
            onClick={closeSidebar}
            aria-label="Close navigation"
          >
            <X size={20} />
          </button>
        </div>

        <div className="nav-label">WORKSPACE</div>

        <nav className="navigation">
          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.name}
                className={`nav-item ${
                  activePage === item.name ? "active" : ""
                }`}
                onClick={() => {
                  setActivePage(item.name);
                  closeSidebar();
                }}
              >
                <Icon size={19} />
                <span>{item.name}</span>

                {activePage === item.name && (
                  <ChevronRight size={16} className="nav-arrow" />
                )}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-bottom">
          <div className="nav-label">PREFERENCES</div>

          <button
            className={`nav-item ${activePage === "Settings" ? "active" : ""}`}
            onClick={() => {
              setActivePage("Settings");
               setSidebarOpen(false);
            }}
          >
            <Settings size={19} />
           <span>Settings</span>
          </button>

          <div className="sidebar-profile">
            <div className="profile-avatar">R</div>

            <div>
              <strong>RetainAI Admin</strong>
              <span>Project Workspace</span>
            </div>
          </div>
        </div>
      </aside>

      {/* MOBILE SIDEBAR OVERLAY */}
      {sidebarOpen && (
        <button
          className="sidebar-overlay"
          onClick={closeSidebar}
          aria-label="Close navigation"
        />
      )}

      {/* MAIN CONTENT */}
      <main className="main-content">
        {/* TOPBAR */}
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="mobile-menu"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open navigation"
            >
              <Menu size={22} />
            </button>

            <div>
              <div className="breadcrumb">
                Workspace / {activePage}
              </div>
              <h1>{activePage}</h1>
            </div>
          </div>

          <div className="topbar-right">
            <div className="system-status">
              <span className="status-dot"></span>
              System Workspace
            </div>

            <button className="icon-button" aria-label="Notifications">
              <Bell size={19} />
            </button>

            <div className="top-avatar">R</div>
          </div>
        </header>

        {/* DASHBOARD CONTENT */}
        <section className="dashboard-content">

          {/* PAGE 1: OVERVIEW */}
          {activePage === "Overview" && (
            <>
              <div className="welcome-section">
                <div>
                  <div className="eyebrow">
                    <Sparkles size={15} />
                    CUSTOMER RETENTION INTELLIGENCE
                  </div>

                  <h2>Welcome to RetainAI</h2>

                  <p>
                    Predict customer churn, understand risk factors,
                    and discover data-driven retention strategies.
                  </p>
                </div>

                <div className="welcome-icon">
                  <BrainCircuit size={48} />
                </div>
              </div>

              <div className="section-heading">
                <div>
                  <h3>Project Overview</h3>
                  <p>Your machine learning system at a glance</p>
                </div>
              </div>

              {/* STATISTICS */}
              <div className="stats-grid">
                {stats.map((stat) => {
                  const Icon = stat.icon;

                  return (
                    <div className="stat-card" key={stat.title}>
                      <div className="stat-top">
                        <div className="stat-icon">
                          <Icon size={21} />
                        </div>

                        <span className="stat-indicator">
                          <span className="status-dot"></span>
                          Ready
                        </span>
                      </div>

                      <h3>{stat.value}</h3>

                      <p className="stat-title">{stat.title}</p>

                      <p className="stat-description">
                        {stat.description}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* MODEL PERFORMANCE */}
              <div className="section-heading">
                <div>
                  <h3>Model Performance Analytics</h3>
                  <p>
                    Evaluation results from your trained machine
                    learning models
                  </p>
                </div>
              </div>

              <div className="charts-grid">

                {/* MODEL COMPARISON CHART */}
                <div className="chart-panel">
                  <div className="chart-heading">
                    <div>
                      <h3>Model Comparison</h3>
                      <p>Performance across four trained models</p>
                    </div>

                    <span className="chart-tag">TEST RESULTS</span>
                  </div>

                  <ResponsiveContainer width="100%" height={330}>
                    <BarChart
                      data={modelComparisonData}
                      margin={{
                        top: 15,
                        right: 10,
                        left: 5,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#29354a"
                        vertical={false}
                      />

                      <XAxis
                        dataKey="model"
                        stroke="#8290a8"
                        tick={{ fontSize: 10 }}
                        interval={0}
                      />

                      <YAxis
                        domain={[0, 100]}
                        stroke="#8290a8"
                        tick={{ fontSize: 10 }}
                        tickFormatter={(value) => `${value}%`}
                      />

                      <Tooltip
                        contentStyle={{
                          background: "#172238",
                          border: "1px solid #394765",
                          borderRadius: "8px",
                          color: "#ffffff",
                        }}
                        formatter={(value) => [`${value}%`]}
                      />

                      <Legend wrapperStyle={{ fontSize: "10px" }} />

                      <Bar
                        dataKey="Accuracy"
                        fill="#818cf8"
                        radius={[4, 4, 0, 0]}
                      />

                      <Bar
                        dataKey="Precision"
                        fill="#38bdf8"
                        radius={[4, 4, 0, 0]}
                      />

                      <Bar
                        dataKey="Recall"
                        fill="#34d399"
                        radius={[4, 4, 0, 0]}
                      />

                      <Bar
                        dataKey="F1"
                        fill="#c084fc"
                        radius={[4, 4, 0, 0]}
                      />

                      <Bar
                        dataKey="ROC-AUC"
                        fill="#fbbf24"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* SELECTED MODEL METRICS */}
                <div className="chart-panel">
                  <div className="chart-heading">
                    <div>
                      <h3>Selected Model Metrics</h3>
                      <p>Final XGBoost test evaluation</p>
                    </div>

                    <span className="chart-tag">XGBOOST</span>
                  </div>

                  <ResponsiveContainer width="100%" height={330}>
                    <BarChart
                      data={selectedModelMetrics}
                      layout="vertical"
                      margin={{
                        top: 15,
                        right: 20,
                        left: 10,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#29354a"
                        horizontal={false}
                      />

                      <XAxis
                        type="number"
                        domain={[0, 100]}
                        stroke="#8290a8"
                        tick={{ fontSize: 10 }}
                        tickFormatter={(value) => `${value}%`}
                      />

                      <YAxis
                        type="category"
                        dataKey="metric"
                        stroke="#8290a8"
                        tick={{ fontSize: 11 }}
                        width={75}
                      />

                      <Tooltip
                        contentStyle={{
                          background: "#172238",
                          border: "1px solid #394765",
                          borderRadius: "8px",
                          color: "#ffffff",
                        }}
                        formatter={(value) => [
                          `${value}%`,
                          "Score",
                        ]}
                      />

                      <Bar
                        dataKey="score"
                        fill="#818cf8"
                        radius={[0, 5, 5, 0]}
                        barSize={23}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* WORKFLOW */}
              <div className="section-heading workflow-heading">
                <div>
                  <h3>RetainAI Workflow</h3>
                  <p>From customer data to actionable insights</p>
                </div>
              </div>

              <div className="workflow-grid">
                <div className="workflow-card">
                  <div className="workflow-number">01</div>

                  <div className="workflow-icon blue">
                    <Users size={22} />
                  </div>

                  <h4>Customer Data</h4>

                  <p>
                    Enter customer attributes for churn analysis.
                  </p>

                  <button
                    onClick={() => setActivePage("Churn Prediction")}
                  >
                    Analyze Customer <ChevronRight size={16} />
                  </button>
                </div>

                <div className="workflow-card">
                  <div className="workflow-number">02</div>

                  <div className="workflow-icon purple">
                    <BrainCircuit size={22} />
                  </div>

                  <h4>Explainable AI</h4>

                  <p>
                    Understand the factors influencing predictions.
                  </p>

                  <button
                    onClick={() => setActivePage("Explainability")}
                  >
                    View Explainability <ChevronRight size={16} />
                  </button>
                </div>

                <div className="workflow-card">
                  <div className="workflow-number">03</div>

                  <div className="workflow-icon green">
                    <ShieldCheck size={22} />
                  </div>

                  <h4>Investigation</h4>

                  <p>
                    Generate a structured customer risk report.
                  </p>

                  <button
                    onClick={() => setActivePage("Investigation")}
                  >
                    Investigate Risk <ChevronRight size={16} />
                  </button>
                </div>
              </div>

              {/* BOTTOM PANELS */}
              <div className="bottom-grid">
                <div className="info-panel">
                  <div className="panel-heading">
                    <div>
                      <h3>Technology Stack</h3>
                      <p>Technologies powering RetainAI</p>
                    </div>

                    <Database size={20} />
                  </div>

                  <div className="tech-list">
                    <span>Python</span>
                    <span>FastAPI</span>
                    <span>XGBoost</span>
                    <span>SHAP</span>
                    <span>React</span>
                    <span>Machine Learning</span>
                  </div>
                </div>

                <div className="info-panel assistant-panel">
                  <div className="panel-heading">
                    <div>
                      <h3>Investigation Assistant</h3>
                      <p>Local rule-based engine</p>
                    </div>

                    <Sparkles size={20} />
                  </div>

                  <div className="assistant-status">
                    <span className="status-dot"></span>
                    Ready for investigation
                  </div>

                  <p className="assistant-note">
                    Uses prediction and SHAP evidence to produce
                    readable investigation reports without a paid
                    external AI API.
                  </p>
                </div>
              </div>
            </>
          )}

          {/* PAGE 2: CUSTOMER PREDICTION */}
          {activePage === "Churn Prediction" && (
            <CustomerPrediction
              customerData={customerData}
              setCustomerData={setCustomerData}
              predictionResult={predictionResult}
              setPredictionResult={setPredictionResult}
            />
          )}

          {/* PAGE 3: EXPLAINABILITY */}
          {activePage === "Explainability" && (
            <CustomerExplainability
              customerData={customerData}
              predictionResult={predictionResult}
            />
          )}

          {/* PAGE 4: INVESTIGATION */}
          
          {activePage === "Investigation" && (
            <CustomerInvestigation
               customerData={customerData}
            />
          )}
          {activePage === "Settings" && <SettingsPage />}
          {/* FOOTER */}
          <footer className="footer">
            <span>RetainAI © 2026</span>
            <span>
              Customer Churn Prediction & Explainable AI
            </span>
          </footer>
        </section>
      </main>
    </div>
  );
}

export default App;
