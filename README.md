.

🟦 Frontend README.md
# MediConnect Frontend

The frontend of **MediConnect** — a healthcare management platform designed to streamline patient–doctor interactions, hospital administration, and appointment management.  
Built with **React**, **Material UI**, and integrated with **Gemini AI** for analytics and **React Charts** for data visualization.

---

## 🌐 Live Demo
🔗 [Frontend Deployment Link](https://orange-hill-0603d7a00.1.azurestaticapps.net/)  
🔗 [Backend Repository](https://github.com/Ujwal-Srimanth/MediConnect_Backend)

---

## 🚀 Features by Persona

### 👤 Patient
- View and update profile (demographics, insurance details, medical history).
- Access medical reports and prescriptions uploaded by doctors after appointments.
- Browse available doctors and book appointment slots.
- View analytics and insights on health & appointments using **Gemini AI** and **React Charts**.

### 🏥 Receptionist
- Approve or cancel appointments.
- Manage doctors' schedules and appointments within the hospital.

### 👨‍⚕️ Doctor
- View complete patient history, including past and upcoming appointments.
- Upload prescriptions and reports for past appointments.
- Approve or cancel patient appointments.

### 👨‍💼 Admin
- Onboard new hospitals into the platform.
- Add hospital staff (doctors, receptionists).
- Access an **analytics dashboard** for hospital-wide insights.

---

## 🛠️ Tech Stack
- **React.js**
- **Material UI (MUI)**
- **React Charts**
- **Gemini AI API**

---

## 📂 Project Structure


frontend/
│── src/
│ ├── components/ # Reusable UI components
│ ├── pages/ # Persona-specific pages
│ ├── services/ # API calls
│ ├── utils/ # Helpers & constants
│ └── App.js
│── public/
│── package.json


---

## ⚡ Deployment
- Deployed on **Azure Static Web Apps**.

---

## ▶️ Getting Started

### Prerequisites
- Node.js v16+
- npm or yarn

### Installation
```bash
git clone https://github.com/<your-username>/mediconnect-frontend.git
cd mediconnect-frontend
npm install
npm start


The app will start on http://localhost:3000.

🔒 Authentication

All requests are authenticated with JWT tokens obtained from the backend.

📊 Analytics

Uses Gemini AI to generate insights and trends.

Charts built with React Charts.
