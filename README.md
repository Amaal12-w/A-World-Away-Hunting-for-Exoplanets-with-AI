# 🌌 KAEOS TEAM — Exoplanet Analysis & AI Assistant

> Built for NASA Space Apps Challenge 🚀  
> An educational AI-powered platform for detecting and analyzing exoplanets using NASA datasets.

---

## 📖 Overview
This project provides:
- Machine learning–based exoplanet classification (Confirmed, Candidate, or False Positive).
- Interactive web interface built with **Flask**, **Three.js**, and **JavaScript**.
- Ability to upload your own **dataset** and even your **own trained model**.
- AI assistant chatbot for guiding users.
- 3D planet generator with orbit simulation for visualization.

---

## ✨ Features

### 🔭 Exoplanet Analysis
- Upload **CSV/JSON** datasets or enter values **manually**.
- Data preprocessing and validation for **13 key planetary/star features**.
- Predict habitability status using a trained ML model.  
- Upload your **own custom ML model** (`.pkl`) and use it for predictions.  

📸 *Analysis Page*
![Exoplanet Analysis Page](images\analysis_pagerl.jpg.png)

---

### 📊 Results & Exports
- Predictions include:
  - Planet Name  
  - Classification (Confirmed / Candidate / False Positive)  
  - Confidence Score  
  - Habitability Indicator  
- Export results as **PDF**, **CSV**, or **JSON**.  

📸 *Results*
![Results](images\results2.jpg)

---

### 🪐 3D Planet Generator
- Realistic 3D planets rendered with **Three.js**.  
- Simulated **Earth, Mars, Jupiter** with orbital animations.  
- Interactive visualization to explore planetary systems.  

📸 *Plant generator*
![Results](images\results2.jpg)
---

### 🤖 AI Chat Assistant
- Chatbot built with **DialoGPT** for answering user questions.  
- Integrated directly on the homepage for quick help.  

📸 *[Insert Screenshot of Chatbot]*

---

### ⚙ Custom Model Upload
- Users can upload a `.pkl` model to replace the default ML pipeline.  
- Immediate integration with the `/api/predict` endpoint.  

📸 *[Insert Screenshot of Upload Model Section]*

---

## 🛠️ Tech Stack
- **Backend:** Python, Flask, Pickle (ML model loading), Transformers  
- **Frontend:** HTML, CSS, JavaScript, Three.js  
- **AI/ML:** scikit-learn models, HuggingFace Transformers  
- **Visualization:** Three.js (3D planets, orbits), Charts (future extension)  

---

## 🚀 Getting Started

### 1️⃣ Clone Repo
```bash
git clone https://github.com/YOUR_USERNAME/nasa.git
cd nasa
```

### 2️⃣ Install Requirements
```bash
pip install -r requirements.txt
```

### 3️⃣ Run App
```bash
python appbest.py
```
Visit 👉 `http://127.0.0.1:5000`

---

## 📂 Project Structure
```
nasa/
│── appbest.py            # Flask backend
│── exoplanet_model.pkl   # Default ML model
│── templates/
│   ├── index.html        # Landing page
│   ├── secondpage.html   # Analysis page
│   └── planet.html       # 3D planet page
│── static/
│   ├── css/              # Stylesheets
│   ├── js/               # JavaScript files
│── README.md             # Project docs
```

---

## 🔮 Future Improvements
- 🌐 Integrate **live NASA APIs** for real-time exoplanet data.  
- 🧠 Extend ML models with **deep learning (CNN/RNN/Transformers)** for better accuracy.  
- 📊 Add **interactive dashboards** with charts for better insights.  
- 🎮 Improve **3D visualizations** with user controls (zoom, drag, custom planets).  
- 🌍 Extend habitability analysis with **atmospheric simulation models**.  
- 📱 Make the platform **mobile-friendly** with responsive UI.  

---

## 📧 Contributors (KAEOS TEAM)
- 📧 amalosama739@gmail.com  
- 📧 alaaessam446@gmail.com  
- 📧 ahmedforedu@gmail.com  
- 📧 kareem.fahme06@eng-st.cu.edu.eg  
- 📧 omargamalhamed8@gmail.com  

---

## 📝 License
This project was built for educational purposes and as part of the **NASA Space Apps Challenge 2025**.  
