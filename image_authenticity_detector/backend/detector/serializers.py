from rest_framework import serializers
from .models import ImageAnalysis


class ImageAnalysisSerializer(serializers.ModelSerializer):
    """Serializer for ImageAnalysis model"""
    
    class Meta:
        model = ImageAnalysis
        fields = [
            'id', 'image', 'filename', 'upload_time',
            'is_real', 'real_confidence', 'is_edited', 'edited_confidence',
            'analysis_status', 'error_message'
        ]
        read_only_fields = [
            'id', 'upload_time', 'is_real', 'real_confidence',
            'is_edited', 'edited_confidence', 'analysis_status', 'error_message'
        ]


class ImageUploadSerializer(serializers.Serializer):
    """Serializer for image upload"""
    
    image = serializers.ImageField()
    
    def validate_image(self, value):
        """Validate uploaded image"""
        # Check file size (max 10MB)
        if value.size > 10 * 1024 * 1024:
            raise serializers.ValidationError("Image file too large. Maximum size is 10MB.")
        
        # Check file format
        allowed_formats = ['JPEG', 'JPG', 'PNG', 'WEBP']
        if value.image.format not in allowed_formats:
            raise serializers.ValidationError(f"Unsupported image format. Allowed formats: {', '.join(allowed_formats)}")
        
        return value