import numpy as np
from PIL import Image
import tensorflow as tf
from io import BytesIO

# Define the expected image size and class names
IMAGE_SIZE = (128, 128)
CLASS_NAMES = ['Normal', 'Cataract', 'Glaucoma']

def load_trained_model(path="./ocular_model.keras"):
    """
    Load the pre-trained Keras model.
    """
    try:
        model = tf.keras.models.load_model(path, compile=False)
        model.compile(
            optimizer=tf.keras.optimizers.Adam(1e-4),
            loss=tf.keras.losses.SparseCategoricalCrossentropy(),
            metrics=['accuracy']
        )
        print("✅ Model loaded successfully.")
        return model
    except Exception as e:
        print(f"❌ Error loading model: {str(e)}")
        raise

def predict_image_bytes(model, file_bytes):
    """
    Predict the class of the image using the loaded model.
    """
    try:
        img = Image.open(BytesIO(file_bytes)).convert("RGB")
        img = img.resize(IMAGE_SIZE)
        img_array = tf.keras.preprocessing.image.img_to_array(img)
        img_array = tf.expand_dims(img_array, 0) / 255.0

        predictions = model.predict(img_array)
        predicted_class = CLASS_NAMES[np.argmax(predictions[0])]
        confidence = 100 * np.max(predictions[0])
        return {
            "class": predicted_class,
            "confidence": round(confidence, 2)
        }
    except Exception as e:
        print(f"❌ Prediction failed: {str(e)}")
        raise
