from django.db import models
from django.utils import timezone


class ImageAnalysis(models.Model):
    """Model to store image analysis results"""
    
    image = models.ImageField(upload_to='uploads/')
    filename = models.CharField(max_length=255)
    upload_time = models.DateTimeField(default=timezone.now)
    
    # Results
    is_real = models.BooleanField(null=True)
    real_confidence = models.FloatField(null=True)
    is_edited = models.BooleanField(null=True)
    edited_confidence = models.FloatField(null=True)
    
    # Status
    analysis_status = models.CharField(max_length=50, default='pending')
    error_message = models.TextField(blank=True, null=True)
    
    def __str__(self):
        return f"Analysis of {self.filename} at {self.upload_time}"
    
    class Meta:
        ordering = ['-upload_time']