from rest_framework import status
from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
import os
import tempfile
import logging

from .models import ImageAnalysis
from .serializers import ImageAnalysisSerializer, ImageUploadSerializer
from .ml_utils import predictor

logger = logging.getLogger(__name__)


@api_view(['POST'])
@parser_classes([MultiPartParser, FormParser])
def analyze_image(request):
    """
    API endpoint to analyze uploaded image for authenticity
    """
    try:
        # Validate uploaded image
        serializer = ImageUploadSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {'error': 'Invalid image', 'details': serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        uploaded_image = serializer.validated_data['image']
        
        # Create ImageAnalysis instance
        analysis = ImageAnalysis.objects.create(
            image=uploaded_image,
            filename=uploaded_image.name,
            analysis_status='processing'
        )
        
        try:
            # Get the file path
            image_path = analysis.image.path
            
            # Make prediction
            prediction_result = predictor.predict(image_path)
            
            # Update analysis with results
            analysis.is_real = prediction_result['is_real']
            analysis.real_confidence = prediction_result['real_confidence']
            analysis.is_edited = prediction_result['is_edited']
            analysis.edited_confidence = prediction_result['edited_confidence']
            analysis.analysis_status = prediction_result['status']
            analysis.error_message = prediction_result['error_message']
            analysis.save()
            
            # Prepare response
            response_data = {
                'id': analysis.id,
                'filename': analysis.filename,
                'upload_time': analysis.upload_time,
                'results': {
                    'is_real': analysis.is_real,
                    'real_confidence': analysis.real_confidence,
                    'authenticity_label': get_authenticity_label(analysis.is_real, analysis.real_confidence),
                    'is_edited': analysis.is_edited,
                    'edited_confidence': analysis.edited_confidence,
                    'edit_label': get_edit_label(analysis.is_real, analysis.is_edited, analysis.edited_confidence)
                },
                'status': analysis.analysis_status,
                'error_message': analysis.error_message
            }
            
            return Response(response_data, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error during image analysis: {str(e)}")
            analysis.analysis_status = 'error'
            analysis.error_message = str(e)
            analysis.save()
            
            return Response(
                {'error': 'Analysis failed', 'details': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    except Exception as e:
        logger.error(f"Error in analyze_image endpoint: {str(e)}")
        return Response(
            {'error': 'Server error', 'details': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
def get_analysis_history(request):
    """
    Get analysis history
    """
    try:
        analyses = ImageAnalysis.objects.all()[:50]  # Last 50 analyses
        serializer = ImageAnalysisSerializer(analyses, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Exception as e:
        logger.error(f"Error getting analysis history: {str(e)}")
        return Response(
            {'error': 'Failed to retrieve history', 'details': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
def get_analysis(request, analysis_id):
    """
    Get specific analysis by ID
    """
    try:
        analysis = ImageAnalysis.objects.get(id=analysis_id)
        serializer = ImageAnalysisSerializer(analysis)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except ImageAnalysis.DoesNotExist:
        return Response(
            {'error': 'Analysis not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        logger.error(f"Error getting analysis {analysis_id}: {str(e)}")
        return Response(
            {'error': 'Server error', 'details': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
def health_check(request):
    """
    Health check endpoint
    """
    try:
        model_status = "loaded" if predictor.model is not None else "not loaded"
        return Response({
            'status': 'healthy',
            'model_status': model_status,
            'message': 'Image Authenticity Detection API is running'
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({
            'status': 'unhealthy',
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


def get_authenticity_label(is_real, confidence):
    """Generate human-readable authenticity label"""
    if is_real is None:
        return "Unknown"
    
    if is_real:
        return f"Real Image (confidence: {confidence:.1%})"
    else:
        return f"AI-Generated/Fake (confidence: {(1-confidence):.1%})"


def get_edit_label(is_real, is_edited, confidence):
    """Generate human-readable edit label"""
    if not is_real:
        return "N/A (Only applicable to real images)"
    
    if is_edited is None:
        return "Unknown"
    
    if is_edited:
        return f"Edited (confidence: {confidence:.1%})"
    else:
        return f"Unedited (confidence: {(1-confidence):.1%})"