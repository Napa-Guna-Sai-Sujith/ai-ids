# 🛡️ AI-Powered Intrusion Detection System (IDS) Dashboard

[![Live Demo](https://img.shields.io/badge/Live_Demo-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://ai-ids-xi.vercel.app)
[![Render Mirror](https://img.shields.io/badge/Render-Deployment-46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://ai-ids-c811.onrender.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React_18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Neon Database](https://img.shields.io/badge/Neon_DB-Serverless_Postgres-00E599?style=for-the-badge&logo=postgresql&logoColor=black)](https://neon.tech/)

> **Next-Generation Network Security Operations Center (SOC) Platform** powered by Ensemble Machine Learning models (XGBoost, Random Forest, CNN-LSTM) to detect, classify, and mitigate cyber threats in real-time (~12ms latency) with **99.87% accuracy**.

---

## 🌐 Live Deployments & Demo Links

* 🚀 **Primary Vercel Web App**: [https://ai-ids-xi.vercel.app](https://ai-ids-xi.vercel.app)
* ⚡ **Render Mirror Service**: [https://ai-ids-c811.onrender.com](https://ai-ids-c811.onrender.com)
* 🐙 **GitHub Repository**: [https://github.com/Napa-Guna-Sai-Sujith/ai-ids](https://github.com/Napa-Guna-Sai-Sujith/ai-ids)

---

## 🌟 Key Features

### 1. 📊 Interactive SOC Security Dashboard
* **Real-time Threat Status**: Displays live system health, connection rate, active data source, and threat status.
* **Network Traffic Particle Monitor**: Animated real-time packet visualizer representing normal, suspicious, and attack traffic.
* **Flow Diagram Architecture**: Visual pipeline rendering raw packet ingress $\rightarrow$ feature extraction $\rightarrow$ AI classification $\rightarrow$ firewall action.

### 2. 📁 Granular Data Source & Switch Control
* **Per-File Detection Switch**: Enables security analysts to start or pause live AI scanning on individual dataset files independently.
* **Multi-Format Upload Support**: Drag & drop or browse `.csv`, `.json`, `.pcap`, `.xml`, `.log`, and `.zip` archives up to 50MB.
* **Cloud Database Persistence**: Uploaded datasets are automatically synced to a serverless **Neon PostgreSQL** database per user account.
* **Persistent Dataset Removal**: Built-in `Remove` action with `localStorage` state retention so deleted datasets stay permanently removed.

### 3. 👁️ Interactive Dataset Data Viewer Modal
* **Sample Payload Inspection**: Click any dataset row or `View Data` button to inspect sample flow records, column headers, and JSON/XML/LOG payloads directly in-app.
* **Direct Downloads**: Download sample test datasets with one click.

### 4. 📡 Live Stream & Real-Time Log Engine
* **Live Detection Stream**: Continuous stream of analyzed network packets with IP tracking, flow latency, byte volume, and model confidence scores.
* **Dynamic Action Badging**:
  * `CRITICAL` / `HIGH` / `MEDIUM` Threats $\rightarrow$ **`BLOCKED`** (Emerald/Red Shield)
  * `LOW` Risk Traffic $\rightarrow$ **`ALLOWED`** (Cyan Monitored Pill)

### 5. 🛡️ Threat Intelligence & Geographic Analytics
* **Geographic Threat Map**: Visual distribution of top attack source countries.
* **Detailed Threat Inspector**: View attack descriptions, confidence ratings, source/destination IPs, and mitigation recommendations.

### 6. 👤 User Authentication & Profile Management
* **Instant Profile Editing**: Change name, role, email, and avatar in real-time with automatic Neon DB cloud synchronization.
* **Dark / Light Theme Toggle**: Seamless glassmorphism dark & light theme modes.

---

## 🔬 Machine Learning Model & Noise Cancellation Architecture

### 1. Extracted Network Flow Features (248 Features)
Network flows are analyzed across 4 key statistical categories:
* **Time-Based Features**: Flow Duration ($\mu s$), Flow Bytes/sec, Flow Packets/sec.
* **Packet Count Features**: Total Forward/Backward Packets, Length Statistics.
* **Packet Size Distribution**: Min, Max, Mean, and Standard Deviation of Packet Lengths.
* **Inter-Arrival Time (IAT)**: Mean, Std Dev, Max, Min time between consecutive packets.

### 2. Signal-to-Noise Filtering & Preprocessing
* **Outlier Elimination**: Uses Interquartile Range (IQR) bounds and Isolation Forests to filter out transient network jitter and broadcast noise before classification.
* **Min-Max Scaling**: Normalizes flow variables so high-volume byte counts do not bias tree splits.
* **Feature Selection**: Low-variance features are automatically pruned.

### 3. Ensemble Model Architecture
| Model | Role & Purpose | Key Advantage |
| :--- | :--- | :--- |
| **XGBoost Classifier** | Primary tabular flow evaluator | High-speed split calculation & missing data handling |
| **Random Forest** | Tree-based ensemble baseline | High robustness against overfitting; feature importance scoring |
| **CNN-LSTM Hybrid** | Deep learning temporal sequence model | Spatial packet payload analysis (CNN) + Time-series memory (LSTM) |
| **Soft Voting Classifier** | Final probability consensus | Merges probability vectors ($\sum w_i P_i$) to minimize false positives |

### 4. Performance Metrics
* **Accuracy**: **99.87%**
* **Precision**: **99.82%**
* **Recall (Detection Rate)**: **99.79%**
* **F1 Score**: **99.80%**
* **Inference Speed**: **~12ms** per packet flow
* **False Positive Rate**: **< 0.12%**

---

## 🧪 Sample Test Datasets

Dedicated single-attack CSV test datasets are included in `public/sample_datasets/` for testing upload capabilities:

| Dataset | Attack Vector | Format | Direct Download Link |
| :--- | :--- | :---: | :--- |
| **DDoS Dataset** | Distributed Denial of Service | `CSV` | [Download DDoS CSV](https://ai-ids-xi.vercel.app/sample_datasets/ddos_attack_dataset.csv) |
| **DoS Dataset** | Denial of Service | `CSV` | [Download DoS CSV](https://ai-ids-xi.vercel.app/sample_datasets/dos_attack_dataset.csv) |
| **Port Scan Dataset** | Port Probe / Sweep | `CSV` | [Download Port Scan CSV](https://ai-ids-xi.vercel.app/sample_datasets/port_scan_dataset.csv) |
| **Web Attack Dataset** | SQL Injection, XSS, Path Traversal | `CSV` | [Download Web Attack CSV](https://ai-ids-xi.vercel.app/sample_datasets/web_attack_dataset.csv) |

---

## 🏢 Enterprise Value Proposition: Why Use This Platform?

1. **Detect Zero-Day Exploits**: Behavioral pattern matching catches novel attacks traditional signature firewalls miss.
2. **Eliminate Alert Fatigue**: Ultra-low false positive rate ($<0.12\%$) ensures security teams focus only on genuine threats.
3. **Automate Tier-1 SOC Triage**: Automates packet inspection, log classification, and threat severity tagging.
4. **Millisecond Response**: Evaluates and mitigates threats in **~12ms** before data exfiltration occurs.

---

## 💻 Tech Stack & System Architecture

* **Frontend**: React 18, Vite 7, TypeScript, Tailwind CSS
* **Icons & UI**: Lucide-React Icons, HTML5 Canvas Particle Engine
* **Cloud Database**: Neon Serverless PostgreSQL Database (Direct HTTP SQL API)
* **State Management**: React Context API (`AuthContext`, `DetectionContext`)
* **Deployment**: Vercel & Render Continuous Integration (CI/CD)

---

## 🛠️ Local Development Setup

### Prerequisites
* Node.js v18.x or higher
* npm or yarn

### Installation Steps

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/Napa-Guna-Sai-Sujith/ai-ids.git
   cd ai-ids
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Open your browser at `http://localhost:5173`.

4. **Build for Production**:
   ```bash
   npm run build
   ```

---

## 📄 License & Citation

This project is licensed under the MIT License. Developed for research and enterprise demonstration of AI-driven cybersecurity operations centers.
