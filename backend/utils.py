import cv2
import numpy as np
import os
from tensorflow.keras.models import load_model
from tensorflow.keras.applications.vgg16 import preprocess_input

# Path to the model
MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "model.keras")
model = load_model(MODEL_PATH)
CLASS_NAMES = ['Normal', 'Lumpy']

def predict_image(img_path):
    img = cv2.imread(img_path)
    if img is None:
        raise ValueError("Image not found or could not be loaded")
    img = cv2.resize(img, (224, 224))
    img = preprocess_input(np.expand_dims(img, axis=0))
    preds = model.predict(img)
    confidence = float(np.max(preds))
    label = CLASS_NAMES[np.argmax(preds)]
    return label, confidence
