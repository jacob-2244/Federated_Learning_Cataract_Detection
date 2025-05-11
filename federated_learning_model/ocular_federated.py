# ocular_federated_final.py
import os
import numpy as np
import pandas as pd
import tensorflow as tf
import flwr as fl
from pathlib import Path
from typing import Dict, List, Tuple
from PIL import Image

# Configuration
NUM_CLIENTS = 3
NUM_ROUNDS = 10
IMAGE_SIZE = (128, 128)
BATCH_SIZE = 32
EPOCHS_PER_ROUND = 10
BASE_DATA_PATH = r"C:\Users\TECHNIFI\Desktop\Fd_model\federated_learning_model\data"
SERVER_ADDRESS = "0.0.0.0:8082"
MODEL_SAVE_PATH = "./ocular_model.keras"

# Initialize global test_data variable
test_data = None

def setup_environment():
    np.random.seed(42)
    tf.random.set_seed(42)
    print("✅ Environment configured")

def load_and_prepare_data():
    global test_data
    print("\n📂 Loading dataset...")
    try:
        df = pd.read_csv(Path(BASE_DATA_PATH) / "dataset_labels.csv")
        df = df[df['labels'].isin(["['N']", "['C']", "['G']"])].copy()
        
        label_map = {
            "['N']": 'normal_images',
            "['C']": 'cataract_images', 
            "['G']": 'glaucoma_images'
        }
        df['filepath'] = df.apply(
            lambda row: Path(BASE_DATA_PATH) / label_map[row['labels']] / row['filename'],
            axis=1
        )
        
        df = df[df['filepath'].apply(lambda x: x.exists())]
        print(f"Loaded {len(df)} valid images")
        
        # Split into train and test (80/20)
        train_df = df.sample(frac=0.8, random_state=42)
        test_df = df.drop(train_df.index)
        
        # Split train data among clients
        client_data = []
        for class_label in ["['N']", "['C']", "['G']"]:
            class_df = train_df[train_df['labels'] == class_label]
            splits = np.array_split(class_df, NUM_CLIENTS)
            client_data.extend(splits)
        
        test_data = test_df  # Set global test_data
        return client_data
    except Exception as e:
        print(f"❌ Data loading failed: {str(e)}")
        raise

def create_enhanced_model():
    model = tf.keras.Sequential([
        tf.keras.layers.Input(shape=(*IMAGE_SIZE, 3)),
        tf.keras.layers.Conv2D(32, 3, activation='relu'),
        tf.keras.layers.MaxPooling2D(2),
        tf.keras.layers.Conv2D(64, 3, activation='relu'),
        tf.keras.layers.MaxPooling2D(2),
        tf.keras.layers.Flatten(),
        tf.keras.layers.Dense(128, activation='relu'),
        tf.keras.layers.Dense(3, activation='softmax')
    ])
    model.compile(
        optimizer=tf.keras.optimizers.Adam(1e-4),
        loss=tf.keras.losses.SparseCategoricalCrossentropy(),
        metrics=['accuracy']
    )
    return model

def prepare_test_data():
    global test_data
    images = []
    labels = []
    for _, row in test_data.iterrows():
        img = tf.io.read_file(str(row['filepath']))
        img = tf.image.decode_jpeg(img, channels=3)
        img = tf.image.resize(img, IMAGE_SIZE)
        images.append(img.numpy() / 255.0)
        labels.append(0 if row['labels'] == "['N']" else 1 if row['labels'] == "['C']" else 2)
    return np.array(images), np.array(labels)

def weighted_average(metrics):
    """Aggregates client metrics using weighted average"""
    try:
        accuracies = [m["accuracy"] for _, m in metrics]
        losses = [m["loss"] for _, m in metrics]
        num_samples = [n for n, _ in metrics]
        
        total = sum(num_samples)
        avg_accuracy = sum(a * n for a, n in zip(accuracies, num_samples)) / total
        avg_loss = sum(l * n for l, n in zip(losses, num_samples)) / total
        return {
            "accuracy": avg_accuracy,
            "loss": avg_loss
        }
    except Exception as e:
        print(f"❌ Metric aggregation failed: {str(e)}")
        raise

class OcularClient(fl.client.NumPyClient):
    def __init__(self, client_data):
        self.client_data = client_data
        self.model = create_enhanced_model()
        self.x_train, self.y_train = self._prepare_dataset()
        print(f"Client initialized with {len(self.x_train)} samples")

    def _prepare_dataset(self):
        images = []
        labels = []
        for _, row in self.client_data.iterrows():
            img = tf.io.read_file(str(row['filepath']))
            img = tf.image.decode_jpeg(img, channels=3)
            img = tf.image.resize(img, IMAGE_SIZE)
            images.append(img.numpy() / 255.0)
            labels.append(0 if row['labels'] == "['N']" else 1 if row['labels'] == "['C']" else 2)
        return np.array(images), np.array(labels)
    
    def get_parameters(self, config):
        return self.model.get_weights()
    
    def fit(self, parameters, config):
        try:
            self.model.set_weights(parameters)
            history = self.model.fit(
                self.x_train, 
                self.y_train,
                batch_size=BATCH_SIZE,
                epochs=EPOCHS_PER_ROUND,
                verbose=0
            )
            print(f"Client training - Loss: {history.history['loss'][-1]:.4f}, Acc: {history.history['accuracy'][-1]:.4f}")
            return self.model.get_weights(), len(self.x_train), {}
        except Exception as e:
            print(f"❌ Client training failed: {str(e)}")
            raise

    def evaluate(self, parameters, config):
        try:
            self.model.set_weights(parameters)
            loss, acc = self.model.evaluate(self.x_train, self.y_train, verbose=0)
            return loss, len(self.x_train), {"accuracy": acc}
        except Exception as e:
            print(f"❌ Client evaluation failed: {str(e)}")
            raise

def server_evaluate(server_round, parameters, config):
    """Centralized evaluation of global model"""
    try:
        model = create_enhanced_model()
        model.set_weights(parameters)
        
        x_test, y_test = prepare_test_data()
        loss, acc = model.evaluate(x_test, y_test, verbose=0)
        
        print(f"\n🔍 Global Model Evaluation (Round {server_round})")
        print(f"  Loss: {loss:.4f}")
        print(f"  Accuracy: {acc*100:.2f}%")
        return loss, {"accuracy": acc}
    except Exception as e:
        print(f"❌ Server evaluation failed: {str(e)}")
        raise

def save_model(model):
    try:
        model.save(MODEL_SAVE_PATH)
        print(f"\n💾 Model saved to {MODEL_SAVE_PATH}")
    except Exception as e:
        print(f"❌ Model saving failed: {str(e)}")
        raise

def load_model():
    try:
        return tf.keras.models.load_model(MODEL_SAVE_PATH)
    except Exception as e:
        print(f"❌ Model loading failed: {str(e)}")
        raise

def predict_image(model, image_path):
    try:
        class_names = ['Normal', 'Cataract', 'Glaucoma']
        img = Image.open(image_path).convert('RGB')
        img = img.resize(IMAGE_SIZE)
        img_array = tf.keras.preprocessing.image.img_to_array(img)
        img_array = tf.expand_dims(img_array, 0) / 255.0
        
        predictions = model.predict(img_array)
        predicted_class = class_names[np.argmax(predictions[0])]
        confidence = 100 * np.max(predictions[0])
        
        print(f"\n🔍 Prediction for {image_path}:")
        print(f"  Class: {predicted_class}")
        print(f"  Confidence: {confidence:.2f}%")
        return predicted_class, confidence
    except Exception as e:
        print(f"❌ Prediction failed: {str(e)}")
        raise

def main():
    global test_data
    setup_environment()
    client_data = load_and_prepare_data()

    try:
        choice = input("\nRun as (1) Server or (2) Client? [1/2/p]: ").lower()
        
        if choice == "1":
            strategy = fl.server.strategy.FedAvg(
                min_available_clients=NUM_CLIENTS,
                min_fit_clients=NUM_CLIENTS,
                evaluate_metrics_aggregation_fn=weighted_average,
                evaluate_fn=server_evaluate,
                fraction_evaluate=1.0,
                min_evaluate_clients=NUM_CLIENTS,
            )
            
            hist = fl.server.start_server(
                server_address=SERVER_ADDRESS,
                config=fl.server.ServerConfig(num_rounds=NUM_ROUNDS),
                strategy=strategy
            )
            
            final_model = create_enhanced_model()
            weights = fl.common.parameters_to_ndarrays(hist.metrics_distributed['parameters'])
            final_model.set_weights(weights)
            save_model(final_model)
            
            # Final evaluation
            x_test, y_test = prepare_test_data()
            loss, acc = final_model.evaluate(x_test, y_test, verbose=0)
            print(f"\n🎯 Final Model Performance:")
            print(f"  Loss: {loss:.4f}")
            print(f"  Accuracy: {acc*100:.2f}%")
            
        elif choice == "2":
            client_id = int(input(f"Enter Client ID (0-{NUM_CLIENTS-1}): "))
            if client_id < 0 or client_id >= NUM_CLIENTS:
                raise ValueError("Invalid client ID")
                
            client = OcularClient(client_data[client_id])
            fl.client.start_client(
                server_address=SERVER_ADDRESS.replace("0.0.0.0", "127.0.0.1"),
                client=client.to_client()
            )
            
        elif choice == "p":
            model = load_model()
            image_path = input("Enter image path to predict: ")
            predict_image(model, image_path)
            
        else:
            print("❌ Invalid choice. Exiting...")
            
    except Exception as e:
        print(f"\n❌ Critical error occurred: {str(e)}")
        print("Troubleshooting steps:")
        print("1. Verify all image paths in CSV are correct")
        print("2. Check firewall allows localhost connections")
        print("3. Ensure all clients are running")
        print("4. Reduce NUM_CLIENTS if memory issues occur")

if __name__ == "__main__":
    main()