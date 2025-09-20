# Image Authenticity Detector

A comprehensive deep learning system to detect if images are real or AI-generated, and for real images, determine if they have been edited. Built with TensorFlow/Keras, Django, and modern web technologies.

![Project Demo](https://img.shields.io/badge/Status-Ready%20for%20Training-green)
![Python](https://img.shields.io/badge/Python-3.8%2B-blue)
![TensorFlow](https://img.shields.io/badge/TensorFlow-2.13.0-orange)
![Django](https://img.shields.io/badge/Django-4.2.4-darkgreen)

## 🎯 Features

- **Multi-Class Detection**: Distinguishes between real and AI-generated images
- **Edit Detection**: For real images, detects if they have been edited/manipulated
- **Web Interface**: Modern, responsive frontend with drag-and-drop functionality
- **REST API**: Complete Django backend with comprehensive API endpoints
- **Jupyter Notebook**: Interactive development environment for model training
- **Real-time Analysis**: Fast image processing with confidence scores
- **Analysis History**: Track and review previous analyses

## 🏗️ Project Structure

```
image_authenticity_detector/
├── notebook/                    # Jupyter notebook for model development
│   └── image_authenticity_model.ipynb
├── dataset/                     # Training dataset
│   ├── real/
│   │   ├── real_edited/        # Edited real images
│   │   └── real_unedited/      # Original real images
│   └── fake/                   # AI-generated images
├── backend/                     # Django REST API
│   ├── backend/                # Django project settings
│   ├── detector/               # Main app for image analysis
│   └── manage.py
├── frontend/                    # Web interface
│   ├── templates/
│   │   └── index.html
│   └── static/
│       ├── css/style.css
│       └── js/script.js
├── models/                      # Trained model storage
├── requirements.txt             # Python dependencies
└── README.md
```

## 🚀 Quick Start

### 1. Clone and Setup

```bash
# Clone the repository (or download the files)
cd image_authenticity_detector

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Prepare Dataset

```bash
# Add your training images to the dataset directories:
# - dataset/real/real_edited/     (edited real images)
# - dataset/real/real_unedited/   (original real images) 
# - dataset/fake/                 (AI-generated images)

# The notebook will create sample data if directories are empty
```

### 3. Train the Model

```bash
# Start Jupyter notebook
jupyter notebook

# Open notebook/image_authenticity_model.ipynb
# Run all cells to train the model
# The trained model will be saved to models/image_authenticity_model.h5
```

### 4. Setup Django Backend

```bash
# Navigate to backend directory
cd backend

# Run database migrations
python manage.py makemigrations
python manage.py migrate

# Create superuser (optional)
python manage.py createsuperuser

# Start Django server
python manage.py runserver
```

### 5. Launch Frontend

```bash
# Open frontend/templates/index.html in your web browser
# Or serve it with a simple HTTP server:

# Using Python
cd frontend/templates
python -m http.server 8080

# Then visit http://localhost:8080
```

## 🔧 Configuration

### API Endpoints

The Django backend provides these API endpoints:

- `POST /api/analyze/` - Upload and analyze an image
- `GET /api/history/` - Get analysis history
- `GET /api/analysis/<id>/` - Get specific analysis details
- `GET /api/health/` - Check API and model status

### Frontend Configuration

Update the API base URL in `frontend/static/js/script.js`:

```javascript
const API_BASE_URL = 'http://localhost:8000/api';
```

### Model Configuration

Model parameters can be adjusted in the Jupyter notebook:

```python
IMG_SIZE = (224, 224)
BATCH_SIZE = 32
EPOCHS = 50
LEARNING_RATE = 0.001
```

## 📊 Model Architecture

The system uses a multi-output CNN architecture:

- **Shared Feature Extraction**: Convolutional layers with batch normalization
- **Primary Classifier**: Real vs Fake detection
- **Secondary Classifier**: Edited vs Unedited (for real images only)
- **Loss Function**: Combined binary cross-entropy with weighted outputs

### Model Performance Metrics

The model provides:
- Classification accuracy for real/fake detection
- Classification accuracy for edit detection
- Confidence scores for each prediction
- Detailed analysis reports

## 🎨 Frontend Features

- **Modern UI**: Clean, responsive design with gradient backgrounds
- **Drag & Drop**: Easy image upload interface
- **Real-time Results**: Live confidence bars and detailed analysis
- **History Tracking**: View previous analyses
- **Error Handling**: Comprehensive error messages and retry functionality
- **Mobile Responsive**: Works on all device sizes

## 🔍 Usage Examples

### Web Interface

1. Open the frontend in your browser
2. Drag and drop an image or click to browse
3. Click "Analyze Image"
4. View results with confidence scores
5. Check analysis history

### API Usage

```python
import requests

# Analyze an image
with open('image.jpg', 'rb') as f:
    files = {'image': f}
    response = requests.post('http://localhost:8000/api/analyze/', files=files)
    result = response.json()
    
print(f"Is Real: {result['results']['is_real']}")
print(f"Confidence: {result['results']['real_confidence']:.2%}")
```

### Jupyter Notebook

```python
# Load the trained model
model = tf.keras.models.load_model('models/image_authenticity_model.h5')

# Make predictions
predictions = model.predict(processed_image)
real_fake_prob = predictions[0][0][0]
edited_prob = predictions[1][0][0]
```

## 📈 Training Your Own Model

### Dataset Requirements

For optimal performance, collect:

- **Real Unedited**: 5,000+ authentic photographs
- **Real Edited**: 5,000+ edited/manipulated images  
- **Fake**: 5,000+ AI-generated images

### Data Sources

- **Real Images**: Personal photos, stock photos, COCO dataset
- **Edited Images**: Photoshop examples, filtered images
- **Fake Images**: DALL-E, Midjourney, Stable Diffusion outputs

### Training Process

1. Prepare your dataset in the correct directory structure
2. Run the Jupyter notebook cells in sequence
3. Monitor training progress and validation metrics
4. Save the best model for deployment

## 🚀 Deployment

### Local Development

```bash
# Backend
cd backend
python manage.py runserver

# Frontend
cd frontend/templates
python -m http.server 8080
```

### Production Deployment

```bash
# Install production dependencies
pip install gunicorn whitenoise

# Collect static files
python manage.py collectstatic

# Run with Gunicorn
gunicorn backend.wsgi:application
```

## 🛠️ Troubleshooting

### Common Issues

1. **Model not loading**: Ensure the model file exists at `models/image_authenticity_model.h5`
2. **CORS errors**: Check that `django-cors-headers` is installed and configured
3. **File upload errors**: Verify file size limits and supported formats
4. **Training issues**: Ensure sufficient dataset size and GPU availability

### Debug Mode

Enable debug mode in Django settings:

```python
DEBUG = True
```

Check API health endpoint:
```bash
curl http://localhost:8000/api/health/
```

## 📝 API Documentation

### Upload and Analyze Image

```http
POST /api/analyze/
Content-Type: multipart/form-data

{
  "image": <image_file>
}
```

Response:
```json
{
  "id": 1,
  "filename": "image.jpg",
  "upload_time": "2024-01-01T12:00:00Z",
  "results": {
    "is_real": true,
    "real_confidence": 0.95,
    "authenticity_label": "Real Image (confidence: 95.0%)",
    "is_edited": false,
    "edited_confidence": 0.15,
    "edit_label": "Unedited (confidence: 85.0%)"
  },
  "status": "success"
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- TensorFlow/Keras team for the deep learning framework
- Django team for the web framework
- OpenCV team for image processing capabilities
- The AI community for inspiration and datasets

## 📞 Support

For questions or issues:
- Check the troubleshooting section
- Review API documentation
- Examine the Jupyter notebook examples
- Test with the provided sample data

---

**Note**: This is a demonstration project. For production use, ensure you have proper datasets, validate model performance, and implement appropriate security measures.