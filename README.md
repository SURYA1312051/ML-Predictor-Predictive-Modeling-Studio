# 🤖 ML Predictor — Predictive Modeling Studio

An interactive web-based machine learning studio for predictive modeling. Train, evaluate, and visualize models using **Linear Regression**, **Decision Trees**, and **Random Forest** — all in the browser with zero backend required.

![ML Predictor](https://img.shields.io/badge/ML-Predictor-6366f1?style=for-the-badge)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-f7df1e?style=for-the-badge&logo=javascript&logoColor=black)
![License](https://img.shields.io/badge/License-MIT-10b981?style=for-the-badge)

---

## ✨ Features

### 📊 Built-in Datasets
- **Iris Flower** — Classify iris species from sepal & petal measurements (150 samples, 4 features, 3 classes)
- **Wine Quality** — Predict wine quality from physicochemical properties (178 samples, 6 features, 3 classes)
- **Diabetes** — Predict diabetes progression from patient metrics (442 samples, 6 features)
- **Custom CSV Upload** — Use your own dataset in CSV format with headers

### ⚙️ Machine Learning Algorithms
| Algorithm | Task Type | Description |
|-----------|-----------|-------------|
| **Linear Regression** | Regression | Gradient descent optimization for continuous outcomes |
| **Decision Tree** | Both | CART algorithm with Gini impurity / variance reduction |
| **Random Forest** | Both | Bagged ensemble of decision trees for higher accuracy |

### 📈 Visualizations
- **Confusion Matrix** — Heatmap showing classification performance per class
- **ROC Curve** — Receiver Operating Characteristic with per-class AUC scores
- **Feature Importance** — Horizontal bar chart ranking feature contributions
- **Predictions Plot** — Actual vs Predicted scatter (regression) or correctness bars (classification)
- **Residual Plot** — Residual analysis for regression tasks

### 🔧 Configurable Parameters
- Train/Test split ratio (50% – 90%)
- Max tree depth (1 – 15)
- Number of trees for Random Forest (5 – 50)
- Task type auto-detection or manual override

---

## 🚀 Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Edge, Safari)
- Any local HTTP server (Python, Node.js, VS Code Live Server, etc.)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/ml-predictor.git
   cd ml-predictor
   ```

2. **Start a local server**

   Using Python:
   ```bash
   python -m http.server 8080
   ```

   Using Node.js:
   ```bash
   npx serve .
   ```

   Using VS Code:
   - Install the "Live Server" extension
   - Right-click `index.html` → "Open with Live Server"

3. **Open in browser**
   ```
   http://localhost:8080
   ```

---

## 📁 Project Structure

```
ml-predictor/
├── index.html          # Main HTML structure (4-step wizard UI)
├── index.css           # Premium dark-theme design system
├── datasets.js         # Built-in synthetic dataset generators
├── ml.js               # ML algorithm implementations
├── visualizations.js   # Plotly.js chart rendering functions
├── app.js              # Core application logic & state management
├── LICENSE             # MIT License
└── README.md           # This file
```

---

## 🎯 How It Works

### Step 1: Choose Dataset
Select from built-in datasets (Iris, Wine, Diabetes) or upload your own CSV file with headers.

### Step 2: Configure Model
- Select the **target variable** (what to predict)
- Choose **features** (input columns)
- Pick an **algorithm** (Linear Regression, Decision Tree, Random Forest)
- Adjust **hyperparameters** (split ratio, tree depth, number of trees)

### Step 3: Train
The model trains in-browser using pure JavaScript implementations. A progress animation shows the training pipeline.

### Step 4: Evaluate Results
View comprehensive performance metrics and interactive visualizations:
- **Classification**: Accuracy, F1 Score, Confusion Matrix, ROC Curve
- **Regression**: R² Score, RMSE, MAE, Residual Plot

---

## 🧠 Algorithm Details

### Linear Regression
- Implements gradient descent optimization
- Learning rate: 0.01, Epochs: 200
- Features are min-max normalized
- For classification tasks, predictions are mapped to nearest class

### Decision Tree (CART)
- Uses **Gini impurity** for classification splits
- Uses **variance reduction** for regression splits
- Configurable max depth and minimum leaf size
- Feature importance based on split frequency

### Random Forest
- Bootstrap aggregating (bagging) of decision trees
- Random sampling with replacement
- Classification: majority vote | Regression: mean prediction
- Aggregated feature importance across all trees

---

## 🛠️ Technologies Used

| Technology | Purpose |
|------------|---------|
| **HTML5** | Semantic structure |
| **CSS3** | Dark theme, animations, responsive layout |
| **JavaScript (ES6+)** | ML algorithms, UI logic, state management |
| **Plotly.js** | Interactive data visualizations |
| **Papa Parse** | CSV file parsing |
| **Google Fonts (Inter)** | Modern typography |

---

## 📝 Using Custom Datasets

Your CSV file should:
- Have a **header row** with column names
- Contain **numeric features** (non-numeric values are treated as 0)
- Have a **target column** (categorical for classification, numeric for regression)

Example:
```csv
feature1,feature2,feature3,target
1.2,3.4,5.6,classA
2.3,4.5,6.7,classB
3.4,5.6,7.8,classA
```

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Plotly.js](https://plotly.com/javascript/) for interactive charting
- [Papa Parse](https://www.papaparse.com/) for CSV parsing
- [Google Fonts](https://fonts.google.com/) for Inter typeface
- Inspired by scikit-learn's API design

---

<p align="center">
  Made with ❤️ for learning supervised machine learning and model evaluation
</p>
