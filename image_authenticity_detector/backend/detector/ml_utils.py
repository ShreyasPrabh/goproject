"""
Machine Learning utilities for image authenticity detection
"""
import os
import cv2
import numpy as np
import tensorflow as tf
from PIL import Image
from django.conf import settings
import logging

logger = logging.getLogger(__name__)


class ImageAuthenticityPredictor:
    """Class to handle ML predictions for image authenticity"""
    
    def __init__(self):
        self.model = None
        self.img_size = (224, 224)
        self.load_model()
    
    def load_model(self):
        """Load the trained model"""
        try:
            model_path = settings.MODEL_PATH
            if os.path.exists(model_path):
                self.model = tf.keras.models.load_model(model_path)
                logger.info(f"Model loaded successfully from {model_path}")
            else:
                logger.warning(f"Model file not found at {model_path}")
                self.model = None
        except Exception as e:
            logger.error(f"Error loading model: {str(e)}")
            self.model = None
    
    def preprocess_image(self, image_path):
        """Preprocess image for prediction"""
        try:
            # Load image
            image = cv2.imread(image_path)
            if image is None:
                return None
            
            # Convert BGR to RGB
            image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            
            # Resize image
            image = cv2.resize(image, self.img_size)
            
            # Normalize pixel values
            image = image.astype(np.float32) / 255.0
            
            # Add batch dimension
            image = np.expand_dims(image, axis=0)
            
            return image
        except Exception as e:
            logger.error(f"Error preprocessing image: {str(e)}")
            return None
    
    def predict(self, image_path):
        """
        Predict image authenticity
        
        Returns:
            dict: Prediction results containing:
                - is_real: bool
                - real_confidence: float
                - is_edited: bool (only for real images)
                - edited_confidence: float (only for real images)
                - status: str
                - error_message: str (if any error)
        """
        try:
            if self.model is None:
                return {
                    'is_real': None,
                    'real_confidence': None,
                    'is_edited': None,
                    'edited_confidence': None,
                    'status': 'error',
                    'error_message': 'Model not loaded'
                }
            
            # Preprocess image
            processed_image = self.preprocess_image(image_path)
            if processed_image is None:
                return {
                    'is_real': None,
                    'real_confidence': None,
                    'is_edited': None,
                    'edited_confidence': None,
                    'status': 'error',
                    'error_message': 'Failed to preprocess image'
                }
            
            # Make prediction
            predictions = self.model.predict(processed_image, verbose=0)
            real_fake_prob = float(predictions[0][0][0])
            edited_prob = float(predictions[1][0][0])
            
            # Determine results
            is_real = real_fake_prob > 0.5
            is_edited = edited_prob > 0.5 if is_real else None
            
            return {
                'is_real': is_real,
                'real_confidence': real_fake_prob,
                'is_edited': is_edited,
                'edited_confidence': edited_prob if is_real else None,
                'status': 'success',
                'error_message': None
            }
            
        except Exception as e:
            logger.error(f"Error making prediction: {str(e)}")
            return {
                'is_real': None,
                'real_confidence': None,
                'is_edited': None,
                'edited_confidence': None,
                'status': 'error',
                'error_message': str(e)
            }


# Global predictor instance
predictor = ImageAuthenticityPredictor()