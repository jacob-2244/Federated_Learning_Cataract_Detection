# Secure AI-Powered Cataract Detection & Classification System

A privacy-preserving web application for cataract detection and classification using federated learning. This project leverages deep learning to assist in early detection of cataract and Glocuma while ensuring patient data privacy through federated model training. The application also integrates a doctor consultation module and chat for enhanced clinical support.



## 🔍 Project Overview

This project aims to modernize and secure traditional machine learning approaches in ophthalmology by:
- Utilizing **Federated Learning** to train models across decentralized data sources without moving sensitive patient data.
- Applying **Deep Learning** for accurate cataract detection and multi-class ocular disease classification.
- Integrating a **real-time doctor consultation system** for expert feedback.
- Using **Firebase** for secure authentication, real-time database services, and cloud storage.

---

## 🧠 Key Features

- ✅ Federated learning for enhanced **data privacy and security**
- ✅ High-performance CNN model for **cataract and ocular disease classification**
- ✅ **Appointments** for consultations and case tracking
- ✅ Can chat with doctors in real time
- ✅ Web-based interface for retinal image upload and predictions
- ✅ Scalable and modular design for healthcare AI deployments

---

## 📁 Dataset

We use the publicly available **ODIR-5K: Ocular Disease Intelligent Recognition** dataset, sourced from Kaggle:

📦 [ODIR-5K Dataset on Kaggle](https://www.kaggle.com/datasets/andrewmvd/ocular-disease-recognition-odir5k)

The dataset includes:
- 5,000+ patient images
- Multi-label classification for diseases such as:
  - Normal
  - Cataract
  - Glaucoma
  - AMD (Age-related Macular Degeneration)
  - Hypertension
  - Diabetes
  - Pathological Myopia
 But here we are detecting only Cataract And Glocuma to maintain accuracy and precision of results and to make project streamline.

> **Note**: The dataset must be manually downloaded from Kaggle due to licensing restrictions.

---

## ⚙️ Tech Stack

| Layer           | Technology                              |
|----------------|------------------------------------------|
| Frontend        | React.js / Next.js                      |
| Backend         | Python (Flask / FastAPI) + Federated Modules |
| AI/ML           | TensorFlow / PyTorch                    |
| Privacy Layer   | TensorFlow Federated / Flower Framework |
| Database        | Firebase Realtime Database / Firestore |
| Authentication  | Firebase Auth                          |
| Deployment      | Vercel

---

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/jacob2244/Federated_Learning_Cataract_Detection.git
cd eyecare
