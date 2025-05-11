# Federated Learning Project for ODIR-5K Cataract/Glaucoma Detection

## Overview
This project implements federated learning for detecting cataracts and glaucoma using the ODIR-5K dataset. The system uses Flower framework for simulation and TensorFlow for model training.

## Prerequisites
- Python 3.x
- Git
- Virtual environment manager

## Running the Project

## Dataset Setup
1. Download the ODIR-5K dataset from Kaggle
2. Create a `data` directory in the project root
3. Extract the dataset contents to:
```bash
project_root/
├── data/
    │   ├── normal_images/
    │   ├── cataract_images/
    │   ├── glaucoma_images/
    │   └── dataset_labels.csv
└── ocular_federated.py
```
## Setup Instructions

### 1. Clone Repository
```bash
git clone https://github.com/SyedAfzalHussain/federated_learning_model.git
cd federated_learning_model
```

### 2. Create and Activate Virtual Environment
```bash
python -m venv venv
# On Windows
venv\Scripts\activate
# On Linux/Mac
source venv/bin/activate
```

### 3. Install Dependencies
```bash
pip install flwr[simulation]==1.8.0
pip install tensorflow==2.14.0
pip install pandas pillow
```


## Running the Project

### Server
```bash
python ocular_federated.py
