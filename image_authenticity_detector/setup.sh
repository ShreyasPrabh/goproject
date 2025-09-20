#!/bin/bash

# Image Authenticity Detector Setup Script
echo "🚀 Setting up Image Authenticity Detector..."

# Check Python version
python_version=$(python3 --version 2>&1 | awk '{print $2}' | cut -d. -f1,2)
required_version="3.8"

if [ "$(printf '%s\n' "$required_version" "$python_version" | sort -V | head -n1)" = "$required_version" ]; then 
    echo "✅ Python version $python_version is compatible"
else
    echo "❌ Python 3.8 or higher is required. Current version: $python_version"
    exit 1
fi

# Create virtual environment
echo "📦 Creating virtual environment..."
python3 -m venv venv

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Upgrade pip
echo "⬆️ Upgrading pip..."
pip install --upgrade pip

# Install requirements
echo "📚 Installing Python dependencies..."
pip install -r requirements.txt

# Setup Django backend
echo "🌐 Setting up Django backend..."
cd backend

# Make migrations
echo "🗄️ Creating database migrations..."
python manage.py makemigrations

# Apply migrations
echo "📊 Applying database migrations..."
python manage.py migrate

# Create models directory
echo "📁 Creating models directory..."
mkdir -p ../models

# Return to root directory
cd ..

echo "✅ Setup completed successfully!"
echo ""
echo "🎯 Next steps:"
echo "1. Activate the virtual environment: source venv/bin/activate"
echo "2. Add training images to the dataset directories"
echo "3. Open Jupyter notebook: jupyter notebook"
echo "4. Run the training notebook: notebook/image_authenticity_model.ipynb"
echo "5. Start Django server: cd backend && python manage.py runserver"
echo "6. Open frontend: Open frontend/templates/index.html in browser"
echo ""
echo "📖 For detailed instructions, see README.md"